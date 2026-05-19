const express = require("express");
const router = express.Router();
const respuestaController = require("../controllers/respuestaController");
const { verifyToken } = require("../middleware/authMiddleware");

// Agregar respuesta — cualquier usuario logueado
router.post("/respuestas", verifyToken, respuestaController.addRespuesta);

// Obtener respuestas de un ticket — cualquier usuario logueado
router.get("/respuestas/:ticket_id", verifyToken, respuestaController.getRespuestas);

module.exports = router;
