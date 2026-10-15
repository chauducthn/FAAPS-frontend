import { apiClient } from './apiClient';
import { User } from '../types/auth';

export const authService = {
  loginAdmin: async (credentials: { email: string; password: string }) => {
    // ----- MOCK API -----
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email === 'admin@fpt.edu.vn' && credentials.password === '123456') {
          // Lưu 1 cái cờ ảo để giả lập backend đã set cookie
          localStorage.setItem('mock_session', 'true'); 
          resolve({ success: true });
        } else {
          reject(new Error('Incorrect email or password'));
        }
      }, 1000);
    });
  },

  loginGoogle: async (accessToken: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('mock_session', 'true');
        resolve({ success: true });
      }, 1000);
    });
  },

  getMe: async (): Promise<User | null> => {
    // ----- MOCK API -----
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Kiểm tra xem đã "đăng nhập" ảo chưa
        const hasSession = localStorage.getItem('mock_session');
        
        if (!hasSession) {
          reject(new Error('Unauthorized')); // Chưa đăng nhập -> Đá văng ra ngoài
          return;
        }

        resolve({
          id: 'mock-uuid-123',
          email: 'admin@fpt.edu.vn',
          fullName: 'Admin User',
          role: 'ADMIN', 
          status: 'ACTIVE',
        });
      }, 500);
    });
  },

  logout: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Xóa cờ ảo khi đăng xuất
        localStorage.removeItem('mock_session');
        resolve({ success: true });
      }, 500);
    });
  }
};