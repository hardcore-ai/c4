# Banco de Productos Curados — AI for Developers | 30X (Cohorte 4)

## Cuatro oportunidades reales para construir en 6 semanas

El equipo de 30X realizó un análisis de oportunidades de mercado y seleccionó cuatro productos con alto potencial, evidencia validada en la industria y factibilidad técnica dentro del tiempo del programa. En la Cohorte 1, estudiantes construyeron productos funcionales en estas mismas categorías y los presentaron ante founders de la red 30X.

**Tu misión:** elegir uno y convertirlo en un producto funcional end-to-end, semana a semana hasta el Demo Day (octubre 1, 2026).

> **Importante:** elige el producto en el que te sea más fácil encontrar clientes o usuarios reales con quienes validar tu solución a lo largo de las 6 semanas (agosto 25 — septiembre 29). El acceso continuo a personas del dominio es clave para que el producto evolucione con feedback real.

---

# Producto 1 — Agente de Compras en WhatsApp

**Industria:** Agentic Commerce

## Qué construyes

Un agente conversacional en WhatsApp que acompaña al cliente desde la intención de compra hasta el pago, de forma autónoma y con confirmación explícita del usuario. El agente entiende qué quiere el cliente, arma el carrito, propone precio y entrega, y cierra la venta en 1–2 interacciones.

**Propuesta de valor central:** convertir conversaciones en ventas repetibles, sin fricción de app, sin formularios, sin login.

## Por qué este producto importa ahora

El comercio conversacional en WhatsApp está dejando de ser un experimento para convertirse en un canal de ventas principal en Latinoamérica:

- **Walmart Chile** reportó que sus campañas por WhatsApp con carritos pre-llenados (basados en historial de compras) ya explican ~20% de su e-commerce local.
- **Magalu (Brasil)** lanzó "Lu's WhatsApp" para completar todo el flujo E2E — recomendación, pago y postventa — dentro del chat, proyectando alcanzar 30M+ de clientes.
- **39%** de retailers en Brasil ya realizan pedidos con proveedores por canales como WhatsApp (Yalo, 2024), con sugerencias automáticas de reposición.

Desde enero 2026, WhatsApp Business Platform **sí permite** bots orientados a negocio (ventas, soporte, reservas). El producto que construirás cae exactamente en esta categoría permitida.

## Qué construyes en el MVP (Rule of One)

El MVP se centra en **un solo tipo de producto o servicio** — por ejemplo, reposición de los 20 artículos más comprados, compra de entradas, o reserva + prepago.

Los componentes clave que implementarás:

- **WhatsApp Flows** para capturar datos estructurados (cantidad, dirección, fecha)
- **Chat conversacional** para capturar intención y responder preguntas
- **Payment link** (Stripe / Mercado Pago / Webpay) + confirmación por webhook
- **Confirm-Before-Pay**: resumen de orden obligatorio antes de ejecutar el pago

## Restricciones de diseño (críticas)

| Restricción | Cómo la manejas |
|---|---|
| Política WhatsApp 2026 (no asistentes generales) | El bot debe ser claramente comercial/transaccional |
| Riesgo de error en pedido (alucinación) | Guardrail obligatorio: Confirm-Before-Pay + resumen |
| Fraude y suplantación | Cuenta verificada, OTP si hay cuenta, límites de monto |
| Inventario y postventa ausentes | El agente declara límite y escala a humano |

## Señal de mercado (2026)

Delhi anunció en marzo 2026 un piloto de servicios gubernamentales con chatbot + Flows + pagos UPI dentro de WhatsApp, validando la viabilidad de "trámite + pago + tracking" en el canal. Visa y Mastercard impulsan pagos "agentic" con estándares seguros para transacciones iniciadas por agentes (Mastercard Agent Pay, FIS Agentic Payments).

---

# Producto 2 — Teaching Assistant 24/7 con IA

**Industria:** Educación

## Qué construyes

Un asistente pedagógico disponible 24/7, entrenado exclusivamente con el material oficial del curso (apuntes, lecturas, guías, rúbricas). Responde preguntas de los estudiantes con citas textuales al material, guía el estudio sin dar respuestas finales, y genera quizzes basados en los contenidos — mientras el profesor conserva el liderazgo de la experiencia humana.

**Propuesta de valor central:** eliminar la fricción de "no entiendo y no tengo a quién preguntar a las 11pm", sin sacrificar integridad académica ni reemplazar al docente.

