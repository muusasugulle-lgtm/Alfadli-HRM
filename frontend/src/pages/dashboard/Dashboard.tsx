import { useAuth } from '../../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
        <p className="text-gray-600">Role: {user?.role}</p>
        {user?.branch && (
          <p className="text-gray-600">Branch: {user.branch.name}</p>
        )}
      </div>
    </div>
  );
}



