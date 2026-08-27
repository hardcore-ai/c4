# Overview del dominio: Agentic Commerce y rieles de pago M2M

> Documento de contexto para AgentVault — Estación 1 / Estación 2, Cohorte 3.
> Fuente: Deep research de validación, mayo 2026.

---

## 1. Por qué AHORA

El último semestre fue un punto de inflexión observable. No es predicción — son anuncios con métricas. En menos de seis meses, las tres redes globales (Mastercard, Visa, Stripe) más los dos labs LLM más grandes (OpenAI, Anthropic) más un consorcio Linux Foundation se movieron de "concept" a "live transactions" en agentic commerce.

### Las tres redes globales

**Mastercard Agent Pay (LatAm)**
- Diciembre 2025: anuncio formal con Davivienda, Evertec, Getnet, MagaluPay, Yuno.
- Marzo 2026: **transacciones agénticas en vivo end-to-end en LAC** con AI agents haciendo compras reales débito/crédito en 17+ bancos (Itaú, Santander, Bancolombia, entre otros).
- Mecanismo: Agentic Tokens — credenciales digitales dinámicas para que AI agents transen on behalf of consumers.

**Visa Trusted Agent Protocol (TAP)**
- Octubre 2025: TAP lanzado con 10+ partners. Framework abierto sobre infraestructura web existente; usa HTTP messages criptográficamente firmados para transmitir intent del agente + identidad + payment details.
- 2026: Visa Agentic Ready se expandió a LatAm (originalmente UK/Europa).
- Intelligent Commerce Connect ya soporta **4 protocolos paralelos**: TAP, Machine Payments Protocol (MPP), Agentic Commerce Protocol (ACP), Universal Commerce Protocol (UCP).

**Stripe + OpenAI: Agentic Commerce Protocol (ACP)**
- Stripe co-desarrolló ACP con OpenAI. Integrado con Microsoft Copilot, Anthropic, Perplexity, Vercel, Lovable, Replit, Bolt, Manus.
- Shared Payment Tokens (SPT) — primitive para que agentes inicien pagos con permisos del buyer sin exponer credenciales.
- En Sessions 2026: Agentic Commerce Suite expandida a Meta y Google, lanzamiento de Link's agent wallet y streaming payments vía Metronome + Tempo.
- ChatGPT (700M weekly users) opera Instant Checkout desde Etsy y se expande a 1M+ Shopify merchants.

### Los labs LLM

**Anthropic — foco en agentes financieros enterprise**
- Claude Opus 4.7 ya en producción en JPMorgan, Goldman Sachs, Citi, AIG y Visa.
- Revenue run rate de $30B en abril 2026 (vs $9B fin 2025, $14B feb, $19B mar).
- Vía MCP, Anthropic integra con x402 para que Claude descubra servicios y autorice pagos autónomamente.

**OpenAI / Sam Altman**
- AgentKit (vía World) integrado con x402 para verificar "humano detrás del agente".
- American Express adquirió Hyper (startup backed por Altman) para llevar agentic AI a corporate expense management.

---

## 2. El stack técnico: x402, ERC-8004, ERC-8183

La infraestructura está estandarizándose como capas separadas.

### x402 — pagos
- Mayo 2025: Coinbase open-sourced x402.
- Septiembre 2025: Coinbase + Cloudflare anunciaron x402 Foundation.
- Abril 2026: Linux Foundation formalizó x402 Foundation con Adyen, AWS, American Express, Base, Circle, Fiserv, Google, KakaoPay, Mastercard, Microsoft, Polygon Labs, PPRO, Shopify, Solana Foundation, Stripe, thirdweb, Visa.

**Performance técnico**
- **Base:** settlement en ~200ms, finalidad sub-segundo. 119M+ transacciones acumuladas, $35M valor.
- **Solana:** 400ms finality, ~$0.00025 por transacción. 49% del market share x402.
- **USDC dominante:** 99.8% del volumen x402.

**Métricas de volumen — caveats importantes**
- Optimista (abril 2026): 69K agentes activos, 165M transacciones, ~$50M acumulado.
- Mid-rango: $600M en volumen anualizado.
- **Realista (CoinDesk marzo 2026):** Solo ~$28K/día reales on-chain. Artemis estima ~50% "gamed". *"Demand is just not there yet."*

### ERC-8004 — identidad y reputación on-chain
- Mainnet 29 enero 2026. Capa de identidad para agentes con historial verificable.

### ERC-8183 — escrow + commerce
- Propuesto 25 feb 2026. Job primitive con 4 estados (Open / Funded / Submitted / Completed) que encapsula task + escrow + evaluation + settlement on-chain. Co-desarrollado por Virtuals + dAI/Ethereum Foundation.

### El stack completo en una frase