## Por qué este producto importa ahora

La capa de IA pedagógica "anclada al curso" está consolidándose como estándar en instituciones líderes:

- **Google Classroom + Gemini + NotebookLM**: Google habilitó que profesores creen y asignen "Gems" usando materiales de clase propios, con respuestas fundamentadas en lo que el docente sube. Esto es exactamente el concepto del producto.
- **Oxford University**: lanzó ChatGPT Edu a toda su comunidad con gobernanza institucional, orientado a mejorar aprendizaje sin reemplazar docencia presencial.
- **Khan Academy (2026)**: Khanmigo reposicionado como "learning coach + teaching assistant" con enfoque en persistencia y anti-cheating, con oferta "district/enterprise" ya disponible.
- **Paper académico "AI-University" (2025)**: framework que alinea un LLM al estilo del instructor usando RAG sobre videos, notas y textos, con trazabilidad completa (links a secciones y timestamps).

## Qué construyes en el MVP

El MVP implementable incluye:

- **Ingesta de materiales** (PDFs, slides, lecturas) como base de conocimiento
- **RAG con citas obligatorias**: el agente solo responde usando fuentes del curso, citando página o sección
- **Modo tutor socrático**: hints y guía progresiva, no respuestas directas a tareas
- **Generador de quizzes** basado en el material oficial con explicación citada
- **Study guide semanal**: objetivos, lecturas recomendadas y práctica auto-generada

## Restricciones de diseño (críticas)

| Restricción | Cómo la manejas |
|---|---|
| Alucinaciones = pérdida de confianza | RAG estricto: "si no está en el material, no respondo" |
| Integridad académica (cheating) | Modo socrático obligatorio; no entrega respuestas de tarea |
| Privacidad y datos de estudiantes | Gobernanza institucional, disclosure explícito de uso de IA |
| Derechos de autor del material | Solo material propio/licenciado del docente como fuente |

## Por qué este producto es poderoso

La arquitectura que construyes — RAG sobre corpus acotado + guardrails de comportamiento — es transferible a decenas de casos de uso profesionales: onboarding corporativo, soporte técnico con documentación propia, asistentes legales o médicos con protocolos institucionales. Aprendes el patrón más demandado en IA empresarial 2025–2026.

---

# Producto 3 — Agente de Procesamiento de Documentos y Pagos

**Industria:** LegalTech / FinOps

## Qué construyes

Un agente de IA que procesa, resume y verifica contratos, facturas y declaraciones de impuestos, y automatiza el cumplimiento y los pagos correspondientes. El agente ingiere el documento, valida que cumpla con las reglas de negocio de la empresa o cliente y libera el pago de manera automatizada mediante contratos inteligentes o APIs bancarias.

**Propuesta de valor central:** eliminar el cuello de botella manual de la auditoría de documentos y la conciliación de cuentas por pagar, reduciendo drásticamente los tiempos de procesamiento y costos operativos.

## Por qué este producto importa ahora

El procesamiento tradicional de facturas y contratos es lento y propenso a errores. Con soluciones de IA recientes, el costo de procesamiento se ha logrado reducir a un estimado de $2.36 por factura y la velocidad de ejecución ha pasado de tardar de 10 a 30 minutos a completarse en solo 1–2 segundos. El mercado de IA para contabilidad está proyectado a superar los $68.75 mil millones para 2031.

## Qué construyes en el MVP (Rule of One)

El MVP se centrará en automatizar un único flujo de extremo a extremo, por ejemplo, la validación y el pago de facturas de proveedores recurrentes.

Los componentes clave que implementarás:

- **Ingesta de documentos:** extracción de datos (OCR) y lectura semántica de facturas o contratos en PDF
- **Motor de validación (RAG):** un agente evaluador que compara los ítems de la factura contra una base de conocimientos (órdenes de compra, políticas internas) para detectar discrepancias
- **Ejecución del pago:** integración con sistemas financieros para ejecutar u orquestar la transacción si todo el flujo es correcto

## Restricciones de diseño (críticas)

| Restricción | Cómo la manejas |
|---|---|
| Alucinación en montos o cuentas | Verificación determinista estricta cruzada antes de cualquier transacción financiera |
| Seguridad en la ejecución de pagos | Reglas embebidas en el smart contract o Human-in-the-Loop (HITL) para montos grandes |
| Privacidad de datos financieros y PII | Uso de entornos seguros, anonimización de datos y cumplimiento con APIs empresariales |
| Errores de OCR en documentos complejos | Umbral de confianza establecido; si el agente duda, escala de inmediato a un operador |

