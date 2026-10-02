import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../../utils/axios";
import { socketService } from "../../utils/socket";
import toast from 'react-hot-toast';

const SearchingPorter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

  useEffect(() => {
    // 1. Fetch booking details to ensure it exists and is REQUESTED
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${id}`);
        const data = res.data.data;
        if (data.status !== 'REQUESTED') {
          // If already accepted, expired, etc. navigate accordingly
          if (data.status === 'ACCEPTED') navigate(`/passenger/booking/${id}`);
          else navigate('/passenger/dashboard');
          return;
        }
        setBooking(data);
        
        // Calculate remaining time based on requestExpiresAt
        if (data.requestExpiresAt) {
          const remaining = Math.max(0, Math.floor((new Date(data.requestExpiresAt) - new Date()) / 1000));
          setTimeLeft(remaining);
        }
      } catch (error) {
        toast.error('Could not load booking details');
        navigate('/passenger/dashboard');
      }
    };

    fetchBooking();

    // 2. Setup socket listeners
    const socket = socketService.getSocket();
    if (!socket) {
      socketService.connect();
    }

    const currentSocket = socketService.getSocket();
    if (currentSocket) {
      // Join the booking room to get updates
      currentSocket.emit('join_booking', id);
      
      // Listen for acceptance
      currentSocket.on('booking:accepted', (updatedBooking) => {
        if (updatedBooking._id === id || updatedBooking.bookingId === id) {
          navigate(`/passenger/booking/${id}`);
        }
      });
      
      // Listen for status updates
      currentSocket.on('booking:status-updated', (data) => {
         if (data.bookingId === id && data.status === 'ACCEPTED') {
            navigate(`/passenger/booking/${id}`);
         }
      });
    }

    return () => {
      if (currentSocket) {
        currentSocket.off('booking:accepted');
        currentSocket.off('booking:status-updated');
      }
    };
  }, [id, navigate]);

  // 3. Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      // Handle expiration
      toast.error('No porter accepted the request.');
      navigate('/passenger/dashboard');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  const handleCancel = async () => {
    try {
      await api.patch(`/bookings/${id}/cancel`, { reason: 'Cancelled by passenger while searching' });
      toast.success('Request cancelled');
      navigate('/passenger/dashboard');
    } catch (error) {
      toast.error('Error cancelling request');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!booking) {
    return <div className="p-12 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-[#0B192C] text-white p-6 text-center">
        <h2 className="text-xl font-bold mb-1">Finding Your Porter</h2>
        <p className="text-gray-300 text-sm">Please wait while we match you with a porter</p>
      </div>

      <div className="p-8 text-center border-b border-gray-100">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
          <span className="text-3xl">🔎</span>
        </div>
        
        <p className="text-gray-600 mb-6 font-medium">
          Searching for an available porter near <span className="text-gray-900 font-bold">{booking.platform?.name || 'Platform'}</span>...
        </p>
        
        <div className="flex justify-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      <div className="p-6 bg-gray-50 grid grid-cols-2 gap-4 text-sm text-left">
        <div>
          <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Station</span>
          <span className="font-medium text-gray-900">{booking.station?.name}</span>
        </div>
        <div>
          <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Pickup</span>
          <span className="font-medium text-gray-900">{booking.pickupPoint?.name}</span>
        </div>
        <div className="col-span-2">
          <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Luggage</span>
          <span className="font-medium text-gray-900">{booking.luggageDetails?.count} {booking.luggageDetails?.type}(s)</span>
        </div>
      </div>

      <div className="p-6 text-center border-t border-gray-100">
        <div className="text-gray-500 text-sm mb-1">Request expires in</div>
        <div className="text-3xl font-bold text-[#E53E3E] mb-6 font-mono">
          {formatTime(timeLeft)}
        </div>

        <button 
          onClick={handleCancel}
          className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
        >
          CANCEL REQUEST
        </button>
      </div>
    </div>
  );
};

export default SearchingPorter;
