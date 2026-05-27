const ticketModel = require("../models/ticketModel");

// ── GET /api/tickets ──────────────────────────────────────────────────────────
const getTickets = async (req, res) => {
  try {
    let tickets;
    if (req.user.rol === 2) {
      tickets = await ticketModel.getTicketsPorTecnico(req.user.id);
    } else {
      tickets = await ticketModel.getTickets();
    }
    return res.json({ data: tickets, total: tickets.length });
  } catch (error) {
    console.error("Error getTickets:", error.message);
    return res.status(500).json({ error: "Error obteniendo tickets" });
  }
};

// ── GET /api/tickets/:id ──────────────────────────────────────────────────────
const getTicketById = async (req, res) => {
  const { id } = req.params;
  try {
    const ticket = await ticketModel.getTicketById(id);
    if (!ticket) return res.status(404).json({ error: "Ticket no encontrado" });

    // MEJORA: Validar que si es técnico, el ticket realmente le pertenezca
    if (req.user.rol === 2 && ticket.tecnico_id !== req.user.id) {
      return res.status(403).json({ error: "No tienes permiso para ver este ticket" });
    }

    return res.json({ data: ticket });
  } catch (error) {
    console.error("Error getTicketById:", error.message);
    return res.status(500).json({ error: "Error obteniendo ticket" });
  }
};

// ── GET /api/tickets/:id/detalle ──────────────────────────────────────────────
const getTicketDetalle = async (req, res) => {
  const { id } = req.params;
  try {
    const ticket = await ticketModel.getTicketDetalle(id);
    if (!ticket) return res.status(404).json({ error: "Ticket no encontrado" });

    if (req.user.rol === 2 && ticket.tecnico_id !== req.user.id) {
      return res.status(403).json({ error: "No tienes permiso para ver el detalle de este ticket" });
    }

    return res.json({ data: ticket });
  } catch (error) {
    console.error("Error getTicketDetalle:", error.message);
    return res.status(500).json({ error: "Error obteniendo detalle del ticket" });
  }
};

// ── POST /api/tickets ─────────────────────────────────────────────────────────
const createTicket = async (req, res) => {
  const { titulo, descripcion, cliente_nombre, categoria_id } = req.body;

  if (!titulo || !descripcion || !cliente_nombre || !categoria_id) {
    return res.status(400).json({
      error: "titulo, descripcion, cliente_nombre y categoria_id son obligatorios",
    });
  }

  try {
    const ticket = await ticketModel.createTicket(req.body);
    return res.status(201).json({ data: ticket, message: "Ticket creado correctamente" });
  } catch (error) {
    console.error("Error createTicket:", error.message);
    return res.status(500).json({ error: "Error creando ticket" });
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
    const ticketActualizado = await ticketModel.asignarTecnico(id, tecnico_id);
    
    if (!ticketActualizado) {
      return res.status(400).json({ error: "No se pudo asignar. Verifica el ID del ticket y que el usuario sea un técnico válido." });
    }

    return res.json({ data: ticketActualizado, message: "Técnico asignado correctamente" });
  } catch (error) {
    console.error("Error asignarTecnico:", error.message);
    return res.status(500).json({ error: "Error asignando técnico" });
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
    if (req.user.rol === 2) {
      const ticket = await ticketModel.getTicketById(id);
      if (ticket && ticket.tecnico_id !== req.user.id) {
        return res.status(403).json({ error: "No puedes cambiar el estado de un ticket que no tienes asignado" });
      }
    }

    const ticketActualizado = await ticketModel.cambiarEstado(id, estado_id);

    if (!ticketActualizado) {
      return res.status(404).json({ error: "Ticket no encontrado" });
    }

    return res.json({ data: ticketActualizado, message: "Estado actualizado correctamente" });
  } catch (error) {
    console.error("Error cambiarEstado:", error.message);
    return res.status(500).json({ error: "Error cambiando estado" });
  }
};

// ── POST /api/tickets/:id/notificar ──────────────────────────────────────────
const registrarNotificacionCliente = async (req, res) => {
  const { id } = req.params;
  const { mensaje } = req.body;

  if (!mensaje) return res.status(400).json({ error: "El mensaje es requerido" });

  try {
    const notificacion = await ticketModel.registrarNotificacion(id, mensaje);
    return res.status(201).json({ data: notificacion, message: "Notificación registrada en el historial" });
  } catch (error) {
    console.error("Error registrarNotificacionCliente:", error.message);
    return res.status(500).json({ error: "Error al guardar en el historial" });
  }
};

// ── GET /api/tickets/:id/notificaciones ──────────────────────────────────────
const obtenerHistorialNotificaciones = async (req, res) => {
  const { id } = req.params;
  try {
    const historial = await ticketModel.getHistorialNotificaciones(id);
    return res.json({ data: historial });
  } catch (error) {
    console.error("Error obtenerHistorialNotificaciones:", error.message);
    return res.status(500).json({ error: "Error obteniendo historial" });
  }
};

// ── GET /api/tickets/notificaciones-globales ─────────────────────────────────
const obtenerHistorialGlobal = async (req, res) => {
  try {
    // Forzamos el await al modelo
    const historial = await ticketModel.getTodosHistorialNotificaciones();
    
    // Verificación de seguridad si la BD viene vacía o nula para que no se rompa el front
    const dataResponse = historial ? historial : [];

    // Cortamos la ejecución explícitamente con un return res.json
    return res.status(200).json({ data: dataResponse });
  } catch (error) {
    console.error("Error obtenerHistorialGlobal:", error.message);
    return res.status(500).json({ error: "Error obteniendo historial global" });
  }
};

module.exports = {
  getTickets,
  getTicketById,
  getTicketDetalle,
  createTicket,
  asignarTecnico,
  cambiarEstado,
  registrarNotificacionCliente,
  obtenerHistorialNotificaciones,
  obtenerHistorialGlobal
};