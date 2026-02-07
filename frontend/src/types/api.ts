// Auth
export interface SignUpRequest {
  email: string;
  password: string;
  nickname: string;
  color_code: string;
  personal_asset_color?: string;
  calendar_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

// User
export interface UserResponse {
  id: number;
  email: string;
  nickname: string;
  color_code: string;
  personal_asset_color: string;
  profile_image_url: string | null;
  created_at: string;
}

export interface UpdateUserRequest {
  nickname?: string;
  color_code?: string;
  personal_asset_color?: string;
}

export interface UserSearchResponse {
  id: number;
  email: string;
  nickname: string;
  color_code: string;
}

// Group
export interface GroupResponse {
  id: number;
  name: string;
  type: 'PERSONAL' | 'SHARED';
  host_id: number;
  joint_asset_color: string;
  budget_start_day: number;
  created_at: string;
}

export interface CreateGroupRequest {
  name: string;
  joint_asset_color?: string;
  budget_start_day?: number;
}

export interface UpdateGroupRequest {
  name?: string;
  joint_asset_color?: string;
  budget_start_day?: number;
}

export interface GroupMemberResponse {
  id: number;
  user_id: number;
  nickname: string;
  email: string;
  color_code: string;
  role: 'HOST' | 'GUEST';
  status: 'INVITED' | 'ACCEPTED';
  joined_at: string | null;
}

// Invite
export interface InviteRequest {
  invitee_email: string;
}

export interface InviteResponse {
  id: number;
  group_id: number;
  group_name: string;
  inviter_name: string;
  invitee_email: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
}

// Schedule
export interface ScheduleResponse {
  id: number;
  group_id: number;
  user_id: number;
  user_nickname: string;
  user_color: string;
  title: string;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  is_all_day: boolean;
  asset_type: 'PERSONAL' | 'JOINT';
  category: 'APPOINTMENT' | 'ANNIVERSARY' | 'WORK' | 'HOSPITAL' | 'TRAVEL' | 'ETC';
  memo: string | null;
  repeat_type: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  repeat_group_id: number | null;
  created_at: string;
}

export interface CreateScheduleRequest {
  title: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  asset_type: 'PERSONAL' | 'JOINT';
  category: string;
  memo?: string;
  repeat_type: string;
  repeat_end_date?: string;
}

export interface UpdateScheduleRequest {
  title?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  is_all_day?: boolean;
  asset_type?: string;
  category?: string;
  memo?: string;
}

// Transaction
export interface TransactionResponse {
  id: number;
  group_id: number;
  user_id: number;
  user_nickname: string;
  amount: number;
  transaction_type: 'EXPENSE' | 'INCOME';
  asset_type: 'PERSONAL' | 'JOINT';
  category_name: string;
  asset_source_id: number | null;
  asset_source_name: string | null;
  date: string;
  description: string | null;
  schedule_id: number | null;
  created_at: string;
}

export interface CreateTransactionRequest {
  amount: number;
  transaction_type: 'EXPENSE' | 'INCOME';
  asset_type: 'PERSONAL' | 'JOINT';
  category_name: string;
  asset_source_id?: number;
  date: string;
  description?: string;
  schedule_id?: number;
}

export interface UpdateTransactionRequest {
  amount?: number;
  transaction_type?: string;
  asset_type?: string;
  category_name?: string;
  asset_source_id?: number;
  date?: string;
  description?: string;
  schedule_id?: number;
}

export interface TransactionSummaryResponse {
  total_income: number;
  total_expense: number;
  balance: number;
  category_summaries: CategorySummary[];
}

export interface CategorySummary {
  category_name: string;
  total_amount: number;
  count: number;
}

// Asset Source
export interface AssetSourceResponse {
  id: number;
  group_id: number;
  name: string;
  type: 'CASH' | 'CARD' | 'ACCOUNT';
  description: string | null;
  created_at: string;
}

export interface CreateAssetSourceRequest {
  name: string;
  type: 'CASH' | 'CARD' | 'ACCOUNT';
  description?: string;
}

export interface UpdateAssetSourceRequest {
  name?: string;
  type?: string;
  description?: string;
}

// Category
export interface CategoryResponse {
  id: number;
  group_id: number;
  name: string;
  icon: string | null;
  type: 'EXPENSE' | 'INCOME';
  is_default: boolean;
  sort_order: number;
}

export interface CreateCategoryRequest {
  name: string;
  icon?: string;
  type: 'EXPENSE' | 'INCOME';
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
  sort_order?: number;
}

// Statistics
export interface BudgetOverviewResponse {
  total_budget: number;
  used_amount: number;
  remaining_amount: number;
  usage_rate: number;
}

export interface CategoryBreakdownResponse {
  category_name: string;
  amount: number;
  percentage: number;
}

export interface DailyTrendResponse {
  date: string;
  amount: number;
}

export interface MemberComparisonResponse {
  user_id: number;
  nickname: string;
  color_code: string;
  total_expense: number;
}

// Common
export interface ApiError {
  code: string;
  message: string;
}
