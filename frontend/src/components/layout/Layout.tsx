import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Layout() {
  const { user, logout, isAdmin, isManager, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const linkClass = (path: string) => 
    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
      isActive(path)
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
    }`;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-800">Alfadli HRM</Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className={linkClass('/')}>
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link to="/branches" className={linkClass('/branches')}>
                    Branches
                  </Link>
                )}
                <Link to="/employees" className={linkClass('/employees')}>
                  Employees
                </Link>
                <Link to="/attendance" className={linkClass('/attendance')}>
                  Attendance
                </Link>
                <Link to="/payroll" className={linkClass('/payroll')}>
                  Payroll
                </Link>
                <Link to="/accounting" className={linkClass('/accounting')}>
                  Accounting
                </Link>
                {isAdmin && (
                  <Link to="/users" className={linkClass('/users')}>
                    Users
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    isAdmin ? 'bg-purple-100 text-purple-800' :
                    isManager ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user?.role}
                  </span>
                  {isStaff && user?.branch && (
                    <span className="text-xs text-gray-500">{user.branch.name}</span>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="sm:hidden bg-white border-b">
        <div className="px-2 py-2 flex flex-wrap gap-2">
          <Link to="/" className={`px-3 py-1 rounded-full text-sm ${isActive('/') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
            Dashboard
          </Link>
          {isAdmin && (
            <Link to="/branches" className={`px-3 py-1 rounded-full text-sm ${isActive('/branches') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              Branches
            </Link>
          )}
          <Link to="/employees" className={`px-3 py-1 rounded-full text-sm ${isActive('/employees') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
            Employees
          </Link>
          <Link to="/attendance" className={`px-3 py-1 rounded-full text-sm ${isActive('/attendance') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
            Attendance
          </Link>
          <Link to="/payroll" className={`px-3 py-1 rounded-full text-sm ${isActive('/payroll') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
            Payroll
          </Link>
          <Link to="/accounting" className={`px-3 py-1 rounded-full text-sm ${isActive('/accounting') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
            Accounting
          </Link>
          {isAdmin && (
            <Link to="/users" className={`px-3 py-1 rounded-full text-sm ${isActive('/users') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              Users
            </Link>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
