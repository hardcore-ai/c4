# Análisis de mercado — Agentic commerce M2M en LatAm

> Documento de contexto para AgentVault.
> Fuente: Deep research de validación, mayo 2026.

---

## 1. Tamaño y volumen de stablecoins en LatAm

LatAm es **el mercado más maduro del mundo en stablecoins B2B** medido por tasa de adopción institucional.

- **2025 LatAm:** $324B en transaction volume con 75% institutional adoption; >$730B en crypto transactions totales.
- **Brasil:** $318.8B crypto value received (1/3 del LatAm total). **>90% de flujos crypto brasileños son stablecoin.** Procesó $89B en stablecoin transactions 2025.
- **Argentina:** 61%+ del crypto volume en stablecoins. En Bitso, USDT 50% / USDC 22% del crypto trading.
- **México:** MXNB + MXNe tokens peso-backed alcanzaron $34M en julio 2025 vs <$55K un año antes.

## 2. B2B y enterprise adoption

- **B2B stablecoin payments globalmente:** $100M/mes (early 2023) → **$6B/mes (mid-2025)** — **60x en 30 meses**.
- **71% de instituciones LatAm ya usan stablecoins cross-border** — la tasa más alta del mundo (Fireblocks 2025 survey).
- **Bitso Business:** $82B TPV anualizado 2025; 45% de su volumen ya viene de FX/treasury/arbitration (no remesas).
- **Proyección Juniper:** Cross-border B2B stablecoin pasará de $13.4B en 2026 a **$5T en 2035**.

## 3. Empresas LatAm activas en stablecoins / fintech infra

| Empresa | País | Foco | Funding/scale |
|---|---|---|---|
| **Bitso / Bitso Business** | México | Stablecoin B2B — ~$82B TPV 2025, 1,900 enterprise clients | Series C $250M |
| **Belo** | Argentina | Stablecoin payments + FX | **$14M Series A (abril 2026) led por Tether** |
| **Lemon** | Argentina | Crypto fintech | $20M Series B (oct 2025) |
| **Pomelo** | Argentina | Card-issuing infra, stablecoin cards | $55M Series C |
| **Yuno** | Colombia | Orquestación de pagos — Mastercard Agent Pay partner | — |
| **Wenia** | Colombia | Wallet stablecoin de Bancolombia | — |

> **Nota:** Estas empresas son adjacent — operan en stablecoins pero NO son agent-native. Son posibles partners, no competidores directos.

---

## 4. Marco regulatorio — el matiz crítico

El use-case M2M USDC tiene **viento de cola macro** (adopción) pero **viento de cara regulatorio** específicamente en Brasil y México. Argentina es el mercado más limpio regulatoriamente para empezar. Colombia ofrece runway intermedio.

### Brasil (BCB, noviembre 2025 – mayo 2026)

- BCB Resoluções **519, 520, 521**.
- **Resolução 521** clasifica operaciones con virtual assets referenciados a moneda extranjera como **operaciones de cambio (FX)** → sujetas a **IOF-Câmbio 3.5%** sobre transacciones USDC/USDT.
- Crea figura de **SPSAV** con minimums de capital + autorização BCB.
- **2 mayo 2026:** BCB **prohibió a eFX providers usar stablecoins/crypto para settlement cross-border**. Hold individual sigue ok.
- En paralelo, **Drex** (CBDC brasileña) avanza con programmable payments — competencia regulatoria directa.

### México (CNBV/Banxico)

- Stablecoins peso-denominados **no autorizados aún**: business model de emisión contra fondos en legal tender es actividad bancaria restringida.
- 2025: México abrió consultas públicas para frameworks de tokenización y peso-backed stablecoins. **Pendiente.**
- USDC/USDT operables vía exchanges regulados bajo Fintech Law, no como issuer doméstico.

### Argentina (era Milei)

- CNV Resolución 1058/2025 define framework para virtual asset service providers.
- Marco favorable para uso, pero macro inflacionario sigue siendo el driver real de adopción USDT/USDC.

### Colombia

- SFC (Superintendencia Financiera) mantiene postura cautelosa pero no restrictiva.
- Sandbox regulatorio abierto.
- Runway intermedio entre Brasil (restrictivo) y Argentina (favorable).

---

## 5. Implicancia para AgentVault

**Go-to-market geográfico recomendado:**

1. **Argentina + Colombia (meses 1–6)** — entorno regulatorio amigable, base de builders Web3 razonable, USDC ya integrado en wallets locales.
2. **México (meses 6–12)** — tras claridad regulatoria sobre stablecoins peso-denominados.
3. **Brasil (meses 12+)** — solo cuando la fricción regulatoria (IOF 3.5%, ban eFX) se navegue vía partner local o estructura legal local.

**Hipótesis comercial:** El cliente target NO es la empresa fintech tradicional. Es el **builder Web3 LatAm** y la **fintech early-stage** que ya razona en USDC y no necesita convencer compliance interno sobre stablecoins.

---

*Hardcore AI by 30X — Cohorte 3 — Estación 1*
