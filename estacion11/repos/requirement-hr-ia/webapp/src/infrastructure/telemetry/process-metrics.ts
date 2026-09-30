// ============================================================
// Process-level metrics vía ObservableGauge
// Complementan las métricas de runtime-node (GC, event loop)
// con datos de process.memoryUsage() y process.cpuUsage()
//
// Este archivo se importa dinámicamente solo en Node.js runtime
// para evitar warnings de Edge Runtime en Turbopack.
// ============================================================

import { metrics } from '@opentelemetry/api';
import { performance } from 'node:perf_hooks';

export function registerProcessMetrics() {
  const meter = metrics.getMeter('process-metrics');

  // ── Memory ──
  meter.createObservableGauge('process.memory.heap_used', {
    description: 'Node.js heap used in bytes',
    unit: 'By',
  }).addCallback((obs) => {
    obs.observe(process.memoryUsage().heapUsed);
  });

  meter.createObservableGauge('process.memory.heap_total', {
    description: 'Node.js total heap allocated in bytes',
    unit: 'By',
  }).addCallback((obs) => {
    obs.observe(process.memoryUsage().heapTotal);
  });

  meter.createObservableGauge('process.memory.rss', {
    description: 'Resident Set Size — total memory occupied by the process',
    unit: 'By',
  }).addCallback((obs) => {
    obs.observe(process.memoryUsage().rss);
  });

  meter.createObservableGauge('process.memory.external', {
    description: 'Memory used by C++ objects bound to JS objects',
    unit: 'By',
  }).addCallback((obs) => {
    obs.observe(process.memoryUsage().external);
  });

  meter.createObservableGauge('process.memory.array_buffers', {
    description: 'Memory allocated for ArrayBuffers and SharedArrayBuffers',
    unit: 'By',
  }).addCallback((obs) => {
    obs.observe(process.memoryUsage().arrayBuffers);
  });

  // ── CPU (acumulativo, en microsegundos) ──
  meter.createObservableGauge('process.cpu.user', {
    description: 'Cumulative user CPU time in microseconds',
    unit: 'us',
  }).addCallback((obs) => {
    obs.observe(process.cpuUsage().user);
  });

  meter.createObservableGauge('process.cpu.system', {
    description: 'Cumulative system CPU time in microseconds',
    unit: 'us',
  }).addCallback((obs) => {
    obs.observe(process.cpuUsage().system);
  });

  // ── Process uptime ──
  meter.createObservableGauge('process.uptime', {
    description: 'Process uptime in seconds',
    unit: 's',
  }).addCallback((obs) => {
    obs.observe(process.uptime());
  });

  // ── Event Loop Utilization ──
  const elu1 = performance.eventLoopUtilization();
  meter.createObservableGauge('process.event_loop.utilization', {
    description: 'Event loop utilization ratio (0-1). High values indicate the event loop is busy.',
    unit: '1',
  }).addCallback((obs) => {
    const elu2 = performance.eventLoopUtilization(elu1);
    obs.observe(elu2.utilization);
  });

  // ── Active handles & requests ──
  meter.createObservableGauge('process.active_handles', {
    description: 'Number of active handles (sockets, timers, etc.)',
  }).addCallback((obs) => {
    // @ts-expect-error _getActiveHandles is internal but stable
    obs.observe(process._getActiveHandles?.()?.length ?? 0);
  });
}
