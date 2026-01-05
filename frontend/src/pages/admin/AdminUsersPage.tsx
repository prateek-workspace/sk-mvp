import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Users, Eye, Shield, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { AdminService, UserListItem } from '../../services/admin.service';

const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser?.id]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllUsers();
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const listingOwners = users.filter(u => ['hostel', 'coaching', 'library', 'tiffin'].includes(u.role)).length;
  const admins = users.filter(u => u.role === 'admin').length;

  const roleColors: Record<string, string> = {
    user: 'bg-gray-100 text-gray-800',
    admin: 'bg-red-100 text-red-800',
    hostel: 'bg-blue-100 text-blue-800',
    coaching: 'bg-green-100 text-green-800',
    library: 'bg-purple-100 text-purple-800',
    tiffin: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <DashboardLayout role={currentUser?.role || 'admin'} pageTitle="Manage Users">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground-default">Manage All Users</h1>
            <p className="text-foreground-muted mt-1">View user profiles, enrollments, and activity</p>
          </div>
          <Users className="w-12 h-12 text-primary" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Total Users</p>
                <p className="text-2xl font-bold text-foreground-default">{totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Active Users</p>
                <p className="text-2xl font-bold text-foreground-default">{activeUsers}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Listing Owners</p>
                <p className="text-2xl font-bold text-foreground-default">{listingOwners}</p>
              </div>
              <UserCheck className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Administrators</p>
                <p className="text-2xl font-bold text-foreground-default">{admins}</p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-2">
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-2">
                Filter by Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Roles</option>
                <option value="user">Regular Users</option>
                <option value="hostel">Hostel Owners</option>
                <option value="coaching">Coaching Owners</option>
                <option value="library">Library Owners</option>
                <option value="tiffin">Tiffin Owners</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground-default">
              All Users ({filteredUsers.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-foreground-muted">
              {searchTerm || roleFilter !== 'all' ? 'No users match your filters' : 'No users found'}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-border">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 hover:bg-surface transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-foreground-default mb-1">
                          {user.name}
                        </h3>
                        <p className="text-xs text-foreground-muted mb-2">{user.email}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            roleColors[user.role] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3 text-xs">
                      <span className={user.is_active ? 'text-green-600' : 'text-red-600'}>
                        {user.is_active ? '✓ Active' : '✗ Inactive'}
                      </span>
                      <span className="text-foreground-muted">•</span>
                      <span className={user.is_verified_email ? 'text-green-600' : 'text-yellow-600'}>
                        {user.is_verified_email ? '✓ Verified' : '⏳ Unverified'}
                      </span>
                      {['hostel', 'coaching', 'library', 'tiffin'].includes(user.role) && (
                        <>
                          <span className="text-foreground-muted">•</span>
                          <span className={user.is_approved_lister ? 'text-green-600' : 'text-yellow-600'}>
                            {user.is_approved_lister ? '✓ Approved' : '⏳ Pending'}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground-muted">
                        Joined {new Date(user.date_joined).toLocaleDateString('en-IN')}
                      </span>
                      <button
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        className="inline-flex items-center text-primary hover:text-rose-600 font-medium"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((user) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-surface transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-foreground-default">
                              {user.name}
                            </div>
                            <div className="text-xs text-foreground-muted">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            roleColors[user.role] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-1">
                            <span className={`text-xs ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                              {user.is_active ? '✓ Active' : '✗ Inactive'}
                            </span>
                            <span className={`text-xs ${user.is_verified_email ? 'text-green-600' : 'text-yellow-600'}`}>
                              {user.is_verified_email ? '✓ Verified' : '⏳ Unverified'}
                            </span>
                            {['hostel', 'coaching', 'library', 'tiffin'].includes(user.role) && (
                              <span className={`text-xs ${user.is_approved_lister ? 'text-green-600' : 'text-yellow-600'}`}>
                                {user.is_approved_lister ? '✓ Approved' : '⏳ Pending'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground-muted">
                            {new Date(user.date_joined).toLocaleDateString('en-IN')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            className="inline-flex items-center text-primary hover:text-rose-600 font-medium"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsersPage;
