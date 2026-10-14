import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  AuthState,
  LoginCredentials,
  SignupCredentials,
  User,
} from '../../types/auth.types';
import {
  saveAuthSession,
  getAuthSession,
  clearAuthSession,
  getRegisteredUsers,
  saveRegisteredUser,
  DEMO_USER,
  StoredUserAccount,
} from '../../utils/storage';
import { authApi } from '../../api/authApi';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isRestoringSession: true,
  error: null,
};

/**
 * 1. Thunk to restore existing session on app startup
 * Reads persisted session from AsyncStorage
 */
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const session = await getAuthSession();
      if (session && session.token) {
        return session;
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to restore session');
    }
  }
);

/**
 * 2. Thunk to register a new user
 * Saves to local AsyncStorage account store + backend API
 */
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (credentials: SignupCredentials, { rejectWithValue }) => {
    try {
      // Step A: Save locally in AsyncStorage (Mock Auth requirement)
      const users = await getRegisteredUsers();
      const existingUser = users.find(
        (u) => u.email.toLowerCase() === credentials.email.toLowerCase().trim()
      );

      if (existingUser) {
        return rejectWithValue('An account with this email address already exists.');
      }

      const newUser: StoredUserAccount = {
        id: `user-${Date.now()}`,
        fullName: credentials.fullName.trim(),
        email: credentials.email.toLowerCase().trim(),
        passwordHash: credentials.password,
        createdAt: new Date().toISOString(),
      };

      await saveRegisteredUser(newUser);

      // Step B: Also attempt to register on the running Express backend
      try {
        await authApi.register({
          fullName: credentials.fullName.trim(),
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password,
        });
      } catch (backendError) {
        // Backend failure is non-fatal since mock local storage handles it
        console.log('Backend sync skipped or offline, registered locally:', backendError);
      }

      const safeUser: User = {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        createdAt: newUser.createdAt,
      };

      return safeUser;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

/**
 * 3. Thunk to log in
 * Checks backend API or local mock account store, sets Redux state & AsyncStorage session
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const emailTrimmed = credentials.email.toLowerCase().trim();

      // Attempt 1: Try real local backend API
      try {
        const backendResponse = await authApi.login({
          email: emailTrimmed,
          password: credentials.password,
        });

        if (backendResponse && backendResponse.token && backendResponse.user) {
          await saveAuthSession({
            user: backendResponse.user,
            token: backendResponse.token,
          });
          return { user: backendResponse.user, token: backendResponse.token };
        }
      } catch (backendError) {
        console.log('Backend login skipped or offline, falling back to local accounts:', backendError);
      }

      // Attempt 2: Compare against local AsyncStorage accounts & demo user
      const users = await getRegisteredUsers();
      const foundUser = users.find(
        (u) =>
          u.email.toLowerCase() === emailTrimmed &&
          u.passwordHash === credentials.password
      );

      if (!foundUser) {
        return rejectWithValue('Invalid email or password. Please check your credentials.');
      }

      const user: User = {
        id: foundUser.id,
        fullName: foundUser.fullName,
        email: foundUser.email,
        createdAt: foundUser.createdAt,
      };

      const token = `mock-jwt-token-${user.id}-${Date.now()}`;
      await saveAuthSession({ user, token });

      return { user, token };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

/**
 * 4. Thunk to log out and clear AsyncStorage session
 */
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await clearAuthSession();
  return true;
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    demoLogin: (state) => {
      const user: User = {
        id: DEMO_USER.id,
        fullName: DEMO_USER.fullName,
        email: DEMO_USER.email,
        createdAt: DEMO_USER.createdAt,
      };
      const token = `mock-jwt-token-demo-${Date.now()}`;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      saveAuthSession({ user, token }).catch(console.error);
    },
  },
  extraReducers: (builder) => {
    // Restore Session
    builder.addCase(restoreSession.pending, (state) => {
      state.isRestoringSession = true;
    });
    builder.addCase(restoreSession.fulfilled, (state, action) => {
      state.isRestoringSession = false;
      if (action.payload) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      } else {
        state.isAuthenticated = false;
      }
    });
    builder.addCase(restoreSession.rejected, (state) => {
      state.isRestoringSession = false;
      state.isAuthenticated = false;
    });

    // Register User
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Login User
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.isAuthenticated = false;
    });

    // Logout User
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    });
  },
});

export const { clearAuthError, demoLogin } = authSlice.actions;
export default authSlice.reducer;
