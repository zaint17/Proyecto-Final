const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express(); // ✅ PRIMERO se crea app

// ✅ Middlewares
app.use(cors());
app.use(express.json()); // ✅ DESPUÉS de crear app

// ✅ Rutas
const userRoutes = require("./routes/UserRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const respuestaRoutes = require("./routes/respuestaRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api", ticketRoutes);
app.use("/api", userRoutes);
app.use("/api", respuestaRoutes);
app.use("/api", authRoutes);

// ✅ Ruta de prueba
app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT NOW()");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json(error);
    }
});

// ✅ Middleware de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Error interno del servidor" });
});

// ✅ Servidor
app.listen(3000, () => {
    console.log("Servidor corriendo en puerto 3000");
});