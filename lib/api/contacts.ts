import api from '../axios';
import { Company } from './companies';

export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  status: 'active' | 'inactive';
  company: Company;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  status?: 'active' | 'inactive';
  companyId?: number;
}

export const contactsApi = {
  getAll: () => api.get<Contact[]>('/contacts').then((r) => r.data),
  getOne: (id: number) => api.get<Contact>(`/contacts/${id}`).then((r) => r.data),
  create: (dto: CreateContactDto) => api.post<Contact>('/contacts', dto).then((r) => r.data),
  update: (id: number, dto: Partial<CreateContactDto>) => api.put<Contact>(`/contacts/${id}`, dto).then((r) => r.data),
  remove: (id: number) => api.patch(`/contacts/${id}/desactive`).then((r) => r.data),
  restore: (id: number) => api.patch(`/contacts/${id}/restore`).then((r) => r.data),
};