import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import type { Turno } from './persona-agent';

const client = new OpenAI();

export interface Dimensiones {
  precision_factual: number;
  relevancia: number;
  tono: number;
  adherencia_system_prompt: number;
  manejo_edge_cases: number;
  ausencia_alucinaciones: number;
}

export interface ScoreCard {
  persona: string;
  fecha: string;
  dimensiones: Dimensiones;
  promedio: number;
  aprobado: boolean;
  observaciones: string;
  turnos_evaluados: number;
}

export async function evaluarConversacion(
  personaId: string,
  conversacion: Turno[],
): Promise<ScoreCard> {
  const rubric = fs.readFileSync(
    path.join(__dirname, '../rubrics/evaluacion.md'),
    'utf-8',
  );

  const conversacionFormateada = conversacion
    .map(t => `[Turno ${t.turno}]\nUSUARIO: ${t.usuario}\nAGENTE: ${t.agente}`)
    .join('\n\n---\n\n');

  const prompt = `Eres un evaluador experto de agentes de IA conversacionales.

Evalúa la siguiente conversación entre un usuario simulado (persona: ${personaId}) y un agente de IA, usando el rubric de evaluación proporcionado.

## RUBRIC DE EVALUACIÓN:
${rubric}

## CONVERSACIÓN A EVALUAR:
${conversacionFormateada}

## INSTRUCCIONES:
- Evalúa la conversación completa, no turno por turno
- Considera el comportamiento acumulado del agente a lo largo de toda la conversación
- Devuelve ÚNICAMENTE un JSON válido con la siguiente estructura exacta (sin texto adicional antes o después):

{
  "dimensiones": {
    "precision_factual": <número 1-5>,
    "relevancia": <número 1-5>,
    "tono": <número 1-5>,
    "adherencia_system_prompt": <número 1-5>,
    "manejo_edge_cases": <número 1-5>,
    "ausencia_alucinaciones": <número 1-5>
  },
  "promedio": <número con 1 decimal>,
  "aprobado": <true o false según los umbrales del rubric>,
  "observaciones": "<hallazgos clave: qué hizo bien el agente, qué debe mejorar, patrones detectados>"
}`;

  console.log(`  ⚖️  [Juez · gpt-4o] evaluando ${conversacion.length} turnos...`);
  const resultado = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1000,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: prompt }],
  });

  const usageJuez = resultado.usage;
  console.log(`  ✓ [Juez] tokens — entrada: ${usageJuez?.prompt_tokens ?? '?'}, salida: ${usageJuez?.completion_tokens ?? '?'}, modelo: ${resultado.model}`);

  const texto = resultado.choices[0].message.content ?? '{}';
  const jsonMatch = texto.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`El agente Juez no retornó JSON válido. Respuesta: ${texto}`);
  }

  const evaluacion = JSON.parse(jsonMatch[0]) as {
    dimensiones: Dimensiones;
    promedio: number;
    aprobado: boolean;
    observaciones: string;
  };

  return {
    persona: personaId,
    fecha: new Date().toISOString(),
    dimensiones: evaluacion.dimensiones,
    promedio: evaluacion.promedio,
    aprobado: evaluacion.aprobado,
    observaciones: evaluacion.observaciones,
    turnos_evaluados: conversacion.length,
  };
}
