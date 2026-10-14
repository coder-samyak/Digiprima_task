import axios from 'axios';
import { LoginCredentials, SignupCredentials, User } from '../types/auth.types';

// Points to the local Express backend server running on port 5000
export const BACKEND_URL = 'http://192.168.1.63:5000/api';

export const authApiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 3000, // Short timeout for graceful fallback
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  register: async (credentials: SignupCredentials): Promise<{ user: User; token: string }> => {
    const response = await authApiClient.post('/auth/signup', credentials);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await authApiClient.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async (token: string): Promise<{ user: User }> => {
    const response = await authApiClient.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
