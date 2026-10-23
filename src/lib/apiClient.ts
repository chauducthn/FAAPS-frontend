import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { handleApiError } from './errorHandler';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// One refresh at a time: parallel 401s wait for the same attempt (the refresh token rotates on each use).
let refreshing: Promise<boolean> | null = null;

const refreshSession = (): Promise<boolean> => {
  refreshing ??= (async () => {
    try {
      const { data } = await axios.get<{ headerName: string; token: string }>(`${baseURL}/auth/csrf`, { withCredentials: true });
      await axios.post(`${baseURL}/auth/refresh`, null, { withCredentials: true, headers: { [data.headerName]: data.token } });
      return true;
    } catch {
      return false;
    } finally {
      setTimeout(() => {
        refreshing = null;
      }, 0);
    }
  })();
  return refreshing;
};

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;
    const isAuthCall = config?.url?.startsWith('/auth/');

    // The session cookie is gone or expired: try the refresh cookie once, then replay the request.
    if (error.response?.status === 401 && config && !isAuthCall && !config._retried) {
      config._retried = true;
      if (await refreshSession()) {
        // The CSRF token belongs to the old session; fetch a new one for write requests.
        if (config.method && config.method.toLowerCase() !== 'get' && config.headers) {
          const { data } = await axios.get<{ headerName: string; token: string }>(`${baseURL}/auth/csrf`, { withCredentials: true });
          config.headers[data.headerName] = data.token;
        }
        return apiClient(config);
      }
    }

    handleApiError(error);
    return Promise.reject(error);
  },
);
