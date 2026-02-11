import api from './api';

export interface Income {
  id: string;
  branchId: string;
  amount: number;
  date: string;
  description?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  branch: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  branchId: string;
  amount: number;
  date: string;
  description?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  branch: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeDto {
  branchId: string;
  amount: number;
  date: string;
  description?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface CreateExpenseDto {
  branchId: string;
  amount: number;
  date: string;
  description?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface ProfitLoss {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
}

export const accountingService = {
  // Income
  async getAllIncomes(branchId?: string, startDate?: string, endDate?: string): Promise<Income[]> {
    const params = new URLSearchParams();
    if (branchId) params.append('branchId', branchId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<Income[]>(`/accounting/income${query}`);
    return response.data;
  },

  async createIncome(data: CreateIncomeDto): Promise<Income> {
    const response = await api.post<Income>('/accounting/income', data);
    return response.data;
  },

  async updateIncome(id: string, data: Partial<CreateIncomeDto>): Promise<Income> {
    const response = await api.patch<Income>(`/accounting/income/${id}`, data);
    return response.data;
  },

  async deleteIncome(id: string): Promise<void> {
    await api.delete(`/accounting/income/${id}`);
  },

  // Expenses
  async getAllExpenses(branchId?: string, startDate?: string, endDate?: string): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (branchId) params.append('branchId', branchId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<Expense[]>(`/accounting/expense${query}`);
    return response.data;
  },

  async createExpense(data: CreateExpenseDto): Promise<Expense> {
    const response = await api.post<Expense>('/accounting/expense', data);
    return response.data;
  },

  async updateExpense(id: string, data: Partial<CreateExpenseDto>): Promise<Expense> {
    const response = await api.patch<Expense>(`/accounting/expense/${id}`, data);
    return response.data;
  },

  async deleteExpense(id: string): Promise<void> {
    await api.delete(`/accounting/expense/${id}`);
  },

  // Profit/Loss
  async getProfitLoss(branchId?: string, startDate?: string, endDate?: string): Promise<ProfitLoss> {
    const params = new URLSearchParams();
    if (branchId) params.append('branchId', branchId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<any>(`/accounting/profit-loss${query}`);
    return {
      totalIncome: response.data.totalIncome || 0,
      totalExpense: response.data.totalExpense || 0,
      netProfit: response.data.profit || response.data.netProfit || 0,
    };
  },
};
