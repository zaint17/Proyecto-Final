require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); // Requerido para enlazar Socket.io
const { Server } = require("socket.io"); // Servidor de sockets

// IMPORTANTE: Importamos lo necesario para la ruta de notificaciones globales
const { verifyToken, checkRole } = require("./middleware/authMiddleware");
const ticketController = require("./controllers/ticketController");

const app = express();
const server = http.createServer(app); // Creamos el servidor HTTP envolviendo a express

// ── CORS MODIFICADO ──────────────────────────────────────────────────────────
const corsOptions = {
  origin: [
    "http://localhost:4200",
    "https://frontend-soporte-eosin.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// ── Inicializar Socket.io con soporte CORS ────────────────────────────────────
const io = new Server(server, {
  cors: corsOptions
});

// Guardamos la instancia de IO en el objeto app para poder usarla en los controladores
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`🔌 Cliente conectado al WebSocket: ${socket.id}`);
  
  socket.on("disconnect", () => {
    console.log(`❌ Cliente desconectado del WebSocket: ${socket.id}`);
  });
});

// ── Middlewares globales ───────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── 📌 CORRECCIÓN RADICAL: RUTA INDEPENDIENTE ULTRA PROTEGIDA ──────────────────
app.get("/api/notificaciones-globales", verifyToken, checkRole([1]), ticketController.obtenerHistorialGlobal);

// ── Rutas Módulos ─────────────────────────────────────────────────────────────
const authRoutes      = require("./routes/authRoutes");
const userRoutes      = require("./routes/userRoutes");
const ticketRoutes    = require("./routes/ticketRoutes");
const respuestaRoutes = require("./routes/respuestaRoutes");

app.use("/api/auth",       authRoutes);       
app.use("/api",            userRoutes);       
app.use("/api",            ticketRoutes);     
app.use("/api",            respuestaRoutes);  

// ── Carpeta de Subidas Estática (UBICACIÓN CORRECTA) ──────────────────────────
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

// ── 404 (Siempre debe ser el penúltimo antes del Server Listen) ───────────────
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// ── Error handler global (Siempre al final) ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Error no controlado:", err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production"
      ? "Error interno del servidor"
      : err.message,
  });
});

// ── Iniciar servidor utilizando SERVER en lugar de APP ─────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor en tiempo real corriendo en http://localhost:${PORT}`);
  console.log(`📋 Modo: ${process.env.NODE_ENV || "development"}`);
});