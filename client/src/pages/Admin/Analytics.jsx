import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, RefreshCw, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

import AnalyticsCard from '../../components/analytics/AnalyticsCard';
import BookingChart from '../../components/analytics/BookingChart';
import RevenueChart from '../../components/analytics/RevenueChart';
import StatusChart from '../../components/analytics/StatusChart';
import AnalyticsTable from '../../components/analytics/AnalyticsTable';
import DateRangePicker from '../../components/analytics/DateRangePicker';

const Analytics = () => {
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    toDate: new Date().toISOString()
  });
  const [dateLabel, setDateLabel] = useState('Last 7 Days');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [overview, setOverview] = useState(null);
  const [bookingTrend, setBookingTrend] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [paymentDist, setPaymentDist] = useState([]);
  const [stationStats, setStationStats] = useState([]);
  const [porterStats, setPorterStats] = useState([]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { fromDate: dateRange.fromDate, toDate: dateRange.toDate };

      const [overviewRes, bookingsRes, revenueRes, paymentsRes, stationsRes, portersRes] = await Promise.all([
        axios.get('/api/analytics/admin/overview', { params }),
        axios.get('/api/analytics/admin/bookings', { params }),
        axios.get('/api/analytics/admin/revenue', { params }),
        axios.get('/api/analytics/admin/payments', { params }),
        axios.get('/api/analytics/admin/stations', { params }),
        axios.get('/api/analytics/admin/porters', { params })
      ]);

      setOverview(overviewRes.data.data);
      setBookingTrend(bookingsRes.data.data.trend);
      setStatusDist(bookingsRes.data.data.statusDistribution);
      setRevenueTrend(revenueRes.data.data);
      setPaymentDist(paymentsRes.data.data);
      setStationStats(stationsRes.data.data);
      setPorterStats(portersRes.data.data);

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Unable to load analytics. Please try again.');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const handleApplyDateRange = (fromDate, toDate, label) => {
    setDateRange({ fromDate, toDate });
    setDateLabel(label);
  };

  const handleExport = async (type) => {
    try {
      const response = await axios.get(`/api/analytics/admin/export/${type}`, {
        params: { fromDate: dateRange.fromDate, toDate: dateRange.toDate },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success(`${type} report exported successfully`);
    } catch (err) {
      console.error(`Export ${type} error:`, err);
      toast.error(`Failed to export ${type} report`);
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-red-100">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchAnalytics} className="flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw size={18} className="mr-2" /> Retry
        </button>
      </div>
    );
  }

  const stationCols = [
    { header: 'Station', accessor: 'stationName', className: 'font-semibold' },
    { header: 'City', accessor: 'city' },
    { header: 'Bookings', accessor: 'bookings' },
    { header: 'Completed', accessor: 'completed', cellClassName: 'text-green-600' },
    { header: 'Cancelled', accessor: 'cancelled', cellClassName: 'text-red-600' },
    { header: 'Revenue', accessor: 'revenue', render: (row) => `₹${row.revenue?.toLocaleString() || 0}` }
  ];

  const porterCols = [
    { header: 'Porter Name', accessor: 'name', className: 'font-semibold' },
    { header: 'Completed', accessor: 'completed', cellClassName: 'text-green-600' },
    { header: 'Cancelled', accessor: 'cancelled', cellClassName: 'text-red-600' },
    { header: 'Rating', accessor: 'rating', render: (row) => row.rating ? `${row.rating} ⭐` : 'N/A' },
    { header: 'Earnings', accessor: 'earnings', render: (row) => `₹${row.earnings?.toLocaleString() || 0}` }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-sm text-gray-500">Platform performance & business intelligence</p>
        </div>
        <div className="flex items-center space-x-3">
          <DateRangePicker onApply={handleApplyDateRange} />
          
          <div className="relative group">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download size={18} className="mr-2 text-gray-500" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block border border-gray-200">
              <button onClick={() => handleExport('bookings')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Bookings Report (CSV)</button>
              <button onClick={() => handleExport('revenue')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Revenue Report (CSV)</button>
              <button onClick={() => handleExport('stations')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Stations Report (CSV)</button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard 
          title="Total Bookings" 
          value={overview?.bookings?.total || 0} 
          subtitle={`${overview?.bookings?.completed || 0} completed`}
          icon={Activity}
          colorClass="bg-blue-50 border-blue-100"
          textColor="text-blue-900"
        />
        <AnalyticsCard 
          title="Gross Revenue" 
          value={`₹${overview?.revenue?.totalRevenue?.toLocaleString() || 0}`} 
          subtitle={`Platform Comm: ₹${overview?.revenue?.platformCommission?.toLocaleString() || 0}`}
          icon={DollarSign}
          colorClass="bg-green-50 border-green-100"
          textColor="text-green-900"
        />
        <AnalyticsCard 
          title="Porter Earnings" 
          value={`₹${overview?.revenue?.porterEarnings?.toLocaleString() || 0}`} 
          icon={TrendingUp}
          colorClass="bg-purple-50 border-purple-100"
          textColor="text-purple-900"
        />
        <AnalyticsCard 
          title="Active Porters" 
          value={overview?.porters?.verified || 0} 
          subtitle={`${overview?.passengers?.total || 0} Total Passengers`}
          icon={Users}
          colorClass="bg-orange-50 border-orange-100"
          textColor="text-orange-900"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Booking Trend</h3>
          <BookingChart data={bookingTrend} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend</h3>
          <RevenueChart data={revenueTrend} />
        </div>
      </div>

      {/* Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Booking Status Distribution</h3>
          <StatusChart data={statusDist} type="booking" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Success Rate</h3>
          <StatusChart data={paymentDist} type="payment" />
        </div>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Station Performance</h3>
          <AnalyticsTable columns={stationCols} data={stationStats} itemsPerPage={5} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Porters by Completion</h3>
          <AnalyticsTable columns={porterCols} data={porterStats} itemsPerPage={5} />
        </div>
      </div>

    </div>
  );
};

export default Analytics;
