const db = require("../config/db");

const getTicketsPorTecnico = async (tecnico_id) => {
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
    WHERE tickets.tecnico_id = $1
    ORDER BY tickets.id DESC
  `, [tecnico_id]);
  return result.rows;
};

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

const getTicketById = async (id) => {
  const result = await db.query(
    "SELECT * FROM tickets WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
};

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
      tickets.tecnico_id,
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

  const dia = new Date().getDay();
  let prioridad_id = 1;         
  if (dia >= 3 && dia <= 4) prioridad_id = 2;
  if (dia >= 5 || dia === 0) prioridad_id = 3;

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

const asignarTecnico = async (ticket_id, tecnico_id) => {
  const tecnico = await db.query(
    "SELECT id FROM usuarios WHERE id = $1 AND rol_id = 2",
    [tecnico_id]
  );

  if (tecnico.rows.length === 0) return null;

  const result = await db.query(`
    UPDATE tickets
    SET tecnico_id = $1,
        estado_id = CASE WHEN estado_id = 1 THEN 2 ELSE estado_id END,
        fecha_actualizacion = NOW()
    WHERE id = $2
    RETURNING *
  `, [tecnico_id, ticket_id]);

  return result.rows[0] || null;
};

const cambiarEstado = async (ticket_id, estado_id) => {
  const result = await db.query(`
    UPDATE tickets
    SET estado_id = $1, 
        fecha_actualizacion = NOW()
    WHERE id = $2
    RETURNING *
  `, [estado_id, ticket_id]);

  return result.rows[0] || null;
};

// ── CORREGIDO CON DATOS REALES DE PGADMIN ──
const actualizarVideoUrl = async (ticket_id, video_url, tipo, usuario_id) => {
  if (tipo === 'entrada') {
    return await db.query(
      "UPDATE tickets SET video_url = $1, fecha_actualizacion = NOW() WHERE id = $2 RETURNING *",
      [video_url, ticket_id]
    );
  } else {
    // ✅ COLUMNA CORRECTA: 'fecha' en lugar de 'fecha_creacion'
    return await db.query(`
      INSERT INTO ticket_respuestas (ticket_id, usuario_id, mensaje, fecha)
      VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [ticket_id, usuario_id, `[EVIDENCIA DE SALIDA] Video adjunto: ${video_url}`]
    );
  }
};

const registrarNotificacion = async (ticket_id, mensaje) => {
  const result = await db.query(`
    INSERT INTO historial_notificaciones (ticket_id, mensaje)
    VALUES ($1, $2)
    RETURNING *
  `, [ticket_id, mensaje]);
  
  return result.rows[0];
};

const getHistorialNotificaciones = async (ticket_id) => {
  const result = await db.query(`
    SELECT id, tipo_notificacion, mensaje, fecha_envio 
    FROM historial_notificaciones 
    WHERE ticket_id = $1 
    ORDER BY fecha_envio DESC
  `, [ticket_id]);
  
  return result.rows;
};

const getTodosHistorialNotificaciones = async () => {
  const result = await db.query(`
    SELECT 
      hn.id,
      hn.ticket_id,
      hn.tipo_notificacion,
      hn.mensaje,
      hn.fecha_envio,
      t.titulo AS ticket_titulo,
      t.cliente_nombre
    FROM historial_notificaciones hn
    JOIN tickets t ON hn.ticket_id = t.id
    ORDER BY hn.fecha_envio DESC
  `);
  return result.rows;
};

module.exports = { 
  getTickets, 
  getTicketById, 
  getTicketDetalle, 
  createTicket, 
  getTicketsPorTecnico,
  asignarTecnico,
  cambiarEstado,
  actualizarVideoUrl,
  registrarNotificacion,
  getHistorialNotificaciones,
  getTodosHistorialNotificaciones
};