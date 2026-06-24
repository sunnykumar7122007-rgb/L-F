const turso = require('./turso');

async function addColumn() {
    try {
        await turso.execute(`ALTER TABLE users ADD COLUMN sessionToken TEXT;`);
        console.log("Successfully added sessionToken column.");
    } catch (e) {
        console.error("Error or column already exists:", e.message);
    }
}

addColumn();
