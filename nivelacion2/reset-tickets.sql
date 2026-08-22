-- Botón de "rebobinar" la demo: deja todos los tickets como recién creados.
-- Ejecutar en el SQL Editor de Supabase para repetir el triage.

update tickets
set estado         = 'pendiente',
    criticidad     = null,
    nota_triage    = null,
    actualizado_en = creado_en;
