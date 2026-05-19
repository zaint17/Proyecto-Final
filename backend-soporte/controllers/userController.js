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

module.exports = { getUsers, getTecnicos };
