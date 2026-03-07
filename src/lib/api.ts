import { createClient } from '@/lib/supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';
const supabase = createClient()

let isRedirectingToLogin = false;

export async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;

    // 1. Intentar obtener token de la sesión de Supabase (más confiable que localStorage manual)
    const { data: { session } } = await supabase.auth.getSession();
    let token: string | null | undefined = session?.access_token;

    // 2. Fallback a localStorage por compatibilidad
    if (!token && typeof window !== 'undefined') {
        token = localStorage.getItem('prodmanager_token');
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        if (typeof window !== 'undefined' && !isRedirectingToLogin) {
            const currentPath = window.location.pathname;

            // Evitar loop si ya estamos en login o registración
            if (currentPath !== '/login' && currentPath !== '/register') {
                isRedirectingToLogin = true;
                console.warn('[fetchApi] 401 Unauthorized -> redirect to /login');
                const fullPath = currentPath + window.location.search;
                window.location.href = `/login?next=${encodeURIComponent(fullPath)}`;
            }
        }
        throw new Error('Sesión expirada. Redirigiendo...');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : {} as T;
}

export const api = {
    orders: {
        getAll: (filters?: any) => {
            const cleanFilters = Object.fromEntries(
                Object.entries(filters || {})
                    .filter(([_, v]) => v != null)
                    .map(([k, v]) => [k, String(v)])
            );
            const params = new URLSearchParams(cleanFilters).toString();
            return fetchApi(`/orders${params ? `?${params}` : ''}`);
        },
        getOne: (id: string) => fetchApi(`/orders/${id}`),
        create: (data: any) => fetchApi('/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        updateStatus: (id: string, status: string, notes?: string, responsableGeneralId?: string) => fetchApi(`/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, notes, responsableGeneralId }),
        }),
    },
    jobs: {
        getQueue: (businessId?: string) => fetchApi(`/jobs/queue${businessId ? `?businessId=${businessId}` : ''}`),
        addProgress: (id: string, unitsDone: number, note?: string) => fetchApi(`/jobs/${id}/progress`, {
            method: 'POST',
            body: JSON.stringify({ unitsDone, note }),
        }),
        updateStatus: (id: string, status: string, note?: string) => fetchApi(`/jobs/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, note }),
        }),
        create: (data: any) => fetchApi('/jobs', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    },
    users: {
        getMe: (token?: string) => fetchApi('/me', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }),
        updateProfile: (token: string | null, data: { fullName?: string }) => fetchApi('/me', {
            method: 'PATCH',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: JSON.stringify(data),
        }),
        setDefaultBusiness: (token: string | null, businessId: string) => fetchApi('/me/default-business', {
            method: 'PUT',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: JSON.stringify({ businessId }),
        }),
    },
    businesses: {
        getAll: () => fetchApi('/businesses'),
        getTemplates: () => fetchApi<any[]>('/business-templates'),
        create: (data: { templateKey: string; name?: string }) => fetchApi<any>('/businesses', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        getDashboardSummary: (businessId: string) => fetchApi<any>(`/businesses/${businessId}/dashboard-summary`, {
            cache: 'no-store'
        }),
        getOne: (id: string) => fetchApi<any>(`/businesses/${id}`),
        update: (id: string, data: any) => fetchApi<any>(`/businesses/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        }),
    },
    customers: {
        getAll: (filters?: any) => {
            const cleanFilters = Object.fromEntries(
                Object.entries(filters || {})
                    .filter(([_, v]) => v != null)
                    .map(([k, v]) => [k, String(v)])
            );
            const params = new URLSearchParams(cleanFilters).toString();
            return fetchApi(`/customers${params ? `?${params}` : ''}`, {
                cache: 'no-store'
            });
        },
        getOne: (id: string) => fetchApi(`/customers/${id}`),
        create: (data: any) => fetchApi('/customers', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: any) => fetchApi(`/customers/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
        remove: (id: string) => fetchApi(`/customers/${id}`, {
            method: 'DELETE',
        }),
    },
    printers: {
        getAll: (businessId?: string) => fetchApi(`/printers${businessId ? `?businessId=${businessId}` : ''}`),
        getOne: (id: string, businessId?: string) => fetchApi(`/printers/${id}${businessId ? `?businessId=${businessId}` : ''}`),
        create: (data: any) => fetchApi('/printers', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: any, businessId?: string) => fetchApi(`/printers/${id}${businessId ? `?businessId=${businessId}` : ''}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        updateStatus: (id: string, status: string, businessId?: string) => fetchApi(`/printers/${id}/status${businessId ? `?businessId=${businessId}` : ''}`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
        assignOrder: (id: string, orderId: string, materialId?: string, businessId?: string) => fetchApi(`/printers/${id}/assign-order${businessId ? `?businessId=${businessId}` : ''}`, {
            method: 'POST',
            body: JSON.stringify({ orderId, materialId }),
        }),
        release: (id: string, businessId?: string) => fetchApi(`/printers/${id}/release${businessId ? `?businessId=${businessId}` : ''}`, {
            method: 'POST',
        }),
        remove: (id: string, businessId?: string) => fetchApi(`/printers/${id}${businessId ? `?businessId=${businessId}` : ''}`, {
            method: 'DELETE',
        }),
    },
    materials: {
        getAll: (businessId?: string) => fetchApi(`/materials${businessId ? `?businessId=${businessId}` : ''}`),
        getOne: (id: string) => fetchApi(`/materials/${id}`),
        create: (data: any) => fetchApi('/materials', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: any) => fetchApi(`/materials/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
        remove: (id: string) => fetchApi(`/materials/${id}`, {
            method: 'DELETE',
        }),
    },
    reports: {
        getSummary: (businessId: string) => fetchApi(`/reports/summary?businessId=${businessId}`),
    },
    employees: {
        getAll: (businessId: string, active?: boolean) => {
            let path = `/employees?businessId=${businessId}`;
            if (active !== undefined) {
                path += `&active=${active}`;
            }
            return fetchApi(path);
        },
        getOne: (id: string, businessId: string) => fetchApi(`/employees/${id}?businessId=${businessId}`),
        create: (businessId: string, data: any) => fetchApi(`/employees?businessId=${businessId}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, businessId: string, data: any) => fetchApi(`/employees/${id}?businessId=${businessId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
        remove: (id: string, businessId: string) => fetchApi(`/employees/${id}?businessId=${businessId}`, {
            method: 'DELETE',
        }),
    }
};
