const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body || {};

  // Validación básica de campos
  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son obligatorios" });
  }

  try {
    // Buscar usuario por email (no devolver password al cliente)
    const result = await db.query(
      "SELECT id, nombre, email, password, rol_id FROM usuarios WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    // ⚠️  Mensaje genérico para no revelar si el email existe
    if (!user) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // ✅ Comparar contraseña con bcrypt
    const passwordValida = await bcrypt.compare(password, user.password);

    if (!passwordValida) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, rol: user.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    // Respuesta sin exponer la contraseña
    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol_id,
      },
    });
  } catch (error) {
    console.error("Error en login:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = { login };
