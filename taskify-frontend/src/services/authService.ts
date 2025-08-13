import { LoginRequest, LoginResponse, RegisterRequest, UserInfo } from '../types/auth';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

class AuthService {
  private accessToken: string | null = null;
  private user: UserInfo | null = null;

  constructor() {
    // Load saved auth data from localStorage
    this.loadAuthFromStorage();
  }

  private loadAuthFromStorage() {
    try {
      const token = localStorage.getItem('taskify_access_token');
      const userData = localStorage.getItem('taskify_user');
      
      if (token && userData) {
        // Clear any demo/fake tokens from previous testing sessions
        if (token === 'demo-token' || token.startsWith('demo-access-token-')) {
          this.clearAuth();
          return;
        }

        this.accessToken = token;
        this.user = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Error loading auth data from storage:', error);
      this.clearAuth();
    }
  }

  private saveAuthToStorage(token: string, user: UserInfo) {
    try {
      localStorage.setItem('taskify_access_token', token);
      localStorage.setItem('taskify_user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving auth data to storage:', error);
    }
  }

  private clearAuth() {
    this.accessToken = null;
    this.user = null;
    localStorage.removeItem('taskify_access_token');
    localStorage.removeItem('taskify_user');
    localStorage.removeItem('taskify_refresh_token');
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.title || errorMessage;
        } catch {
          // If response is not JSON, use status text
        }
        
        throw new Error(errorMessage);
      }

      const data: LoginResponse = await response.json();
      
      // Save auth data
      this.accessToken = data.accessToken;
      this.user = data.user;
      this.saveAuthToStorage(data.accessToken, data.user);
      localStorage.setItem('taskify_refresh_token', data.refreshToken);

      return data;
    } catch (error) {
      console.error('[ERROR] Login error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server. Please ensure the API is running on http://localhost:5217');
      }
      
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data: LoginResponse = await response.json();
      
      // Save auth data
      this.accessToken = data.accessToken;
      this.user = data.user;
      this.saveAuthToStorage(data.accessToken, data.user);
      localStorage.setItem('taskify_refresh_token', data.refreshToken);

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  async getCurrentUser(): Promise<UserInfo | null> {
    if (!this.accessToken) {
      return null;
    }

    // If it's a demo token, just return the stored user data
    if (this.accessToken.startsWith('demo-token-')) {
      return this.user;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuth();
        }
        return null;
      }

      const user: UserInfo = await response.json();
      this.user = user;
      this.saveAuthToStorage(this.accessToken, user);
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getUser(): UserInfo | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.user;
  }

  isDemoMode(): boolean {
    return this.accessToken?.startsWith('demo-access-token-') || false;
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }
}

export const authService = new AuthService();
