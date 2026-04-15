const db = require("../config/db");

const getUsers = async () => {

    const result = await db.query(`
        SELECT 
            id,
            nombre,
            email,
            rol_id
        FROM usuarios
        ORDER BY nombre
    `);

    return result.rows;
};

module.exports = { 
    getUsers 
};