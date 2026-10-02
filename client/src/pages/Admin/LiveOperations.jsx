import React, { useEffect, useState } from 'react';
import { RefreshCcw, Search, Clock, MapPin, Briefcase } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const LiveOperations = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveBookings = async () => {
    try {
      const res = await api.get('/admin/bookings?active=true');
      setBookings(res.data.data);
    } catch (error) {
      toast.error('Failed to load active bookings');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveBookings();
    const interval = setInterval(fetchLiveBookings, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLiveBookings();
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'REQUESTED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REACHED_PLATFORM': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'LUGGAGE_PICKED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'IN_TRANSIT': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Operations</h2>
          <p className="text-sm text-gray-500 mt-1">Monitoring {bookings.length} active bookings in real-time.</p>
        </div>
        
        <button 
          onClick={handleRefresh}
          className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCcw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bookings.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm">
            <Clock className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-lg">No active operations at the moment.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full ${getStatusColor(booking.status).split(' ')[0]}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border uppercase ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-gray-400 mt-2 font-mono">ID: #{booking._id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Started</p>
                  <p className="text-sm font-bold text-gray-900">{new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Passenger</p>
                  <p className="text-sm font-bold text-gray-900">{booking.passenger?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-600">{booking.passenger?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Porter</p>
                  {booking.porter ? (
                    <>
                      <p className="text-sm font-bold text-gray-900">{booking.porter.name}</p>
                      <p className="text-xs text-gray-600">{booking.porter.phone}</p>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-orange-600 italic">Matching...</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 flex items-center space-x-4 border border-gray-100">
                <div className="flex items-center flex-1">
                  <MapPin size={16} className="text-gray-400 mr-2 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {booking.station?.name} - {booking.platform?.name}
                    </p>
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex items-center flex-1">
                  <Briefcase size={16} className="text-gray-400 mr-2 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Items</p>
                    <p className="text-sm font-semibold text-gray-900">{booking.luggageCount} Luggage</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveOperations;
