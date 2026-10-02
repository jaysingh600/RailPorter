import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const EarningsTab = () => {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    todayEarnings: 0,
    weekEarnings: 0,
    monthEarnings: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentRes, analyticsRes] = await Promise.all([
          api.get('/payments/porter/earnings'),
          api.get('/analytics/porter/me')
        ]);
        
        setStats(paymentRes.data.data.stats);
        setTransactions(paymentRes.data.data.transactions);
        
        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.data);
        }
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B192C]"></div></div>;
  }

  // Format trend data for Recharts
  const chartData = analytics?.trend?.map(item => ({
    name: item._id, // Assuming _id is YYYY-MM-DD
    bookings: item.completed
  })) || [];

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-bold text-[#0B192C]">My Earnings</h2>

      <div className="bg-gradient-to-r from-[#0B192C] to-[#1A365D] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-gray-300 text-sm mb-1">Total Balance</p>
            <h3 className="text-4xl font-bold">₹{stats.totalEarnings}</h3>
          </div>
          <div className="bg-white/20 p-2 rounded-lg">
            <Wallet size={24} className="text-green-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
          <div>
            <p className="text-gray-300 text-xs">Today</p>
            <p className="font-bold text-lg">₹{stats.todayEarnings}</p>
          </div>
          <div>
            <p className="text-gray-300 text-xs">This Week</p>
            <p className="font-bold text-lg">₹{stats.weekEarnings}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-green-100 p-2 rounded-full mr-3 text-green-600"><CheckCircle size={20}/></div>
          <div>
            <p className="text-xs text-gray-500">Completed</p>
            <p className="font-bold text-lg">{analytics?.overview?.completed || 0} Jobs</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600"><TrendingUp size={20}/></div>
          <div>
            <p className="text-xs text-gray-500">Avg Rating</p>
            <p className="font-bold text-lg">
              {analytics?.overview?.rating ? `${analytics.overview.rating} ⭐` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-6">Completed Bookings Trend</h3>
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} allowDecimals={false} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar name="Completed Bookings" dataKey="bookings" fill="#0B192C" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">No trend data available</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Recent Transactions</h3>
        </div>
        
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock size={32} className="mx-auto mb-2 text-gray-300" />
            <p>No recent earnings found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map(txn => (
              <div key={txn._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gray-900 text-sm">#{txn.booking?._id.slice(-6).toUpperCase()}</span>
                  <span className="font-bold text-[#38A169]">₹{txn.porterEarning}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(txn.createdAt).toLocaleDateString()}</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                    Platform Fee: ₹{txn.platformCommission}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsTab;
