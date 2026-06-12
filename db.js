/**
 * Campus Lost & Found - Server Database Manager
 * Handles client-side API calls to the persistent backend storage.
 */

class CampusDB {
    constructor() {
        this.db = null;
    }

    /**
     * Initializes communication with the server backend.
     * Sets this.db to a truthy value if successful.
     */
    async init() {
        try {
            // Check if server is running by doing a light health ping or simple store fetch
            const response = await fetch('/api/users');
            if (response.ok) {
                this.db = { active: true, type: 'server' };
                console.log("Database initialized successfully: Connected to server database.");
                return this.db;
            } else {
                throw new Error("Server response not ok");
            }
        } catch (error) {
            console.error("Backend database initialization error:", error);
            throw error;
        }
    }

    /**
     * Retrieves all records from a specific store via API.
     */
    async getAll(storeName) {
        if (!this.db) throw new Error("Database not initialized");

        const response = await fetch(`/api/${storeName}`);
        if (!response.ok) {
            throw new Error(`Failed to retrieve data from store ${storeName}`);
        }
        return await response.json();
    }

    /**
     * Adds or updates a single record in a store via API.
     */
    async put(storeName, data) {
        if (!this.db) throw new Error("Database not initialized");

        const response = await fetch(`/api/${storeName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Failed to save record to store ${storeName}`);
        }
        return await response.json();
    }

    /**
     * Adds or updates multiple records in a store via API.
     */
    async putAll(storeName, itemsList) {
        if (!this.db) throw new Error("Database not initialized");

        const response = await fetch(`/api/${storeName}/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemsList)
        });

        if (!response.ok) {
            throw new Error(`Failed to perform batch update in store ${storeName}`);
        }
        return await response.json();
    }

    /**
     * Deletes a single record from a store by its key via API.
     */
    async delete(storeName, key) {
        if (!this.db) throw new Error("Database not initialized");

        const response = await fetch(`/api/${storeName}/${encodeURIComponent(key)}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete record ${key} from store ${storeName}`);
        }
        return await response.json();
    }

    /**
     * Clears all records in an object store via API.
     */
    async clear(storeName) {
        if (!this.db) throw new Error("Database not initialized");

        const response = await fetch(`/api/${storeName}/clear`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`Failed to clear store ${storeName}`);
        }
        return await response.json();
    }
}

// Instantiate database globally
const dbManager = new CampusDB();