> "x402 maneja la ejecución del pago, ERC-8004 maneja la identidad y reputación del agente, ERC-8183 maneja la capa transaccional comercial."

**Implicancia para AgentVault:** El stack que AgentVault necesita ya existe como capas estandarizadas. Esto reduce el technical lift pero **elimina parte del moat técnico**: el escrow programable ya es un standard ERC del que cualquiera puede construir encima.

---

## 3. Trayectoria de los proyectos hackathon

El Agentic Commerce on Arc Hackathon (9–24 enero 2026, co-hosted Arc/Circle, Google DeepMind, MindsDB) reunió 1,200+ developers y produjo señales útiles.

**Arc & Circle Track (On-Site):**
- 1er lugar: NewsFacts — data commerce verificable
- 2º lugar: AIsaEscrow — escrow para agentic commerce
- 3er lugar: VibeCard

**Google Track:**
- 1º: OmniAgentPay ($20K GCP credits) — Python SDK con una sola llamada `pay()` para USDC + x402 + CCTP cross-chain

### AIsa: la empresa detrás de AIsaEscrow

- **Sitio:** [aisa.one](https://aisa.one/)
- **Founder/CEO:** Jordan Liu (anterior co-founder de UXUY, multi-chain wallet con 5M+ users).
- **Funding total:** $10M+ con Binance Labs, SNZ, Waterdrip, CatcherVC (oct 2025).
- **Producto:** AIsa Payment Network + AgentPay Guard SDK. Posicionamiento: "alternativa a x402 y fiat tradicional" con on-chain escrow.
- **Equipo:** "Seasoned experts from Meta, MasterCard, and Bloomberg."
- **Partnership status:** Listed en Circle Alliance Directory.

**Implicancia para AgentVault:** AIsa es el competidor directo más maduro del espacio que AgentVault propone. $10M, equipo senior, partner con Circle, producto comercial en mercado. AgentVault necesita un wedge defensible para no ser un me-too con menos recursos.

---

## 4. Otros builders activos en agent payments / escrow

| Proyecto | Foco | Funding | Notable |
|---|---|---|---|
| **Nava Labs** | On-chain escrow + verification para AI financial agents (L3 sobre Arbitrum, deploy paralelo en Tempo) | **$8.3M seed (abril 2026)** co-led Polychain + Archetype | Krishnan + Brianna Montgomery (ex-EigenLayer) |
| **AIsa** | AI-native payment network + AgentPay Guard SDK + AIsaEscrow | $10M+ (Binance Labs, SNZ, Waterdrip, CatcherVC) | Jordan Liu (ex-UXUY) |
| **Skyfire** | Agent wallets + payment + identity | $9.5M (Coinbase Ventures, a16z CSX, Neuberger Berman) | — |
| **Crossmint** | Virtual Visa/Mastercard cards para AI agents | $23.6M (Ribbit, Franklin Templeton, Lightspeed Faction) | — |
| **Catena Labs** | AI-native payment capabilities | Backed por Coinbase Ventures + Stripe | — |
| **Payman** | AI-to-user payment platform (fiat + USDC) | $3M pre-seed (Visa, Coinbase Ventures, Spartan) | — |
| **PayCrow** | USDC escrow + on-chain dispute resolution sobre x402 | No disclosed | — |
| **Nekuda** | Agentic payments | $5M seed (mayo 2025, Madrona, Amex, Visa Ventures) | — |

### Hackathon projects con tracción

- **Giggy** (EasyA Hackathon Miami mayo 2026): escrow USDC en Base + agents pagando APIs vía x402.
- **Chainlens**: x402-compatible layer que solo libera pago si la respuesta del API se autentica.
- **Talos** (CDMX hackathon): autonomous agent corporation framework con payment x402 — **primera señal concreta México**.
- **AgentHire**: marketplace trustless de agentes basado en ERC-8004 + ERC-8183, escrow on-chain con evaluator attestation.

**Builders LatAm con foco específico en agentic AI:** Es el hueco. Solo Talos en CDMX como señal concreta. Hay capacidad evidente (Brazil hosting Blockchain.RIO ago 2026, MERGE marzo 2026) pero ningún builder LatAm consolidado dedicado a agent escrow específicamente. Esto puede ser oportunidad real o señal de no-mercado.

---

## 5. Veredicto del espacio

El mercado existe y es urgente HOY. Los grandes actores convergen, los standards se forman, los startups bien-fondeados compiten. Pero la **demanda orgánica todavía no llega** ($28K/día reales según CoinDesk).

AgentVault opera en un mercado real pero en formación. La timing window útil es **12–18 meses** antes del inflection point. La estrategia debe asumir un mercado "vacío" durante ese período y planificar runway acordemente.

---

*Hardcore AI by 30X — Cohorte 3 — Estación 1*
