const db = require("../config/db");

const addRespuesta = async (respuesta) => {

    const { ticket_id, usuario_id, mensaje } = respuesta;

    const result = await db.query(
        `INSERT INTO ticket_respuestas
        (ticket_id, usuario_id, mensaje)
        VALUES ($1,$2,$3)
        RETURNING id, ticket_id, usuario_id, mensaje, fecha`,
        [ticket_id, usuario_id, mensaje]
    );

    return result.rows[0];
};

const getRespuestas = async (ticket_id) => {

    const result = await db.query(`
        SELECT 
            tr.id,
            tr.ticket_id,
            u.nombre AS usuario,
            tr.mensaje,
            tr.fecha
        FROM ticket_respuestas tr
        JOIN usuarios u
            ON tr.usuario_id = u.id
        WHERE tr.ticket_id = $1
        ORDER BY tr.fecha ASC
    `,[ticket_id]);

    return result.rows;
};

module.exports = {
    addRespuesta,
    getRespuestas
};