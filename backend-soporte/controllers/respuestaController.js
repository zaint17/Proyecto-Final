const respuestaModel = require("../models/respuestaModel");

const addRespuesta = async (req, res) => {

    const { ticket_id, usuario_id, mensaje } = req.body;

    // Validación
    if (!ticket_id || !usuario_id || !mensaje) {
        return res.status(400).json({
            error: "ticket_id, usuario_id y mensaje son obligatorios"
        });
    }

    try {

        const respuesta = await respuestaModel.addRespuesta(req.body);

        res.json(respuesta);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

const getRespuestas = async (req, res) => {

    const { ticket_id } = req.params;

    if (!ticket_id) {
        return res.status(400).json({
            error: "ticket_id es obligatorio"
        });
    }

    try {

        const respuestas = await respuestaModel.getRespuestas(ticket_id);

        res.json(respuestas);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

module.exports = {
    addRespuesta,
    getRespuestas
};