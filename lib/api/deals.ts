import api from '../axios';
import { Contact } from './contacts';

export type DealStage = 'lead' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Deal {
  id: number;
  title: string;
  value: number;
  stage: DealStage;
  notes: string;
  expectedCloseDate: string;
  contact: Contact;
  contactId: number;
  assignedToId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealDto {
  title: string;
  value?: number;
  stage?: DealStage;
  notes?: string;
  expectedCloseDate?: string;
  contactId?: number;
  assignedToId?: number;
}

export const dealsApi = {
  getAll: () => api.get<Deal[]>('/deals').then((r) => r.data),
  getOne: (id: number) => api.get<Deal>(`/deals/${id}`).then((r) => r.data),
  getByStage: (stage: DealStage) => api.get<Deal[]>(`/deals/stage/${stage}`).then((r) => r.data),
  create: (dto: CreateDealDto) => api.post<Deal>('/deals', dto).then((r) => r.data),
  update: (id: number, dto: Partial<CreateDealDto>) => api.put<Deal>(`/deals/${id}`, dto).then((r) => r.data),
  updateStage: (id: number, stage: DealStage) => api.patch<Deal>(`/deals/${id}/stage`, { stage }).then((r) => r.data),
  remove: (id: number) => api.patch(`/deals/${id}/desactive`).then((r) => r.data),
  restore: (id: number) => api.patch(`/deals/${id}/restore`).then((r) => r.data),
};