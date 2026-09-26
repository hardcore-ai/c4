import { generarConversacion, PERSONA_IDS, Turno } from './persona-agent';
import { evaluarConversacion, ScoreCard } from './judge-agent';
import * as fs from 'fs';
import * as path from 'path';

// Configuración desde variables de entorno
const AGENT_ENDPOINT = process.env.AGENT_URL || 'http://localhost:3000/api/agent/chat';
const TURNOS = parseInt(process.env.TURNOS ?? '6', 10);

// Personas a evaluar: --persona <id> evalúa una sola, --all evalúa todas,
// sin flags corre las dos personas por defecto (carlos y maria)
const args = process.argv.slice(2);
const personaFlag = args.indexOf('--persona');
const PERSONAS_A_EVALUAR = personaFlag !== -1 && args[personaFlag + 1]
  ? [args[personaFlag + 1]]
  : args.includes('--all')
    ? PERSONA_IDS
    : ['carlos', 'maria'];

interface ResultadoCompleto extends ScoreCard {
  conversacion: Turno[];
}

async function main() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║   Evaluación de Agente IA — 30X      ║');
  console.log('╚══════════════════════════════════════╝\n');
  console.log(`Endpoint: ${AGENT_ENDPOINT}`);
  console.log(`Personas: ${PERSONAS_A_EVALUAR.join(', ')}`);
  console.log(`Turnos por conversación: ${TURNOS}\n`);

  const resultados: ResultadoCompleto[] = [];

  for (const personaId of PERSONAS_A_EVALUAR) {
    console.log(`▶ Ejecutando conversación con persona: ${personaId}`);

    try {
      const conversacion = await generarConversacion(personaId, AGENT_ENDPOINT, TURNOS);
      console.log(`  ✓ Conversación generada (${conversacion.length} turnos)`);

      // Mostrar conversación completa
      console.log('\n  ── Conversación completa ──');
      for (const turno of conversacion) {
        console.log(`\n  ┌─ Turno ${turno.turno} ────────────────────────────────`);
        console.log(`  │ 👤 Usuario:\n  │   ${turno.usuario.replaceAll('\n', '\n  │   ')}`);
        console.log(`  │ 🤖 Agente:\n  │   ${turno.agente.replaceAll('\n', '\n  │   ')}`);
        console.log(`  └─────────────────────────────────────────`);
      }

      console.log('\n  Evaluando con agente Juez...');
      const scorecard = await evaluarConversacion(personaId, conversacion);

      resultados.push({ ...scorecard, conversacion });

      const estado = scorecard.aprobado ? '✅ APROBADO' : '❌ REPROBADO';
      console.log(`\n  Resultado: ${estado} (promedio: ${scorecard.promedio})`);
      console.log(`  Observaciones: ${scorecard.observaciones}`);
      console.log('\n  Puntuaciones por dimensión:');

      for (const [dimension, puntuacion] of Object.entries(scorecard.dimensiones)) {
        const barra = '█'.repeat(puntuacion) + '░'.repeat(5 - puntuacion);
        console.log(`    ${dimension.padEnd(30)} ${barra} ${puntuacion}/5`);
      }

      console.log('\n' + '─'.repeat(50) + '\n');

    } catch (error) {
      console.error(`  ✗ Error evaluando persona ${personaId}:`, error);
    }
  }

  // Generar reporte JSON
  const reporte = {
    fecha: new Date().toISOString(),
    agente_endpoint: AGENT_ENDPOINT,
    configuracion: { turnos: TURNOS, personas: PERSONAS_A_EVALUAR },
    resumen: {
      total: resultados.length,
      aprobados: resultados.filter(r => r.aprobado).length,
      reprobados: resultados.filter(r => !r.aprobado).length,
      promedio_general: resultados.length > 0
        ? (resultados.reduce((sum, r) => sum + r.promedio, 0) / resultados.length).toFixed(1)
        : 0,
    },
    scorecards: resultados,
  };

  const reportsDir = path.join(__dirname, '../reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const reportePath = path.join(reportsDir, `evaluacion-${Date.now()}.json`);
  fs.writeFileSync(reportePath, JSON.stringify(reporte, null, 2));

  console.log('╔══════════════════════════════════════╗');
  console.log('║   RESUMEN FINAL                      ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(`  Total evaluados:  ${reporte.resumen.total}`);
  console.log(`  Aprobados:        ${reporte.resumen.aprobados}`);
  console.log(`  Reprobados:       ${reporte.resumen.reprobados}`);
  console.log(`  Promedio general: ${reporte.resumen.promedio_general}`);
  console.log(`\n  Reporte guardado en: ${reportePath}`);
  console.log('\n  → Siguiente paso: llevar los hallazgos al harness de tu equipo (issues en Linear, Jira, etc.).');
  console.log('    Este repo es un demo base: esa integración la moldea cada equipo a su necesidad.');
}

main().catch((error) => {
  console.error('Error fatal en la evaluación:', error);
  process.exit(1);
});
