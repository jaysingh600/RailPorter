import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { socketService } from '../../utils/socket';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { MapPin, Navigation, CheckCircle, Navigation2, Clock } from 'lucide-react';
import { calculateDistance } from '../../utils/distance';
import SOSButton from '../safety/SOSButton';

const HomeTab = () => {
  const { user } = useContext(AuthContext);
  const [availability, setAvailability] = useState('OFFLINE');
  const [activeBooking, setActiveBooking] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [stats, setStats] = useState({ todaysJobs: 0, todayEarnings: 0, rating: 0 });
  const [watchId, setWatchId] = useState(null);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const requestsRef = useRef([]);

  // Keep ref in sync for socket callbacks
  useEffect(() => {
    requestsRef.current = incomingRequests;
  }, [incomingRequests]);

  useEffect(() => {
    fetchStats();
    
    // Fetch initial requests and active bookings (could be combined or separate API)
    // For now, if we reconnect, we might have an active booking
    const checkActiveBooking = async () => {
      try {
        const res = await api.get('/bookings/porter');
        const active = res.data.data.find(b => ['ACCEPTED', 'REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT'].includes(b.status));
        if (active) {
          setActiveBooking(active);
          startLocationTracking(active._id);
          
          // Check for active emergencies
          const emRes = await api.get(`/bookings/${active._id}/emergencies`);
          const openSOS = emRes.data.data.find(e => e.status !== 'RESOLVED' && e.status !== 'CLOSED');
          if (openSOS) setActiveEmergency(openSOS);
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkActiveBooking();

    // Socket Setup
    socketService.connect();
    const socket = socketService.getSocket();
    
    // Handlers
    const handleNewRequest = (booking) => {
      if (!requestsRef.current.find(r => r._id === booking._id)) {
        setIncomingRequests(prev => [...prev, booking]);
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(e => console.log('Audio autoplay blocked'));
        } catch(e) {}
      }
    };

    const handleRequestCancelled = (data) => {
      setIncomingRequests(prev => prev.filter(r => r._id !== data.bookingId));
    };

    const handleSOS = (data) => {
      if (activeBooking && (data.booking._id === activeBooking._id || data.booking === activeBooking._id)) {
        setActiveEmergency(data);
      }
    };

    const handleAck = () => setActiveEmergency(prev => prev ? { ...prev, status: 'ACKNOWLEDGED' } : prev);
    const handleResolved = () => setActiveEmergency(null);

    if (socket && user?._id) {
      socket.emit('join_user_room', { userId: user._id, role: 'porter' });
      
      socket.on('booking:new-request', handleNewRequest);
      socket.on('booking:request-cancelled', handleRequestCancelled);
      socket.on('emergency:sos', handleSOS);
      socket.on('emergency:acknowledged', handleAck);
      socket.on('emergency:resolved', handleResolved);
    }

    return () => {
      stopLocationTracking();
      if (socket) {
        socket.off('booking:new-request', handleNewRequest);
        socket.off('booking:request-cancelled', handleRequestCancelled);
        socket.off('emergency:sos', handleSOS);
        socket.off('emergency:acknowledged', handleAck);
        socket.off('emergency:resolved', handleResolved);
      }
    };
  }, [user, activeBooking]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/porter/stats');
      setStats(res.data.data);
      // We assume stats endpoint also returns availability if it was a real backend
    } catch (error) {
      // Mute error for boilerplate if no DB
    }
  };

  const handleAvailabilityChange = async (newStatus) => {
    if (activeBooking && newStatus !== 'BUSY') {
      toast.error('You have an active booking. Complete it first.');
      return;
    }
    
    try {
      await api.put('/porter/availability', { availabilityStatus: newStatus });
      setAvailability(newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const lastLocationRef = useRef({ lat: null, lng: null, time: 0 });

  const startLocationTracking = (bookingId) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const now = Date.now();
        const lastLoc = lastLocationRef.current;
        
        // Throttle logic: update if > 5 seconds OR distance > 10m
        let shouldUpdate = false;
        if (!lastLoc.lat || now - lastLoc.time > 5000) {
          shouldUpdate = true;
        } else {
          const distance = calculateDistance(lastLoc.lat, lastLoc.lng, latitude, longitude);
          if (distance > 10) shouldUpdate = true;
        }

        if (shouldUpdate) {
          lastLocationRef.current = { lat: latitude, lng: longitude, time: now };
          socketService.emit('porter_location_update', {
            bookingId,
            lat: latitude,
            lng: longitude,
            accuracy
          });
          
          // Fallback REST call (Optional but robust)
          api.patch(`/bookings/${bookingId}/location`, { latitude, longitude, accuracy }).catch(() => {});
        }
      },
      (err) => {
        console.log('Location error', err);
        if (err.code === 1) {
          toast.error('Location denied. Passenger cannot track you.');
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    setWatchId(id);
  };

  const stopLocationTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const acceptRequest = async (request) => {
    try {
      const res = await api.patch(`/bookings/${request._id}/accept`);
      setActiveBooking(res.data.data);
      setIncomingRequests([]); // Clear all other requests
      setAvailability('BUSY'); // Update local state
      
      socketService.joinBookingRoom(request._id);
      startLocationTracking(request._id);
      toast.success('Booking accepted! Location sharing ON.');
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(error.response.data.message || 'Another porter already accepted this booking.');
      } else {
        toast.error('Failed to accept request');
      }
      setIncomingRequests(prev => prev.filter(r => r._id !== request._id));
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await api.patch(`/bookings/${requestId}/reject`);
      setIncomingRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (error) {
      toast.error('Failed to decline request');
    }
  };

  const updateActiveStatus = async (newStatus) => {
    try {
      await api.put(`/bookings/${activeBooking._id}/status`, { status: newStatus });
      setActiveBooking({ ...activeBooking, status: newStatus });
      
      if (newStatus === 'COMPLETED') {
        stopLocationTracking();
        setActiveBooking(null);
        setAvailability('AVAILABLE');
        fetchStats();
        toast.success('Job Completed successfully!');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Countdown Timer Component
  const RequestCountdown = ({ expiresAt }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt) - new Date()) / 1000));
      setTimeLeft(remaining);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }, [expiresAt]);

    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    
    return (
      <div className="flex items-center text-sm font-bold text-[#E53E3E]">
        <Clock size={14} className="mr-1" />
        {m}:{s}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Toggle */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Hi, {user?.name?.split(' ')[0] || 'Porter'} 👋</h2>
          <div className="text-xs text-gray-500 flex items-center mt-1">
            <span className={`w-2 h-2 rounded-full mr-1 ${watchId ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></span>
            {watchId ? 'Location sharing active' : 'Location sharing off'}
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            disabled={activeBooking !== null}
            onClick={() => handleAvailabilityChange('OFFLINE')} 
            className={`px-3 py-1.5 rounded-md text-xs font-bold ${availability === 'OFFLINE' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'} disabled:opacity-50`}
          >
            OFF
          </button>
          <button 
            disabled={activeBooking !== null}
            onClick={() => handleAvailabilityChange('AVAILABLE')} 
            className={`px-3 py-1.5 rounded-md text-xs font-bold ${availability === 'AVAILABLE' ? 'bg-[#38A169] text-white shadow-sm' : 'text-gray-500'} disabled:opacity-50`}
          >
            ON
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-1">Today's Jobs</p>
          <p className="text-2xl font-bold text-[#0B192C]">{stats.todaysJobs}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-1">Earnings</p>
          <p className="text-2xl font-bold text-[#38A169]">₹{stats.todayEarnings}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-1">Rating</p>
          <p className="text-2xl font-bold text-yellow-500">{(stats?.rating || 0).toFixed(1)}</p>
        </div>
      </div>

      {/* Active Job (Sticky) */}
      {activeBooking && (
        <div className="bg-[#0B192C] rounded-2xl shadow-xl border-t-4 border-[#38A169] overflow-hidden sticky top-4 z-40">
          <div className="p-5 text-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase text-[#38A169] tracking-wider">Active Job</span>
              <span className="text-xl font-bold text-[#38A169]">₹{activeBooking.fare?.estimatedTotal}</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">{activeBooking.passenger?.name}</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm bg-white/10 p-3 rounded-lg">
              <div>
                <span className="text-gray-400 block text-xs">Platform</span>
                <span className="font-bold text-lg">{activeBooking.platform?.name}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Luggage</span>
                <span className="font-bold">{activeBooking.luggageDetails?.count}x {activeBooking.luggageDetails?.type}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 block text-xs">Pickup</span>
                <span className="font-medium">{activeBooking.pickupPoint?.name}</span>
              </div>
              {activeBooking.trainNumber && (
                <div className="col-span-2 border-t border-white/10 pt-2 mt-1">
                  <span className="text-gray-400 block text-xs">Train</span>
                  <span className="font-medium">{activeBooking.trainNumber} - Coach {activeBooking.coachNumber}, Seat {activeBooking.seatNumber}</span>
                </div>
              )}
            </div>

            {activeBooking.status === 'ACCEPTED' && (
              <button onClick={() => updateActiveStatus('REACHED_PLATFORM')} className="w-full py-4 bg-white text-[#0B192C] font-bold rounded-xl text-lg hover:bg-gray-100 shadow-md transition-colors">
                I'm at the Platform
              </button>
            )}
            {activeBooking.status === 'REACHED_PLATFORM' && (
              <button onClick={() => updateActiveStatus('LUGGAGE_PICKED')} className="w-full py-4 bg-yellow-500 text-yellow-900 font-bold rounded-xl text-lg hover:bg-yellow-400 shadow-md transition-colors">
                Luggage Picked Up
              </button>
            )}
            {activeBooking.status === 'LUGGAGE_PICKED' && (
              <button onClick={() => updateActiveStatus('IN_TRANSIT')} className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl text-lg hover:bg-blue-400 shadow-md transition-colors">
                In Transit to Drop
              </button>
            )}
            {activeBooking.status === 'IN_TRANSIT' && (
              <button onClick={() => updateActiveStatus('COMPLETED')} className="w-full py-4 bg-[#38A169] text-white font-bold rounded-xl text-lg flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors">
                <CheckCircle className="mr-2" /> Mark Completed
              </button>
            )}
            
            {['ACCEPTED', 'REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT'].includes(activeBooking.status) && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <SOSButton 
                  bookingId={activeBooking._id}
                  currentLocation={lastLocationRef.current.lat ? { lat: lastLocationRef.current.lat, lng: lastLocationRef.current.lng, accuracy: 10 } : null}
                  activeEmergency={activeEmergency}
                  onSOSCreated={setActiveEmergency}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Incoming Requests Feed */}
      {!activeBooking && availability === 'AVAILABLE' && (
        <div>
          <div className="bg-green-50 text-green-800 border border-green-200 rounded-xl p-4 mb-4 text-center text-sm font-medium">
            You're available for new booking requests.
          </div>
          
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-ping"></span> Incoming Requests
          </h3>
          
          {incomingRequests.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
              No new requests right now. Keep your app open.
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map(req => (
                <div key={req._id} className="bg-white rounded-xl shadow-lg border-2 border-blue-100 overflow-hidden transform transition-all hover:scale-[1.02]">
                  <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-lg text-gray-900 block">{req.passenger?.name}</span>
                      {req.requestExpiresAt && <RequestCountdown expiresAt={req.requestExpiresAt} />}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 block">Est. Fare</span>
                      <span className="text-xl font-bold text-[#38A169]">₹{req.fare?.estimatedTotal}</span>
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3 text-sm bg-white">
                    <div className="flex items-center text-gray-700 font-medium">
                      <Navigation2 size={16} className="mr-2 text-gray-400"/> Plat {req.platform?.name}
                    </div>
                    <div className="flex items-center text-gray-700 font-medium truncate">
                      <MapPin size={16} className="mr-2 text-gray-400 shrink-0"/> {req.pickupPoint?.name}
                    </div>
                    {req.trainNumber && (
                      <div className="col-span-2 text-xs text-gray-500 flex items-center bg-gray-50 p-2 rounded">
                        Train {req.trainNumber} • Coach {req.coachNumber || '-'} • Seat {req.seatNumber || '-'}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2">
                    <button onClick={() => rejectRequest(req._id)} className="py-4 bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 uppercase tracking-wider text-sm">Decline</button>
                    <button onClick={() => acceptRequest(req)} className="py-4 bg-[#0B192C] text-white font-bold hover:bg-[#1A365D] uppercase tracking-wider text-sm shadow-inner">Accept Request</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!activeBooking && availability !== 'AVAILABLE' && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          You're currently offline and won't receive new booking requests.
        </div>
      )}
    </div>
  );
};

export default HomeTab;
