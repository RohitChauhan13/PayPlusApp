import { WorkField } from '../utils/workFields';

export type Role = 'super_admin' | 'admin';

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_blocked: boolean;
  created_at?: string;
  updated_at?: string;
};

export type AuthPayload = {
  user: User;
  token: string | null;
  requiresApproval?: boolean;
};

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type PaymentType = 'online' | 'cash';

export type WorkPaymentTypes = Record<`${WorkField}_payment_type`, PaymentType>;

export type WorkQuantities = Record<WorkField, number | string>;

export type WorkEntry = WorkQuantities & {
  id: number;
  start_date: string;
  end_date: string;
  total_amount: string;
  total_commission: string;
  online_amount: string;
  online_net_amount: string;
  cash_amount: string;
  salary_amount: string;
  remaining_amount: string;
  created_by: number;
  creator?: Pick<User, 'id' | 'name' | 'email' | 'role' | 'is_blocked'>;
  createdAt?: string;
  updatedAt?: string;
} & WorkPaymentTypes;

export type WorkInput = WorkQuantities & {
  start_date: string;
  end_date: string;
  salary_amount: number | string;
} & WorkPaymentTypes;

export type Rates = {
  id: number;
} & Record<`${WorkField}_rate` | `${WorkField}_commission`, string>;
