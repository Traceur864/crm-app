import api from '../axios';

export interface Company {
  id: number;
  name: string;
  industry: string;
  website: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyDto {
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
}

export const companiesApi = {
  getAll: () => api.get<Company[]>('/companies').then((r) => r.data),
  getOne: (id: number) => api.get<Company>(`/companies/${id}`).then((r) => r.data),
  create: (dto: CreateCompanyDto) => api.post<Company>('/companies', dto).then((r) => r.data),
  update: (id: number, dto: Partial<CreateCompanyDto>) => api.put<Company>(`/companies/${id}`, dto).then((r) => r.data),
  remove: (id: number) => api.delete(`/companies/${id}`).then((r) => r.data),
};