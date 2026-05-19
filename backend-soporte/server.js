require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Permite peticiones desde Angular (localhost:4200) y producción
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:4200",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// ── Middlewares globales ───────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ─────────────────────────────────────────────────────────────────────
const authRoutes      = require("./routes/authRoutes");
const userRoutes      = require("./routes/userRoutes");
const ticketRoutes    = require("./routes/ticketRoutes");
const respuestaRoutes = require("./routes/respuestaRoutes");

app.use("/api/auth",       authRoutes);       // POST /api/auth/login
app.use("/api",            userRoutes);       // GET  /api/usuarios
app.use("/api",            ticketRoutes);     // CRUD /api/tickets
app.use("/api",            respuestaRoutes);  // CRUD /api/respuestas

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// ── Error handler global ──────────────────────────────────────────────────────
// Captura cualquier error que llegue con next(err)
app.use((err, req, res, next) => {
  console.error("❌ Error no controlado:", err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production"
      ? "Error interno del servidor"
      : err.message,
  });
});

// ── Iniciar servidor ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Modo: ${process.env.NODE_ENV || "development"}`);
});
