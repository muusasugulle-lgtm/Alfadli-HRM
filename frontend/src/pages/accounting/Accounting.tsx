import { useState, useEffect } from 'react';
import { accountingService, Income, Expense, ExpenseCategory, CreateIncomeDto, CreateExpenseDto, ProfitLoss } from '../../services/accounting.service';
import { branchesService, Branch } from '../../services/branches.service';
import { useAuth } from '../../hooks/useAuth';

type TabType = 'overview' | 'income' | 'expenses' | 'categories';

export default function Accounting() {
  const { isAdmin, canWrite } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [profitLoss, setProfitLoss] = useState<ProfitLoss>({ totalIncome: 0, totalExpense: 0, netProfit: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterBranch, setFilterBranch] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [incomeForm, setIncomeForm] = useState<CreateIncomeDto>({
    branchId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [expenseForm, setExpenseForm] = useState<CreateExpenseDto>({
    branchId: '',
    categoryId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filterBranch, filterStartDate, filterEndDate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [branchesData, categoriesData] = await Promise.all([
        branchesService.getAll(),
        accountingService.getCategories(),
      ]);
      setBranches(branchesData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [incomesData, expensesData, profitLossData] = await Promise.all([
        accountingService.getAllIncomes(filterBranch || undefined, filterStartDate || undefined, filterEndDate || undefined),
        accountingService.getAllExpenses(filterBranch || undefined, filterStartDate || undefined, filterEndDate || undefined),
        accountingService.getProfitLoss(filterBranch || undefined, filterStartDate || undefined, filterEndDate || undefined),
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
      setIncomeForm({ branchId: branches[0]?.id || '', amount: 0, date: new Date().toISOString().split('T')[0], description: '' });
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
      setExpenseForm({ branchId: branches[0]?.id || '', categoryId: categories[0]?.id || '', amount: 0, date: new Date().toISOString().split('T')[0], description: '' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await accountingService.createCategory(categoryForm.name, categoryForm.description);
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '' });
      const categoriesData = await accountingService.getCategories();
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create category');
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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'income', label: 'Income' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'categories', label: 'Categories' },
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
        <h1 className="text-3xl font-bold text-gray-900">Accounting</h1>
        <div className="flex gap-2">
          {canWrite && activeTab === 'income' && (
            <button onClick={() => { setEditingIncome(null); setIncomeForm({ branchId: branches[0]?.id || '', amount: 0, date: new Date().toISOString().split('T')[0], description: '' }); setShowIncomeModal(true); }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
              + Add Income
            </button>
          )}
          {canWrite && activeTab === 'expenses' && (
            <button onClick={() => { setEditingExpense(null); setExpenseForm({ branchId: branches[0]?.id || '', categoryId: categories[0]?.id || '', amount: 0, date: new Date().toISOString().split('T')[0], description: '' }); setShowExpenseModal(true); }}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
              + Add Expense
            </button>
          )}
          {isAdmin && activeTab === 'categories' && (
            <button onClick={() => setShowCategoryModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
              + Add Category
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

      {/* Filters */}
      {(activeTab === 'overview' || activeTab === 'income' || activeTab === 'expenses') && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <p className="text-sm font-medium text-gray-500">Net Profit</p>
            <p className={`text-3xl font-bold mt-1 ${profitLoss.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              ${profitLoss.netProfit.toLocaleString()}
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
              {canWrite && (
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  {canWrite && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                      +${income.amount.toLocaleString()}
                    </td>
                    {canWrite && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button onClick={() => { setEditingIncome(income); setIncomeForm({ branchId: income.branchId, amount: income.amount, date: income.date.split('T')[0], description: income.description || '' }); setShowIncomeModal(true); }}
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
              {canWrite && categories.length > 0 && (
                <button onClick={() => setShowExpenseModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg">
                  Add First Expense
                </button>
              )}
              {categories.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">Create expense categories first</p>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  {canWrite && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.branch?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{expense.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-red-600">
                      -${expense.amount.toLocaleString()}
                    </td>
                    {canWrite && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button onClick={() => { setEditingExpense(expense); setExpenseForm({ branchId: expense.branchId, categoryId: expense.categoryId, amount: expense.amount, date: expense.date.split('T')[0], description: expense.description || '' }); setShowExpenseModal(true); }}
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

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No expense categories yet</p>
              {isAdmin && (
                <button onClick={() => setShowCategoryModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
                  Create First Category
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {categories.map((category) => (
                <div key={category.id} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  {category.description && <p className="text-sm text-gray-500 mt-1">{category.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">{editingIncome ? 'Edit Income' : 'Add Income'}</h2>
              <button onClick={() => setShowIncomeModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} />
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
              <h2 className="text-xl font-semibold">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
              <button onClick={() => setShowExpenseModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                  <select required value={expenseForm.branchId} onChange={(e) => setExpenseForm({ ...expenseForm, branchId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (<option key={branch.id} value={branch.id}>{branch.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select required value={expenseForm.categoryId} onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Category</option>
                    {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{editingExpense ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Add Category</h2>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" required value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. Rent, Utilities, Supplies" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
