import { ApiEnvelope, AuthPayload, Rates, User, WorkEntry, WorkInput } from './types';
import { request } from './client';

export const login = (email: string, password: string) =>
  request<ApiEnvelope<AuthPayload>>('/auth/login', {
    method: 'POST',
    body: { email, password }
  });

export const register = (
  name: string,
  email: string,
  password: string,
  role: 'admin' | 'super_admin' = 'admin'
) =>
  request<ApiEnvelope<AuthPayload>>('/auth/register', {
    method: 'POST',
    body: { name, email, password, role }
  });

export const listWork = (
  token: string,
  query: { page?: number; limit?: number; startDate?: string; endDate?: string }
) =>
  request<ApiEnvelope<WorkEntry[]>>('/work', {
    token,
    query
  });

export const createWork = (token: string, body: WorkInput) =>
  request<ApiEnvelope<WorkEntry>>('/work', {
    method: 'POST',
    token,
    body
  });

export const updateWork = (token: string, id: number, body: Partial<WorkInput>) =>
  request<ApiEnvelope<WorkEntry>>(`/work/${id}`, {
    method: 'PUT',
    token,
    body
  });

export const deleteWork = (token: string, id: number) =>
  request<ApiEnvelope<null>>(`/work/${id}`, {
    method: 'DELETE',
    token
  });

export const listUsers = (token: string) =>
  request<ApiEnvelope<User[]>>('/users', {
    token
  });

export const updateUserBlock = (token: string, id: number, isBlocked: boolean) =>
  request<ApiEnvelope<User>>(`/users/${id}/block`, {
    method: 'PUT',
    token,
    body: { is_blocked: isBlocked }
  });

export const getRates = (token: string) =>
  request<ApiEnvelope<Rates>>('/rates', {
    token
  });

export const updateRates = (token: string, body: Partial<Rates>) =>
  request<ApiEnvelope<Rates>>('/rates', {
    method: 'PUT',
    token,
    body
  });
