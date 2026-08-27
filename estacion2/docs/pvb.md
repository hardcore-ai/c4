# Product Vision Board — AgentVault

> **Producto:** Sistema de Escrow Autónomo para IA (Banco de Productos, opción 4)
> **Cohorte:** Hardcore AI by 30X — Cohorte 3
> **Demo Day:** 9 de junio de 2026

---

## PRODUCTO

**Nombre del producto:** AgentVault

**Descripción en una línea:** Infraestructura de escrow autónomo en USDC que permite a agentes de IA contratar, pagar y verificar servicios entre sí sin intervención humana, optimizada para builders Web3 y Fintech en Latinoamérica.

**Tagline interno:** *"Stripe para agentes que no pueden firmar contratos."*

---

## 1. PROBLEMA

### Problema que resuelvo

Cuando un agente autónomo necesita delegar trabajo a otro agente (investigación de mercado, validación de identidad, generación de contenido, scraping estructurado), no existe un mecanismo de pago que funcione económicamente ni un mecanismo de confianza que funcione sin humanos en el loop.

**Cifras concretas del dolor:**

- Una transacción M2M de **$0.50 USD** procesada vía Stripe cuesta **$0.31 en fees** (2.9% + $0.30) → **62% del valor se va en fricción**. A esos costos, el agentic commerce es matemáticamente imposible.
- Una transacción de **$5 USD** sigue siendo inviable: $0.45 en fees = **9%**.
- Las transferencias bancarias B2B en LatAm tardan **1–3 días hábiles** y cuestan **$15–35** por wire. Para micropagos M2M es absurdo.
- Sin escrow, el agente proveedor exige pago upfront (riesgo del comprador) o entrega upfront (riesgo del proveedor). **No hay punto medio sin humano arbitrando.**

### ¿Sobrevive al próximo salto de modelos?

**[X] Sí, porque es un problema de WORKFLOW/INTEGRACIÓN, no de OUTPUT**

El próximo modelo foundation no liberado (Opus 5 / Gemini 4) hará a los agentes **más capaces de querer transaccionar**, no menos. Cuanto mejor sea el modelo, más urgente el problema de infraestructura. Los rieles de pago, los contratos inmutables, la verificación on-chain — nada de eso se resuelve con un modelo más inteligente. Es plomería, no inteligencia.

**Durability Score: 5/5**

---

## 2. SEGMENTO TARGET

### ¿Para quién es este producto?

**Beachhead (primeras 4 semanas):** Equipos de **3–15 ingenieros** en startups **Pre-Seed a Series A** en LatAm (Bogotá, México DF, São Paulo, Buenos Aires, Santiago) que están construyendo:

1. **Agent marketplaces** (plataformas tipo Replit Agent, Cursor Cloud, AutoGen orchestrators) que necesitan resolver pagos entre agentes de terceros.
2. **Aplicaciones Fintech con agentes B2B** (cobranza automatizada, validación de KYC entre instituciones, conciliación de pagos cross-border en stablecoins).
3. **Builders Web3** que ya operan con USDC/USDT y construyen flows multi-agente nativos (DeFi automation, on-chain research, oracle networks).

**NO es para:** empresas tradicionales sin agentes desplegados, retail/consumer apps, gobiernos, banca regulada Tier 1.

### ¿Quién controla el veto de confianza?

Dos perfiles, en este orden de poder:

1. **CTO / Head of Engineering** — Decide si el smart contract es auditable y si los SDKs se integran con su stack (típicamente Node/Python + LangChain/CrewAI). Mata la adopción si la auditoría no es de un firm reconocido (Trail of Bits, OpenZeppelin, Sherlock).
2. **Compliance Officer** (en Fintech reguladas) — Mata la adopción si KYA (Know Your Agent) no es defendible ante reguladores locales. **En LatAm específicamente:** SFC en Colombia, CNBV en México, BCB en Brasil.

**Implicación:** El primer flow del MVP debe pasar una auditoría informal de un CTO senior **antes** de invitar a Fintechs.

---

## 3. MOAT PRIMARIO

**[X] Trust Moat**

### ¿Qué trust única poseemos o podemos construir?

Tres capas acumulables:

