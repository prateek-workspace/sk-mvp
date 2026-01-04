import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Users, Shield, UserCheck, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { User, Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { AdminService } from '../services/admin.service';
import { BookingsService } from '../services/bookings.service';

interface UserListItem extends User {
  is_active: boolean;
  is_verified_email: boolean;
  date_joined: string;
}

const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [newRole, setNewRole] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'bookings'>('users');

  useEffect(() => {
    // Only fetch data if user is authenticated and is an admin
    if (currentUser?.role === 'admin') {
      fetchUsers();
      fetchAllBookings();
    }
  }, [currentUser?.id]); // Only run when user ID changes

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllUsers();
      console.log('Fetched users:', data);
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBookings = async () => {
    try {
      const data = await BookingsService.getAllBookingsAdmin();
      setBookings(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch bookings');
    }
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await AdminService.updateUserRole(selectedUser.id, newRole);
      toast.success('User role updated successfully');
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: newRole as any } : u));
      setSelectedUser(null);
      setNewRole('');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const handleApproveLister = async (userId: number, approve: boolean) => {
    try {
      await AdminService.approveLister(userId, approve);
      toast.success(`Lister ${approve ? 'approved' : 'rejected'} successfully`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update lister status');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await AdminService.deleteUser(userId);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u.id !== userId));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const roleColors: Record<string, string> = {
    user: 'bg-gray-100 text-gray-800',
    admin: 'bg-red-100 text-red-800',
    hostel: 'bg-blue-100 text-blue-800',
    coaching: 'bg-green-100 text-green-800',
    library: 'bg-purple-100 text-purple-800',
    tiffin: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <DashboardLayout role={currentUser?.role || 'admin'} pageTitle="Admin Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground-default">Admin Dashboard</h1>
            <p className="text-foreground-muted mt-1">Manage users, bookings, and permissions</p>
          </div>
          <Shield className="w-12 h-12 text-primary" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Listing Owners</p>
                <p className="text-2xl font-bold">{users.filter(u => ['hostel', 'coaching', 'library', 'tiffin'].includes(u.role)).length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Pending Approvals</p>
                <p className="text-2xl font-bold">{users.filter(u => ['hostel', 'coaching', 'library', 'tiffin'].includes(u.role) && !u.is_approved_lister).length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-border">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground-muted hover:text-foreground-default'
            }`}
          >
            Users Management
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'bookings'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground-muted hover:text-foreground-default'
            }`}
          >
            All Bookings
          </button>
        </div>
        {/* Content based on active tab */}
        {activeTab === 'users' ? (
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground-default">All Users</h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-foreground-muted">
                No users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                    <tr key={user.id} className="hover:bg-surface transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground-default">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className={`text-xs ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                            {user.is_active ? '✓ Active' : '✗ Inactive'}
                          </span>
                          {['hostel', 'coaching', 'library', 'tiffin'].includes(user.role) && (
                            <span className={`text-xs ${user.is_approved_lister ? 'text-green-600' : 'text-yellow-600'}`}>
                              {user.is_approved_lister ? '✓ Approved' : '⏳ Pending'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                          }}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Change Role
                        </button>
                        {['hostel', 'coaching', 'library', 'tiffin'].includes(user.role) && !user.is_approved_lister && (
                          <button
                            onClick={() => handleApproveLister(user.id, true)}
                            className="text-green-600 hover:text-green-700 font-medium inline-flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                        )}
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700 font-medium inline-flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        ) : (
          /* Bookings Tab */
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground-default">All Bookings</h2>
            </div>
            
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-foreground-muted">
                No bookings found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Booking ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">User ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Listing ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-surface transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-default">
                          #{booking.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-muted">
                          User #{booking.user_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-muted">
                          Listing #{booking.listing_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground-default">
                          ₹{booking.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-muted">
                          {new Date(booking.created_at).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Role Update Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedUser(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-foreground-default mb-4">
              Update Role for {selectedUser.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  Select New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="user">User (Regular Student)</option>
                  <option value="hostel">Hostel Owner</option>
                  <option value="coaching">Coaching Owner</option>
                  <option value="library">Library Owner</option>
                  <option value="tiffin">Tiffin Service Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRoleUpdate}
                  className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Update Role
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2 bg-surface text-foreground-default rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;

