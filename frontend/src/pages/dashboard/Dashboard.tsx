import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { branchesService, Branch } from '../../services/branches.service';
import { employeesService, Employee } from '../../services/employees.service';
import { attendanceService, Attendance } from '../../services/attendance.service';

interface DashboardStats {
  totalBranches: number;
  activeBranches: number;
  totalEmployees: number;
  activeEmployees: number;
  todayAttendance: number;
  presentToday: number;
}

export default function Dashboard() {
  const { user, isAdmin, canWrite } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBranches: 0,
    activeBranches: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    todayAttendance: 0,
    presentToday: 0,
  });
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const [branches, employees, attendance] = await Promise.all([
        branchesService.getAll().catch(() => [] as Branch[]),
        employeesService.getAll().catch(() => [] as Employee[]),
        attendanceService.getAll(undefined, today).catch(() => [] as Attendance[]),
      ]);

      setStats({
        totalBranches: branches.length,
        activeBranches: branches.filter(b => b.isActive).length,
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.status === 'active').length,
        todayAttendance: attendance.length,
        presentToday: attendance.filter(a => a.status === 'present').length,
      });

      // Get recent employees (last 5)
      setRecentEmployees(employees.slice(0, 5));
      setTodayAttendance(attendance.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { name: 'Add Branch', href: '/branches', icon: '🏢', color: 'bg-blue-500', show: isAdmin },
    { name: 'Add Employee', href: '/employees', icon: '👤', color: 'bg-green-500', show: canWrite },
    { name: 'Mark Attendance', href: '/attendance', icon: '✓', color: 'bg-purple-500', show: true },
    { name: 'View Payroll', href: '/payroll', icon: '💰', color: 'bg-yellow-500', show: true },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isEmpty = stats.totalBranches === 0 && stats.totalEmployees === 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Branches</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBranches}</p>
              <p className="text-sm text-green-600 mt-1">{stats.activeBranches} active</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalEmployees}</p>
              <p className="text-sm text-green-600 mt-1">{stats.activeEmployees} active</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Attendance</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.todayAttendance}</p>
              <p className="text-sm text-green-600 mt-1">{stats.presentToday} present</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.activeEmployees > 0 
                  ? Math.round((stats.presentToday / stats.activeEmployees) * 100) 
                  : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">of active employees</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State with Getting Started Guide */}
      {isEmpty && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 mb-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Alfadli HRM!</h2>
            <p className="text-gray-600 mb-6">
              Your HR management system is ready. Let's get started by setting up your organization.
            </p>
            
            <div className="bg-white rounded-lg p-6 text-left shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Getting Started Guide:</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Create Your First Branch</h4>
                    <p className="text-sm text-gray-500">Set up your company branches or locations.</p>
                    <Link to="/branches" className="text-blue-600 text-sm hover:underline">Go to Branches →</Link>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Add Employees</h4>
                    <p className="text-sm text-gray-500">Add your team members to the system.</p>
                    <Link to="/employees" className="text-blue-600 text-sm hover:underline">Go to Employees →</Link>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Track Attendance</h4>
                    <p className="text-sm text-gray-500">Start tracking daily attendance.</p>
                    <Link to="/attendance" className="text-blue-600 text-sm hover:underline">Go to Attendance →</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.filter(a => a.show).map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className={`${action.color} text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium text-gray-900">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Employees */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Employees</h2>
            <Link to="/employees" className="text-blue-600 text-sm hover:underline">View all</Link>
          </div>
          {recentEmployees.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No employees yet</p>
          ) : (
            <div className="space-y-3">
              {recentEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{employee.name}</p>
                    <p className="text-xs text-gray-500 truncate">{employee.position || 'No position'}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {employee.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Attendance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Attendance</h2>
            <Link to="/attendance" className="text-blue-600 text-sm hover:underline">View all</Link>
          </div>
          {todayAttendance.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No attendance records today</p>
          ) : (
            <div className="space-y-3">
              {todayAttendance.map((record) => (
                <div key={record.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    record.status === 'present' ? 'bg-green-100' : record.status === 'late' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    {record.status === 'present' ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : record.status === 'late' ? (
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{record.employee?.name}</p>
                    <p className="text-xs text-gray-500">
                      {record.checkIn && `In: ${record.checkIn}`}
                      {record.checkOut && ` | Out: ${record.checkOut}`}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    record.status === 'present' ? 'bg-green-100 text-green-800' : 
                    record.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Info Card */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Account</h2>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-900">{user?.name}</p>
            <p className="text-gray-500">{user?.email}</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
              user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
              user?.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
