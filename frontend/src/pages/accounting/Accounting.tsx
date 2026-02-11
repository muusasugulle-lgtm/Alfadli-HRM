import { useState, useEffect } from 'react';
import { accountingService, Income, Expense, CreateIncomeDto, CreateExpenseDto, ProfitLoss } from '../../services/accounting.service';
import { branchesService, Branch } from '../../services/branches.service';
import { useAuth } from '../../hooks/useAuth';

type TabType = 'overview' | 'income' | 'expenses';

export default function Accounting() {
  const { isAdmin, isManager, isStaff, user, canWrite } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profitLoss, setProfitLoss] = useState<ProfitLoss>({ totalIncome: 0, totalExpense: 0, netProfit: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterBranch, setFilterBranch] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [incomeForm, setIncomeForm] = useState<CreateIncomeDto>({
    branchId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    attachmentUrl: '',
    attachmentName: '',
  });

  const [expenseForm, setExpenseForm] = useState<CreateExpenseDto>({
    branchId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    attachmentUrl: '',
    attachmentName: '',
  });

  const [incomeFilePreview, setIncomeFilePreview] = useState<string>('');
  const [expenseFilePreview, setExpenseFilePreview] = useState<string>('');

  // Handle file upload for income
  const handleIncomeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setIncomeForm({ ...incomeForm, attachmentUrl: base64, attachmentName: file.name });
        setIncomeFilePreview(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file upload for expense
  const handleExpenseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setExpenseForm({ ...expenseForm, attachmentUrl: base64, attachmentName: file.name });
        setExpenseFilePreview(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filterBranch, filterStartDate, filterEndDate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const branchesData = await branchesService.getAll().catch(() => []);
      setBranches(branchesData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      // Staff can only see their branch
      const branchFilter = isStaff ? user?.branchId : (filterBranch || undefined);
      
      const [incomesData, expensesData, profitLossData] = await Promise.all([
        accountingService.getAllIncomes(branchFilter, filterStartDate || undefined, filterEndDate || undefined).catch(() => []),
        accountingService.getAllExpenses(branchFilter, filterStartDate || undefined, filterEndDate || undefined).catch(() => []),
        accountingService.getProfitLoss(branchFilter, filterStartDate || undefined, filterEndDate || undefined).catch(() => ({ totalIncome: 0, totalExpense: 0, netProfit: 0 })),
      ]);
      setIncomes(incomesData);
      setExpenses(expensesData);
      setProfitLoss(profitLossData);
    } catch (err: any) {
      console.error('Failed to fetch accounting data:', err);
    }
  };

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingIncome) {
        await accountingService.updateIncome(editingIncome.id, incomeForm);
      } else {
        await accountingService.createIncome(incomeForm);
      }
      setShowIncomeModal(false);
      setEditingIncome(null);
      setIncomeForm({ branchId: branches[0]?.id || '', amount: 0, date: new Date().toISOString().split('T')[0], description: '', attachmentUrl: '', attachmentName: '' });
      setIncomeFilePreview('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save income');
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await accountingService.updateExpense(editingExpense.id, expenseForm);
      } else {
        await accountingService.createExpense(expenseForm);
      }
      setShowExpenseModal(false);
      setEditingExpense(null);
      setExpenseForm({ branchId: branches[0]?.id || '', amount: 0, date: new Date().toISOString().split('T')[0], description: '', attachmentUrl: '', attachmentName: '' });
      setExpenseFilePreview('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!confirm('Delete this income record?')) return;
    try {
      await accountingService.deleteIncome(id);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Delete this expense record?')) return;
    try {
      await accountingService.deleteExpense(id);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  // Manager can only view, not edit
  const canEdit = isAdmin || (isStaff && canWrite);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'income', label: 'Daily Income' },
    { id: 'expenses', label: 'Daily Expenses' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounting</h1>
          {isManager && (
            <p className="text-sm text-orange-600 mt-1">👁️ View Only Mode</p>
          )}
          {isStaff && user?.branch && (
            <p className="text-sm text-blue-600 mt-1">🏢 {user.branch.name}</p>
          )}
        </div>
        <div className="flex gap-2">
          {canEdit && activeTab === 'income' && (
            <button onClick={() => { setEditingIncome(null); setIncomeForm({ branchId: branches[0]?.id || '', amount: 0, date: new Date().toISOString().split('T')[0], description: '', attachmentUrl: '', attachmentName: '' }); setIncomeFilePreview(''); setShowIncomeModal(true); }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
              + Add Income
            </button>
          )}
          {canEdit && activeTab === 'expenses' && (
            <button onClick={() => { setEditingExpense(null); setExpenseForm({ branchId: branches[0]?.id || '', amount: 0, date: new Date().toISOString().split('T')[0], description: '', attachmentUrl: '', attachmentName: '' }); setExpenseFilePreview(''); setShowExpenseModal(true); }}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
              + Add Expense
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold">&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters - Admin and Manager can filter by branch */}
      {(activeTab === 'overview' || activeTab === 'income' || activeTab === 'expenses') && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(isAdmin || isManager) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-500">Total Income</p>
            <p className="text-3xl font-bold text-green-600 mt-1">${profitLoss.totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
            <p className="text-3xl font-bold text-red-600 mt-1">${profitLoss.totalExpense.toLocaleString()}</p>
          </div>
          <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${profitLoss.netProfit >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
            <p className="text-sm font-medium text-gray-500">Net {profitLoss.netProfit >= 0 ? 'Profit' : 'Loss'}</p>
            <p className={`text-3xl font-bold mt-1 ${profitLoss.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              ${Math.abs(profitLoss.netProfit).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Income Tab */}
      {activeTab === 'income' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {incomes.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No income records found</p>
              {canEdit && (
                <button onClick={() => setShowIncomeModal(true)} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg">
                  Add First Income
                </button>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attachment</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  {canEdit && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {incomes.map((income) => (
                  <tr key={income.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(income.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{income.branch?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{income.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {income.attachmentUrl ? (
                        <a href={income.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                      +${Number(income.amount).toLocaleString()}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button onClick={() => { setEditingIncome(income); setIncomeForm({ branchId: income.branchId, amount: Number(income.amount), date: income.date.split('T')[0], description: income.description || '', attachmentUrl: income.attachmentUrl || '', attachmentName: income.attachmentName || '' }); setIncomeFilePreview(''); setShowIncomeModal(true); }}
                          className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button onClick={() => handleDeleteIncome(income.id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {expenses.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No expense records found</p>
              {canEdit && (
                <button onClick={() => setShowExpenseModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg">
                  Add First Expense
                </button>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attachment</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  {canEdit && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.branch?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{expense.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {expense.attachmentUrl ? (
                        <a href={expense.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-red-600">
                      -${Number(expense.amount).toLocaleString()}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button onClick={() => { setEditingExpense(expense); setExpenseForm({ branchId: expense.branchId, amount: Number(expense.amount), date: expense.date.split('T')[0], description: expense.description || '', attachmentUrl: expense.attachmentUrl || '', attachmentName: expense.attachmentName || '' }); setExpenseFilePreview(''); setShowExpenseModal(true); }}
                          className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button onClick={() => handleDeleteExpense(expense.id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">{editingIncome ? 'Edit Income' : 'Add Daily Income'}</h2>
              <button onClick={() => setShowIncomeModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleIncomeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                <select required value={incomeForm.branchId} onChange={(e) => setIncomeForm({ ...incomeForm, branchId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (<option key={branch.id} value={branch.id}>{branch.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input type="number" required min="0" step="0.01" value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" required value={incomeForm.date}
                  onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={incomeForm.description}
                  onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} 
                  placeholder="e.g., Daily sales, Service fee, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Receipt/Invoice)</label>
                <input type="file" accept="image/*,.pdf" onChange={handleIncomeFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                {incomeFilePreview && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <span>✓ {incomeFilePreview}</span>
                    <button type="button" onClick={() => { setIncomeFilePreview(''); setIncomeForm({ ...incomeForm, attachmentUrl: '', attachmentName: '' }); }} className="text-red-500">×</button>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowIncomeModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{editingIncome ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">{editingExpense ? 'Edit Expense' : 'Add Daily Expense'}</h2>
              <button onClick={() => setShowExpenseModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                <select required value={expenseForm.branchId} onChange={(e) => setExpenseForm({ ...expenseForm, branchId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (<option key={branch.id} value={branch.id}>{branch.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input type="number" required min="0" step="0.01" value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" required value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={2}
                  placeholder="e.g., Rent, Utilities, Supplies, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Receipt/Invoice)</label>
                <input type="file" accept="image/*,.pdf" onChange={handleExpenseFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                {expenseFilePreview && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <span>✓ {expenseFilePreview}</span>
                    <button type="button" onClick={() => { setExpenseFilePreview(''); setExpenseForm({ ...expenseForm, attachmentUrl: '', attachmentName: '' }); }} className="text-red-500">×</button>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{editingExpense ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
