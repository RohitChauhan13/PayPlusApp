import { WorkEntry } from '../api/types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  WorkForm: { entry?: WorkEntry } | undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Work: undefined;
  Rates: undefined;
  Settings: undefined;
};
