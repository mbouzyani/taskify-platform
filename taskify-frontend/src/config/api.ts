// API Configuration for development
export const API_CONFIG = {
  // Backend API URL - pointing to our running Taskify backend
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5217/api',
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Auth configuration
  AUTH: {
    TOKEN_KEY: 'taskify_auth_token',
    REFRESH_TOKEN_KEY: 'taskify_refresh_token',
    TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes buffer before token expiry
  },
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
    },
    USERS: '/users',
    PROJECTS: '/projects',
    TASKS: '/tasks',
    TEAM: '/team',
    DASHBOARD: '/dashboard',
  },
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Environment-specific settings
export const ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL,
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
};
