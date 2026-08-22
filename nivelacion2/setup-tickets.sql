-- Demo triage de tickets: crear tabla y cargar datos de prueba
-- Ejecutar en el SQL Editor de Supabase ANTES de la clase.

create table tickets (
  id             serial primary key,
  titulo         text not null,
  descripcion    text,
  cliente        text,
  estado         text default 'pendiente',   -- pendiente | clasificado
  criticidad     text,                        -- alta | media | baja (null hasta el triage)
  nota_triage    text,                        -- justificación del agente
  creado_en      timestamptz default now(),
  actualizado_en timestamptz default now()
);

-- Datos diseñados para la demo: casos obvios y casos grises
insert into tickets (titulo, descripcion, cliente) values
('Sistema caído en producción', 'Ningún usuario puede ingresar a la plataforma desde las 8am. Error 500 en login. Afecta a todos los clientes.', 'Acme Corp'),
('Posible fuga de datos', 'Un usuario reporta que al iniciar sesión vio datos de otra cuenta. Podría ser un incidente de seguridad.', 'Banco Delta'),
('Reporte mensual no exporta a PDF', 'El botón de exportar a PDF falla, pero el export a Excel sí funciona como alternativa.', 'Logística Sur'),
('Lentitud en el módulo de facturas', 'Cargar la lista de facturas tarda 30 segundos. Se puede usar pero es molesto.', 'Ferretería Norte'),
('Cambiar logo en la página de inicio', 'Queremos actualizar el logo por el nuevo branding. No hay urgencia.', 'Café Andino'),
('¿Cómo creo un usuario nuevo?', 'Pregunta de uso: el cliente no encuentra dónde agregar usuarios a su cuenta.', 'Tienda Luna'),
('Error al guardar pedidos intermitente', 'Aproximadamente 1 de cada 10 pedidos falla al guardar y hay que reintentar. Los clientes están perdiendo ventas.', 'Distribuidora Este'),
('Solicitud de nueva funcionalidad: modo oscuro', 'Varios usuarios piden modo oscuro en la aplicación.', 'Acme Corp');
