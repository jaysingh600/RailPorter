import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Search, CheckCircle, XCircle } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalCollected: 0, totalCommission: 0, totalPorterEarnings: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAdminPayments = async () => {
      try {
        const res = await api.get('/payments/admin/all');
        setPayments(res.data.data.payments);
        setSummary(res.data.data.summary);
      } catch (error) {
        toast.error('Failed to load platform transactions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminPayments();
  }, []);

  const filteredPayments = payments.filter(p => 
    p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.booking?._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.passenger?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.porter?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Transactions & Revenue</h1>
        <button className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
          <Download size={18} className="mr-2" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Transaction Volume</p>
          <h3 className="text-3xl font-bold text-gray-900">₹{summary.totalCollected}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-[#0B192C]">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Platform Commission (15%)</p>
          <h3 className="text-3xl font-bold text-gray-900">₹{summary.totalCommission}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-[#38A169]">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Porter Payouts (85%)</p>
          <h3 className="text-3xl font-bold text-gray-900">₹{summary.totalPorterEarnings}</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-gray-800">All Transactions</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search ID, name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B192C] focus:border-transparent outline-none w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Transaction ID</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Users</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Platform Fee</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B192C] mx-auto"></div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((txn) => (
                  <tr key={txn._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-bold text-gray-900">{txn.transactionId}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Booking: #{txn.booking?._id.slice(-6).toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{txn.passenger?.name} (Pass)</div>
                      <div className="text-sm text-gray-500">{txn.porter?.name} (Port)</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">₹{txn.amount}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[#0B192C]">₹{txn.platformCommission}</div>
                      <div className="text-xs text-gray-500">Payout: ₹{txn.porterEarning}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <CreditCard size={12} className="mr-1" /> {txn.method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {txn.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center text-sm font-bold text-green-600">
                          <CheckCircle size={16} className="mr-1.5" /> PAID
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-sm font-bold text-red-600">
                          <XCircle size={16} className="mr-1.5" /> {txn.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
