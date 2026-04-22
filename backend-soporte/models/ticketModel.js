const db = require("../config/db");

// 📋 Obtener tickets
const getTickets = async () => {

    const result = await db.query(`
        SELECT
            tickets.id,
            tickets.titulo,
            tickets.descripcion,

            tickets.cliente_nombre AS cliente,
            usuarios.nombre AS tecnico,

            ticket_estados.nombre AS estado,
            ticket_prioridades.nombre AS prioridad,
            ticket_categorias.nombre AS categoria,

            tickets.fecha_creacion,
            tickets.fecha_limite

        FROM tickets

        LEFT JOIN usuarios
        ON tickets.tecnico_id = usuarios.id

        JOIN ticket_estados
        ON tickets.estado_id = ticket_estados.id

        JOIN ticket_prioridades
        ON tickets.prioridad_id = ticket_prioridades.id

        JOIN ticket_categorias
        ON tickets.categoria_id = ticket_categorias.id

        ORDER BY tickets.id DESC
    `);

    return result.rows;
};

// 🎟 Crear ticket
const createTicket = async (ticket) => {

    const {
        titulo,
        descripcion,

        cliente_nombre,
        cliente_dni,
        cliente_telefono,
        cliente_direccion,
        cliente_email,

        categoria_id,
        video_url

    } = ticket;

    // 🔥 Prioridad automática
    const dia = new Date().getDay();

    let prioridad_id = 1;

    if (dia >= 3 && dia <= 4) prioridad_id = 2;
    if (dia >= 5) prioridad_id = 3;

    // ⏰ Fecha límite +5 días
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 5);

    const result = await db.query(`
        INSERT INTO tickets (

            titulo,
            descripcion,

            cliente_nombre,
            cliente_dni,
            cliente_telefono,
            cliente_direccion,
            cliente_email,

            estado_id,
            prioridad_id,
            categoria_id,
            fecha_limite,
            video_url

        )

        VALUES (
            $1,$2,$3,$4,$5,$6,$7,
            1,$8,$9,$10,$11
        )

        RETURNING *
    `, [

        titulo,
        descripcion,

        cliente_nombre,
        cliente_dni,
        cliente_telefono,
        cliente_direccion,
        cliente_email,

        prioridad_id,
        categoria_id,
        fechaLimite,
        video_url

    ]);

    return result.rows[0];
};

module.exports = {
    getTickets,
    createTicket
};