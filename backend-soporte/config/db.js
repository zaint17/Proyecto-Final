require("dotenv").config();
const { Pool } = require("pg");

// Configuración adaptada para producción con la URI de Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Requerido obligatoriamente por Supabase para conexiones SSL seguras
  }
});

// Verificar conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error conectando a PostgreSQL (Supabase):", err.message);
  } else {
    console.log("✅ Conectado exitosamente a PostgreSQL en la nube.");
    release();
  }
});

module.exports = pool;