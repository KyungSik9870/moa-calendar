import apiClient from './client';
import type { BudgetOverviewResponse, CategoryBreakdownResponse, DailyTrendResponse, MemberComparisonResponse } from '../types/api';

export const statisticsApi = {
  getBudget: (groupId: number, startDate: string, endDate: string) =>
    apiClient.get<BudgetOverviewResponse>(`/groups/${groupId}/statistics/budget`, { params: { startDate, endDate } }).then(res => res.data),
  getCategoryBreakdown: (groupId: number, startDate: string, endDate: string) =>
    apiClient.get<CategoryBreakdownResponse[]>(`/groups/${groupId}/statistics/category-breakdown`, { params: { startDate, endDate } }).then(res => res.data),
  getDailyTrend: (groupId: number, startDate: string, endDate: string) =>
    apiClient.get<DailyTrendResponse[]>(`/groups/${groupId}/statistics/daily-trend`, { params: { startDate, endDate } }).then(res => res.data),
  getMemberComparison: (groupId: number, startDate: string, endDate: string) =>
    apiClient.get<MemberComparisonResponse[]>(`/groups/${groupId}/statistics/member-comparison`, { params: { startDate, endDate } }).then(res => res.data),
};