1. **Smart contract inmutable, auditado y open source** — La confianza no viene de AgentVault Inc., viene del código verificable en Base/Polygon. Cero dependencia del operador.
2. **Red KYA (Know Your Agent) con historial on-chain** — Cada agente tiene reputación medible: completion rate, dispute rate, tiempo promedio de entrega. Los nuevos agentes pagan más colateral; los veteranos pagan menos. **Este historial no es replicable comprando una API.**
3. **Banco de evaluadores AI especializados** — LLMs evaluadores con prompts y criterios validados por casos de uso reales (research, scraping, classification, code review). Cada evaluador tiene su propio track record de accuracy.

**El moat real no es el smart contract** (replicable en 2 semanas). **Es la red de agentes verificados + la biblioteca de evaluadores con accuracy medida en producción.** Eso toma meses de operación real.

---

## 4. ARENA COMPETITIVA

**[X] Pioneer (AI-Native)** — Este mercado no podría existir antes del agentic commerce. No estamos disrumpiendo Stripe; estamos creando una categoría que Stripe no puede servir.

### ¿Cómo sobrevives o complementas a los gigantes?

**Mastercard Agent Pay (lanzado en LatAm, 2026)** opera sobre rieles tradicionales: KYC fuerte de personas, settlement T+1, fees del 1–2%. Sirve B2B regulado entre empresas con identidad legal. **No sirve para agentes anónimos transaccionando en marketplaces abiertos.**

**Visa "Agentic Standards"** está estandarizando pagos iniciados por agentes, pero sigue siendo card-based. Excelente para "agente compra producto físico"; inútil para "agente paga a otro agente $0.20 por una query."

**Stripe + Plaid** no tienen producto M2M nativo. Su unidad económica mínima es ~$1.

**Coinbase Commerce / Circle USDC SDKs** ofrecen rieles, no escrow. Resuelven el "cómo mover dinero," no el "cómo confiar sin humanos."

**Posicionamiento defensible:** Somos la capa de escrow + verificación que **se monta encima de USDC y Base**. Si Coinbase lanza escrow built-in mañana, seguimos teniendo el evaluador AI + el KYA layer + las integraciones verticales con frameworks (LangChain, CrewAI, AutoGen). Pioneer category creator.

---

## 5. UX PARADIGM

**[X] Autonomous** — Cero humano en el loop por diseño.

### ¿Por qué este paradigma?

El producto entero **es la ausencia de humanos**. Si un humano tiene que aprobar la transacción, ya no es agentic commerce — es Stripe con extra pasos. La autonomía no es una feature; **es la propuesta de valor**.

**Excepciones controladas (Human-in-the-Loop solo en):**
- Transacciones >$500 USD (configurable por el builder).
- Disputas activadas por el evaluador con score de incertidumbre >threshold.
- Primera transacción de un agente nuevo en la red (cold start trust).

**Todo lo demás:** agente deposita → trabajo se ejecuta → evaluador valida → fondos se liberan. **Tiempo target: <30 segundos end-to-end.**

---

## 6. AI DECISION TRIANGLE

**[X] Speed**

### Trade-offs que acepto

- **Sacrifico capability del evaluador:** Uso modelos pequeños y rápidos (Haiku 4.5, Gemini Flash) para la mayoría de las validaciones. Los casos complejos suben a Sonnet/Opus, pero son <5% del volumen.
- **Sacrifico cost en gas:** Pago premium por inclusión rápida en bloque (Base prioritization). No optimizo para gas barato si añade 30s de espera.
- **Sacrifico flexibilidad en criterios de evaluación:** Los criterios deben ser **binarios o casi binarios** (cumplió/no cumplió) para que el evaluador rápido funcione. Casos con criterios subjetivos se quedan fuera del MVP.

**Razón de fondo:** En micropagos M2M, la latencia es la propuesta de valor. Un escrow que tarda 5 minutos en liberar fondos rompe el flow del agente que está esperando para pagar al siguiente agente downstream.

---

## 7. MODELO ECONÓMICO

**Modelo de pricing:** Híbrido **Usage-Based + Outcome-Based**

- **0.4% del monto en escrow** + **$0.01 fee fijo** por transacción exitosa.
- **Disputas resueltas a favor del comprador:** refund completo, **no cobramos fee** (alinea incentivos a que el sistema funcione).
- **Tier Enterprise:** Volumen >100K tx/mes baja a 0.25% + acceso a evaluadores custom.

**¿Escala a 10x usuarios?** **[X] Sí**

Cada transacción adicional genera revenue. Costos marginales = gas (~$0.005 en Base) + inference Haiku (~$0.001 por evaluación promedio). El cost-to-serve es flat por transacción; revenue escala con monto y volumen.

