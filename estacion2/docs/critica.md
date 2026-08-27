# Deep Research: Crítica — AgentVault
*Fecha: 12 de mayo de 2026 | Hardcore AI Cohorte 3 — Estación 1*

## TL;DR: ¿Por qué AgentVault podría fallar?

- **Coinbase YA tiene esto, gratis, open source, en producción.** El Commerce Payments Protocol (Coinbase + Shopify, lanzado mid-2025) implementa escrow non-custodial en USDC sobre Base con sub-cent fees (~$0.01), authorize/capture/refund, y ya está sirviendo a "millones de merchants Shopify". Tu PVB compite contra una utility ya commodificada.
- **Circle lanzó Agent Stack AYER (11 mayo 2026).** Open-source, USDC-nativo, con Agent Wallets, policy controls, marketplace, y "Nanopayments" sub-céntimos. Si construyes 4 semanas sobre Circle, ellos pueden absorber tu feature en una sprint.
- **x402 (el "killer protocol" del segmento M2M) procesa solo ~$28K/día — y la mitad es wash-trading.** Onchain analysts de Artemis dicen que ~50% de las 131K txns/día son self-dealing o wash trading. El TAM real M2M hoy es minúsculo; el "narrativa de $7B" no tiene fundamento on-chain.
- **Mastercard Agent Pay YA está LIVE en LatAm con Bancolombia, Banco Itaú, Santander, Davivienda, Pomelo, Yuno.** Tu cliente fintech LatAm tiene una rail con compliance built-in, Travel Rule resuelto, y bancos locales en cap-table. ¿Por qué te elegiría a ti?
- **Smart-contract escrow + LLM-as-judge = riesgo cuadrado.** Auditoría real (Trail of Bits, OpenZeppelin) cuesta $60K–$150K, toma 4–8 semanas, y la cola privada agrega 4–12 semanas más. Ningún auditor serio te firma una review en 4 semanas. Y los LLM judges fallan 20–40% en tareas de razonamiento; en disputas financieras eso es inaceptable.

**Veredicto adelantado: 4.5/5 de riesgo. NO construir como producto comercial. Como ejercicio pedagógico para aprender Solidity + agentic stacks, OK. Como apuesta de 4 semanas para ir a mercado, suicidio.**

---

## 1. ¿Qué pasó con AIsaEscrow? Lecciones del silencio post-hackathon

