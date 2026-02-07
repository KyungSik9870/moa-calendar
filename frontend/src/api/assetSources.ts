import apiClient from './client';
import type { AssetSourceResponse, CreateAssetSourceRequest, UpdateAssetSourceRequest } from '../types/api';

export const assetSourcesApi = {
  getAll: (groupId: number) =>
    apiClient.get<AssetSourceResponse[]>(`/groups/${groupId}/asset-sources`).then(res => res.data),
  getById: (groupId: number, assetSourceId: number) =>
    apiClient.get<AssetSourceResponse>(`/groups/${groupId}/asset-sources/${assetSourceId}`).then(res => res.data),
  create: (groupId: number, data: CreateAssetSourceRequest) =>
    apiClient.post<AssetSourceResponse>(`/groups/${groupId}/asset-sources`, data).then(res => res.data),
  update: (groupId: number, assetSourceId: number, data: UpdateAssetSourceRequest) =>
    apiClient.put<AssetSourceResponse>(`/groups/${groupId}/asset-sources/${assetSourceId}`, data).then(res => res.data),
  delete: (groupId: number, assetSourceId: number) =>
    apiClient.delete(`/groups/${groupId}/asset-sources/${assetSourceId}`),
};
