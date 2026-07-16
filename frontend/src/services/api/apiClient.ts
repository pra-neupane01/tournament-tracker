import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Foundation for handling responses and chunk 2 token refresh logic
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: In Chunk 2, implement 401 interceptor for access-token expiration
    
    return Promise.reject(error);
  }
);
