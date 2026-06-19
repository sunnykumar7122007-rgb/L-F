const { createClient } = require('@libsql/client');
require('dotenv').config();

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.warn("⚠️ TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is missing in the .env file!");
}

const turso = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:local.db', // fallback to local file if no URL
    authToken: process.env.TURSO_AUTH_TOKEN,
});

module.exports = turso;
