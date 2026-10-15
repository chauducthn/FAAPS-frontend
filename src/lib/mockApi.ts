import MockAdapter from 'axios-mock-adapter';
import { apiClient } from './apiClient';

export function setupMockApi() {
  const mock = new MockAdapter(apiClient, { delayResponse: 500 });

  // Mock Đăng nhập Admin
  mock.onPost('/auth/admin/login').reply((config) => {
    const { email, password } = JSON.parse(config.data);
    if (email === 'admin@fpt.edu.vn' && password === '123456') {
      localStorage.setItem('mock_session', 'true');
      return [
        200,
        {
          success: true,
          message: 'Đăng nhập thành công',
          data: {
            id: 'mock-uuid-123',
            email: 'admin@fpt.edu.vn',
            fullName: 'Admin User',
            role: 'ADMIN',
            status: 'ACTIVE',
          },
        },
      ];
    }
    return [400, { success: false, errorCode: 'ERR_INVALID', message: 'Sai email hoặc mật khẩu' }];
  });

  // Mock Google Login
  mock.onPost('/auth/google').reply(() => {
    localStorage.setItem('mock_session', 'true');
    return [
      200,
      {
        success: true,
        message: 'Đăng nhập Google thành công',
        data: {
          id: 'mock-uuid-456',
          email: 'student@fpt.edu.vn',
          fullName: 'Student User',
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      },
    ];
  });

  // Mock Lấy thông tin User
  mock.onGet('/auth/me').reply(() => {
    const hasSession = localStorage.getItem('mock_session');
    if (hasSession) {
      return [
        200,
        {
          success: true,
          data: {
            id: 'mock-uuid-123',
            email: 'admin@fpt.edu.vn',
            fullName: 'Admin User',
            role: 'ADMIN',
            status: 'ACTIVE',
          },
        },
      ];
    }
    return [401, { success: false, errorCode: 'ERR_UNAUTHORIZED', message: 'Chưa đăng nhập' }];
  });

  // Mock Đăng xuất
  mock.onPost('/auth/logout').reply(() => {
    localStorage.removeItem('mock_session');
    return [200, { success: true, message: 'Đã đăng xuất' }];
  });
}