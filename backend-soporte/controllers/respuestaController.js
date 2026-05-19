const respuestaModel = require("../models/respuestaModel");

// ── POST /api/respuestas ──────────────────────────────────────────────────────
const addRespuesta = async (req, res) => {
  const { ticket_id, mensaje } = req.body;

  // usuario_id viene del token JWT, no del body (más seguro)
  const usuario_id = req.user.id;

  if (!ticket_id || !mensaje) {
    return res.status(400).json({ error: "ticket_id y mensaje son obligatorios" });
  }

  try {
    const respuesta = await respuestaModel.addRespuesta({
      ticket_id,
      usuario_id,
      mensaje,
    });
    res.status(201).json({ data: respuesta, message: "Respuesta agregada" });
  } catch (error) {
    console.error("Error addRespuesta:", error.message);
    res.status(500).json({ error: "Error agregando respuesta" });
  }
};

// ── GET /api/respuestas/:ticket_id ────────────────────────────────────────────
const getRespuestas = async (req, res) => {
  const { ticket_id } = req.params;

  try {
    const respuestas = await respuestaModel.getRespuestas(ticket_id);
    res.json({ data: respuestas });
  } catch (error) {
    console.error("Error getRespuestas:", error.message);
    res.status(500).json({ error: "Error obteniendo respuestas" });
  }
};

module.exports = { addRespuesta, getRespuestas };
