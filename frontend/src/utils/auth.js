const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const ROLE_ROUTE_MAP = {
  Donor: '/donor-dashboard',
  Admin: '/admin-dashboard',
  'Hospital Staff': '/requests',
  Hospital: '/requests',
  'Blood Bank Staff': '/requests',
};

function parseJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
}

export function getDefaultRouteForRole(role) {
  return ROLE_ROUTE_MAP[role] || '/dashboard';
}

export function normalizeAuthResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    return { token: '', user: null };
  }

  if (payload.user && payload.token) {
    return { token: payload.token, user: payload.user };
  }

  const { token, ...userFields } = payload;
  return {
    token: token || '',
    user: userFields?.id ? userFields : null,
  };
}

export function saveAuthSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredAuthSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);

  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }

  return { token, user };
}

export function isTokenValid(token) {
  if (!token) return false;

  const payload = parseJwtPayload(token);
  if (!payload) return false;

  if (!payload.exp) return true;
  return payload.exp * 1000 > Date.now();
}
