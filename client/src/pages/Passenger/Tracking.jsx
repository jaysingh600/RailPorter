import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { socketService } from '../../utils/socket';
import LiveMap from '../../components/map/LiveMap';
import { MapPin, Navigation, Luggage, Phone, MessageSquare, Clock } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { calculateDistance, formatDistance } from '../../utils/distance';
import SOSButton from '../../components/safety/SOSButton';

const STATUS_FLOW = [
  'REQUESTED',
  'ACCEPTED',
  'REACHED_PLATFORM',
  'LUGGAGE_PICKED',
  'IN_TRANSIT',
  'COMPLETED'
];

const Tracking = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Realtime state
  const [liveStatus, setLiveStatus] = useState('');
  const [porterLocation, setPorterLocation] = useState(null);
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [now, setNow] = useState(new Date());
  
  const [activeEmergency, setActiveEmergency] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${id}`);
        setBooking(res.data.data);
        setLiveStatus(res.data.data.status);
        
        // Check for active emergencies
        const emRes = await api.get(`/bookings/${id}/emergencies`);
        const openSOS = emRes.data.data.find(e => e.status !== 'RESOLVED' && e.status !== 'CLOSED');
        if (openSOS) {
          setActiveEmergency(openSOS);
        }
      } catch (err) {
        toast.error('Failed to load tracking data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPassengerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        (err) => console.log('Passenger denied location')
      );
    }
    
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [id]);

  useEffect(() => {
    const socket = socketService.connect();
    
    // Handlers
    const handleStatusChange = (data) => {
      setLiveStatus(data.status);
      toast.success(`Booking status updated to ${data.status.replace('_', ' ')}`);
    };

    const handleLocationChange = (data) => {
      setPorterLocation(data);
    };

    const handleSOS = (data) => {
      if (data.booking._id === booking._id || data.booking === booking._id) {
        setActiveEmergency(data);
      }
    };

    const handleAck = () => {
      setActiveEmergency(prev => prev ? { ...prev, status: 'ACKNOWLEDGED' } : prev);
    };

    const handleResolved = () => {
      setActiveEmergency(null);
    };

    if (booking) {
      socketService.joinBookingRoom(booking._id);
      
      socketService.on('booking_status_changed', handleStatusChange);
      socketService.on('porter_location_changed', handleLocationChange);
      socketService.on('emergency:sos', handleSOS);
      socketService.on('emergency:acknowledged', handleAck);
      socketService.on('emergency:resolved', handleResolved);
    }

    return () => {
      if (booking) {
        socketService.off('booking_status_changed', handleStatusChange);
        socketService.off('porter_location_changed', handleLocationChange);
        socketService.off('emergency:sos', handleSOS);
        socketService.off('emergency:acknowledged', handleAck);
        socketService.off('emergency:resolved', handleResolved);
      }
    };
  }, [booking]);

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div></div>;
  if (!booking) return <div className="text-center py-20">Booking not found.</div>;

  const currentStepIndex = STATUS_FLOW.indexOf(liveStatus);
  const isCancelled = liveStatus === 'CANCELLED';
  const isCompleted = liveStatus === 'COMPLETED';

  // Distance calculations
  const distanceMeters = calculateDistance(
    passengerLocation?.lat, passengerLocation?.lng,
    porterLocation?.lat, porterLocation?.lng
  );
  const formattedDistance = formatDistance(distanceMeters);

  let staleness = '';
  let isStale = false;
  if (porterLocation?.timestamp) {
    const secondsAgo = Math.floor((now - new Date(porterLocation.timestamp)) / 1000);
    if (secondsAgo < 60) staleness = `${secondsAgo} seconds ago`;
    else staleness = `${Math.floor(secondsAgo/60)} mins ago`;
    if (secondsAgo > 30) isStale = true;
  }

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      {/* Mobile-first layout: Map -> Porter Card -> Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Map & Info */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <span className="font-bold text-gray-800">
                {isCompleted ? 'Service Completed' : isCancelled ? 'Booking Cancelled' : 'Porter is on the way'}
              </span>
              <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                isCompleted ? 'bg-green-100 text-green-800' :
                isCancelled ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800 animate-pulse'
              }`}>
                {liveStatus.replace('_', ' ')}
              </span>
            </div>
            
            <LiveMap 
              passengerLocation={passengerLocation} 
              porterLocation={porterLocation} 
            />
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gray-200 rounded-full mr-4 overflow-hidden border-2 border-[#38A169]">
                   <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.porter?.name}`} alt="Porter" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{booking.porter?.name || 'Assigned Porter'}</h3>
                  <div className="text-xs text-[#38A169] font-medium flex items-center mt-0.5">
                    ✓ Verified Porter <span className="mx-1">•</span> ⭐ 4.7
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="bg-blue-50 text-blue-600 p-2 rounded-full hover:bg-blue-100 transition">
                  <MessageSquare size={20} />
                </button>
                <button className="bg-green-50 text-green-600 p-2 rounded-full hover:bg-green-100 transition">
                  <Phone size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Approximate Distance</p>
                <p className="font-bold text-gray-800">{formattedDistance}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className={`font-bold text-sm flex items-center ${isStale ? 'text-orange-500' : 'text-gray-800'}`}>
                   {isStale && <Clock size={14} className="mr-1" />}
                   {porterLocation ? staleness : 'Waiting for GPS...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status Timeline & Manual Info */}
        <div className="space-y-4">
          
          {/* Timeline */}
          <div className="bg-[#0B192C] text-white p-6 rounded-xl shadow-md">
            <h3 className="font-bold mb-6 text-lg tracking-wide">Booking Status</h3>
            <div className="space-y-5">
              {STATUS_FLOW.map((statusItem, idx) => {
                const isStepCompleted = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                if (isCancelled && idx > 0) return null; // Hide future steps if cancelled

                return (
                  <div key={statusItem} className="flex items-start relative">
                    {/* Vertical line connector */}
                    {idx < STATUS_FLOW.length - 1 && !isCancelled && (
                      <div className={`absolute left-3 top-7 bottom-[-20px] w-0.5 ${currentStepIndex > idx ? 'bg-[#38A169]' : 'bg-gray-600/50'}`}></div>
                    )}
                    
                    <div className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full mt-0.5 shrink-0 transition-colors duration-300">
                      {isCancelled ? (
                        <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-[#0B192C]"></div>
                      ) : isStepCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-[#38A169] flex items-center justify-center shadow-[0_0_10px_rgba(56,161,105,0.5)]">
                          <div className="w-2 h-2 bg-[#0B192C] rounded-full"></div>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#0B192C] border-2 border-gray-500"></div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <p className={`font-semibold transition-colors duration-300 ${isCurrent ? 'text-white text-base' : isStepCompleted ? 'text-gray-300 text-sm' : 'text-gray-500 text-sm'}`}>
                        {isCancelled ? 'CANCELLED' : statusItem.replace('_', ' ')}
                      </p>
                      {isCurrent && !isCancelled && !isCompleted && (
                        <p className="text-xs text-gray-400 mt-1 animate-pulse">Waiting for update...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {isCompleted && (
              <div className="mt-8 pt-4 border-t border-gray-700/50">
                <button className="w-full bg-[#38A169] text-white py-3 rounded-lg font-bold hover:bg-green-600 transition">
                  Proceed to Payment
                </button>
              </div>
            )}
          </div>
          
          {/* Target Location Info */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Target Details</h3>
            
            <div className="flex">
              <Navigation className="text-[#E53E3E] mr-3 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-gray-500">Platform</p>
                <p className="font-bold text-gray-800">{booking.platform?.name || booking.platform}</p>
              </div>
            </div>
            
            <div className="flex">
              <MapPin className="text-blue-500 mr-3 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-gray-500">Pickup Point</p>
                <p className="font-bold text-gray-800">{booking.pickupPoint?.name || booking.pickupPoint}</p>
              </div>
            </div>
            
            <div className="flex">
              <Luggage className="text-purple-500 mr-3 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-gray-500">Luggage</p>
                <p className="font-bold text-gray-800">{booking.luggageDetails.count}x {booking.luggageDetails.type}</p>
              </div>
            </div>
          </div>
          
          {/* Safety & Emergency */}
          {['ACCEPTED', 'REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT'].includes(liveStatus) && (
            <div className="pt-4 border-t border-gray-200">
              <SOSButton 
                bookingId={booking._id} 
                currentLocation={passengerLocation} 
                activeEmergency={activeEmergency} 
                onSOSCreated={(data) => setActiveEmergency(data)}
              />
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default Tracking;
