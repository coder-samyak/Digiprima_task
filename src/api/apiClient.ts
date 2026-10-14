import axios, { AxiosError } from 'axios';

export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor for logging/debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('[API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging & standardized error messages
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API RESPONSE] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error: AxiosError) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    if (error.response) {
      // Server responded with non-2xx status code
      errorMessage = `Server Error (${error.response.status}): ${
        (error.response.data as { message?: string })?.message || error.message
      }`;
    } else if (error.request) {
      // No response received (network failure)
      errorMessage = 'Network connection error. Please check your internet connection.';
    } else {
      errorMessage = error.message;
    }

    console.error('[API RESPONSE ERROR]', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);
