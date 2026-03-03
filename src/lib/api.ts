const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

export async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

export const api = {
    orders: {
        getAll: (filters?: any) => {
            const params = new URLSearchParams(filters).toString();
            return fetchApi(`/orders${params ? `?${params}` : ''}`);
        },
        getOne: (id: string) => fetchApi(`/orders/${id}`),
        create: (data: any) => fetchApi('/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        updateStatus: (id: string, status: string, notes?: string) => fetchApi(`/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, notes }),
        }),
    },
    users: {
        getMe: (token: string) => fetchApi('/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        }),
        updateProfile: (token: string, data: { fullName?: string }) => fetchApi('/me', {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data),
        }),
    }
};
