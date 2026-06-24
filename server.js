const express = require('express');
const path = require('path');
const turso = require('./turso');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

// Helper to safely parse JSON from DB
function safeParse(str, defaultVal) {
    if (!str) return defaultVal;
    try {
        return JSON.parse(str);
    } catch (e) {
        return defaultVal;
    }
}

// API Routes

// Get all items in a store
app.get('/api/:storeName', async (req, res) => {
    const { storeName } = req.params;
    try {
        let result;
        if (storeName === 'users') {
            result = await turso.execute('SELECT * FROM users');
        } else if (storeName === 'items') {
            result = await turso.execute('SELECT * FROM items');
        } else if (storeName === 'chat_invitations') {
            result = await turso.execute('SELECT * FROM chat_invitations');
        } else if (storeName === 'conversations') {
            result = await turso.execute('SELECT * FROM conversations');
        } else {
            return res.status(400).json({ error: `Unknown store: ${storeName}` });
        }

        // Map SQL rows back to objects
        const data = result.rows.map(row => {
            const obj = { ...row };
            // Parse JSON fields back to arrays/objects if necessary
            if (storeName === 'conversations') {
                obj.participants = safeParse(obj.participants, []);
                obj.messages = safeParse(obj.messages, []);
            }
            return obj;
        });

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
    
    try {
        if (storeName === 'users') {
            await turso.execute({
                sql: `INSERT OR REPLACE INTO users (email, password, role, name, avatar, phone, registrationNo, branch, createdAt)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [record.email, record.password, record.role, record.name, record.avatar, record.phone, record.registrationNo, record.branch, record.createdAt]
            });
        } else if (storeName === 'items') {
            await turso.execute({
                sql: `INSERT OR REPLACE INTO items (id, title, type, category, location, date, description, image, reporterName, reporterEmail, contactDetails, status, createdAt)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [record.id, record.title, record.type, record.category, record.location, record.date, record.description, record.image, record.reporterName, record.reporterEmail, record.contactDetails, record.status, record.createdAt]
            });
        } else if (storeName === 'chat_invitations') {
            await turso.execute({
                sql: `INSERT OR REPLACE INTO chat_invitations (id, fromEmail, fromName, toEmail, toName, itemId, itemTitle, status, createdAt)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [record.id, record.fromEmail, record.fromName, record.toEmail, record.toName, record.itemId, record.itemTitle, record.status, record.createdAt]
            });
        } else if (storeName === 'conversations') {
            await turso.execute({
                sql: `INSERT OR REPLACE INTO conversations (id, participants, itemId, itemTitle, messages, createdAt)
                      VALUES (?, ?, ?, ?, ?, ?)`,
                args: [record.id, JSON.stringify(record.participants || []), record.itemId, record.itemTitle, JSON.stringify(record.messages || []), record.createdAt]
            });
        } else {
            return res.status(400).json({ error: `Unknown store: ${storeName}` });
        }
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

    if (!Array.isArray(records)) {
        return res.status(400).json({ error: 'Request body must be an array' });
    }

    try {
        for (const record of records) {
            if (storeName === 'users') {
                await turso.execute({
                    sql: `INSERT OR REPLACE INTO users (email, password, role, name, avatar, phone, registrationNo, branch, createdAt)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [record.email, record.password, record.role, record.name, record.avatar, record.phone, record.registrationNo, record.branch, record.createdAt]
                });
            } else if (storeName === 'items') {
                await turso.execute({
                    sql: `INSERT OR REPLACE INTO items (id, title, type, category, location, date, description, image, reporterName, reporterEmail, contactDetails, status, createdAt)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [record.id, record.title, record.type, record.category, record.location, record.date, record.description, record.image, record.reporterName, record.reporterEmail, record.contactDetails, record.status, record.createdAt]
                });
            } else if (storeName === 'chat_invitations') {
                await turso.execute({
                    sql: `INSERT OR REPLACE INTO chat_invitations (id, fromEmail, fromName, toEmail, toName, itemId, itemTitle, status, createdAt)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [record.id, record.fromEmail, record.fromName, record.toEmail, record.toName, record.itemId, record.itemTitle, record.status, record.createdAt]
                });
            } else if (storeName === 'conversations') {
                await turso.execute({
                    sql: `INSERT OR REPLACE INTO conversations (id, participants, itemId, itemTitle, messages, createdAt)
                          VALUES (?, ?, ?, ?, ?, ?)`,
                    args: [record.id, JSON.stringify(record.participants || []), record.itemId, record.itemTitle, JSON.stringify(record.messages || []), record.createdAt]
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
        let result;
        if (storeName === 'users') {
            result = await turso.execute({ sql: 'DELETE FROM users WHERE email = ?', args: [String(key)] });
        } else if (storeName === 'items') {
            result = await turso.execute({ sql: 'DELETE FROM items WHERE id = ?', args: [String(key)] });
        } else if (storeName === 'chat_invitations') {
            result = await turso.execute({ sql: 'DELETE FROM chat_invitations WHERE id = ?', args: [String(key)] });
        } else if (storeName === 'conversations') {
            result = await turso.execute({ sql: 'DELETE FROM conversations WHERE id = ?', args: [String(key)] });
        } else {
            return res.status(400).json({ error: `Unknown store: ${storeName}` });
        }

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
        if (storeName === 'users') {
            await turso.execute('DELETE FROM users');
        } else if (storeName === 'items') {
            await turso.execute('DELETE FROM items');
        } else if (storeName === 'chat_invitations') {
            await turso.execute('DELETE FROM chat_invitations');
        } else if (storeName === 'conversations') {
            await turso.execute('DELETE FROM conversations');
        } else {
            return res.status(400).json({ error: `Unknown store: ${storeName}` });
        }
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
