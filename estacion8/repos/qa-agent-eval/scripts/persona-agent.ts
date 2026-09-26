import OpenAI from 'openai';

const client = new OpenAI();

interface PersonaConfig {
  id: string;
  nombre: string;
  perfil: string;
  estiloComunicacion: string;
  intenciones: string[];
}

const PERSONAS: Record<string, PersonaConfig> = {
  carlos: {
    id: 'carlos',
    nombre: 'Carlos',
    perfil: 'Desarrollador de software, 32 años. Usuario técnico y directo.',
    estiloComunicacion: 'Directo y conciso. Hace preguntas precisas. Espera respuestas con información técnica cuando aplica.',
    intenciones: ['consultar sobre integraciones disponibles', 'conocer limitaciones del sistema', 'resolver un problema técnico puntual'],
  },
  maria: {
    id: 'maria',
    nombre: 'María',
    perfil: 'Gerente de administración, 45 años. Primera vez usando el producto.',
    estiloComunicacion: 'Informal y coloquial. Hace preguntas abiertas. Puede dar contexto insuficiente.',
    intenciones: ['entender qué puede hacer el asistente', 'resolver una duda general', 'obtener orientación sobre un proceso'],
  },
  pedro: {
    id: 'pedro',
    nombre: 'Pedro',
    perfil: 'Coordinador de operaciones, 38 años. Experiencia previa negativa con sistemas de soporte.',
    estiloComunicacion: 'Escéptico y exigente al inicio. Puede usar tono elevado. Se calma con respuestas útiles y empáticas.',
    intenciones: ['resolver un problema urgente', 'verificar si el sistema es mejor que los anteriores', 'solicitar hablar con un humano si no obtiene ayuda'],
  },
  teresita: {
    id: 'teresita',
    nombre: 'Teresita',
    perfil: 'Señora de 70 años, jubilada. Baja alfabetización digital, dificultades persistentes con cualquier herramienta digital. Esta vez está sola frente a la pantalla, sin su hijo o nieto al lado.',
    estiloComunicacion: 'Inseguro y disperso. Hace muchas preguntas seguidas en el mismo mensaje y repite la misma duda con palabras distintas para asegurarse de que la entendieron. ESCRIBE MAL las palabras: tipea con errores ortográficos abundantes (faltas, letras cambiadas o repetidas, "v" por "b", "s" por "c", sin tildes, mayúsculas y minúsculas mezcladas, signos de puntuación inconsistentes, espacios extra). Usa muletillas como "mijo", "mire", "es que...", "perdone la molestia", "ay no se", "disculpe". No usa tecnicismos y confunde conceptos básicos (correo vs. usuario, contraseña vs. código, página vs. aplicación, botón vs. link).',
    intenciones: ['entender cómo se usa esta cosa', 'que le expliquen paso a paso dónde hacer clic', 'confirmar algo que su hijo le dijo que hiciera sin que ella entendiera bien'],
  },
};

/** IDs de todas las personas disponibles — usado por `--all` en run-evaluation.ts */
export const PERSONA_IDS = Object.keys(PERSONAS);

export interface Turno {
  turno: number;
  usuario: string;
  agente: string;
}

export async function generarConversacion(
  personaId: string,
  agenteEndpoint: string,
  turnos: number = 3,
): Promise<Turno[]> {
  const persona = PERSONAS[personaId];
  if (!persona) {
    throw new Error(`Persona '${personaId}' no definida. Opciones: ${Object.keys(PERSONAS).join(', ')}`);
  }

  const systemPrompt = `Eres ${persona.nombre}. ${persona.perfil}

Tu estilo de comunicación: ${persona.estiloComunicacion}
Tus intenciones en esta conversación: ${persona.intenciones.join('; ')}.

REGLAS:
- Genera mensajes realistas como si fueras este usuario interactuando con un asistente de IA
- Mantén coherencia con las respuestas anteriores del agente
- No actúes como el agente bajo ninguna circunstancia
- No rompas el rol
- Los mensajes deben ser naturales, no perfectos`;

  const conversacion: Turno[] = [];
  const historialPersona: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  let conversationId: string | undefined;

  for (let i = 1; i <= turnos; i++) {
    // El agente Persona genera el mensaje del usuario
    const promptParaPersona = i === 1
      ? 'Inicia la conversación con el asistente con tu primera consulta o saludo, según tu perfil.'
      : 'Continúa la conversación de forma natural basándote en la última respuesta del asistente.';

    console.log(`    🤖 [Persona · gpt-4o-mini] generando mensaje turno ${i}...`);
    const respuestaPersona = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      messages: [
        { role: 'system', content: systemPrompt },
        ...historialPersona,
        { role: 'user', content: promptParaPersona },
      ],
    });

    const usage = respuestaPersona.usage;
    console.log(`    ✓ tokens — entrada: ${usage?.prompt_tokens ?? '?'}, salida: ${usage?.completion_tokens ?? '?'}, modelo: ${respuestaPersona.model}`);

    const mensajeUsuario = respuestaPersona.choices[0].message.content?.trim() ?? '';

    console.log(`    📡 [Demo API] enviando a ${agenteEndpoint}`);
    // Enviar el mensaje al agente bajo prueba
    const respuestaHTTP = await fetch(agenteEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: mensajeUsuario,
        ...(conversationId && { conversation_id: conversationId }),
      }),
    });

    if (!respuestaHTTP.ok) {
      throw new Error(`El agente retornó status ${respuestaHTTP.status} en turno ${i}`);
    }

    const dataAgente = await respuestaHTTP.json() as { response: string; conversation_id: string };
    conversationId = dataAgente.conversation_id;
    console.log(`    ✓ [Demo API] conversation_id: ${conversationId}`);

    conversacion.push({
      turno: i,
      usuario: mensajeUsuario,
      agente: dataAgente.response,
    });

    // Actualizar historial para el agente Persona
    historialPersona.push(
      { role: 'user', content: promptParaPersona },
      { role: 'assistant', content: mensajeUsuario },
      // Inyectar la respuesta del agente como contexto para el siguiente turno
      { role: 'user', content: `La respuesta del asistente fue: "${dataAgente.response}"` },
      { role: 'assistant', content: 'Entendido, continuaré la conversación.' },
    );
  }

  return conversacion;
}
