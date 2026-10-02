import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Star, Activity, DollarSign } from 'lucide-react';
import AnalyticsCard from '../../components/analytics/AnalyticsCard';
import BookingChart from '../../components/analytics/BookingChart';
import toast from 'react-hot-toast';

const PorterAnalyticsDetail = () => {
  const { porterId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPorterData = async () => {
      try {
        const res = await axios.get(`/api/analytics/admin/porters/${porterId}`);
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching porter analytics', err);
        setError('Failed to load data for this porter');
        toast.error('Error loading porter details');
      } finally {
        setLoading(false);
      }
    };
    fetchPorterData();
  }, [porterId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-red-100">
        <p className="text-red-500 mb-4">{error || 'No data found'}</p>
        <Link to="/admin/analytics" className="text-blue-600 hover:underline">Back to Analytics</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/admin/analytics" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-200">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.name}'s Performance</h1>
          <p className="text-sm text-gray-500">{data.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard 
          title="Completed Bookings" 
          value={data.completed || 0} 
          icon={Activity}
          colorClass="bg-green-50 border-green-100"
          textColor="text-green-900"
        />
        <AnalyticsCard 
          title="Cancelled Bookings" 
          value={data.cancelled || 0} 
          icon={Activity}
          colorClass="bg-red-50 border-red-100"
          textColor="text-red-900"
        />
        <AnalyticsCard 
          title="Total Earnings" 
          value={`₹${data.earnings?.toLocaleString() || 0}`} 
          icon={DollarSign}
          colorClass="bg-blue-50 border-blue-100"
          textColor="text-blue-900"
        />
        <AnalyticsCard 
          title="Average Rating" 
          value={data.rating ? `${data.rating} ⭐` : 'N/A'} 
          icon={Star}
          colorClass="bg-yellow-50 border-yellow-100"
          textColor="text-yellow-900"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Booking Trend (All Time)</h3>
        <BookingChart data={data.trend} />
      </div>
    </div>
  );
};

export default PorterAnalyticsDetail;
