import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { branchesService } from '../../services/branches.service';
import { employeesService } from '../../services/employees.service';
import { accountingService, ProfitLoss } from '../../services/accounting.service';

export default function Dashboard() {
  const { user, isAdmin, isManager, isStaff } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalEmployees: 0,
  });
  const [profitLoss, setProfitLoss] = useState<ProfitLoss>({ totalIncome: 0, totalExpense: 0, netProfit: 0 });
  const [monthlyProfitLoss, setMonthlyProfitLoss] = useState<ProfitLoss>({ totalIncome: 0, totalExpense: 0, netProfit: 0 });
  const [yearlyProfitLoss, setYearlyProfitLoss] = useState<ProfitLoss>({ totalIncome: 0, totalExpense: 0, netProfit: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current month and year dates
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      const lastDayOfYear = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
      
      // Staff sees only their branch
      const branchFilter = isStaff ? user?.branchId : undefined;
      
      const [branches, employees, allTimePL, monthlyPL, yearlyPL] = await Promise.all([
        branchesService.getAll().catch(() => []),
        employeesService.getAll(branchFilter).catch(() => []),
        accountingService.getProfitLoss(branchFilter).catch(() => ({ totalIncome: 0, totalExpense: 0, netProfit: 0 })),
        accountingService.getProfitLoss(branchFilter, firstDayOfMonth, lastDayOfMonth).catch(() => ({ totalIncome: 0, totalExpense: 0, netProfit: 0 })),
        accountingService.getProfitLoss(branchFilter, firstDayOfYear, lastDayOfYear).catch(() => ({ totalIncome: 0, totalExpense: 0, netProfit: 0 })),
      ]);

      setStats({
        totalBranches: branches.length,
        totalEmployees: employees.length,
      });
      setProfitLoss(allTimePL);
      setMonthlyProfitLoss(monthlyPL);
      setYearlyProfitLoss(yearlyPL);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="mt-2 text-blue-100">
              {isAdmin && '👑 Administrator Dashboard - Full access to all data'}
              {isManager && '👁️ Manager Dashboard - View only access'}
              {isStaff && `🏢 ${user?.branch?.name || 'Your Branch'} - Staff Dashboard`}
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-sm text-blue-200">Today</p>
            <p className="text-2xl font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats - Admin/Manager only */}
      {(isAdmin || isManager) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Branches</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBranches}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Overview */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          💰 Financial Overview
          {isStaff && user?.branch && <span className="text-sm font-normal text-gray-500 ml-2">({user.branch.name})</span>}
        </h2>
        
        {/* Monthly Stats */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">📅 {currentMonth} {currentYear}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Monthly Income</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">${monthlyProfitLoss.totalIncome.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Monthly Expenses</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">${monthlyProfitLoss.totalExpense.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-red-200 rounded-full">
                  <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
              </div>
            </div>
            <div className={`bg-gradient-to-br ${monthlyProfitLoss.netProfit >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'} rounded-xl p-6 border`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${monthlyProfitLoss.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    Monthly {monthlyProfitLoss.netProfit >= 0 ? 'Profit' : 'Loss'}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${monthlyProfitLoss.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    ${Math.abs(monthlyProfitLoss.netProfit).toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 ${monthlyProfitLoss.netProfit >= 0 ? 'bg-blue-200' : 'bg-orange-200'} rounded-full`}>
                  {monthlyProfitLoss.netProfit >= 0 ? (
                    <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Yearly Stats */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">📆 Year {currentYear}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Yearly Income</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${yearlyProfitLoss.totalIncome.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Yearly Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-1">${yearlyProfitLoss.totalExpense.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Yearly {yearlyProfitLoss.netProfit >= 0 ? 'Profit' : 'Loss'}</p>
              <p className={`text-2xl font-bold mt-1 ${yearlyProfitLoss.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                ${Math.abs(yearlyProfitLoss.netProfit).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* All Time Stats - Admin/Manager only */}
        {(isAdmin || isManager) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">🏆 All Time</h3>
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center md:text-left">
                  <p className="text-sm font-medium text-gray-400">Total Income</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">${profitLoss.totalIncome.toLocaleString()}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm font-medium text-gray-400">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-400 mt-1">${profitLoss.totalExpense.toLocaleString()}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm font-medium text-gray-400">Net {profitLoss.netProfit >= 0 ? 'Profit' : 'Loss'}</p>
                  <p className={`text-3xl font-bold mt-1 ${profitLoss.netProfit >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                    ${Math.abs(profitLoss.netProfit).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions - Based on role */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isAdmin && (
            <a href="/branches" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-center group">
              <div className="p-3 bg-purple-100 rounded-xl w-fit mx-auto mb-2 group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">Branches</p>
            </a>
          )}
          <a href="/employees" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-center group">
            <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Employees</p>
          </a>
          <a href="/attendance" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all text-center group">
            <div className="p-3 bg-green-100 rounded-xl w-fit mx-auto mb-2 group-hover:bg-green-200 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Attendance</p>
          </a>
          <a href="/accounting" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-center group">
            <div className="p-3 bg-indigo-100 rounded-xl w-fit mx-auto mb-2 group-hover:bg-indigo-200 transition-colors">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Accounting</p>
          </a>
        </div>
      </div>

      {/* Role Information Card */}
      <div className={`rounded-xl p-6 ${
        isAdmin ? 'bg-purple-50 border border-purple-200' :
        isManager ? 'bg-orange-50 border border-orange-200' :
        'bg-blue-50 border border-blue-200'
      }`}>
        <h3 className={`font-bold ${
          isAdmin ? 'text-purple-800' :
          isManager ? 'text-orange-800' :
          'text-blue-800'
        }`}>
          {isAdmin && '👑 Admin Privileges'}
          {isManager && '👁️ Manager Access'}
          {isStaff && '🏢 Staff Access'}
        </h3>
        <p className={`mt-2 text-sm ${
          isAdmin ? 'text-purple-700' :
          isManager ? 'text-orange-700' :
          'text-blue-700'
        }`}>
          {isAdmin && 'You have full access to create, edit, and delete all data across all branches.'}
          {isManager && 'You can view all information across all branches but cannot make changes. Contact an Admin to make updates.'}
          {isStaff && `You can manage data for your branch (${user?.branch?.name}). Monthly and yearly profit/loss data shows your branch performance.`}
        </p>
      </div>
    </div>
  );
}
