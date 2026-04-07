import { API_URL } from '../config';
import { getStoredAuthSession } from '../utils/auth';

const buildUrl = (path) => {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_URL}${path}`;
};

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
};

export const apiRequest = async (path, options = {}) => {
  const {
    method = 'GET',
    headers = {},
    body,
    withAuth = false,
  } = options;

  const requestHeaders = { ...headers };

  if (!(body instanceof FormData) && body !== undefined && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (withAuth) {
    const { token } = getStoredAuthSession();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data;
};

export const apiGet = (path, options = {}) => apiRequest(path, { ...options, method: 'GET' });
export const apiPost = (path, body, options = {}) => apiRequest(path, { ...options, method: 'POST', body });
export const apiPut = (path, body, options = {}) => apiRequest(path, { ...options, method: 'PUT', body });
export const apiDelete = (path, options = {}) => apiRequest(path, { ...options, method: 'DELETE' });
