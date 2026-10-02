import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, Briefcase, IndianRupee, ShieldCheck, Phone } from 'lucide-react';
import api from '../../utils/axios';

const BookingConfirmation = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${id}`);
        setBooking(res.data.data);
      } catch(err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B192C]"></div>
      </div>
    );
  }

  if (!booking) {
    return <div className="text-center py-12">Booking not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
        <CheckCircle2 size={40} className="text-[#38A169]" />
      </div>
      
      <h1 className="text-3xl font-bold text-[#0B192C] mb-2">Porter Found ✓</h1>
      <p className="text-gray-500 mb-8">
        Your booking <span className="font-mono bg-gray-100 px-2 py-1 rounded">#{booking?._id.slice(-6).toUpperCase()}</span> has been confirmed.
      </p>

      {/* Porter Details Card */}
      {booking.porter && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left mb-6 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
              <img 
                src={booking.porter.profileImage && booking.porter.profileImage !== 'default.jpg' ? booking.porter.profileImage : `https://api.dicebear.com/7.x/initials/svg?seed=${booking.porter.name}`} 
                alt={booking.porter.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900">{booking.porter.name}</h3>
              <div className="flex items-center text-[#38A169] text-sm font-medium">
                <ShieldCheck size={16} className="mr-1" />
                Verified Porter
              </div>
            </div>
          </div>
          <a href={`tel:${booking.porter.phone}`} className="bg-blue-50 text-blue-600 p-3 rounded-full hover:bg-blue-100 transition-colors">
            <Phone size={24} />
          </a>
        </div>
      )}

      {/* Booking Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left mb-8">
        <div className="bg-[#0B192C] px-6 py-4 flex justify-between items-center text-white">
          <div className="font-medium">Booking Details</div>
          <div className="bg-[#38A169] text-white text-xs font-bold px-2 py-1 rounded uppercase">
            {booking?.status.replace('_', ' ')}
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <MapPin className="text-gray-400 mr-3 mt-1 shrink-0" size={20} />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium text-gray-900">Platform {booking?.platform?.name}</p>
              <p className="text-sm text-gray-600">{booking?.pickupPoint?.name}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Briefcase className="text-gray-400 mr-3 mt-1 shrink-0" size={20} />
            <div>
              <p className="text-sm text-gray-500">Luggage</p>
              <p className="font-medium text-gray-900">{booking?.luggageDetails?.count}x {booking?.luggageDetails?.type}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <IndianRupee className="text-gray-400 mr-3 mt-1 shrink-0" size={20} />
            <div>
              <p className="text-sm text-gray-500">Estimated Fare</p>
              <p className="font-bold text-[#38A169] text-lg">₹{booking?.fare?.estimatedTotal}</p>
            </div>
          </div>

          <div className="flex items-start">
            <Clock className="text-gray-400 mr-3 mt-1 shrink-0" size={20} />
            <div>
              <p className="text-sm text-gray-500">Train</p>
              <p className="font-medium text-gray-900">{booking?.trainNumber || 'N/A'}</p>
              {booking?.coachNumber && <p className="text-sm text-gray-600">Coach {booking.coachNumber}, Seat {booking.seatNumber}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to={`/passenger/booking/${id}/tracking`} className="w-full bg-[#E53E3E] text-white py-3 px-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors">
          TRACK PORTER
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmation;
