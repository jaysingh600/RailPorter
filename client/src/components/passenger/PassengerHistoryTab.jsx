import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Search, Star, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';
import RatingModal from './RatingModal';
import ComplaintModal from './ComplaintModal';
import { AlertTriangle } from 'lucide-react';

const PassengerHistoryTab = () => {
  const [filter, setFilter] = useState('ALL');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingBooking, setRatingBooking] = useState(null);
  const [complaintBooking, setComplaintBooking] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/passenger/history');
      setHistory(res.data.data);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(booking => {
    if (filter === 'ALL') return true;
    return booking.status === filter;
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Booking History</h2>

      {/* Tabs */}
      <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
        {['ALL', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${filter === tab ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <Search size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No bookings found</h3>
          <p className="text-gray-500 text-sm">You have no {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((booking) => (
            <div key={booking._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${
                    booking.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                    booking.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                  <h3 className="font-bold text-gray-900">{new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">ID: #{booking._id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-lg text-gray-900">₹{booking.fare?.estimatedTotal}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Porter</p>
                  <p className="font-medium text-gray-800">{booking.porter?.name || 'Not assigned'}</p>
                </div>
                
                <div className="flex space-x-3">
                  {booking.status === 'COMPLETED' && booking.paymentStatus === 'UNPAID' && (
                    <Link 
                      to={`/passenger/payment/${booking._id}`}
                      className="text-green-600 font-bold flex items-center bg-green-50 px-3 py-1 rounded-full hover:bg-green-100 transition-colors"
                    >
                      <Banknote size={14} className="mr-1" /> Pay Now
                    </Link>
                  )}
                  {booking.status === 'COMPLETED' && (
                    <button 
                      onClick={() => setRatingBooking(booking)}
                      className="text-yellow-600 font-bold flex items-center bg-yellow-50 px-3 py-1 rounded-full hover:bg-yellow-100 transition-colors"
                    >
                      <Star size={14} className="mr-1 fill-current" /> Rate
                    </button>
                  )}
                  {booking.status === 'COMPLETED' && (
                    <button 
                      onClick={() => setComplaintBooking(booking)}
                      className="text-red-600 font-bold flex items-center bg-red-50 px-3 py-1 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <AlertTriangle size={14} className="mr-1" /> Complaint
                    </button>
                  )}
                  <button className="text-red-600 font-bold flex items-center hover:text-red-800 transition-colors">
                    Details <ArrowUpRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {ratingBooking && (
        <RatingModal 
          booking={ratingBooking} 
          onClose={() => setRatingBooking(null)} 
          onSuccess={() => {
            setRatingBooking(null);
            fetchHistory();
          }}
        />
      )}

      {complaintBooking && (
        <ComplaintModal 
          booking={complaintBooking} 
          onClose={() => setComplaintBooking(null)} 
          onSuccess={() => {
            setComplaintBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default PassengerHistoryTab;
