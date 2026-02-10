import api from './api';

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees: number;
    users: number;
  };
}

export interface CreateBranchDto {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateBranchDto extends Partial<CreateBranchDto> {}

export const branchesService = {
  async getAll(): Promise<Branch[]> {
    const response = await api.get<Branch[]>('/branches');
    return response.data;
  },

  async getOne(id: string): Promise<Branch> {
    const response = await api.get<Branch>(`/branches/${id}`);
    return response.data;
  },

  async create(data: CreateBranchDto): Promise<Branch> {
    const response = await api.post<Branch>('/branches', data);
    return response.data;
  },

  async update(id: string, data: UpdateBranchDto): Promise<Branch> {
    const response = await api.patch<Branch>(`/branches/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/branches/${id}`);
  },
};
