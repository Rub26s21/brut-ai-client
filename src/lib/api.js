/**
 * API Client
 * Handles all API calls to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get authorization header with Supabase token
 */
async function getAuthHeader(supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error('Not authenticated');
    }
    return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
    };
}

/**
 * Contacts API
 */
export const contactsApi = {
    async getAll(supabase) {
        const headers = await getAuthHeader(supabase);
        const response = await fetch(`${API_URL}/api/contacts`, { headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch contacts');
        return data;
    },

    async create(supabase, contact) {
        const headers = await getAuthHeader(supabase);
        const response = await fetch(`${API_URL}/api/contacts`, {
            method: 'POST',
            headers,
            body: JSON.stringify(contact),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create contact');
        return data;
    },

    async update(supabase, id, contact) {
        const headers = await getAuthHeader(supabase);
        const response = await fetch(`${API_URL}/api/contacts/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(contact),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update contact');
        return data;
    },

    async delete(supabase, id) {
        const headers = await getAuthHeader(supabase);
        const response = await fetch(`${API_URL}/api/contacts/${id}`, {
            method: 'DELETE',
            headers,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete contact');
        return data;
    },
};

/**
 * Messages API
 */
export const messagesApi = {
    async generate(supabase, { name, tone, businessName }) {
        const headers = await getAuthHeader(supabase);
        const response = await fetch(`${API_URL}/api/messages/generate`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name, tone, businessName }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to generate message');
        return data;
    },
};

/**
 * Logs API
 */
export const logsApi = {
    async getAll(supabase, params = {}) {
        const headers = await getAuthHeader(supabase);
        const queryParams = new URLSearchParams(params);
        const response = await fetch(`${API_URL}/api/logs?${queryParams}`, { headers });
        if (!response.ok) throw new Error('Failed to fetch logs');
        return response.json();
    },

    async getStats(supabase) {
        const headers = await getAuthHeader(supabase);
        const response = await fetch(`${API_URL}/api/logs/stats`, { headers });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },
};
