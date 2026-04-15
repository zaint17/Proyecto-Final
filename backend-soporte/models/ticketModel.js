const db = require("../config/db");

const getTickets = async () => {

    const result = await db.query(`
        SELECT 
            t.id,
            t.titulo,
            t.descripcion,
            c.nombre AS cliente,
            tec.nombre AS tecnico,
            e.nombre AS estado,
            p.nombre AS prioridad,
            t.fecha_creacion
        FROM tickets t

        JOIN usuarios c 
            ON t.cliente_id = c.id

        LEFT JOIN usuarios tec
            ON t.tecnico_id = tec.id

        JOIN ticket_estados e 
            ON t.estado_id = e.id

        JOIN ticket_prioridades p
            ON t.prioridad_id = p.id

        ORDER BY t.fecha_creacion DESC
    `);

    return result.rows;
};

const createTicket = async (ticket) => {

    const { titulo, descripcion, cliente_id, prioridad_id } = ticket;

    const result = await db.query(
        `INSERT INTO tickets 
        (titulo, descripcion, cliente_id, prioridad_id, estado_id)
        VALUES ($1,$2,$3,$4,1)
        RETURNING id, titulo, descripcion, cliente_id, prioridad_id, estado_id, fecha_creacion`,
        [titulo, descripcion, cliente_id, prioridad_id]
    );

    return result.rows[0];
};

const getTicketById = async (id) => {

    const result = await db.query(`
        SELECT 
            t.id,
            t.titulo,
            t.descripcion,
            c.nombre AS cliente,
            tec.nombre AS tecnico,
            e.nombre AS estado,
            p.nombre AS prioridad,
            t.fecha_creacion,
            t.fecha_actualizacion

        FROM tickets t

        JOIN usuarios c
            ON t.cliente_id = c.id

        LEFT JOIN usuarios tec
            ON t.tecnico_id = tec.id

        JOIN ticket_estados e
            ON t.estado_id = e.id

        JOIN ticket_prioridades p
            ON t.prioridad_id = p.id

        WHERE t.id = $1
    `,[id]);

    return result.rows[0];
};

const getTicketDetalle = async (id) => {

    const result = await db.query(`
        SELECT 
            t.id,
            t.titulo,
            t.descripcion,
            c.nombre AS cliente,
            tec.nombre AS tecnico,
            e.nombre AS estado,
            p.nombre AS prioridad,
            t.fecha_creacion,
            t.fecha_actualizacion,

            COALESCE(
                json_agg(
                    json_build_object(
                        'id', tr.id,
                        'usuario', u.nombre,
                        'mensaje', tr.mensaje,
                        'fecha', tr.fecha
                    )
                ) FILTER (WHERE tr.id IS NOT NULL),
                '[]'
            ) AS respuestas

        FROM tickets t

        JOIN usuarios c
            ON t.cliente_id = c.id

        LEFT JOIN usuarios tec
            ON t.tecnico_id = tec.id

        JOIN ticket_estados e
            ON t.estado_id = e.id

        JOIN ticket_prioridades p
            ON t.prioridad_id = p.id

        LEFT JOIN ticket_respuestas tr
            ON t.id = tr.ticket_id

        LEFT JOIN usuarios u
            ON tr.usuario_id = u.id

        WHERE t.id = $1

        GROUP BY 
            t.id, c.nombre, tec.nombre, e.nombre, p.nombre
    `,[id]);

    return result.rows[0];
};

module.exports = {
    getTickets,
    createTicket,
    getTicketById,
    getTicketDetalle
};

