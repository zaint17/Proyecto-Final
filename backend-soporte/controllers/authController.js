const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const login = async (req, res) => {

    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({
            error: "Email y password son obligatorios"
        });
    }

    try {

        const result = await db.query(
            "SELECT * FROM usuarios WHERE email = $1",
            [email]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({
                error: "Usuario no encontrado"
            });
        }

        const validPassword = password === user.password;

        if (!validPassword) {
            return res.status(401).json({
                error: "Contraseña incorrecta"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                rol: user.rol_id
            },
            "secreto_super_seguro",
            { expiresIn: "8h" }
        );

        res.json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                rol: user.rol_id
            }
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

module.exports = {
    login
};