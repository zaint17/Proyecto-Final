const db = require("../config/db");

// Listar todos los tickets
const getTickets = async () => {
  const result = await db.query(`
    SELECT
      tickets.id,
      tickets.titulo,
      tickets.descripcion,
      tickets.cliente_nombre     AS cliente,
      tickets.cliente_email,
      tickets.cliente_telefono,
      usuarios.nombre            AS tecnico,
      ticket_estados.nombre      AS estado,
      ticket_prioridades.nombre  AS prioridad,
      ticket_categorias.nombre   AS categoria,
      tickets.fecha_creacion,
      tickets.fecha_limite,
      tickets.fecha_actualizacion
    FROM tickets
    LEFT JOIN usuarios          ON tickets.tecnico_id   = usuarios.id
    JOIN ticket_estados         ON tickets.estado_id    = ticket_estados.id
    JOIN ticket_prioridades     ON tickets.prioridad_id = ticket_prioridades.id
    JOIN ticket_categorias      ON tickets.categoria_id = ticket_categorias.id
    ORDER BY tickets.id DESC
  `);
  return result.rows;
};

// Obtener ticket por id (simple)
const getTicketById = async (id) => {
  const result = await db.query(
    "SELECT * FROM tickets WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
};

// Obtener ticket con joins completos (detalle)
const getTicketDetalle = async (id) => {
  const result = await db.query(`
    SELECT
      tickets.id,
      tickets.titulo,
      tickets.descripcion,
      tickets.video_url,
      tickets.cliente_nombre,
      tickets.cliente_dni,
      tickets.cliente_telefono,
      tickets.cliente_direccion,
      tickets.cliente_email,
      usuarios.nombre            AS tecnico,
      ticket_estados.nombre      AS estado,
      ticket_estados.id          AS estado_id,
      ticket_prioridades.nombre  AS prioridad,
      ticket_categorias.nombre   AS categoria,
      tickets.fecha_creacion,
      tickets.fecha_limite,
      tickets.fecha_actualizacion
    FROM tickets
    LEFT JOIN usuarios          ON tickets.tecnico_id   = usuarios.id
    JOIN ticket_estados         ON tickets.estado_id    = ticket_estados.id
    JOIN ticket_prioridades     ON tickets.prioridad_id = ticket_prioridades.id
    JOIN ticket_categorias      ON tickets.categoria_id = ticket_categorias.id
    WHERE tickets.id = $1
  `, [id]);
  return result.rows[0] || null;
};

// Crear ticket con prioridad automática y fecha límite
const createTicket = async (ticket) => {
  const {
    titulo,
    descripcion,
    cliente_nombre,
    cliente_dni,
    cliente_telefono,
    cliente_direccion,
    cliente_email,
    categoria_id,
    video_url = null,
  } = ticket;

  // Prioridad automática según día de semana
  const dia = new Date().getDay(); // 0=dom, 1=lun ... 6=sab
  let prioridad_id = 1;            // Baja por defecto (lun-mar)
  if (dia >= 3 && dia <= 4) prioridad_id = 2; // Media (mié-jue)
  if (dia >= 5 || dia === 0) prioridad_id = 3; // Alta (vie-sab-dom)

  // Fecha límite: 5 días hábiles
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + 5);

  const result = await db.query(`
    INSERT INTO tickets (
      titulo, descripcion,
      cliente_nombre, cliente_dni, cliente_telefono,
      cliente_direccion, cliente_email,
      estado_id, prioridad_id, categoria_id,
      fecha_limite, video_url
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7, 1,$8,$9,$10,$11)
    RETURNING *
  `, [
    titulo, descripcion,
    cliente_nombre, cliente_dni, cliente_telefono,
    cliente_direccion, cliente_email,
    prioridad_id, categoria_id,
    fechaLimite, video_url,
  ]);

  return result.rows[0];
};

module.exports = { getTickets, getTicketById, getTicketDetalle, createTicket };
