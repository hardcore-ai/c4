---
name: triage-tickets
description: Realiza el triage de tickets de soporte pendientes en Supabase, asignando criticidad (alta, media, baja) según las reglas del negocio y actualizando la base de datos. Usar cuando se pida clasificar, hacer triage o priorizar tickets.
---

# Triage de tickets de soporte

## Proceso (seguir en orden)

1. Consulta en Supabase todos los tickets con `estado = 'pendiente'`.
2. Clasifica cada ticket con las reglas de criticidad de abajo.
3. Actualiza CADA ticket clasificado con un UPDATE que establezca:
   - `criticidad`: 'alta', 'media' o 'baja' (en minúsculas)
   - `nota_triage`: justificación en una frase (máx. 140 caracteres)
   - `estado`: 'clasificado'
   - `actualizado_en`: now()
4. Al terminar, muestra un resumen en tabla: id, título, criticidad, justificación,
   ordenado de mayor a menor criticidad.

## Reglas de criticidad

### ALTA — atender de inmediato
- Caída total o parcial del servicio en producción.
- Incidentes de seguridad o posible exposición de datos (ante la duda, es ALTA).
- Pérdida de datos o de transacciones del cliente.
- Errores que impiden al cliente vender, facturar o cobrar (aunque sean intermitentes).

### MEDIA — atender en el día
- Funcionalidad con fallas pero CON alternativa disponible (workaround).
- Degradación de rendimiento que molesta pero no bloquea la operación.

### BAJA — planificar
- Preguntas de uso o solicitudes de capacitación.
- Cambios cosméticos (textos, logos, colores).
- Solicitudes de nuevas funcionalidades.

## Reglas adicionales
- Nunca borres tickets ni modifiques tickets que ya estén en estado 'clasificado'.
- Si un ticket es ambiguo entre dos niveles, asigna el nivel MÁS ALTO y dilo en la nota.
- No inventes tickets: trabaja solo con lo que exista en la base de datos.
