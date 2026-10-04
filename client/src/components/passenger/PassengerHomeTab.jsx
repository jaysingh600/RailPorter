import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Navigation, ArrowRight, ShieldCheck, HelpCircle, Clock } from 'lucide-react';
import api from '../../utils/axios';

const PassengerHomeTab = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState({ activeBooking: null, recentBookings: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/passenger/dashboard');
        setData(res.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;
  }

  const { activeBooking, recentBookings } = data;

  return (
    <div className="space-y-6">
      
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Ready for your next journey?</p>
      </div>

      {/* Active Booking Card (High Priority) */}
      {activeBooking ? (
        <div className="bg-red-600 text-white rounded-2xl shadow-lg shadow-red-200 overflow-hidden relative">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-10 rounded-full -ml-8 -mb-8"></div>
          
          <div className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-red-500/50 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm border border-red-400">Active Booking</span>
              <div className="text-right">
                <span className="font-mono text-sm opacity-80 block">#{activeBooking._id.slice(-6).toUpperCase()}</span>
                {activeBooking.otp && ['REQUESTED', 'ACCEPTED', 'REACHED_PLATFORM'].includes(activeBooking.status) && (
                  <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded mt-1 inline-block">OTP: {activeBooking.otp}</span>
                )}
              </div>
            </div>

            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-white rounded-full p-1 mr-4 border-2 border-red-300">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${activeBooking.porter?.name || 'P'}`} alt="Porter" className="w-full h-full rounded-full" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{activeBooking.porter?.name || 'Assigning Porter...'}</h3>
                {activeBooking.porter?.phone && (
                  <p className="text-sm font-medium mt-1">📞 {activeBooking.porter.phone}</p>
                )}
                <p className="text-red-100 text-sm flex items-center mt-1">
                  {activeBooking.status.replace('_', ' ')}
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full ml-2 animate-pulse"></span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 bg-black/10 rounded-xl p-4">
              <div>
                <p className="text-red-200 text-xs mb-1 flex items-center"><Navigation size={12} className="mr-1"/> Platform</p>
                <p className="font-bold">{activeBooking.platform}</p>
              </div>
              <div>
                <p className="text-red-200 text-xs mb-1 flex items-center"><MapPin size={12} className="mr-1"/> Pickup</p>
                <p className="font-bold">{activeBooking.pickupPoint}</p>
              </div>
            </div>

            <button onClick={() => navigate(`/passenger/tracking/${activeBooking._id}`)} className="w-full bg-white text-red-600 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-red-50 transition-colors">
              Track Booking <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty State Active Booking - CTA to book */
        <div className="bg-gradient-to-br from-[#0B192C] to-[#1A365D] text-white rounded-2xl shadow-md overflow-hidden relative p-6">
           <h2 className="text-xl font-bold mb-2">Need a Porter?</h2>
           <p className="text-gray-300 text-sm mb-6 max-w-xs">Find verified porters at your station and travel luggage-free.</p>
           <button onClick={() => navigate('/passenger/find-porter')} className="bg-[#38A169] hover:bg-green-600 text-white py-3 px-6 rounded-xl font-bold flex items-center transition-colors">
             Find a Porter Now <Search size={18} className="ml-2" />
           </button>
        </div>
      )}

      {/* Quick Actions Grid */}
      <h3 className="font-bold text-gray-900 mt-8 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-3">
        <Link to="/passenger/find-porter" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-2 text-red-600">
            <Search size={24} />
          </div>
          <span className="text-xs font-bold text-gray-700">Book</span>
        </Link>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2 text-green-600">
            <ShieldCheck size={24} />
          </div>
          <span className="text-xs font-bold text-gray-700">Safety</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-2 text-orange-600">
            <HelpCircle size={24} />
          </div>
          <span className="text-xs font-bold text-gray-700">Help</span>
        </div>
      </div>

      {/* Recent Bookings */}
      {recentBookings && recentBookings.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div key={booking._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 mr-4">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{booking.platform} to {booking.dropLocation}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-[#38A169] text-sm">₹{booking.fare?.estimatedTotal}</span>
                  <span className={`text-[10px] font-bold uppercase ${booking.status === 'COMPLETED' ? 'text-green-500' : 'text-gray-400'}`}>
                    {booking.status === 'COMPLETED' ? 'Done' : booking.status.slice(0,6)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default PassengerHomeTab;
