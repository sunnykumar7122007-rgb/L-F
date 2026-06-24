const turso = require('./turso');

async function setupTables() {
    console.log("Setting up explicit SQL tables in Turso...");

    try {
        // Drop the old generic document_store
        await turso.execute(`DROP TABLE IF EXISTS document_store`);
        console.log("Dropped legacy 'document_store' table.");

        // 1. Users Table
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS users (
                email TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                name TEXT NOT NULL,
                avatar TEXT,
                phone TEXT,
                registrationNo TEXT,
                branch TEXT,
                createdAt TEXT
            )
        `);
        console.log("Created 'users' table.");

        // 2. Items Table
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS items (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                type TEXT NOT NULL,
                category TEXT,
                location TEXT,
                date TEXT,
                description TEXT,
                image TEXT,
                reporterName TEXT,
                reporterEmail TEXT,
                contactDetails TEXT,
                status TEXT,
                createdAt INTEGER
            )
        `);
        console.log("Created 'items' table.");

        // 3. Chat Invitations Table
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS chat_invitations (
                id TEXT PRIMARY KEY,
                fromEmail TEXT NOT NULL,
                fromName TEXT NOT NULL,
                toEmail TEXT NOT NULL,
                toName TEXT NOT NULL,
                itemId TEXT,
                itemTitle TEXT,
                status TEXT NOT NULL,
                createdAt INTEGER
            )
        `);
        console.log("Created 'chat_invitations' table.");

        // 4. Conversations Table
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                participants TEXT NOT NULL,
                itemId TEXT,
                itemTitle TEXT,
                messages TEXT NOT NULL,
                createdAt INTEGER
            )
        `);
        console.log("Created 'conversations' table.");

        // Seed Admin User
        console.log("Seeding initial admin user...");
        await turso.execute({
            sql: `INSERT OR REPLACE INTO users (email, password, role, name, phone, registrationNo, branch)
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [
                "sunnykumar7122007@gmail.com",
                "$unny1357.S",
                "admin",
                "Sunny Kumar (Admin)",
                "+91 7360899505",
                "1211824054",
                "CSE"
            ]
        });

        console.log("Database schema setup complete!");
    } catch (error) {
        console.error("Error setting up database tables:", error);
    }
}

setupTables();
