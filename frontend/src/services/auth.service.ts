import api from './api';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: string;
  branchId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'OWNER';
  branchId?: string;
  branch?: {
    id: string;
    name: string;
  };
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

// Use sessionStorage for tab-independent sessions
// Each browser tab will have its own independent login session
const storage = sessionStorage;

export const authService = {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    storage.setItem('token', response.data.access_token);
    storage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    storage.setItem('token', response.data.access_token);
    storage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    // Update stored user with fresh data
    storage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  logout(): void {
    storage.removeItem('token');
    storage.removeItem('user');
  },

  getToken(): string | null {
    return storage.getItem('token');
  },

  getUser(): User | null {
    const userStr = storage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
