/**
 * Campus Lost & Found — Supabase User Sync
 * ─────────────────────────────────────────
 * Handles persistent user account storage in Supabase Postgres.
 * NOTE: Passwords are NEVER sent to or stored in Supabase.
 *       Local authentication continues to use the JSON flat-file server.
 *       Supabase stores: email, name, role, suspended status, created_at.
 */

const SUPABASE_URL  = 'https://snuabfazhnpganjtnniy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ujLN7KnrqfCKGi10c6j5dQ_wRNFgNmU';

// ── Internal client (lazy-init after CDN loads) ──────────────────────────────
let _supabaseClient = null;

function _getClient() {
    if (!_supabaseClient) {
        if (typeof supabase === 'undefined' || typeof supabase.createClient !== 'function') {
            throw new Error('Supabase CDN not loaded yet.');
        }
        _supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _supabaseClient;
}

// ── Public API ───────────────────────────────────────────────────────────────
const supabaseDB = {
    /** True once the connection has been verified. */
    isReady: false,

    /**
     * Verifies the Supabase connection with a lightweight probe query.
     * Returns true on success, false on failure.
     */
    async init() {
        try {
            const client = _getClient();
            const { error } = await client
                .from('users')
                .select('email')
                .limit(1);
            if (error) throw error;
            this.isReady = true;
            console.log('%c[Supabase] Connected ✓', 'color: #10b981; font-weight: bold;');
            return true;
        } catch (err) {
            console.warn('[Supabase] Connection failed:', err.message);
            this.isReady = false;
            return false;
        }
    },

    /**
     * Fetch all user profiles from Supabase.
     * Returns an array of { email, name, role, suspended, createdAt }.
     * Passwords are never fetched.
     */
    async getAll() {
        const client = _getClient();
        const { data, error } = await client
            .from('users')
            .select('email, name, role, suspended, created_at')
            .order('created_at', { ascending: true });
        if (error) throw error;
        // Normalise snake_case → camelCase for the app layer
        return (data || []).map(u => ({
            email:     u.email,
            name:      u.name,
            role:      u.role,
            suspended: u.suspended,
            createdAt: u.created_at
        }));
    },

    /**
     * Upsert (insert or update) a user profile in Supabase.
     * The `password` field on the user object is intentionally omitted.
     */
    async put(user) {
        const client = _getClient();
        const record = {
            email:     user.email,
            name:      user.name,
            role:      user.role      || 'user',
            suspended: user.suspended || false
            // password intentionally excluded
        };
        const { error } = await client
            .from('users')
            .upsert(record, { onConflict: 'email' });
        if (error) throw error;
    },

    /**
     * Delete a user by email from Supabase.
     */
    async delete(email) {
        const client = _getClient();
        const { error } = await client
            .from('users')
            .delete()
            .eq('email', email);
        if (error) throw error;
    },

    /**
     * Upload a file (image or voice) to Supabase storage.
     * @param {File} file - The File object to upload.
     * @param {string} path - Destination path within the storage bucket.
     * @returns {Promise<string>} - Public URL of the uploaded file.
     */
    async uploadMedia(file, path) {
        const client = _getClient();
        // Ensure a bucket named 'messages' exists in Supabase Storage.
        const { data, error } = await client.storage
            .from('messages')
            .upload(`${path}/${file.name}`, file, { upsert: true });
        if (error) throw error;
        // Get public URL
        const { publicURL, error: urlError } = client.storage
            .from('messages')
            .getPublicUrl(`${path}/${file.name}`);
        if (urlError) throw urlError;
        return publicURL;
    },

    /**
     * Send a chat message (text, image, or voice) to another user.
     * @param {Object} payload - Message payload.
     *   { string } sender_id   - ID of the sender.
     *   { string } receiver_id - ID of the receiver.
     *   { string } [text]      - Text content (optional).
     *   { string } [media_url] - URL of uploaded media (optional).
     *   { string } [media_type] - 'image' or 'voice' (optional).
     */
    async sendMessage(payload) {
        const client = _getClient();
        const { error } = await client
            .from('messages')
            .insert([payload]);
        if (error) throw error;
        return true;
    }
};
