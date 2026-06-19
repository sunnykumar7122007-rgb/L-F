const express = require('express');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const turso = require('./turso');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
// Log incoming requests so you can see UptimeRobot pings in Render logs
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.json({ limit: '10mb' })); // support large payloads for compressed base64 images
app.use(express.static(path.join(__dirname)));

// Helper to get key path name for a store
function getKeyName(storeName) {
    return storeName === 'users' ? 'email' : 'id';
}

// API Routes

// Get all items in a store
app.get('/api/:storeName', async (req, res) => {
    const { storeName } = req.params;
    try {
        const result = await turso.execute({
            sql: 'SELECT data FROM document_store WHERE store_name = ?',
            args: [storeName]
        });
        const data = result.rows.map(row => JSON.parse(row.data));
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Failed to read ${storeName}` });
    }
});

// Add or update a record in a store
app.post('/api/:storeName', async (req, res) => {
    const { storeName } = req.params;
    const record = req.body;
    const keyName = getKeyName(storeName);
    const recordKey = record[keyName];

    if (!recordKey) {
        return res.status(400).json({ error: `Missing key path '${keyName}' in request body` });
    }

    try {
        await turso.execute({
            sql: 'INSERT OR REPLACE INTO document_store (store_name, record_key, data) VALUES (?, ?, ?)',
            args: [storeName, String(recordKey), JSON.stringify(record)]
        });
        res.json(record);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Failed to save record to ${storeName}` });
    }
});

// Add or update multiple records in a store (Batch)
app.post('/api/:storeName/batch', async (req, res) => {
    const { storeName } = req.params;
    const records = req.body;
    const keyName = getKeyName(storeName);

    if (!Array.isArray(records)) {
        return res.status(400).json({ error: 'Request body must be an array' });
    }

    try {
        for (const newRecord of records) {
            const newKey = newRecord[keyName];
            if (newKey) {
                await turso.execute({
                    sql: 'INSERT OR REPLACE INTO document_store (store_name, record_key, data) VALUES (?, ?, ?)',
                    args: [storeName, String(newKey), JSON.stringify(newRecord)]
                });
            }
        }
        res.json({ success: true, count: records.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Failed to perform batch update in ${storeName}` });
    }
});

// Delete a record from a store by key
app.delete('/api/:storeName/:key', async (req, res) => {
    const { storeName, key } = req.params;

    try {
        const result = await turso.execute({
            sql: 'DELETE FROM document_store WHERE store_name = ? AND record_key = ?',
            args: [storeName, String(key)]
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: `Record with key ${key} not found in ${storeName}` });
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Failed to delete record from ${storeName}` });
    }
});

// Clear all records in a store
app.post('/api/:storeName/clear', async (req, res) => {
    const { storeName } = req.params;
    try {
        await turso.execute({
            sql: 'DELETE FROM document_store WHERE store_name = ?',
            args: [storeName]
        });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Failed to clear store ${storeName}` });
    }
});

// Fallback to serving index.html for UI routing if necessary
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Campus Lost & Found Server running on http://localhost:${PORT}`);
});
