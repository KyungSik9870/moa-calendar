import apiClient from './client';
import type { UserResponse, UpdateUserRequest, UserSearchResponse } from '../types/api';

export const usersApi = {
  getMe: () =>
    apiClient.get<UserResponse>('/users/me').then(res => res.data),
  updateMe: (data: UpdateUserRequest) =>
    apiClient.put<UserResponse>('/users/me', data).then(res => res.data),
  search: (email: string) =>
    apiClient.get<UserSearchResponse>('/users/search', { params: { email } }).then(res => res.data),
};
