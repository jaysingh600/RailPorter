import React, { useEffect, useState } from 'react';
import { Users, UserCheck, Ticket, AlertCircle, TrendingUp, CheckCircle, Clock, XCircle, IndianRupee } from 'lucide-react';
import api from '../../utils/axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/overview');
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to load stats');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!stats) {
    return <div className="text-center py-20">Failed to load statistics</div>;
  }

  const cards = [
    { title: 'Total Users', value: stats.users.total, sub: `${stats.users.passengers} Passengers`, icon: Users, color: 'bg-blue-500' },
    { title: 'Porters', value: stats.porters.verified, sub: `${stats.porters.pending} Pending | ${stats.porters.suspended} Suspended`, icon: UserCheck, color: 'bg-[#38A169]' },
    { title: 'Active Bookings', value: stats.bookings.active, sub: 'In progress', icon: Clock, color: 'bg-orange-500' },
    { title: 'Completed', value: stats.bookings.completed, sub: 'Successfully finished', icon: CheckCircle, color: 'bg-indigo-500' },
    { title: 'Cancelled', value: stats.bookings.cancelled, sub: 'Did not complete', icon: XCircle, color: 'bg-gray-500' },
    { title: 'Total Revenue', value: `₹${stats.payments.totalRevenue.toLocaleString()}`, sub: `Commission: ₹${stats.payments.platformCommission.toLocaleString()}`, icon: IndianRupee, color: 'bg-emerald-500' },
    { title: 'Open Complaints', value: stats.complaints.open, sub: 'Requires attention', icon: AlertCircle, color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Operational Dashboard</h2>
        <button className="text-sm bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors font-medium">
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
              <div className={`absolute right-0 top-0 w-32 h-32 rounded-full -mr-12 -mt-12 opacity-10 transition-transform group-hover:scale-150 ${card.color}`}></div>
              <div className="flex items-start">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mr-4 shadow-sm ${card.color}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-2 font-medium">{card.sub}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default Dashboard;
