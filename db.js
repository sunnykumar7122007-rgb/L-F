/**
 * Campus Lost & Found - IndexedDB Database Manager
 * Handles client-side persistent storage of users, items, and chats.
 */

class CampusDB {
    constructor() {
        this.dbName = "CampusLF_DB";
        this.dbVersion = 1;
        this.db = null;
    }

    /**
     * Initializes the IndexedDB database.
     * Creates object stores if they do not already exist.
     */
    init() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                return resolve(this.db);
            }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // User Accounts Store (Keyed by email)
                if (!db.objectStoreNames.contains("users")) {
                    db.createObjectStore("users", { keyPath: "email" });
                }

                // Lost/Found Items Store (Keyed by id)
                if (!db.objectStoreNames.contains("items")) {
                    db.createObjectStore("items", { keyPath: "id" });
                }

                // Chat Invitations Store (Keyed by id)
                if (!db.objectStoreNames.contains("chat_invitations")) {
                    db.createObjectStore("chat_invitations", { keyPath: "id" });
                }

                // Conversations Store (Keyed by id)
                if (!db.objectStoreNames.contains("conversations")) {
                    db.createObjectStore("conversations", { keyPath: "id" });
                }
            };
        });
    }

    /**
     * Retrieves all records from a specific object store.
     */
    getAll(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error("Database not initialized"));

            const transaction = this.db.transaction(storeName, "readonly");
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Adds or updates a single record in a store.
     */
    put(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error("Database not initialized"));

            const transaction = this.db.transaction(storeName, "readwrite");
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Adds or updates multiple records in a store inside a single transaction.
     */
    putAll(storeName, itemsList) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error("Database not initialized"));

            const transaction = this.db.transaction(storeName, "readwrite");
            const store = transaction.objectStore(storeName);

            itemsList.forEach(item => {
                store.put(item);
            });

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * Deletes a single record from a store by its key.
     */
    delete(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error("Database not initialized"));

            const transaction = this.db.transaction(storeName, "readwrite");
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clears all records in an object store.
     */
    clear(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error("Database not initialized"));

            const transaction = this.db.transaction(storeName, "readwrite");
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// Instantiate database globally
const dbManager = new CampusDB();