## Señal de mercado (2026)

El proyecto *docs.ai* fue premiado en el hackathon global ETHGlobal Agentic Ethereum (febrero 2026) por su innovadora automatización de procesos documentales. PwC pronostica que los agentes de IA se moverán velozmente en 2026 para automatizar áreas de alto valor como las finanzas y la auditoría interna.

---

# Producto 4 — Sistema de Escrow Autónomo para IA

**Industria:** Agentic Commerce / Web3 Payments

## Qué construyes

Una infraestructura de pagos de "pago por uso" (Pay-Per-Use) diseñada específicamente para la economía máquina a máquina (M2M). Construyes un sistema de fideicomiso (escrow) autónomo en el que un agente retiene los fondos (por ejemplo, en USDC) y los libera automáticamente solo cuando el agente proveedor cumple a cabalidad con la tarea solicitada.

**Propuesta de valor central:** permitir interacciones financieras directas, seguras y libres de disputas entre diferentes agentes de IA, eliminando la dependencia de la confianza humana.

## Por qué este producto importa ahora

Los rieles de pago tradicionales no están preparados para sostener el comercio agéntico. Las transacciones de alta frecuencia y bajo valor (micropagos) se vuelven inviables económicamente con comisiones estándar (2.9% + $0.30 por transacción). Las stablecoins y las redes blockchain ofrecen el medio ideal, con liquidaciones instantáneas e interoperables para que la IA haga compras en la red de forma nativa.

## Qué construyes en el MVP (Rule of One)

El MVP abordará un caso transaccional simple y comprobable: un agente comprador delegando una carga de trabajo (por ejemplo, investigación de mercado) a un agente proveedor.

Los componentes clave que implementarás:

- **Contrato inteligente de escrow:** lógica inmutable que mantiene y bloquea los fondos depositados
- **Integración con estándares de pago de IA:** uso de protocolos nativos web como x402 para gestionar el micropago a una API
- **Agente evaluador u orquestador:** un LLM que verifica el entregable y llama al método del contrato para liberar los fondos si se cumplen las condiciones de éxito

## Restricciones de diseño (críticas)

| Restricción | Cómo la manejas |
|---|---|
| Gastos no autorizados (rogue spending) | Límites estrictos (diarios o por transacción) programados a nivel billetera/contrato |
| Resolución de disputas entre agentes | Lógica de reembolso automático si el trabajo no es validado en el tiempo asignado |
| Confianza técnica en la contraparte | Implementación de medidas "Know Your Agent" (KYA) verificables on-chain |
| Fricción Web3 | Abstracción del pago del gas (Gasless) para que el desarrollador interactúe sin barreras complejas |

## Señal de mercado (2026)

*AIsaEscrow* resultó ganador en el Agentic Commerce on Arc Hackathon (enero 2026), respaldado conjuntamente por Circle y Google. Mastercard lanzó "Agent Pay" en América Latina en 2026 para proveer seguridad y trazabilidad en los pagos ejecutados por agentes de IA.

---

# Cómo elegir tu producto

Todas las opciones son viables y factibles en 6 semanas. La clave para elegir bien es una sola pregunta: **¿en cuál dominio puedo encontrar más fácilmente clientes o usuarios reales con quienes hablar y validar durante las seis semanas?**

**Elige el Agente de WhatsApp** si tienes contacto con negocios, emprendedores o retailers que venden por mensajería, y puedes testear el flujo con compradores reales.

**Elige el Teaching Assistant** si tienes acceso a profesores, cursos, o comunidades de estudiantes que puedan usar el asistente y darte feedback durante las 6 semanas.

**Elige el Agente de Procesamiento de Documentos** si tienes acceso a contadores, analistas financieros o equipos legales que buscan acelerar la gestión y auditoría de sus facturas o contratos.

**Elige el Sistema de Escrow Autónomo** si tu entorno se compone del ecosistema Web3, empresas de Fintech o builders que implementan infraestructuras de transacciones para aplicaciones B2B.

> **Recuerda:** el producto que elijas lo presentarás en el Demo Day ante founders de la red 30X. Los mejores proyectos tendrán la oportunidad de presentar en vivo. Elige con ambición.
