const express = require('express');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

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

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fsSync.existsSync(DATA_DIR)) {
    fsSync.mkdirSync(DATA_DIR);
}

// Helper to get filepath for a store
function getStoreFilePath(storeName) {
    return path.join(DATA_DIR, `${storeName}.json`);
}

// Helper to get key path name for a store
function getKeyName(storeName) {
    return storeName === 'users' ? 'email' : 'id';
}

// Helper to read data from a store
async function readStore(storeName) {
    const filePath = getStoreFilePath(storeName);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        console.error(`Error reading store ${storeName}:`, error);
        throw error;
    }
}

// Helper to write data to a store
async function writeStore(storeName, data) {
    const filePath = getStoreFilePath(storeName);
    const tempPath = `${filePath}.tmp`;
    try {
        await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
        await fs.rename(tempPath, filePath);
    } catch (error) {
        console.error(`Error writing store ${storeName}:`, error);
        throw error;
    }
}

// API Routes

// Get all items in a store
app.get('/api/:storeName', async (req, res) => {
    const { storeName } = req.params;
    try {
        const data = await readStore(storeName);
        res.json(data);
    } catch (error) {
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
        const data = await readStore(storeName);
        const index = data.findIndex(item => item[keyName] === recordKey);

        if (index > -1) {
            data[index] = record; // update
        } else {
            data.push(record); // create
        }

        await writeStore(storeName, data);
        res.json(record);
    } catch (error) {
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
        const data = await readStore(storeName);
        
        records.forEach(newRecord => {
            const newKey = newRecord[keyName];
            if (newKey) {
                const index = data.findIndex(item => item[keyName] === newKey);
                if (index > -1) {
                    data[index] = newRecord;
                } else {
                    data.push(newRecord);
                }
            }
        });

        await writeStore(storeName, data);
        res.json({ success: true, count: records.length });
    } catch (error) {
        res.status(500).json({ error: `Failed to perform batch update in ${storeName}` });
    }
});

// Delete a record from a store by key
app.delete('/api/:storeName/:key', async (req, res) => {
    const { storeName, key } = req.params;
    const keyName = getKeyName(storeName);

    try {
        const data = await readStore(storeName);
        const filtered = data.filter(item => String(item[keyName]) !== String(key));

        if (data.length === filtered.length) {
            return res.status(404).json({ error: `Record with key ${key} not found in ${storeName}` });
        }

        await writeStore(storeName, filtered);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: `Failed to delete record from ${storeName}` });
    }
});

// Clear all records in a store
app.post('/api/:storeName/clear', async (req, res) => {
    const { storeName } = req.params;
    try {
        await writeStore(storeName, []);
        res.json({ success: true });
    } catch (error) {
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
