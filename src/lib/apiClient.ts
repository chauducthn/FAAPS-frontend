import axios from 'axios';
import { handleApiError } from './errorHandler';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => {
    return response.data; 
  },
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);