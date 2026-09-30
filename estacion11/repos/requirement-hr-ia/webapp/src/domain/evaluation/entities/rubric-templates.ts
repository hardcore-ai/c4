import type { Rubric } from './rubric';
import { generateId } from '@/shared/utils/id';
import { nowISO } from '@/shared/utils/date';

export function createBPORubricTemplate(tenantId: string): Rubric {
  return {
    rubricId: generateId(),
    tenantId,
    name: 'BPO - Agente de Servicio al Cliente',
    template: 'bpo',
    createdAt: nowISO(),
    competencies: [
      {
        competencyId: generateId(),
        name: 'Comunicación',
        description: 'Capacidad de expresarse con claridad, escuchar activamente y adaptar el mensaje al interlocutor',
        weight: 0.25,
        sampleQuestion: 'Cuéntame sobre una situación en la que tuviste que explicar algo complejo a alguien. ¿Cómo te aseguraste de que te entendiera?',
        criteria: {
          1: 'No logra comunicar ideas de forma comprensible. Respuestas incoherentes o muy breves.',
          2: 'Comunica ideas básicas pero con dificultad. Falta estructura y claridad.',
          3: 'Se comunica de forma clara y organizada. Responde con ejemplos concretos.',
          4: 'Comunicación clara, estructurada y empática. Adapta su lenguaje al contexto.',
          5: 'Comunicación excepcional. Ejemplos detallados, narrativa fluida, empatía natural.',
        },
      },
      {
        competencyId: generateId(),
        name: 'Resolución de Problemas',
        description: 'Capacidad de identificar problemas, analizar opciones y tomar decisiones efectivas bajo presión',
        weight: 0.25,
        sampleQuestion: 'Describe una situación en la que enfrentaste un problema inesperado en tu trabajo. ¿Qué hiciste para resolverlo?',
        criteria: {
          1: 'No identifica el problema ni propone soluciones.',
          2: 'Identifica el problema pero la solución es vaga o inefectiva.',
          3: 'Identifica el problema y propone una solución razonable con pasos claros.',
          4: 'Analiza el problema desde múltiples ángulos. Solución creativa y efectiva.',
          5: 'Análisis excepcional. Solución innovadora con impacto medible. Anticipó consecuencias.',
        },
      },
      {
        competencyId: generateId(),
        name: 'Orientación al Cliente',
        description: 'Disposición y habilidad para entender necesidades del cliente y brindar un servicio excepcional',
        weight: 0.25,
        sampleQuestion: 'Cuéntame sobre una vez que un cliente estaba muy molesto. ¿Cómo manejaste la situación?',
        criteria: {
          1: 'No muestra interés por el cliente. Respuesta defensiva o indiferente.',
          2: 'Muestra interés básico pero no toma acción concreta para ayudar.',
          3: 'Atiende al cliente con profesionalismo. Busca solución activamente.',
          4: 'Empatiza genuinamente. Va más allá de lo esperado para resolver.',
          5: 'Transforma una experiencia negativa en positiva. El cliente queda encantado.',
        },
      },
      {
        competencyId: generateId(),
        name: 'Trabajo en Equipo',
        description: 'Capacidad de colaborar efectivamente, compartir responsabilidades y contribuir a objetivos comunes',
        weight: 0.25,
        sampleQuestion: '¿Puedes contarme sobre un proyecto o tarea en la que trabajaste con otras personas? ¿Cuál fue tu rol?',
        criteria: {
          1: 'No menciona colaboración. Enfoque completamente individual.',
          2: 'Menciona trabajo con otros pero su contribución es pasiva.',
          3: 'Colabora activamente. Define su rol y contribución al equipo.',
          4: 'Lidera o facilita la colaboración. Ayuda a otros a contribuir.',
          5: 'Inspira al equipo. Resuelve conflictos. Resultados excepcionales en equipo.',
        },
      },
    ],
  };
}

export function createTechRubricTemplate(tenantId: string): Rubric {
  return {
    rubricId: generateId(),
    tenantId,
    name: 'Tech - Desarrollador de Software',
    template: 'tech',
    createdAt: nowISO(),
    competencies: [
      {
        competencyId: generateId(),
        name: 'Conocimiento Técnico',
        description: 'Dominio de tecnologías, lenguajes y herramientas relevantes para el rol',
        weight: 0.30,
        sampleQuestion: 'Cuéntame sobre el proyecto técnico más desafiante en el que has trabajado. ¿Qué tecnologías usaste y por qué?',
        criteria: {
          1: 'No demuestra conocimiento técnico relevante.',
          2: 'Conocimiento básico. Menciona tecnologías sin profundidad.',
          3: 'Conocimiento sólido. Explica decisiones técnicas con fundamento.',
          4: 'Conocimiento profundo. Compara alternativas. Justifica trade-offs.',
          5: 'Dominio excepcional. Arquitectura avanzada. Contribuciones a la comunidad.',
        },
      },
      {
        competencyId: generateId(),
        name: 'Resolución de Problemas Técnicos',
        description: 'Capacidad de debugging, análisis de root cause y diseño de soluciones escalables',
        weight: 0.25,
        sampleQuestion: 'Describe un bug o problema técnico difícil que hayas resuelto. ¿Cómo lo diagnosticaste?',
        criteria: {
          1: 'No describe proceso de diagnóstico. Solución por ensayo y error.',
          2: 'Proceso básico de diagnóstico. Solución funciona pero no es óptima.',
          3: 'Proceso metódico. Identifica root cause. Solución robusta.',
          4: 'Análisis profundo. Previene recurrencia. Documenta aprendizaje.',
          5: 'Diagnóstico excepcional. Solución sistémica. Mejora procesos del equipo.',
        },
      },
      {
        competencyId: generateId(),
        name: 'Colaboración y Comunicación Técnica',
        description: 'Capacidad de comunicar ideas técnicas, hacer code review y trabajar en equipo',
        weight: 0.20,
        sampleQuestion: '¿Cómo manejas desacuerdos técnicos con compañeros de equipo? Dame un ejemplo.',
        criteria: {
          1: 'No comunica ideas técnicas. Trabaja aislado.',
          2: 'Comunica de forma básica. Dificultad para explicar decisiones.',
          3: 'Comunica claramente. Participa en code reviews. Acepta feedback.',
          4: 'Facilita discusiones técnicas. Mentoriza a juniors. Feedback constructivo.',
          5: 'Líder técnico natural. Eleva al equipo. Documentación excepcional.',
        },
      },
      {
        competencyId: generateId(),
        name: 'Autonomía y Proactividad',
        description: 'Capacidad de tomar iniciativa, investigar por cuenta propia y entregar sin supervisión constante',
        weight: 0.25,
        sampleQuestion: '¿Puedes contarme sobre algo que hayas mejorado o implementado por iniciativa propia, sin que nadie te lo pidiera?',
        criteria: {
          1: 'Espera instrucciones para todo. No toma iniciativa.',
          2: 'Toma iniciativa ocasionalmente en tareas pequeñas.',
          3: 'Proactivo. Identifica mejoras y las propone. Investiga soluciones.',
          4: 'Altamente autónomo. Implementa mejoras significativas. Anticipa necesidades.',
          5: 'Intraemprendedor. Impacto medible en producto o equipo. Auto-dirigido.',
        },
      },
    ],
  };
}
