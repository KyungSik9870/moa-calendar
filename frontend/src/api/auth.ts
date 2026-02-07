import apiClient from './client';
import type { SignUpRequest, LoginRequest, AuthResponse } from '../types/api';

export const authApi = {
  signUp: (data: SignUpRequest) =>
    apiClient.post<AuthResponse>('/auth/signup', data).then(res => res.data),
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data).then(res => res.data),
};
