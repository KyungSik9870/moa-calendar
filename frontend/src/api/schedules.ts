import apiClient from './client';
import type { ScheduleResponse, CreateScheduleRequest, UpdateScheduleRequest } from '../types/api';

export const schedulesApi = {
  getAll: (groupId: number, startDate: string, endDate: string, filterUserId?: number, filterAssetType?: string) => {
    const params: Record<string, string> = { startDate, endDate };
    if (filterUserId) params.filterUserId = String(filterUserId);
    if (filterAssetType) params.filterAssetType = filterAssetType;
    return apiClient.get<ScheduleResponse[]>(`/groups/${groupId}/schedules`, { params }).then(res => res.data);
  },
  getById: (groupId: number, scheduleId: number) =>
    apiClient.get<ScheduleResponse>(`/groups/${groupId}/schedules/${scheduleId}`).then(res => res.data),
  create: (groupId: number, data: CreateScheduleRequest) =>
    apiClient.post<ScheduleResponse>(`/groups/${groupId}/schedules`, data).then(res => res.data),
  update: (groupId: number, scheduleId: number, data: UpdateScheduleRequest) =>
    apiClient.put<ScheduleResponse>(`/groups/${groupId}/schedules/${scheduleId}`, data).then(res => res.data),
  delete: (groupId: number, scheduleId: number) =>
    apiClient.delete(`/groups/${groupId}/schedules/${scheduleId}`),
  deleteRepeatGroup: (groupId: number, repeatGroupId: number) =>
    apiClient.delete(`/groups/${groupId}/schedules/repeat-group/${repeatGroupId}`),
};
