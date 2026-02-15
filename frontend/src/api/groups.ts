import apiClient from './client';
import type { GroupResponse, CreateGroupRequest, UpdateGroupRequest, GroupMemberResponse, InviteRequest, InviteResponse } from '../types/api';

export const groupsApi = {
  getAll: () =>
    apiClient.get<GroupResponse[]>('/groups').then(res => res.data),
  getById: (groupId: number) =>
    apiClient.get<GroupResponse>(`/groups/${groupId}`).then(res => res.data),
  create: (data: CreateGroupRequest) =>
    apiClient.post<GroupResponse>('/groups', data).then(res => res.data),
  update: (groupId: number, data: UpdateGroupRequest) =>
    apiClient.put<GroupResponse>(`/groups/${groupId}`, data).then(res => res.data),
  delete: (groupId: number) =>
    apiClient.delete(`/groups/${groupId}`),
  getMembers: (groupId: number) =>
    apiClient.get<GroupMemberResponse[]>(`/groups/${groupId}/members`).then(res => res.data),
  removeMember: (groupId: number, userId: number) =>
    apiClient.delete(`/groups/${groupId}/members/${userId}`),
  leaveGroup: (groupId: number) =>
    apiClient.delete(`/groups/${groupId}/members/self`),
  invite: (groupId: number, data: InviteRequest) =>
    apiClient.post<InviteResponse>(`/groups/${groupId}/invites`, data).then(res => res.data),
  getPendingInvites: () =>
    apiClient.get<InviteResponse[]>('/groups/invites/pending').then(res => res.data),
  acceptInvite: (inviteId: number) =>
    apiClient.post('/groups/invites/' + inviteId + '/accept'),
  rejectInvite: (inviteId: number) =>
    apiClient.post('/groups/invites/' + inviteId + '/reject'),
};
