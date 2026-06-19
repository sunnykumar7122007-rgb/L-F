const turso = require('./turso');
const fs = require('fs/promises');
const path = require('path');

async function initDB() {
    console.log("Initializing Turso Database...");

    try {
        // Create a generic key-value document store table
        // This mimics the existing JSON file behavior while giving us a SQL backend
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS document_store (
                store_name TEXT NOT NULL,
                record_key TEXT NOT NULL,
                data TEXT NOT NULL,
                PRIMARY KEY (store_name, record_key)
            );
        `);
        console.log("Table 'document_store' is ready.");

        // Optional: migrate existing data
        console.log("Checking for existing local data to migrate...");
        const dataDir = path.join(__dirname, 'data');
        
        try {
            const files = await fs.readdir(dataDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const storeName = file.replace('.json', '');
                    const filePath = path.join(dataDir, file);
                    const fileContent = await fs.readFile(filePath, 'utf8');
                    let records = [];
                    try {
                        records = JSON.parse(fileContent);
                    } catch (e) {
                        console.error(`Skipping ${file}: Invalid JSON`);
                        continue;
                    }

                    if (!Array.isArray(records)) {
                        records = Object.values(records); // just in case it's an object map
                    }

                    const keyName = storeName === 'users' ? 'email' : 'id';
                    
                    let count = 0;
                    for (const record of records) {
                        const recordKey = record[keyName];
                        if (recordKey) {
                            await turso.execute({
                                sql: `INSERT OR REPLACE INTO document_store (store_name, record_key, data) VALUES (?, ?, ?)`,
                                args: [storeName, String(recordKey), JSON.stringify(record)]
                            });
                            count++;
                        }
                    }
                    console.log(`Migrated ${count} records for store '${storeName}'.`);
                }
            }
        } catch (err) {
            console.log("No local data directory found or error reading it. Skipping migration.", err.message);
        }

        console.log("Database initialization complete!");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

initDB();
