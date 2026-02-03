import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';

interface Transaction {
  id: number;
  listing_id: number;
  listing_name: string;
  listing_type: string;
  user_id: number;
  user_email: string;
  user_name: string;
  status: string;
  amount: number;
  quantity: number;
  payment_id: string | null;
  payment_screenshot: string | null;
  payment_verified: boolean;
  created_at: string;
}

const AdminTransactionsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchTransactions();
    }
  }, [currentUser]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.get('/bookings/admin/all');
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error(error.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.listing_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toString().includes(searchTerm)
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleVerifyPayment = async (
    transactionId: number,
    paymentStatus: "verified" | "pending"
  ) => {
    try {
      await api.patch(`/bookings/${transactionId}/verify-payment`, {
        payment_status: paymentStatus,
      });

      toast.success(
        paymentStatus === "verified"
          ? "Payment verified"
          : "Payment verification removed"
      );

      fetchTransactions();
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail[0]?.msg : "Action failed");
    }
  };


  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      waitlist: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const totalRevenue = transactions
    .filter(t => t.status === 'accepted')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardLayout role={currentUser?.role || 'admin'} pageTitle="Transactions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground-default">All Transactions</h1>
            <p className="text-foreground-muted mt-1">Monitor all payments and bookings</p>
          </div>
          <DollarSign className="w-12 h-12 text-primary" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Total Revenue</p>
                <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Pending Amount</p>
                <p className="text-2xl font-bold">₹{pendingAmount.toLocaleString('en-IN')}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Verified Payments</p>
                <p className="text-2xl font-bold">{transactions.filter(t => t.payment_verified).length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <input
                  type="text"
                  placeholder="Search by user email, listing, payment ID, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-foreground-muted" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="waitlist">Waitlist</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground-default">
              Transactions ({filteredTransactions.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-foreground-muted">
              No transactions found
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-border">
                {filteredTransactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 hover:bg-surface transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-foreground-default mb-1">
                          {transaction.listing_name}
                        </h3>
                        <p className="text-xs text-foreground-muted capitalize mb-2">
                          {transaction.listing_type}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {getStatusBadge(transaction.status)}
                          <span className="px-2 py-1 text-xs font-medium text-foreground-default bg-surface rounded-full">
                            ₹{transaction.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 mb-3 text-xs">
                      <p className="text-foreground-muted">
                        User: <span className="text-foreground-default font-medium">{transaction.user_name}</span>
                      </p>
                      <p className="text-foreground-muted">
                        Email: <span className="text-foreground-default">{transaction.user_email}</span>
                      </p>
                      <p className="text-foreground-muted">
                        Quantity: <span className="text-foreground-default font-medium">{transaction.quantity}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground-muted">Payment:</span>
                        {transaction.payment_verified ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : transaction.payment_id || transaction.payment_screenshot ? (
                          <Clock className="w-3 h-3 text-yellow-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span className="text-foreground-default text-xs">
                          {transaction.payment_verified ? 'Verified' : transaction.payment_id || transaction.payment_screenshot ? 'Pending' : 'No proof'}
                        </span>
                      </div>
                      <p className="text-foreground-muted">
                        Date: <span className="text-foreground-default">{new Date(transaction.created_at).toLocaleDateString('en-IN')}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      className="w-full inline-flex items-center justify-center text-primary hover:text-rose-600 font-medium text-sm py-2 px-4 bg-surface rounded-lg"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Listing</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-surface transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground-default">
                          #{transaction.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground-default">{transaction.user_email}</div>
                          <div className="text-xs text-foreground-muted">{transaction.user_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground-default">{transaction.listing_name}</div>
                          <div className="text-xs text-foreground-muted capitalize">{transaction.listing_type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground-default">
                          ₹{transaction.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-muted">
                          {transaction.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {transaction.payment_verified ? (
                              <CheckCircle className="w-4 h-4 text-green-500" title="Verified" />
                            ) : transaction.payment_id || transaction.payment_screenshot ? (
                              <Clock className="w-4 h-4 text-yellow-500" title="Pending verification" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" title="No payment proof" />
                            )}
                            <span className="text-xs text-foreground-muted">
                              {transaction.payment_id ? `ID: ${transaction.payment_id.slice(0, 10)}...` : 'No ID'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-muted">
                          {new Date(transaction.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedTransaction(transaction)}
                            className="text-primary hover:text-rose-600 font-medium inline-flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedTransaction(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-foreground-default mb-4">
              Transaction Details
            </h3>

            <div className="space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-foreground-muted">Transaction ID</p>
                  <p className="font-semibold text-foreground-default">#{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">Amount</p>
                  <p className="font-semibold text-foreground-default">₹{selectedTransaction.amount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">Quantity</p>
                  <p className="font-semibold text-foreground-default">{selectedTransaction.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">Date</p>
                  <p className="font-semibold text-foreground-default">
                    {new Date(selectedTransaction.created_at).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">Payment Verified</p>
                  <p className="font-semibold text-foreground-default">
                    {selectedTransaction.payment_verified ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Yes
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> No
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* User Info */}
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-foreground-default mb-3">User Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-foreground-muted">Email</p>
                    <p className="font-semibold text-foreground-default">{selectedTransaction.user_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-muted">Name</p>
                    <p className="font-semibold text-foreground-default">{selectedTransaction.user_name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Listing Info */}
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-foreground-default mb-3">Listing Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-foreground-muted">Name</p>
                    <p className="font-semibold text-foreground-default">{selectedTransaction.listing_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-muted">Type</p>
                    <p className="font-semibold text-foreground-default capitalize">{selectedTransaction.listing_type}</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-foreground-default mb-3">Payment Information</h4>
                <div className="space-y-4">
                  {selectedTransaction.payment_id && (
                    <div>
                      <p className="text-sm text-foreground-muted">Payment ID / Transaction ID</p>
                      <p className="font-mono text-foreground-default bg-surface px-3 py-2 rounded mt-1">
                        {selectedTransaction.payment_id}
                      </p>
                    </div>
                  )}
                  {selectedTransaction.payment_screenshot && (
                    <div>
                      <p className="text-sm text-foreground-muted mb-2">Payment Screenshot</p>
                      <img 
                        src={selectedTransaction.payment_screenshot} 
                        alt="Payment proof" 
                        className="w-full max-w-md h-auto rounded-lg border border-border"
                      />
                    </div>
                  )}
                  {!selectedTransaction.payment_id && !selectedTransaction.payment_screenshot && (
                    <p className="text-sm text-foreground-muted">No payment proof provided</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-border pt-4 flex gap-3">
                {!selectedTransaction.payment_verified && (selectedTransaction.payment_id || selectedTransaction.payment_screenshot) && (
                  <button
                    onClick={() => {
                      handleVerifyPayment(selectedTransaction.id, "verified");
                      setSelectedTransaction(null);
                    }}
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    Verify Payment
                  </button>
                )}
                {selectedTransaction.payment_verified && (
                  <button
                    onClick={() => {
                      handleVerifyPayment(selectedTransaction.id, 'pending');
                      setSelectedTransaction(null);
                    }}
                    className="flex-1 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                  >
                    Remove Verification
                  </button>
                )}
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="flex-1 py-2 bg-surface text-foreground-default rounded-lg font-semibold hover:bg-border transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminTransactionsPage;
