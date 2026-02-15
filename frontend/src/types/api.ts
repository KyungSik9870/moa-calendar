// Auth
export interface SignUpRequest {
  email: string;
  password: string;
  nickname: string;
  color_code: string;
  profile_image_url?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: TokenResponse;
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
  profile_image_url?: string;
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
  updated_at: string;
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
  color_code: string;
  role: 'HOST' | 'GUEST';
  status: 'INVITED' | 'ACCEPTED';
  joined_at: string | null;
}

// Invite
export interface InviteRequest {
  email: string;
}

export interface InviteResponse {
  id: number;
  group_id: number;
  group_name: string;
  inviter_nickname: string;
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
  user_color_code: string;
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
  updated_at: string;
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
  title: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  asset_type: 'PERSONAL' | 'JOINT';
  category: string;
  memo?: string;
}

// Transaction
export interface TransactionResponse {
  id: number;
  group_id: number;
  user_id: number;
  user_nickname: string;
  user_color_code: string;
  amount: number;
  transaction_type: 'EXPENSE' | 'INCOME';
  asset_type: 'PERSONAL' | 'JOINT';
  category_name: string;
  asset_source_id: number | null;
  asset_source_name: string | null;
  date: string;
  description: string | null;
  schedule_id: number | null;
  schedule_title: string | null;
  created_at: string;
  updated_at: string;
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
  amount: number;
  transaction_type: 'EXPENSE' | 'INCOME';
  asset_type: 'PERSONAL' | 'JOINT';
  category_name: string;
  asset_source_id?: number;
  date: string;
  description?: string;
  schedule_id?: number;
}

export interface TransactionSummaryResponse {
  start_date: string;
  end_date: string;
  total_expense: number;
  total_income: number;
  balance: number;
  category_breakdown: CategoryBreakdownItem[];
}

export interface CategoryBreakdownItem {
  category_name: string;
  transaction_type: 'EXPENSE' | 'INCOME';
  total: number;
}

// Asset Source
export interface AssetSourceResponse {
  id: number;
  group_id: number;
  name: string;
  type: 'CASH' | 'CARD' | 'ACCOUNT';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetSourceRequest {
  name: string;
  type: 'CASH' | 'CARD' | 'ACCOUNT';
  description?: string;
}

export interface UpdateAssetSourceRequest {
  name: string;
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
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  icon?: string;
  type: 'EXPENSE' | 'INCOME';
}

export interface UpdateCategoryRequest {
  name: string;
  icon?: string;
}

// Statistics
export interface BudgetOverviewResponse {
  start_date: string;
  end_date: string;
  budget_start_day: number;
  total_expense: number;
  total_income: number;
  balance: number;
}

export interface CategoryBreakdownResponse {
  start_date: string;
  end_date: string;
  total_expense: number;
  total_income: number;
  items: CategoryBreakdownItemResponse[];
}

export interface CategoryBreakdownItemResponse {
  category_name: string;
  transaction_type: 'EXPENSE' | 'INCOME';
  total: number;
}

export interface DailyTrendResponse {
  start_date: string;
  end_date: string;
  items: DailyTrendItemResponse[];
}

export interface DailyTrendItemResponse {
  date: string;
  transaction_type: 'EXPENSE' | 'INCOME';
  total: number;
}

export interface MemberComparisonResponse {
  start_date: string;
  end_date: string;
  items: MemberComparisonItemResponse[];
}

export interface MemberComparisonItemResponse {
  user_id: number;
  nickname: string;
  color_code: string;
  transaction_type: 'EXPENSE' | 'INCOME';
  total: number;
}

// Common
export interface ApiError {
  code: string;
  message: string;
}
