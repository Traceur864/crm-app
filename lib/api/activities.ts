import api from '../axios';

export type ActivityType = 'note' | 'call' | 'email' | 'meeting';

export interface Activity {
  id: number;
  type: ActivityType;
  description: string;
  scheduledAt: string;
  dealId: number;
  contactId: number;
  createdById: number;
  deal: { id: number; title: string };
  contact: { id: number; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityDto {
  type: ActivityType;
  description: string;
  scheduledAt?: string;
  dealId?: number;
  contactId?: number;
  createdById?: number;
}

export const activitiesApi = {
  getAll: () => api.get<Activity[]>('/activities').then((r) => r.data),
  getOne: (id: number) => api.get<Activity>(`/activities/${id}`).then((r) => r.data),
  getByDeal: (dealId: number) => api.get<Activity[]>(`/activities/deal/${dealId}`).then((r) => r.data),
  getByContact: (contactId: number) => api.get<Activity[]>(`/activities/contact/${contactId}`).then((r) => r.data),
  create: (dto: CreateActivityDto) => api.post<Activity>('/activities', dto).then((r) => r.data),
  remove: (id: number) => api.delete(`/activities/${id}`).then((r) => r.data),
};