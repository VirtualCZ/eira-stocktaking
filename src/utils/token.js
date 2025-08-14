// Simple token management
const TOKEN_KEY = 'auth_token';

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  
  // Get token from cookies only
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === TOKEN_KEY) {
      return value;
    }
  }
  
  return null;
};

export const setAuthToken = (token) => {
  if (typeof window === 'undefined') return;
  // Set token as cookie - only use Secure flag for HTTPS
  const isSecure = window.location.protocol === 'https:';
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=86400; SameSite=Lax; ${isSecure ? 'Secure;' : ''}`;
};

export const clearAuthToken = () => {
  if (typeof window === 'undefined') return;
  // Clear cookie
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const getAuthHeadersSafe = () => {
  const token = getAuthToken();
  if (!token) {
    return {
      'Content-Type': 'application/json'
    };
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const isAuthenticated = () => {
  return !!getAuthToken();
}; 