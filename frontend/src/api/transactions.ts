import apiClient from './client';
import type { TransactionResponse, CreateTransactionRequest, UpdateTransactionRequest, TransactionSummaryResponse } from '../types/api';

export const transactionsApi = {
  getAll: (groupId: number, startDate: string, endDate: string, assetType?: string) => {
    const params: Record<string, string> = { startDate, endDate };
    if (assetType) params.assetType = assetType;
    return apiClient.get<TransactionResponse[]>(`/groups/${groupId}/transactions`, { params }).then(res => res.data);
  },
  getById: (groupId: number, transactionId: number) =>
    apiClient.get<TransactionResponse>(`/groups/${groupId}/transactions/${transactionId}`).then(res => res.data),
  create: (groupId: number, data: CreateTransactionRequest) =>
    apiClient.post<TransactionResponse>(`/groups/${groupId}/transactions`, data).then(res => res.data),
  update: (groupId: number, transactionId: number, data: UpdateTransactionRequest) =>
    apiClient.put<TransactionResponse>(`/groups/${groupId}/transactions/${transactionId}`, data).then(res => res.data),
  delete: (groupId: number, transactionId: number) =>
    apiClient.delete(`/groups/${groupId}/transactions/${transactionId}`),
  getSummary: (groupId: number, startDate: string, endDate: string) =>
    apiClient.get<TransactionSummaryResponse>(`/groups/${groupId}/transactions/summary`, { params: { startDate, endDate } }).then(res => res.data),
};
