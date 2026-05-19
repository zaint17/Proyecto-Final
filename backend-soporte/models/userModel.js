const db = require("../config/db");

// Todos los usuarios (sin exponer password)
const getUsers = async () => {
  const result = await db.query(`
    SELECT id, nombre, email, rol_id
    FROM usuarios
    ORDER BY nombre
  `);
  return result.rows;
};

// Solo técnicos (rol_id = 2) — para asignación de tickets
const getTecnicos = async () => {
  const result = await db.query(`
    SELECT id, nombre, email
    FROM usuarios
    WHERE rol_id = 2
    ORDER BY nombre
  `);
  return result.rows;
};

module.exports = { getUsers, getTecnicos };
