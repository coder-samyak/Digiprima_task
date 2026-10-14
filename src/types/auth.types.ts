export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestoringSession: boolean;
  error: string | null;
}

export interface SignupCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
