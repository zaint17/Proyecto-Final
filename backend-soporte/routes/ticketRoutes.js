const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

// Listar tickets — cualquier usuario logueado
router.get("/tickets", verifyToken, ticketController.getTickets);

// Crear ticket — cualquier usuario logueado
router.post("/tickets", verifyToken, ticketController.createTicket);

// Asignar técnico — solo admin (rol 1)
router.put("/tickets/:id/asignar", verifyToken, checkRole([1]), ticketController.asignarTecnico);

// Cambiar estado — admin y técnico (roles 1 y 2)
router.put("/tickets/:id/estado", verifyToken, checkRole([1, 2]), ticketController.cambiarEstado);

// Detalle completo — cualquier usuario logueado
router.get("/tickets/:id/detalle", verifyToken, ticketController.getTicketDetalle);

module.exports = router;