**AIsaEscrow ganó SEGUNDO LUGAR, no primero.** Primer hallazgo importante: el PVB original está usando información imprecisa. AIsa quedó runner-up en el Agentic Commerce on Arc hackathon (Circle + Google DeepMind + Gemini), celebrado en SF el 23–24 de enero de 2026 ([RootData](https://www.rootdata.com/news/519859), [GlobeNewswire](https://www.globenewswire.com/news-release/2026/01/26/3225771/0/en/AIsa-Awarded-Second-Place-at-Circle-Google-Backed-Agentic-Commerce-on-Arc-Hackathon.html)).

**Lo que sí sabemos del equipo:**
- Founder/CEO: Jordan Liu. Compañía seed-stage US-based, fundada 2025.
- Seed round cerrada el 27 oct 2025 con SNZ, Waterdrip Capital, CatcherVC — antes del hackathon ([Tracxn](https://tracxn.com/d/companies/aisa/__DUZVQpyJZT_bRVUUXIKgx9zApNz9MNUCXgF92-b0waE)).
- Producto original: AIsa AI Marketplace (marketplace.aisa.one), una plataforma de unified API para LLM inference, search y data sources — live "desde finales de 2025".

**Lo que NO encontramos (= señal):**
- Cero comunicados de prensa, posts técnicos, demos públicas o anuncios de AIsaEscrow en producción entre febrero–mayo 2026.
- El producto que sí está vivo es "AIsa Skills" en el marketplace OpenClaw — **un giro hacia agent skills/marketplace, NO escrow**. Esto es un pivot suave: el equipo dejó AIsaEscrow como tech demo y dobló apuestas en monetización de skills.

**Interpretación crítica [no verificada directamente, inferida del patrón]:** AIsa probó el "agentic escrow" como vehículo PR/hackathon para validar narrativa, vio que la demanda real no estaba ahí (consistente con datos x402), y pivoteó al producto core (marketplace). Si un equipo con seed ya cerrada, infraestructura productiva y 6 inversores no le dedicó cycles a comercializar AIsaEscrow después de ganarse el reflector con Circle/Google detrás, **eso te dice todo lo que necesitas saber del PMF de "AI-native escrow standalone"**.

**Lección para AgentVault:** si AIsa con todas las ventajas iniciales no comercializó esto, ¿qué te hace pensar que cuatro semanas y un estudiante de cohorte sí lo harán?

---

## 2. Riesgo de commoditización: Coinbase/Circle/Base ya están en producción

Esta es la sección donde el caso AgentVault casi muere por sí solo. La commoditización **NO está a 6–12 meses; ya pasó.**

### 2.1 Coinbase Commerce Payments Protocol (live desde 2025)

- Open-source en GitHub ([coinbase/commerce-onchain-payment-protocol](https://github.com/coinbase/commerce-onchain-payment-protocol)) ([Coinbase blog](https://www.coinbase.com/blog/coinbase-commerce-onchain-payment-protocol-deep-dive), [Shopify Engineering](https://shopify.engineering/commerce-payments-protocol)).
- Implementa **escrow no-custodial en USDC sobre Base** con flujo authorize / capture / void / refund — esencialmente el modelo Visa/Mastercard en smart contracts.
- **Fees de ~$0.01 (un centavo), settlement sub-segundo (~200ms).**
- Ya rolling out a "millones de Shopify merchants" globalmente.
- Y, además, **Coinbase Business** lanzó un suite de payment tools para empresas.

Tu propuesta de "smart-contract escrow en USDC para builders Web3/Fintech LatAm" no es diferenciable de esto. Tendrías que justificar muy bien qué agregas que el protocolo de Coinbase no haga gratis.

### 2.2 Circle Agent Stack (lanzado AYER, 11 mayo 2026)

[Circle blog](https://www.circle.com/blog/introducing-circle-agent-stack-financial-infrastructure-for-the-agentic-economy), [Crowdfund Insider](https://www.crowdfundinsider.com/2026/05/278776-stablecoin-issuer-circle-launches-open-source-infrastructure-for-agentic-economy/).

Cinco productos open-source live en `agents.circle.com`:
1. **Agent Wallets** — policy-controlled, allowlist/blocklist, spending limits.
2. **Agent Marketplace** — directorio de servicios agénticos que agents pueden descubrir y pagar.
3. **Circle CLI** — wallets/policies/transactions vía CLI.
4. **Nanopayments (Circle Gateway)** — gas-free, sub-céntimo, machine-speed.
5. **Circle Skills** — patterns para desarrolladores con AI tools.

**Importante (matiz que protege tu honestidad):** Circle Agent Stack en su release de ayer **NO incluye explícitamente "escrow contracts" como producto separado**. Pero Circle ya tiene la base: su [AI-Powered Escrow Agent](https://www.zenml.io/llmops-database/ai-powered-escrow-agent-for-programmable-money-settlement) (ZenML case study) combina OpenAI multimodal + Circle Wallets + Circle Contracts + Smart contract templates para parsear contratos PDF, deployar escrow, verificar entregables por imagen y settlear USDC. **Eso es literalmente AgentVault.** Circle puede empacarlo y lanzarlo en un sprint si ven demanda.

### 2.3 Base y el hackathon ecosystem

[CoinDesk: AI agents fueled startups en Consensus Miami EasyA hackathon, 8 mayo 2026](https://www.coindesk.com/tech/2026/05/08/ai-agents-fueled-a-frenzy-of-startup-building-at-the-consensus-miami-easya-hackathon). El 3er lugar fue **Giggy**: "marketplace where users hire AI agents… payments locked in crypto escrow on Base". Esto es agentic escrow construido en un fin de semana. La idea no tiene moat.

**Veredicto sección 2:** No hay 6–12 meses de runway. Coinbase ya está aquí (gratis), Circle ya está aquí (ayer), y cada hackathon de Base/Solana produce 3 clones del concepto.

---

## 3. Riesgo competitivo: Mastercard Agent Pay y Visa TAP

### 3.1 Mastercard Agent Pay en LatAm — YA VIVO

- Diciembre 2025: anuncio formal de lanzamiento LatAm ([Mastercard press](https://www.mastercard.com/news/latin-america/en/newsroom/press-releases/pr-en/2025/december/mastercard-unveils-agent-pay-in-latin-america-and-the-caribbean/), [Silicon Caribe](https://www.siliconcaribe.com/2025/12/09/mastercard-to-launch-agent-pay-across-the-caribbean-in-2026-ushering-in-the-regions-ai-commerce-era/)).
- Marzo 2026: Mastercard reporta **transacciones live ya completadas en la región** ([The Paypers](https://thepaypers.com/payments/news/mastercard-launches-agent-pay-in-latin-america-and-the-caribbean)).
- Bancos/fintechs ya integrados como issuers/processors: **Bancolombia (Cibest Group), Banamex, Banco Itaú, Banco Galicia, Santander, Davivienda, BAC, Banco Falabella, Cencosud-Scotiabank, Pomelo, Yuno, Dock, Evertec, Getnet, MagaluPay, ueno bank**.

Esa lista es exactamente tu ICP (Fintech LatAm). Y todos ya están conectados a Mastercard.

### 3.2 Visa Trusted Agent Protocol (TAP)

[Visa TAP en GitHub](https://github.com/visa/trusted-agent-protocol), [Visa investor news](https://investor.visa.com/news/news-details/2025/Visa-Introduces-Trusted-Agent-Protocol-An-Ecosystem-Led-Framework-for-AI-Commerce/default.aspx).

- Open framework sobre HTTP + cryptographic signatures para distinguir agents legítimos de bots.
- Specs ya públicas; "millones de consumidores usando AI agents en el holiday season 2026" según Visa.
- Visa + Santander LatAm anunciaron proyecto agentic en marzo 2026 ([PYMNTS](https://www.pymnts.com/partnerships/2026/santander-and-visa-launch-latam-agentic-payments-project/)).
- Y bonus: Visa stablecoin settlement volume **$4.5B annualized en enero 2026, +460% YoY** — Visa puede settlear en USDC también.

### 3.3 ¿Por qué un CFO de Fintech LatAm te elegiría?

Brutal honestidad: **probablemente no lo haría hoy.** Mastercard/Visa tienen:
1. **Compliance built-in:** Travel Rule, OFAC/UN/local sanctions screening, KYC/AML. Tú tienes "smart contract sobre Base" + un LLM no auditado por reguladores.
2. **Issuer/acquirer ya integrado.** Pomelo, Dock, Bancolombia ya tienen pipes a Mastercard.
3. **Reverso de transacciones nativo.** Chargebacks, disputas, recursos legales conocidos.
4. **Brand trust.** Una fintech B2B no va a contar a su board que su sistema crítico de escrow corre sobre un contrato Solidity recién deployado.

El bull case de AgentVault sería costos: USDC + smart contract es <$0.05/tx vs. Mastercard interchange (~1.5–2.9%). Pero a) Coinbase Commerce Protocol también ofrece eso (y ya en Base), y b) BVNK ya es la rail enterprise estándar con $10B annualized — están entre tú y Mastercard.

---

## 4. Riesgo técnico: smart contract exploits + auditoría real

### 4.1 Historial reciente de exploits relevantes

- **2024:** ~$14B perdidos por vulnerabilidades de smart contracts ([Hacken](https://hacken.io/discover/smart-contract-vulnerabilities/), [CoinLaw](https://coinlaw.io/smart-contract-security-risks-and-audits-statistics/)).
- **2024:** Sonne Finance — $20M (mayo 2024), exploit por safeguards faltantes en Compound V2 fork.
- **2024:** Penpie DeFi — $27M en ETH por reentrancy.
- **2025:** Cetus — **$223M** (mayo 2025) por liquidity math overflow.
- **2025:** Balancer — **$128M** (nov 2025) en un solo exploit.
- **H1 2025:** $263M en daños solo por bugs de smart contracts.
- **Access control flaws** son el #1 vector — $953.2M en pérdidas.
- **Reentrancy** acumula $300M+ desde enero 2024.

Tu PVB de 4 semanas con escrow custodiando funds de clientes está en la categoría más explotada del espacio.

### 4.2 Costos reales de auditoría 2026

Datos cruzados de [Sherlock 2026 pricing](https://sherlock.xyz/post/smart-contract-audit-pricing-a-market-reference-for-2026), [Solulab guide](https://www.solulab.com/smart-contract-audit-cost/), [7BlockLabs benchmarks](https://www.7blocklabs.com/blog/smart-contract-audit-cost-range-2026-and-trail-of-bits-smart-contract-audit-cost-benchmarks):

| Firm tier | Price (2026) | Timeline | Wait queue |
|---|---|---|---|
| Trail of Bits | ~$25K / engineer-week | 1–3 wks (DeFi std) hasta 8+ (complejo) | 4–12 wks de espera privada |
| OpenZeppelin | ~$25K / engineer-week | 1–3 wks std | similar |
| CertiK | $80K–$200K rango enterprise | 1–4 wks | – |
| Sherlock / Code4rena (competitive) | $20K–$200K prize pool | 1–2 wks | requiere prep |
| Cyfrin / Spearbit | $60K–$120K mid-complexity | 2–4 wks | – |

**Realidad sobria:** un budget realista para escrow contracts de complejidad media es **$60K–$120K incluyendo remediation review**, con un calendario total de **8–16 semanas** (queue + audit + fixes + re-audit).

**No puedes lanzar un escrow B2B serio en 4 semanas.** Si lanzas sin audit, ningún Fintech CFO firmará. Si lanzas con un auditor de $5K que rota en 5 días, has comprado teatro de seguridad, no seguridad. Y si lo lanzas como "MVP solo demo, no production", entonces no es PVB, es un proyecto académico.

---

## 5. Riesgo de producto: LLM-as-judge no es confiable a escala

### 5.1 Datos duros de accuracy

[Survey LLM-as-a-judge (Cell, 2026)](https://www.cell.com/the-innovation/fulltext/S2666-6758(25)00456-4), [Judge's Verdict benchmark](https://openreview.net/forum?id=jVyUlri4Rw), [DataRobot](https://www.datarobot.com/blog/llm-judges/), [Eugene Yan](https://eugeneyan.com/writing/llm-evaluators/):

- **Tareas estructuradas (Q&A, code):** >80% agreement con humanos.
- **Dominios de expertise (legal, médico, financiero):** **60–68%** agreement entre SME y LLM.
- **GPT-4 sin abstention:** **63.2%** agreement con humanos en exámenes legales.
- **Reasoning-heavy tasks:** Fleiss' Kappa 0.1–0.32 (acuerdo modesto a pobre).
- **Multilingual (importante para LatAm — español/portugués):** Fleiss Kappa ~0.3 en 25 idiomas — significativamente peor que inglés.
- **CALM framework** identifica **12 sesgos distintos** en LLM judges (posición, verbosidad, lenient scoring, formatting bias).
- Un solo flaw en un eval framework puede sesgar resultados **10–20%**.

### 5.2 Vulnerabilidades adversariales

[Bad Likert Judge (Palo Alto Unit 42)](https://unit42.paloaltonetworks.com/multi-turn-technique-jailbreaks-llms/), [Bypassing guardrails](https://arxiv.org/html/2504.11168v1), [OWASP LLM01 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/):

- "Bad Likert Judge" técnica jailbreakea evaluadores explotando su capacidad de scoring.
- Multi-turn attacks funcionan en GPT-4, Claude 2, Mistral, Vicuna (1,400 prompts adversariales testeados).
- Hidden prompts en académicos manipularon AI peer review en 2025 — equivalente directo a un proveedor inyectando texto en un deliverable para que tu LLM judge apruebe el milestone.
- **Tu LLM judge es atacable por el actor cuyo trabajo está siendo evaluado.** Eso es un agujero arquitectónico.

### 5.3 Aritmética de disputas

Tu escenario: 10,000 tx/mes, eval falla 3%. Eso son **300 disputas/mes**.

Realidad:
- Si tu accuracy real es 65% (rango realista para reasoning-heavy en español), son **3,500 disputas/mes** sobre 10K.
- Cada disputa exige human-in-the-loop, claim portal, evidencia, refund logic, política legal.
- Sin un equipo de ops + legal + ML + smart-contract upgradeability, te ahogas en mes 2.
- Y los LLM "sobre-aprueban" (lenient scoring bias documentado) — entonces tu peor caso no son disputas; es FRAUDE silencioso donde el proveedor entrega basura y el LLM judge le libera funds.

**Esto solo es viable con escrow stage discreto + verificación humana mandatoria + LLM como pre-filter, no como árbitro. Y eso anula la propuesta "autónoma" del producto.**

---

## 6. ¿"Agentic commerce" es una categoría real o vaporware? (TAM real)

### 6.1 La narrativa vs. la realidad on-chain

[CoinDesk: x402 demand is just not there yet (11 mar 2026)](https://www.coindesk.com/markets/2026/03/11/coinbase-backed-ai-payments-protocol-wants-to-fix-micropayment-but-demand-is-just-not-there-yet), [AInvest](https://www.ainvest.com/news/coinbase-x402-28k-daily-volume-reality-check-2603/), [MEXC](https://www.mexc.com/news/901995), [KuCoin](https://www.kucoin.com/news/flash/coinbase-backed-x402-protocol-reports-daily-volume-of-28-000-amid-high-valuation):

**x402, el supuesto rail M2M, datos abril 2026:**
- 69,000 active agents
- 165 millones de transacciones cumulativas
- ~$50M volumen cumulativo
- **Daily volume reciente: ~$28,000 USD** (sí, veintiocho mil dólares por día — eso es una bodega cafetera, no un mercado global).
- 131K txns/día → avg $0.20/tx
- Onchain analysts (Artemis): **~50% wash trading / self-dealing**.
- Ecosystem market cap: ~$7B → ratio narrative-to-reality es 250,000:1.

**Coinbase's own engineering head, Erik Reppel, en CoinDesk:** efectivamente reconoció que la demanda real no está ahí todavía, defendiendo el caso como apuesta de largo plazo.

### 6.2 Las forecasts grandes son aspiracionales

- Juniper Research: **$8B en gasto agentic en 2026**, escalando a $1.5T en 2030 ([Juniper](https://www.juniperresearch.com/research/fintech-payments/ecommerce/agentic-commerce-research-report/)).
- McKinsey: $1T en US retail orchestrated, $3–5T global para 2030.
- Mercado agentic commerce 2026: $5.71B → $7.71B ([Cognitive Market Research](https://www.cognitivemarketresearch.com/agentic-commerce-market-report)).

**Pero estas cifras son "agentic commerce" amplio**, que incluye ChatGPT/Gemini/Copilot empujando users humanos a comprar — NO M2M con escrow autónomo. El sub-segmento M2M autónomo (tu mercado) es donde x402 vive — y ese mercado es **$28K/día y la mitad es wash**.

[Criteo](https://www.criteo.com/blog/agentic-commerce-is-emerging-just-not-the-way-most-people-expect/) y [Skift](https://skift.com/2026/03/05/openai-chatgpt-checkout-walkback/) reportan que OpenAI mismo se replegó del checkout directo en marzo 2026, devolviendo el flujo a third-party — señal de que ni el actor más posicionado encuentra el wedge.

### 6.3 Veredicto TAM

**El TAM agentic M2M HOY (mayo 2026) está entre $1–10M/mes globalmente** descontando wash trading. **Eso no es un mercado, es un demo.**

Tu producto no fallaría por falta de tecnología; fallaría porque **la demanda no existe todavía**. Y cuando exista, en 2027–2028, Coinbase/Circle/Mastercard/Visa estarán ya posicionados con producto en producción y miles de devs como Lego pieces.

---

## Veredicto crítico

**Riesgo score: 4.5/5 (kill-or-pivot).**

AgentVault como está descrito es un producto que: (a) compite contra infraestructura gratis open-source de Coinbase y Circle, ambos ya en producción; (b) tiene como cliente target el mismo segmento (Fintech LatAm) que Mastercard Agent Pay y Visa TAP ya integraron con los bancos top del mercado; (c) propone escrow con funds reales en custodia bajo Solidity construido en 4 semanas (sin tiempo ni budget para auditoría seria); (d) usa LLM-as-judge para resolución de pagos en un dominio donde la accuracy real es 60–68% y existe attack surface adversarial documentado; (e) sirve un mercado M2M cuyo volumen real on-chain es $28K/día con la mitad wash. La ganadora de runner-up del hackathon Arc, AIsa, pivoteó silenciosamente a Skills Marketplace en lugar de comercializar el escrow — eso es el N=1 más caro de ignorar. **Como ejercicio pedagógico para tocar todos los stacks (Solidity, agents, LLM eval, USDC), tiene valor. Como apuesta comercial de 4 semanas, es comprar un boleto a la trinchera de los proyectos que mueren a los 6 meses.**

---

## ¿Qué cambiaría del PVB?

1. **Kill "smart-contract escrow propio". Hazte builder ON TOP de Coinbase Commerce Protocol o Circle Agent Stack.** La capa de valor no está en el contrato; está en orchestration, dispute UX, integración local LatAm. Forkea o integra, no reinventes.
2. **Pivot al wedge: "agente verificador de entregables" como SaaS API**, no como rail de pago. Ofreces el LLM-evaluator + auditoría humana como servicio que se llama desde el contrato de quien sea (Coinbase, Circle, Stripe). Te conviertes en herramienta, no en plataforma — y eso te quita el riesgo de custodia + auditoría.
3. **Cambia el target: builders Web3 ≠ fintechs reguladas.** Si quieres builders Web3 (el mercado de x402), aceptas que el TAM es $28K/día y construyes para esa comunidad. Si quieres fintechs LatAm, abandonas crypto y construyes sobre Mastercard Agent Pay APIs (que están públicas). No se pueden cazar ambas con un PVB de 4 semanas.
4. **Reduce el alcance: una sola vertical, un solo idioma de evaluación.** Por ejemplo: "AgentVault para freelance dev work en español/inglés", verificación con tests automatizados (no LLM judging libre). Eso elimina el riesgo de evaluator hallucination y te da un caso de uso defensible.
5. **Si insistes en construir lo original tal cual: no pongas dinero real custodiado en el demo de 4 semanas.** Construye en testnet, con stablecoin sintética, y vende la demo como "proof of concept" educativo. Ese cambio te salva del compromiso legal/de auditoría y respeta el timebox.

---

## Fuentes citadas

### AIsa / Arc Hackathon
- [AIsa won runner-up at Agentic Commerce on Arc — RootData](https://www.rootdata.com/news/519859)
- [AIsa Awarded Second Place — GlobeNewswire](https://www.globenewswire.com/news-release/2026/01/26/3225771/0/en/AIsa-Awarded-Second-Place-at-Circle-Google-Backed-Agentic-Commerce-on-Arc-Hackathon.html)
- [AIsa Tracxn profile](https://tracxn.com/d/companies/aisa/__DUZVQpyJZT_bRVUUXIKgx9zApNz9MNUCXgF92-b0waE)
- [AIsa Skills launches on OpenClaw — Phemex News](https://phemex.com/news/article/aisa-skills-launches-on-openclaws-plugin-marketplace-streamlining-ai-agent-deployment-57375)
- [Guest Post: New Era of Agentic Commerce — Arc Community](https://community.arc.network/public/blogs/the-new-era-of-agentic-commerce-highlights-from-the-arc-hackathon)

### Coinbase / Base / Commerce Protocol
- [Coinbase Commerce Onchain Payment Protocol deep dive — Coinbase blog](https://www.coinbase.com/blog/coinbase-commerce-onchain-payment-protocol-deep-dive)
- [Coinbase commerce-onchain-payment-protocol — GitHub](https://github.com/coinbase/commerce-onchain-payment-protocol)
- [Introducing the commerce payments protocol — Shopify Engineering](https://shopify.engineering/commerce-payments-protocol)
- [Coinbase launches stablecoin payment stack — CryptoSlate](https://cryptoslate.com/coinbase-launches-stablecoin-payment-stack-with-usdc-checkout-targeting-commerce-giants/)
- [Programmable Payments Are Here — Fintech Wrap Up](https://www.fintechwrapup.com/p/deep-dive-coinbases-commerce-payments)

### Circle / Agent Stack
- [Introducing Circle Agent Stack — Circle blog](https://www.circle.com/blog/introducing-circle-agent-stack-financial-infrastructure-for-the-agentic-economy)
- [Circle Launches AI Infrastructure — Investor.Circle](https://investor.circle.com/news/news-details/2026/Circle-Launches-AI-Infrastructure-to-Power-the-Agentic-Economy/default.aspx)
- [Stablecoin Issuer Circle Launches Open-Source Infrastructure — Crowdfund Insider](https://www.crowdfundinsider.com/2026/05/278776-stablecoin-issuer-circle-launches-open-source-infrastructure-for-agentic-economy/)
- [Circle Agent Stack — Blockhead](https://www.blockhead.co/2026/05/12/circle-launches-agent-stack-to-put-usdc-at-the-centre-of-machine-to-machine-payments/)
- [Circle: AI-Powered Escrow Agent — ZenML Database](https://www.zenml.io/llmops-database/ai-powered-escrow-agent-for-programmable-money-settlement)

### Mastercard Agent Pay
- [Mastercard unveils Agent Pay in LatAm — Mastercard press](https://www.mastercard.com/news/latin-america/en/newsroom/press-releases/pr-en/2025/december/mastercard-unveils-agent-pay-in-latin-america-and-the-caribbean/)
- [Mastercard launches Agent Pay — The Paypers](https://thepaypers.com/payments/news/mastercard-launches-agent-pay-in-latin-america-and-the-caribbean)
- [Mastercard launches Agent Pay — BNamericas](https://www.bnamericas.com/en/news/mastercard-launches-agent-pay-in-latin-america-and-the-caribbean)
- [Mastercard to Launch Agent Pay Caribbean 2026 — Silicon Caribe](https://www.siliconcaribe.com/2025/12/09/mastercard-to-launch-agent-pay-across-the-caribbean-in-2026-ushering-in-the-regions-ai-commerce-era/)

### Visa Trusted Agent Protocol
- [Visa Trusted Agent Protocol — Visa Developer](https://developer.visa.com/capabilities/trusted-agent-protocol/trusted-agent-protocol-specifications)
- [Visa TAP repo — GitHub](https://github.com/visa/trusted-agent-protocol)
- [Visa Introduces Trusted Agent Protocol — Visa investor](https://investor.visa.com/news/news-details/2025/Visa-Introduces-Trusted-Agent-Protocol-An-Ecosystem-Led-Framework-for-AI-Commerce/default.aspx)
- [Santander and Visa Launch LatAm Agentic Project — PYMNTS](https://www.pymnts.com/partnerships/2026/santander-and-visa-launch-latam-agentic-payments-project/)

### Smart contract security / exploits / audits
- [Top 10 Smart Contract Vulnerabilities 2025 — Hacken](https://hacken.io/discover/smart-contract-vulnerabilities/)
- [Smart Contract Security Risks Statistics 2026 — CoinLaw](https://coinlaw.io/smart-contract-security-risks-and-audits-statistics/)
- [Sherlock: Smart Contract Audit Pricing 2026](https://sherlock.xyz/post/smart-contract-audit-pricing-a-market-reference-for-2026)
- [Smart Contract Audit Cost 2026 — Solulab](https://www.solulab.com/smart-contract-audit-cost/)
- [2026 Audit Costs Trail of Bits — 7BlockLabs](https://www.7blocklabs.com/blog/smart-contract-audit-cost-range-2026-and-trail-of-bits-smart-contract-audit-cost-benchmarks)

### LLM-as-judge accuracy / vulnerabilities
- [Survey on LLM-as-a-judge — Cell Innovation](https://www.cell.com/the-innovation/fulltext/S2666-6758(25)00456-4)
- [Judge's Verdict Benchmark — OpenReview](https://openreview.net/forum?id=jVyUlri4Rw)
- [Evaluating LLM-Evaluators — Eugene Yan](https://eugeneyan.com/writing/llm-evaluators/)
- [Can You Trust LLM Judges — DataRobot](https://www.datarobot.com/blog/llm-judges/)
- [Bad Likert Judge — Palo Alto Unit 42](https://unit42.paloaltonetworks.com/multi-turn-technique-jailbreaks-llms/)
- [OWASP LLM01 Prompt Injection 2025](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
- [Bypassing Prompt Injection in LLM Guardrails — arXiv 2504.11168](https://arxiv.org/html/2504.11168v1)

### x402 / Agentic Commerce TAM
- [Coinbase-backed x402 demand is just not there yet — CoinDesk](https://www.coindesk.com/markets/2026/03/11/coinbase-backed-ai-payments-protocol-wants-to-fix-micropayment-but-demand-is-just-not-there-yet)
- [Coinbase's x402 $28k Daily Volume Reality Check — AInvest](https://www.ainvest.com/news/coinbase-x402-28k-daily-volume-reality-check-2603/)
- [x402 protocol $28,000 daily volume — MEXC](https://www.mexc.com/news/901995)
- [Welcome to x402 — Coinbase docs](https://docs.cdp.coinbase.com/x402/welcome)
- [Agentic Commerce Market Report — Juniper Research](https://www.juniperresearch.com/research/fintech-payments/ecommerce/agentic-commerce-research-report/)
- [Agentic Commerce is emerging — Criteo](https://www.criteo.com/blog/agentic-commerce-is-emerging-just-not-the-way-most-people-expect/)
- [ChatGPT Bails on Transactions — Skift](https://skift.com/2026/03/05/openai-chatgpt-checkout-walkback/)

---

*Hardcore AI by 30X — Cohorte 3 — Estación 1 | Documento generado el 12 de mayo de 2026*
