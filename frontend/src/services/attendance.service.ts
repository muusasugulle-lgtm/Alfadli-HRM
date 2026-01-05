import api from './api';

export interface Attendance {
  id: string;
  employeeId: string;
  branchId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
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

export interface CreateAttendanceDto {
  employeeId: string;
  branchId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

export interface UpdateAttendanceDto extends Partial<CreateAttendanceDto> {}

export const attendanceService = {
  async getAll(branchId?: string, date?: string): Promise<Attendance[]> {
    const params = new URLSearchParams();
    if (branchId) params.append('branchId', branchId);
    if (date) params.append('date', date);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<Attendance[]>(`/attendance${query}`);
    return response.data;
  },

  async getOne(id: string): Promise<Attendance> {
    const response = await api.get<Attendance>(`/attendance/${id}`);
    return response.data;
  },

  async create(data: CreateAttendanceDto): Promise<Attendance> {
    const response = await api.post<Attendance>('/attendance', data);
    return response.data;
  },

  async update(id: string, data: UpdateAttendanceDto): Promise<Attendance> {
    const response = await api.patch<Attendance>(`/attendance/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/attendance/${id}`);
  },

  async getByEmployee(employeeId: string): Promise<Attendance[]> {
    const response = await api.get<Attendance[]>(`/attendance/employee/${employeeId}`);
    return response.data;
  },

  async getByDateRange(startDate: string, endDate: string, branchId?: string): Promise<Attendance[]> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    if (branchId) params.append('branchId', branchId);
    const response = await api.get<Attendance[]>(`/attendance/range?${params.toString()}`);
    return response.data;
  },
};
