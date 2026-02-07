import apiClient from './client';
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '../types/api';

export const categoriesApi = {
  getAll: (groupId: number, type?: string) => {
    const params: Record<string, string> = {};
    if (type) params.type = type;
    return apiClient.get<CategoryResponse[]>(`/groups/${groupId}/categories`, { params }).then(res => res.data);
  },
  create: (groupId: number, data: CreateCategoryRequest) =>
    apiClient.post<CategoryResponse>(`/groups/${groupId}/categories`, data).then(res => res.data),
  update: (groupId: number, categoryId: number, data: UpdateCategoryRequest) =>
    apiClient.put<CategoryResponse>(`/groups/${groupId}/categories/${categoryId}`, data).then(res => res.data),
  delete: (groupId: number, categoryId: number) =>
    apiClient.delete(`/groups/${groupId}/categories/${categoryId}`),
};
