import Cookies from 'js-cookie';
import api from './axios';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthTokens> => {
  const { data } = await api.post<AuthTokens>('/auth/login', credentials);
  Cookies.set('accessToken', data.accessToken, { expires: 1 });
  Cookies.set('refreshToken', data.refreshToken, { expires: 7 });
  return data;
};

export const logout = async () => {
  await api.post('/auth/logout');
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  window.location.href = '/login';
};

export const isAuthenticated = (): boolean => {
  return !!Cookies.get('accessToken');
};