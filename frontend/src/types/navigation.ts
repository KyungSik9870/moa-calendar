import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  SignUp: undefined;
  Onboarding: { email: string; password: string; nickname: string };
};

export type MainTabParamList = {
  Calendar: undefined;
  Statistics: undefined;
  Assets: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProfileEdit: undefined;
  CalendarManagement: { groupId: number };
  MemberInvite: { groupId: number };
  MemberList: { groupId: number };
  AppSettings: { groupId: number };
  CategoryManagement: { groupId: number };
  AssetDetail: { assetSourceId: number; assetName: string };
  ScheduleDetail: { scheduleId: number; groupId: number };
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;
export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<MainTabParamList, T>;
export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
