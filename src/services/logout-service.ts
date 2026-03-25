import axios from 'axios';
import { AuthService } from './auth-service';

const logoutApi = axios.create({
  baseURL: '',
  timeout: 10000,
});

export const LogoutService = {
  async logout(): Promise<void> {
    try {
      await logoutApi.post('/api/auth/logout');
    } finally {
      AuthService.clear();
    }
  },
};
