const respuestaModel = require("../models/respuestaModel");
const ticketModel = require("../models/ticketModel");

// ── POST /api/respuestas (REFACTORIZADO) ──────────────────────────────────────
const addRespuesta = async (req, res) => {
  const { ticket_id, mensaje } = req.body;
  const usuario_id = req.user.id;

  if (!ticket_id || !mensaje) {
    return res.status(400).json({ error: "ticket_id y mensaje son obligatorios" });
  }

  try {
    // VALIDACIÓN CRÍTICA: Bloquear inserción si el ticket está CERRADO (estado_id = 3)
    const ticket = await ticketModel.getTicketById(ticket_id);
    if (ticket && ticket.estado_id === 3) {
      return res.status(400).json({ 
        error: "El chat interactivo está bloqueado porque este ticket ya ha sido finalizado y cerrado por el Administrador." 
      });
    }

    const respuesta = await respuestaModel.addRespuesta({
      ticket_id,
      usuario_id,
      mensaje,
    });
    return res.status(201).json({ data: respuesta, message: "Respuesta agregada" });
  } catch (error) {
    console.error("Error addRespuesta:", error.message);
    return res.status(500).json({ error: "Error agregando respuesta" });
  }
};

// ── GET /api/respuestas/:ticket_id ────────────────────────────────────────────
const getRespuestas = async (req, res) => {
  const { ticket_id } = req.params;

  try {
    const respuestas = await respuestaModel.getRespuestas(ticket_id);
    return res.json({ data: respuestas });
  } catch (error) {
    console.error("Error getRespuestas:", error.message);
    return res.status(500).json({ error: "Error obteniendo respuestas" });
  }
};

module.exports = { addRespuesta, getRespuestas };