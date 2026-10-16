import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { ApiErrorResponse } from '../types/api';

export const handleApiError = (error: unknown) => {
  if (import.meta.env.DEV) console.error('[API Error]:', error);

  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const errorData = axiosError.response?.data;
    const requestUrl = axiosError.config?.url;

    const isAuthMe = requestUrl?.includes('/auth/me');

    if (isAuthMe && (status === 401 || !axiosError.response || axiosError.code === 'ERR_NETWORK')) {
      return;
    }

    if (status === 400) {
      return errorData;
    }

    if (errorData?.message) {
      toast.error(errorData.message);
      return errorData;
    }

    switch (status) {
      case 401:
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
        break;
      case 403:
        toast.error('Bạn không có quyền thực hiện thao tác này.');
        break;
      case 404:
        toast.error('Không tìm thấy tài nguyên hệ thống.');
        break;
      case 500:
        toast.error('Lỗi máy chủ nội bộ. Vui lòng thử lại sau.');
        break;
      default:
        if (!isAuthMe) {
          toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.');
        }
    }
    return;
  }

  toast.error('Đã có lỗi không mong muốn xảy ra.');
};