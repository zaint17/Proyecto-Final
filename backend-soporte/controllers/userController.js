const db = require("../config/db");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

// ── GET /api/usuarios ─────────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const users = await userModel.getUsers();
    res.json({ data: users });
  } catch (error) {
    console.error("Error getUsers:", error.message);
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
};

// ── GET /api/usuarios/tecnicos ────────────────────────────────────────────────
// Para el selector de técnicos al asignar un ticket
const getTecnicos = async (req, res) => {
  try {
    const tecnicos = await userModel.getTecnicos();
    res.json({ data: tecnicos });
  } catch (error) {
    console.error("Error getTecnicos:", error.message);
    res.status(500).json({ error: "Error obteniendo técnicos" });
  }
};

const crearTecnico = async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    const existe = await db.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: "Ya existe un usuario con ese email" });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO usuarios (nombre, email, password, rol_id)
       VALUES ($1, $2, $3, 2) RETURNING id, nombre, email`,
      [nombre, email, hash]
    );

    res.status(201).json({ data: result.rows[0], message: "Técnico creado correctamente" });
  } catch (error) {
    console.error("Error crearTecnico:", error.message);
    res.status(500).json({ error: "Error al crear técnico" });
  }
};

module.exports = { getUsers, getTecnicos, crearTecnico };
