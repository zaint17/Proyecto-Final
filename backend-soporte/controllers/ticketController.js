const ticketModel = require("../models/ticketModel");
const db = require("../config/db");

// ── GET /api/tickets ──────────────────────────────────────────────────────────
const getTickets = async (req, res) => {
  try {
    const tickets = await ticketModel.getTickets();
    res.json({ data: tickets, total: tickets.length });
  } catch (error) {
    console.error("Error getTickets:", error.message);
    res.status(500).json({ error: "Error obteniendo tickets" });
  }
};

// ── GET /api/tickets/:id ──────────────────────────────────────────────────────
const getTicketById = async (req, res) => {
  const { id } = req.params;
  try {
    const ticket = await ticketModel.getTicketById(id);
    if (!ticket) return res.status(404).json({ error: "Ticket no encontrado" });
    res.json({ data: ticket });
  } catch (error) {
    console.error("Error getTicketById:", error.message);
    res.status(500).json({ error: "Error obteniendo ticket" });
  }
};

// ── GET /api/tickets/:id/detalle ──────────────────────────────────────────────
const getTicketDetalle = async (req, res) => {
  const { id } = req.params;
  try {
    const ticket = await ticketModel.getTicketDetalle(id);
    if (!ticket) return res.status(404).json({ error: "Ticket no encontrado" });
    res.json({ data: ticket });
  } catch (error) {
    console.error("Error getTicketDetalle:", error.message);
    res.status(500).json({ error: "Error obteniendo detalle del ticket" });
  }
};

// ── POST /api/tickets ─────────────────────────────────────────────────────────
const createTicket = async (req, res) => {
  const { titulo, descripcion, cliente_nombre, categoria_id } = req.body;

  // Validación mínima obligatoria
  if (!titulo || !descripcion || !cliente_nombre || !categoria_id) {
    return res.status(400).json({
      error: "titulo, descripcion, cliente_nombre y categoria_id son obligatorios",
    });
  }

  try {
    const ticket = await ticketModel.createTicket(req.body);
    res.status(201).json({ data: ticket, message: "Ticket creado correctamente" });
  } catch (error) {
    console.error("Error createTicket:", error.message);
    res.status(500).json({ error: "Error creando ticket" });
  }
};

// ── PUT /api/tickets/:id/asignar ──────────────────────────────────────────────
const asignarTecnico = async (req, res) => {
  const { id } = req.params;
  const { tecnico_id } = req.body;

  if (!tecnico_id) {
    return res.status(400).json({ error: "tecnico_id es obligatorio" });
  }

  try {
    // Verificar que el usuario sea técnico (rol_id = 2)
    const tecnico = await db.query(
      "SELECT id, nombre FROM usuarios WHERE id = $1 AND rol_id = 2",
      [tecnico_id]
    );

    if (tecnico.rows.length === 0) {
      return res.status(400).json({ error: "El usuario no es un técnico válido" });
    }

    const result = await db.query(
      `UPDATE tickets
       SET tecnico_id = $1, fecha_actualizacion = NOW()
       WHERE id = $2
       RETURNING *`,
      [tecnico_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ticket no encontrado" });
    }

    res.json({ data: result.rows[0], message: "Técnico asignado correctamente" });
  } catch (error) {
    console.error("Error asignarTecnico:", error.message);
    res.status(500).json({ error: "Error asignando técnico" });
  }
};

// ── PUT /api/tickets/:id/estado ───────────────────────────────────────────────
const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado_id } = req.body;

  if (!estado_id) {
    return res.status(400).json({ error: "estado_id es obligatorio" });
  }

  try {
    const result = await db.query(
      `UPDATE tickets
       SET estado_id = $1, fecha_actualizacion = NOW()
       WHERE id = $2
       RETURNING *`,
      [estado_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ticket no encontrado" });
    }

    res.json({ data: result.rows[0], message: "Estado actualizado correctamente" });
  } catch (error) {
    console.error("Error cambiarEstado:", error.message);
    res.status(500).json({ error: "Error cambiando estado" });
  }
};

module.exports = {
  getTickets,
  getTicketById,
  getTicketDetalle,
  createTicket,
  asignarTecnico,
  cambiarEstado,
};
