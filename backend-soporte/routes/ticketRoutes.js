const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path"); // 📌 CORREGIDO: Importación del módulo path necesaria para las extensiones

// 📌 CONFIGURACIÓN DE ALMACENAMIENTO DE MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

// 📌 CORREGIDO: Instanciar el middleware upload con la configuración de arriba
const upload = multer({ storage: storage });

// 📌 2. RUTAS NORMALES DEL CRUD (SIN PARÁMETROS)
router.get("/tickets", verifyToken, ticketController.getTickets);
router.post("/tickets", verifyToken, ticketController.createTicket);

// 📌 3. RUTAS DINÁMICAS (CON PARÁMETROS ":id")
router.get("/tickets/:id", verifyToken, ticketController.getTicketById);
router.get("/tickets/:id/detalle", verifyToken, ticketController.getTicketDetalle);
router.put("/tickets/:id/asignar", verifyToken, checkRole([1]), ticketController.asignarTecnico);
router.put("/tickets/:id/estado", verifyToken, checkRole([1, 2]), ticketController.cambiarEstado);
router.post("/tickets/:id/notificar", verifyToken, ticketController.registrarNotificacionCliente);
router.get("/tickets/:id/notificaciones", verifyToken, ticketController.obtenerHistorialNotificaciones);

// ── NUEVO ENDPOINT: Subir video de entrada o salida ──
// 📌 ALINEADO: Se agrega el prefijo "/tickets" para mantener la consistencia con el service de Angular
router.post("/tickets/:id/upload-video", verifyToken, upload.single("video"), ticketController.uploadVideoLocal);

module.exports = router;