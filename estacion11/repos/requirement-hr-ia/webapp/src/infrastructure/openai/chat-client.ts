import OpenAI from 'openai';
import { trace, metrics, SpanStatusCode } from '@opentelemetry/api';
import type { SessionState, Message } from '@/domain/conversation/entities/conversation';
import type { Rubric } from '@/domain/evaluation/entities/rubric';
import type { CompetencyScore } from '@/domain/evaluation/entities/evaluation';
import { OPENAI_CONFIG } from '@/shared/constants';
import { logger } from '@/infrastructure/logging/logger';

// OpenTelemetry tracer y métricas para llamadas al LLM
const tracer = trace.getTracer('openai-client');
const meter = metrics.getMeter('openai-client');

const llmLatencyHistogram = meter.createHistogram('llm.request.duration', {
  description: 'Latencia de llamadas al LLM en milisegundos',
  unit: 'ms',
});

const llmTokensCounter = meter.createCounter('llm.tokens.total', {
  description: 'Total de tokens consumidos por el LLM',
  unit: '{token}',
});

const llmErrorsCounter = meter.createCounter('llm.request.errors', {
  description: 'Errores en llamadas al LLM',
  unit: '{error}',
});

// Inicializa las series en 0 al arrancar: así los paneles de errores y tokens
// muestran "0" desde el primer minuto en vez de "No data" hasta el primer evento.
for (const [model, operation] of [
  [OPENAI_CONFIG.CONVERSATION_MODEL, 'conversation'],
  [OPENAI_CONFIG.EVALUATOR_MODEL, 'evaluation'],
] as const) {
  const attrs = { 'llm.model': model, 'llm.operation': operation };
  llmErrorsCounter.add(0, attrs);
  llmTokensCounter.add(0, { ...attrs, 'llm.token_type': 'input' });
  llmTokensCounter.add(0, { ...attrs, 'llm.token_type': 'output' });
}

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export interface ChatResponse {
  response: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export async function generateConversationResponse(params: {
  systemPrompt: string;
  sessionState: SessionState;
  recentMessages: Message[];
  knowledgeContext?: string;
}): Promise<string> {
  return tracer.startActiveSpan('llm.conversation', async (span) => {
    const model = OPENAI_CONFIG.CONVERSATION_MODEL;
    span.setAttribute('llm.system', 'openai');
    span.setAttribute('llm.model', model);
    span.setAttribute('llm.temperature', 0.7);
    span.setAttribute('llm.max_tokens', 500);
    span.setAttribute('llm.operation', 'conversation');
    span.setAttribute('llm.phase', params.sessionState.currentPhase ?? 'unknown');

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: params.systemPrompt },
      { role: 'system', content: `SESSION STATE: ${JSON.stringify(params.sessionState)}` },
    ];

    if (params.knowledgeContext) {
      messages.push({ role: 'system', content: `KNOWLEDGE BASE:\n${params.knowledgeContext}` });
    }

    for (const msg of params.recentMessages) {
      messages.push({
        role: msg.role === 'agent' ? 'assistant' : 'user',
        content: msg.content,
      });
    }

    const startTime = Date.now();

    try {
      const completion = await getOpenAI().chat.completions.create({
        model,
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const latency = Date.now() - startTime;
      const response = completion.choices[0]?.message?.content || '';
      const promptTokens = completion.usage?.prompt_tokens ?? 0;
      const completionTokens = completion.usage?.completion_tokens ?? 0;

      // Atributos del span
      span.setAttribute('llm.latency_ms', latency);
      span.setAttribute('llm.tokens.input', promptTokens);
      span.setAttribute('llm.tokens.output', completionTokens);
      span.setAttribute('llm.tokens.total', promptTokens + completionTokens);
      span.setAttribute('llm.response.length', response.length);
      span.setStatus({ code: SpanStatusCode.OK });

      // Métricas
      const metricAttrs = { 'llm.model': model, 'llm.operation': 'conversation' };
      llmLatencyHistogram.record(latency, metricAttrs);
      llmTokensCounter.add(promptTokens, { ...metricAttrs, 'llm.token_type': 'input' });
      llmTokensCounter.add(completionTokens, { ...metricAttrs, 'llm.token_type': 'output' });

      logger.info('openai', 'Conversation response generated', {
        context: { model, latency, promptTokens, completionTokens },
      });

      span.end();
      return response;
    } catch (error) {
      const latency = Date.now() - startTime;
      span.setAttribute('llm.latency_ms', latency);
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
      span.recordException(error as Error);
      llmErrorsCounter.add(1, { 'llm.model': model, 'llm.operation': 'conversation' });
      span.end();
      throw error;
    }
  });
}

export interface EvaluatorResult {
  competencyScores: CompetencyScore[];
  keySignals: string[];
}

export async function runEvaluatorPrompt(params: {
  transcript: Message[];
  rubric: Rubric;
}): Promise<EvaluatorResult> {
  return tracer.startActiveSpan('llm.evaluation', async (span) => {
    const model = OPENAI_CONFIG.EVALUATOR_MODEL;
    span.setAttribute('llm.system', 'openai');
    span.setAttribute('llm.model', model);
    span.setAttribute('llm.temperature', 0.3);
    span.setAttribute('llm.max_tokens', 2000);
    span.setAttribute('llm.operation', 'evaluation');
    span.setAttribute('llm.response_format', 'json_object');
    span.setAttribute('llm.transcript_messages', params.transcript.length);
    span.setAttribute('llm.competencies_count', params.rubric.competencies.length);

    const competencyList = params.rubric.competencies
      .map((c) => `### ${c.name} (weight: ${c.weight})\n${c.description}\nCriteria:\n1: ${c.criteria[1]}\n2: ${c.criteria[2]}\n3: ${c.criteria[3]}\n4: ${c.criteria[4]}\n5: ${c.criteria[5]}`)
      .join('\n\n');

    const transcript = params.transcript
      .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are an expert evaluator. Score the following interview transcript against the rubric.

RUBRIC:
${competencyList}

INSTRUCTIONS:
- For each competency, assign a score from 1-5 based on the rubric criteria
- For each score, extract a VERBATIM quote from the candidate's responses as evidence
- Provide a brief justification for each score
- Identify 2-3 key signals (strengths or concerns)

OUTPUT FORMAT: Respond ONLY with valid JSON matching this schema:
{
  "competencyScores": [
    {
      "competencyId": "string",
      "competencyName": "string",
      "score": number,
      "weight": number,
      "evidence": [{ "quote": "string", "messageIndex": number, "relevance": "string" }],
      "justification": "string"
    }
  ],
  "keySignals": ["string"]
}`;

    const startTime = Date.now();

    try {
      const completion = await getOpenAI().chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `TRANSCRIPT:\n${transcript}` },
        ],
        max_tokens: 2000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const latency = Date.now() - startTime;
      const content = completion.choices[0]?.message?.content || '{}';
      const promptTokens = completion.usage?.prompt_tokens ?? 0;
      const completionTokens = completion.usage?.completion_tokens ?? 0;

      // Atributos del span
      span.setAttribute('llm.latency_ms', latency);
      span.setAttribute('llm.tokens.input', promptTokens);
      span.setAttribute('llm.tokens.output', completionTokens);
      span.setAttribute('llm.tokens.total', promptTokens + completionTokens);
      span.setStatus({ code: SpanStatusCode.OK });

      // Métricas
      const metricAttrs = { 'llm.model': model, 'llm.operation': 'evaluation' };
      llmLatencyHistogram.record(latency, metricAttrs);
      llmTokensCounter.add(promptTokens, { ...metricAttrs, 'llm.token_type': 'input' });
      llmTokensCounter.add(completionTokens, { ...metricAttrs, 'llm.token_type': 'output' });

      logger.info('openai', 'Evaluator response generated', {
        context: { model, latency, promptTokens, completionTokens },
      });

      const parsed = JSON.parse(content) as EvaluatorResult;

      parsed.competencyScores = parsed.competencyScores.map((cs) => {
        const rubricComp = params.rubric.competencies.find((c) => c.competencyId === cs.competencyId || c.name === cs.competencyName);
        return {
          ...cs,
          weight: rubricComp?.weight ?? cs.weight,
          competencyId: rubricComp?.competencyId ?? cs.competencyId,
        };
      });

      span.setAttribute('llm.evaluation.scores_count', parsed.competencyScores.length);
      span.end();
      return parsed;
    } catch (error) {
      const latency = Date.now() - startTime;
      span.setAttribute('llm.latency_ms', latency);
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
      span.recordException(error as Error);
      llmErrorsCounter.add(1, { 'llm.model': model, 'llm.operation': 'evaluation' });
      span.end();
      throw error;
    }
  });
}
