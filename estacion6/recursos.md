# Recursos de estaciones 6 y 7

## Herramientas y skills

- [Design skills](https://design.trilogyai.co/): skills y prácticas de diseño usadas en el programa.
- [OpenSymphony](https://opensymphony.dev): orquestación de tareas, workspaces, ejecución, revisión y memoria.
- [`create-implementation-plan`](https://github.com/kumanday/OpenSymphony/tree/main/.agents/skills/create-implementation-plan): genera `task-package.yaml`, milestones y archivos de tareas.
- [`linear`](https://github.com/kumanday/OpenSymphony/tree/main/.agents/skills/linear): lee y actualiza Linear mediante los helpers de OpenSymphony.
- [`convert-tasks-to-linear`](https://github.com/kumanday/OpenSymphony/tree/main/.agents/skills/convert-tasks-to-linear): valida, previsualiza y publica el paquete de tareas en Linear.
- [Engineering Behavior Observatory](https://github.com/trilogy-group/engineering-behavior-observatory/): observabilidad de eventos de agente y arnés, con una ontología de comportamiento y su evaluación.

## Artículos

- [Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/), OpenAI.
- [Extreme Harness Engineering for Token Billionaires](https://www.latent.space/p/harness-eng), Latent Space.
- [How enabling two settings tripled our scores on the ARC-AGI-3 benchmark](https://openai.com/index/how-two-settings-tripled-our-arc-agi-3-scores/), OpenAI.
- [From Spec-Driven Work to Work Orchestration](https://trilogyai.substack.com/p/from-spec-driven-work-to-work-orchestration), Trilogy AI.
- [The Shape of Things to Come](https://yegge.ai/essays/the-shape-of-things-to-come/), Steve Yegge. En clase se usa la síntesis aportada por el instructor.
- [AI News: Reality Checks on AI](https://www.latent.space/p/ainews-reality-checks-on-ai-news), referencia del comentario sobre la confiabilidad de Gas Town.

Los tres skills cumplen funciones distintas: `create-implementation-plan` genera el paquete, `convert-tasks-to-linear` lo valida y publica, y `linear` permite operar después sobre los objetos de Linear. Revisa el paquete y su dry-run antes de publicar en un proyecto observado por un orquestador.
