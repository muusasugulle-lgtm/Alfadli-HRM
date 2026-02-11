import api from './api';

export interface Sale {
  id: string;
  branchId: string;
  amount: number;
  profit: number;
  date: string;
  note?: string;
  branch: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleDto {
  branchId: string;
  amount: number;
  profit: number;
  date: string;
  note?: string;
}

export interface SalesSummary {
  totalSales: number;
  totalProfit: number;
  count: number;
}

export const salesService = {
  async getAll(branchId?: string, startDate?: string, endDate?: string): Promise<Sale[]> {
    const params = new URLSearchParams();
    if (branchId) params.append('branchId', branchId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<Sale[]>(`/sales${query}`);
    return response.data;
  },

  async getOne(id: string): Promise<Sale> {
    const response = await api.get<Sale>(`/sales/${id}`);
    return response.data;
  },

  async create(data: CreateSaleDto): Promise<Sale> {
    const response = await api.post<Sale>('/sales', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateSaleDto>): Promise<Sale> {
    const response = await api.patch<Sale>(`/sales/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/sales/${id}`);
  },

  async getSummary(branchId?: string, startDate?: string, endDate?: string): Promise<SalesSummary> {
    const params = new URLSearchParams();
    if (branchId) params.append('branchId', branchId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<SalesSummary>(`/sales/summary${query}`);
    return response.data;
  },
};


