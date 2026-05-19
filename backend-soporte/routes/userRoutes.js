const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

// GET /api/usuarios  — solo admin
router.get("/usuarios", verifyToken, checkRole([1]), userController.getUsers);

// GET /api/usuarios/tecnicos — admin y técnico
router.get("/usuarios/tecnicos", verifyToken, checkRole([1, 2]), userController.getTecnicos);

module.exports = router;
