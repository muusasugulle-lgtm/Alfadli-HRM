import { useState, useEffect } from 'react';
import { attendanceService, Attendance as AttendanceType, CreateAttendanceDto } from '../../services/attendance.service';
import { employeesService } from '../../services/employees.service';
import { useAuth } from '../../hooks/useAuth';

export default function Attendance() {
  
  const { user, canWrite, isOwner, isStaff } = useAuth();
  const [attendances, setAttendances] = useState<AttendanceType[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<AttendanceType | null>(null);
  const [formData, setFormData] = useState<CreateAttendanceDto>({
    employeeId: '',
    branchId: user?.branchId || '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    notes: '',
  });
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attendanceData, employeesData] = await Promise.all([
        attendanceService.getAll(user?.branchId, undefined),
        employeesService.getAll(user?.branchId),
      ]);
      setAttendances(attendanceData.filter((a) => a.date.startsWith(selectedDate.split('T')[0])));
      setEmployees(employeesData);
      
      if (!formData.branchId && user?.branchId) {
        setFormData((prev) => ({ ...prev, branchId: user?.branchId || '' }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (attendance?: AttendanceType) => {
    if (attendance) {
      setEditingAttendance(attendance);
      setFormData({
        employeeId: attendance.employeeId,
        branchId: attendance.branchId,
        date: attendance.date.split('T')[0],
        status: attendance.status as any,
        notes: attendance.notes || '',
      });
    } else {
      setEditingAttendance(null);
      setFormData({
        employeeId: '',
        branchId: user?.branchId || '',
        date: selectedDate,
        status: 'present',
        notes: '',
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAttendance(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // For Staff, always use their branchId (enforce branch isolation)
      const submitData = {
        ...formData,
        branchId: isStaff && user?.branchId ? user.branchId : formData.branchId,
      };

      if (editingAttendance) {
        await attendanceService.update(editingAttendance.id, submitData);
      } else {
        await attendanceService.create(submitData);
      }
      await fetchData();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save attendance');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      await attendanceService.delete(id);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete attendance');
    }
  };

  const filteredAttendances = attendances.filter((a) => a.date.startsWith(selectedDate.split('T')[0]));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading attendance...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">Manage employee attendance</p>
        </div>
        <div className="flex gap-4 items-center">
          {isOwner && (
            <span className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">
              👁️ View Only
            </span>
          )}
          {isStaff && user?.branch && (
            <span className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
              🏢 {user.branch.name}
            </span>
          )}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm"
          />
          {canWrite && (
            <button
              onClick={() => handleOpenModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              + Mark Attendance
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                {canWrite && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendances.length === 0 ? (
                <tr>
                  <td colSpan={canWrite ? 6 : 5} className="px-6 py-4 text-center text-gray-500">
                    No attendance records found for this date
                  </td>
                </tr>
              ) : (
                filteredAttendances.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(attendance.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {attendance.employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendance.branch.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          attendance.status === 'present'
                            ? 'bg-green-100 text-green-800'
                            : attendance.status === 'late'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {attendance.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {attendance.notes || '-'}
                    </td>
                    {canWrite && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(attendance)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(attendance.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingAttendance ? 'Edit Attendance' : 'Mark Attendance'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee *</label>
                <select
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} {emp.position ? `(${emp.position})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  {editingAttendance ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
