const envApiUrl = import.meta.env.VITE_API_URL?.trim();

// In development we prefer relative API calls so Vite proxy can forward to backend.
export const API_URL = import.meta.env.DEV ? '' : (envApiUrl || '');