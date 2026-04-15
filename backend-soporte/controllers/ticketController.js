const ticketModel = require("../models/ticketModel");
const db = require("../config/db");

// obtener tickets
const getTickets = async (req, res) => {

    try {

        const tickets = await ticketModel.getTickets();

        res.json(tickets);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};
// obtener ticket por id
const getTicketById = async (req, res) => {

    const { id } = req.params;

    try {

        const ticket = await ticketModel.getTicketById(id);

        if (!ticket) {
            return res.status(404).json({
                error: "Ticket no encontrado"
            });
        }

        res.json(ticket);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

// crear ticket
const createTicket = async (req, res) => {

    const { titulo, descripcion, cliente_id, prioridad_id } = req.body;

    // Validación
    if (!titulo || !descripcion || !cliente_id || !prioridad_id) {
        return res.status(400).json({
            error: "titulo, descripcion, cliente_id y prioridad_id son obligatorios"
        });
    }

    try {

        const ticket = await ticketModel.createTicket(req.body);

        res.json(ticket);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

// asignar técnico
const asignarTecnico = async (req, res) => {
    const { id } = req.params;
    const { tecnico_id } = req.body;

    try {

        // 🔍 Verificar que sea técnico
        const usuario = await db.query(
            "SELECT * FROM usuarios WHERE id = $1 AND rol_id = 2",
            [tecnico_id]
        );

        if (usuario.rows.length === 0) {
            return res.status(400).json({
                error: "El usuario no es un técnico válido"
            });
        }

        // ✅ Asignar
        const result = await db.query(
            `UPDATE tickets 
             SET tecnico_id = $1, fecha_actualizacion = NOW()
             WHERE id = $2
             RETURNING *`,
            [tecnico_id, id]
        );

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json(error);
    }
};

// cambiar estado
const cambiarEstado = async (req, res) => {

    const { id } = req.params;
    const { estado_id } = req.body;

    if (!estado_id) {
        return res.status(400).json({
            error: "estado_id es obligatorio"
        });
    }

    try {

        const result = await db.query(
            `UPDATE tickets
             SET estado_id = $1, fecha_actualizacion = NOW()
             WHERE id = $2
             RETURNING *`,
            [estado_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Ticket no encontrado"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

const getTicketDetalle = async (req, res) => {

    const { id } = req.params;

    try {

        const ticket = await ticketModel.getTicketDetalle(id);

        if (!ticket) {
            return res.status(404).json({
                error: "Ticket no encontrado"
            });
        }

        res.json(ticket);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

module.exports = {
    getTickets,
    getTicketById,
    getTicketDetalle,
    createTicket,
    asignarTecnico,
    cambiarEstado
};