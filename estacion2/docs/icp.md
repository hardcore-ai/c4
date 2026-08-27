# Ideal Customer Profile — AgentVault

> Perfil de cliente ideal para AgentVault. Derivado de PVB + Deep research de validación.

---

## ICP — Segmento beachhead (primeras 4 semanas)

**Empresas:** Startups en stage Pre-Seed a Series A con equipos de **3 a 15 ingenieros**, operando en LatAm (Bogotá, México DF, São Paulo, Buenos Aires, Santiago).

**Verticales prioritarios:**

1. **Agent Marketplaces** — plataformas tipo Replit Agent, Cursor Cloud, AutoGen orchestrators que necesitan resolver pagos entre agentes de terceros que ya orquestan.
2. **Fintech con agentes B2B** — cobranza automatizada, validación KYC entre instituciones, conciliación de pagos cross-border en stablecoins.
3. **Builders Web3** — operan con USDC/USDT y construyen flows multi-agente nativos (DeFi automation, on-chain research, oracle networks).

**NO es para (explícitamente fuera del ICP):**
- Empresas tradicionales sin agentes desplegados.
- Retail / consumer apps.
- Gobiernos.
- Banca regulada Tier 1 (Bancolombia, Itaú, Santander, etc. — usan Mastercard Agent Pay y necesitan KYC fuerte de persona).

---

## Buyer personas

### Persona 1 — CTO / Head of Engineering (decisor principal)

**Quién es:** Ingeniero senior, 8–15 años de experiencia, hands-on con Solidity / TypeScript / Python. Lidera equipo de 3–15 personas.

**Qué evalúa antes de adoptar AgentVault:**

- ¿El smart contract está auditado por un firm reconocido? (Trail of Bits, OpenZeppelin, Sherlock o equivalente).
- ¿El SDK se integra con su stack actual? Esperamos Node + Python + integración nativa con LangChain / CrewAI / AutoGen / Anthropic Agents SDK / OpenAI Agents SDK.
- ¿La latencia end-to-end es <30s? Cualquier cosa por encima rompe el flow de los agentes downstream.
- ¿La documentación es ejecutable? Tutorial completo con un comando.

**Mata la adopción si:** la auditoría es informal o de un firm desconocido; el SDK requiere wrappers custom para integrarse con su framework; la documentación no permite un quickstart sin soporte humano.

### Persona 2 — Compliance Officer (en Fintech reguladas)

**Quién es:** Profesional con background legal/regulatorio, responsable de mantener a la empresa al día con regulaciones locales y standards internacionales (FATF, SAR/STR, KYC tradicional).

**Qué evalúa:**

- ¿KYA (Know Your Agent) es defendible ante el regulador local? SFC en Colombia, CNBV en México, BCB en Brasil.
- ¿Hay trazabilidad on-chain auditable de cada transacción?
- ¿Hay mecanismo de freezing / pausing en caso de orden judicial?

**Mata la adopción si:** no hay KYA definido, no hay reporting compatible con FATF, no hay capacidad de freeze ante orden judicial.

### Persona 3 — Founder / CEO (sponsor inicial)

**Quién es:** Founder técnico o ex-Founder con experiencia en una vertical Web3 / fintech. Mayor decisor de adoptar tecnología nueva en fase early.

**Qué evalúa:**

- ¿Esto desbloquea un caso de uso que sin AgentVault sería imposible?
- ¿El pricing aguanta nuestro volumen proyectado?
- ¿AgentVault va a estar vivo en 18 meses?

**Mata la adopción si:** el caso de uso parece "nice to have" y no "must have"; el pricing los desangra a escala; AgentVault parece pre-seed con runway corto.

---

## Pains (puntos de dolor)

**Pain operativo:**

- **Stripe + bank wires no funcionan económicamente para M2M.** Una transacción de $0.50 con 62% de fees es imposible. Una de $5 con 9% sigue siendo desfavorable.
- **No hay mecanismo de confianza sin humano arbitrando.** El agente proveedor exige pago upfront (riesgo del comprador); el agente comprador exige entrega upfront (riesgo del proveedor). Sin escrow, los agentes no pueden transaccionar entre ellos.
- **Tiempos T+1 / T+3 rompen el flow.** Bank transfers cross-border tardan días, mientras un agente downstream está esperando para ejecutar el siguiente paso.

**Pain estratégico:**

- **El builder construye su propio escrow ad-hoc en cada proyecto.** Solidity propio sin auditar, sin verificación AI, sin reputación on-chain. Esto consume 2–4 semanas de tiempo de ingeniería del equipo en algo que no es core.
- **Sin reputación de agentes, no se puede construir un marketplace abierto.** El builder está atrapado entre "agentes whitelisteados manualmente" (no escala) o "open" (alta tasa de scam).

---

## Deseos

- **Una sola API para todos los pagos M2M de su stack.** Quieren olvidarse de smart contracts custom y enfocarse en su producto core.
- **Confianza on-chain verificable que no dependa de un operador centralizado.** Si AgentVault desaparece, los smart contracts siguen funcionando.
- **Integraciones nativas con los frameworks de agentes que ya usan.** No quieren escribir wrappers.
- **Reputación on-chain portable.** Si AgentVault muere, su historial de agentes verificados es portable a otra solución.

---

## Triggers de compra (qué eventos detonan adopción)

1. **Primer caso de uso multi-agente en producción.** Cuando el equipo deja de hacer demos y empieza a procesar transacciones reales.
2. **Primer chargeback / disputa donde nadie sabe quién tiene razón.** Cuando el dolor de "no hay árbitro" se vuelve concreto.
3. **Primera factura de Stripe de cuatro cifras que en realidad son fees.** Cuando la unit economics del M2M con Stripe se vuelve obvia.

---

## Objeciones probables

| Objeción | Respuesta |
|---|---|
| "Coinbase va a lanzar escrow built-in en 6 meses." | Probablemente sí. Pero el moat de AgentVault no es el escrow — es la red KYA + biblioteca de evaluadores AI con accuracy medida en producción. Eso no lo lanza Coinbase. |
| "Podemos construir nuestro propio escrow en 2 semanas." | Sí, pueden. ¿Cuánto cuesta auditarlo? ¿Cuánto cuesta mantener el evaluador AI? ¿Cuánto cuesta la primera disputa que pierdes por bug? |
| "Estamos esperando a que ERC-8183 se vuelva mainstream." | AgentVault corre sobre ERC-8183 cuando esté estable. Mientras tanto, ya estás transaccionando con el smart contract de AgentVault auditado hoy. |
| "Demand de M2M aún no llega — CoinDesk dijo $28K/día reales." | Correcto, el mercado está en formación. La pregunta es si quieres entrar antes del inflection point o después. |

---

*Hardcore AI by 30X — Cohorte 3 — Estación 1*
