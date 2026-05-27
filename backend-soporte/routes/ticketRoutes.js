const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

// 📌 2. RUTAS NORMALES DEL CRUD (SIN PARÁMETROS)
router.get("/tickets", verifyToken, ticketController.getTickets);
router.post("/tickets", verifyToken, ticketController.createTicket);

// 📌 3. RUTAS DINÁMICAS (CON PARÁMETROS ":id" - LIMPIAS PARA EVITAR CRASHEOS)
router.get("/tickets/:id", verifyToken, ticketController.getTicketById);
router.get("/tickets/:id/detalle", verifyToken, ticketController.getTicketDetalle);
router.put("/tickets/:id/asignar", verifyToken, checkRole([1]), ticketController.asignarTecnico);
router.put("/tickets/:id/estado", verifyToken, checkRole([1, 2]), ticketController.cambiarEstado);
router.post("/tickets/:id/notificar", verifyToken, ticketController.registrarNotificacionCliente);
router.get("/tickets/:id/notificaciones", verifyToken, ticketController.obtenerHistorialNotificaciones);

module.exports = router;