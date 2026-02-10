import api from './api';

export interface Payroll {
  id: string;
  employeeId: string;
  branchId: string;
  month: number;
  year: number;
  baseSalary: number;
  adjustments: number;
  bonuses: number;
  total: number;
  employee: {
    id: string;
    name: string;
    position?: string;
  };
  branch: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayrollDto {
  employeeId: string;
  branchId: string;
  month: number;
  year: number;
  baseSalary: number;
  adjustments: number;
  bonuses: number;
}

export interface UpdatePayrollDto extends Partial<CreatePayrollDto> {}

export const payrollService = {
  async getAll(branchId?: string, employeeId?: string, month?: number, year?: number): Promise<Payroll[]> {
    const params = new URLSearchParams();
    if (branchId) params.append('branchId', branchId);
    if (employeeId) params.append('employeeId', employeeId);
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<Payroll[]>(`/payroll${query}`);
    return response.data;
  },

  async getOne(id: string): Promise<Payroll> {
    const response = await api.get<Payroll>(`/payroll/${id}`);
    return response.data;
  },

  async create(data: CreatePayrollDto): Promise<Payroll> {
    const response = await api.post<Payroll>('/payroll', data);
    return response.data;
  },

  async update(id: string, data: UpdatePayrollDto): Promise<Payroll> {
    const response = await api.patch<Payroll>(`/payroll/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/payroll/${id}`);
  },
};
