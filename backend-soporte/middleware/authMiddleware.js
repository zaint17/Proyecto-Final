const jwt = require("jsonwebtoken");

// 🔐 Verificar token
const verifyToken = (req, res, next) => {

    const authHeader = req.headers["authorization"];

    // Verificar si viene el header
    if (!authHeader) {
        return res.status(401).json({
            error: "Token requerido"
        });
    }

    // Formato: Bearer TOKEN
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Token inválido"
        });
    }

    try {

        const decoded = jwt.verify(token, "secreto_super_seguro");

        req.user = decoded; // { id, rol }

        next();

    } catch (error) {

        return res.status(403).json({
            error: "Token inválido o expirado"
        });

    }

};

// 🎯 Verificar roles
const checkRole = (rolesPermitidos) => {

    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                error: "Usuario no autenticado"
            });
        }

        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({
                error: "No tienes permisos"
            });
        }

        next();

    };

};

module.exports = {
    verifyToken,
    checkRole
};