### Economía por transacción

| Tamaño escrow | Costo total | Revenue (0.4% + $0.01) | Margen |
|---|---|---|---|
| $1   | $0.013 | $0.014 | 7% |
| $5   | $0.013 | $0.030 | 57% |
| $50  | $0.013 | $0.210 | 94% |
| $500 | $0.013 | $2.010 | 99% |

**Lectura:** El break-even es ~$3. Volúmenes <$3 son loss-leader (acquisition). El producto es **brutalmente rentable a partir de $10 por transacción.**

**Costo estimado por usuario/mes (builder activo, ~200 tx/mes promedio escrow $15):** $2.60
**Revenue por usuario/mes:** $14
**Gross margin proyectado:** **81%**

---

## 8. MÉTRICAS DE ÉXITO

### Métricas de usuario

1. **Volumen mensual de transacciones liquidadas exitosamente** (target Demo Day: 50 tx procesadas en testnet con builders reales; target M+3: 10,000 tx/mes en mainnet).
2. **% de builders integrados que ejecutan >10 tx/mes** (proxy de retención real; target: 30% de los integrados activos).

### Métricas específicas de AI

1. **Accuracy del evaluador en validación de entregables** (medido contra ground truth humano semanal). **Target: >97%.**
2. **Tasa de disputas que requieren intervención manual / HITL.** **Target: <3%** del total de transacciones. Por encima de 5% el producto se rompe — significa que los criterios de evaluación están mal definidos o el evaluador es insuficiente.

**Métrica de salud secundaria:** Tiempo end-to-end de liquidación (depósito → release). **Target p50: <15s, p95: <45s.**

---

## 9. RIESGOS CRÍTICOS

### 1. ¿Qué pasa si el problema desaparece en 12 meses por commoditización?

**Riesgo medio.** Coinbase, Circle o Base podrían lanzar primitivas de escrow built-in en sus SDKs. Si pasa, el smart contract base se commoditiza.

**Mitigación:**
- Doblar la apuesta en el **evaluador AI** (no en el escrow). El smart contract es el plomero; el evaluador es el inspector. Es donde se acumula el data moat.
- Construir **integraciones verticales** con los frameworks de agentes top (LangChain, CrewAI, AutoGen, Anthropic SDK, OpenAI Agents SDK). Volverse la opción default no por ser el más barato, sino por ser el más fácil de integrar.
- KYA layer + reputación on-chain — eso no lo lanza Coinbase porque no es su negocio.

### 2. ¿Puede un competidor replicar el producto con la misma API en menos de 6 semanas?

**Parcialmente sí, pero el moat real no es el código.** El smart contract de escrow es replicable en 2–3 semanas por un equipo competente de Solidity. **Lo que NO es replicable en 6 semanas:**

- **Auditorías de seguridad reales** (Trail of Bits cobra $80K+, toma 6–10 semanas).
- **Historial on-chain de transacciones exitosas** (no se compra, se construye).
- **Red de evaluadores AI con accuracy medida en producción** (cada vertical requiere 100s de transacciones reales para calibrar).
- **Confianza del CTO de turno** (el primer cliente Fintech toma 3–6 meses de cycle).

**Estrategia:** Mover rápido al MVP, audit en sprint paralelo, capturar los primeros 5 design partners como case studies defensibles.

### 3. Si tienes éxito a escala, ¿cuál es la primera forma en que se rompe la confianza?

**Tres vectores de ruptura, en orden de probabilidad:**

1. **Bug en el smart contract → pérdida de fondos.** Es el escenario muerte. Mitigación: auditorías formales múltiples, bug bounty $50K público, límites progresivos por agente, kill switch operacional con timelock.
2. **Evaluador AI falsea release de fondos por trabajo malo (hallucination on validation).** Construye una crisis de confianza en el AI moat. Mitigación: evaluadores con cross-validation (2 modelos independientes votan), score de incertidumbre que escala a HITL, ledger público de evaluaciones para auditoría externa.
3. **Compromiso de la red KYA por agentes falsos farmando reputación.** Mitigación: colateral en stake creciente, slashing on-chain por mala conducta, periodo de "trust ramp-up" para agentes nuevos.

**Verdad incómoda:** El primer bug grave que cause pérdida de fondos define el destino del producto. Por eso la auditoría no es opcional ni post-launch — es pre-launch.

---

*Hardcore AI by 30X — Cohorte 3 — Estación 1 (mayo 2026)*
