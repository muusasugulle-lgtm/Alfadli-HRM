import api from './api';

export interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  salary: number;
  startDate: string;
  status: 'active' | 'inactive';
  branchId: string;
  branch?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  salary: number;
  startDate: string;
  status?: 'active' | 'inactive';
  branchId: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

export const employeesService = {
  async getAll(branchId?: string): Promise<Employee[]> {
    const query = branchId ? `?branchId=${branchId}` : '';
    const response = await api.get<Employee[]>(`/employees${query}`);
    return response.data;
  },

  async getOne(id: string): Promise<Employee> {
    const response = await api.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  async create(data: CreateEmployeeDto): Promise<Employee> {
    const response = await api.post<Employee>('/employees', data);
    return response.data;
  },

  async update(id: string, data: UpdateEmployeeDto): Promise<Employee> {
    const response = await api.patch<Employee>(`/employees/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/employees/${id}`);
  },

  async getByBranch(branchId: string): Promise<Employee[]> {
    const response = await api.get<Employee[]>(`/employees/branch/${branchId}`);
    return response.data;
  },
};
