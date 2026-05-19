/**
 * Ejecutar con: node scripts/hashPasswords.js
 * Copia los hashes generados en seed.sql
 */
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const passwords = [
  { usuario: "admin",    password: "123456" },
  { usuario: "tecnico",  password: "124567" },
  { usuario: "usuario",  password: "usuario123" },
];

async function main() {
  console.log("Generando hashes bcrypt...\n");
  for (const p of passwords) {
    const hash = await bcrypt.hash(p.password, SALT_ROUNDS);
    console.log(`-- ${p.usuario} (${p.password}):`);
    console.log(`'${hash}'\n`);
  }2
}

main();
