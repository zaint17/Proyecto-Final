const express = require("express");
const router = express.Router();

const ticketController = require("../controllers/ticketController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

// 🔐 Obtener tickets (logueado)
router.get("/tickets", verifyToken, ticketController.getTickets);

// 🔐 Crear ticket
router.post("/tickets", verifyToken, ticketController.createTicket);

// 🔐 Asignar técnico (solo admin)
router.put(
  "/tickets/:id/asignar",
  verifyToken,
  checkRole([1]),
  ticketController.asignarTecnico
);

// 🔐 Cambiar estado (admin y técnico)
router.put(
  "/tickets/:id/estado",
  verifyToken,
  checkRole([1, 2]),
  ticketController.cambiarEstado
);

// 🔐 Detalle ticket
router.get(
  "/tickets/:id/detalle",
  verifyToken,
  ticketController.getTicketDetalle
);

module.exports = router;