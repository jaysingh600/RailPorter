import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, Luggage } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const FindPorter = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedFare, setEstimatedFare] = useState(120); // Dummy fare for UI
  const [availablePortersCount, setAvailablePortersCount] = useState(null);

  // Dynamic Location State
  const [stations, setStations] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  
  // Form State
  const [searchParams, setSearchParams] = useState({
    station: '',
    platform: '',
    pickup: '',
    trainNumber: '',
    trainName: '',
    coachNumber: '',
    seatNumber: '',
    bags: '1',
    type: 'Suitcase',
    instructions: ''
  });

  // Load initial stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await api.get('/stations');
        setStations(res.data.data);
      } catch (error) {
        toast.error('Failed to load stations');
      }
    };
    fetchStations();
  }, []);

  // When station changes, load its platforms
  useEffect(() => {
    if (searchParams.station) {
      const fetchPlatforms = async () => {
        try {
          const res = await api.get(`/stations/${searchParams.station}/platforms`);
          setPlatforms(res.data.data);
          setSearchParams(prev => ({...prev, platform: '', pickup: ''})); // Reset downstream
          setPickupPoints([]);
        } catch (error) {
          toast.error('Failed to load platforms');
        }
      };
      fetchPlatforms();
    } else {
      setPlatforms([]);
      setPickupPoints([]);
    }
  }, [searchParams.station]);

  // When platform changes, load its pickup points
  useEffect(() => {
    if (searchParams.platform) {
      const fetchPickups = async () => {
        try {
          const res = await api.get(`/platforms/${searchParams.platform}/pickup-points`);
          setPickupPoints(res.data.data);
          setSearchParams(prev => ({...prev, pickup: ''})); // Reset downstream
        } catch (error) {
          toast.error('Failed to load pickup points');
        }
      };
      fetchPickups();
    } else {
      setPickupPoints([]);
    }
  }, [searchParams.platform]);

  // Check available porters when station & platform are selected
  useEffect(() => {
    if (searchParams.station && searchParams.platform) {
      const fetchAvailablePorters = async () => {
        try {
          const res = await api.get(`/porters/available?stationId=${searchParams.station}&platformId=${searchParams.platform}`);
          setAvailablePortersCount(res.data.count);
        } catch (error) {
          console.error('Failed to fetch available porters');
          setAvailablePortersCount(0);
        }
      };
      fetchAvailablePorters();
    } else {
      setAvailablePortersCount(null);
    }
  }, [searchParams.station, searchParams.platform]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchParams.station || !searchParams.platform || !searchParams.pickup) {
      toast.error('Please select Station, Platform, and Pickup Point');
      return;
    }

    setIsLoading(true);
    try {
      const luggageCount = parseInt(searchParams.bags, 10) || 1;
      
      const payload = {
        station: searchParams.station,
        platform: searchParams.platform,
        pickupPoint: searchParams.pickup,
        dropLocation: 'Exit / Another Platform',
        trainNumber: searchParams.trainNumber,
        trainName: searchParams.trainName,
        coachNumber: searchParams.coachNumber,
        seatNumber: searchParams.seatNumber,
        luggageDetails: {
          count: luggageCount,
          type: searchParams.type,
          instructions: searchParams.instructions
        }
      };

      const res = await api.post('/bookings', payload);
      const bookingId = res.data.data._id;
      
      // Redirect to the searching screen
      navigate(`/passenger/booking/${bookingId}/searching`);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error(error.response.data.message || 'You already have an active request.');
      } else if (error.response && error.response.status === 404) {
        toast.error(error.response.data.message || 'No porter available.');
      } else {
        toast.error('Error creating booking request');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-32 pb-16 px-4 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-display font-bold text-brand-navy mb-3">Book a Railway Porter</h1>
        <p className="text-text-gray text-lg font-light">Fast, secure, and reliable porter matching.</p>
      </div>
      
      <div className="card border-0 p-8 md:p-10">
        <form onSubmit={handleSearch} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">1. Journey Details</h3>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Station *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select 
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none appearance-none bg-gray-50"
                  value={searchParams.station}
                  onChange={(e) => setSearchParams({...searchParams, station: e.target.value})}
                  required
                >
                  <option value="">Select Station</option>
                  {stations.map(st => <option key={st._id} value={st._id}>{st.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Train Number (Optional)</label>
              <input 
                type="text"
                placeholder="e.g. 12345"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none bg-gray-50"
                value={searchParams.trainNumber}
                onChange={(e) => setSearchParams({...searchParams, trainNumber: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Train Name (Optional)</label>
              <input 
                type="text"
                placeholder="e.g. Rajdhani Exp"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none bg-gray-50"
                value={searchParams.trainName}
                onChange={(e) => setSearchParams({...searchParams, trainName: e.target.value})}
              />
            </div>

            <div className="md:col-span-2 mt-2">
              <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">2. Pickup Details</h3>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Platform *</label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select 
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none appearance-none bg-gray-50 disabled:opacity-50"
                  value={searchParams.platform}
                  onChange={(e) => setSearchParams({...searchParams, platform: e.target.value})}
                  disabled={!searchParams.station}
                  required
                >
                  <option value="">Select Platform</option>
                  {platforms.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pickup Point *</label>
              <select 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none appearance-none bg-gray-50 disabled:opacity-50"
                value={searchParams.pickup}
                onChange={(e) => setSearchParams({...searchParams, pickup: e.target.value})}
                disabled={!searchParams.platform}
                required
              >
                <option value="">Select Pickup</option>
                {pickupPoints.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Coach Number (Optional)</label>
              <input 
                type="text"
                placeholder="e.g. S5"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none bg-gray-50"
                value={searchParams.coachNumber}
                onChange={(e) => setSearchParams({...searchParams, coachNumber: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Seat Number (Optional)</label>
              <input 
                type="text"
                placeholder="e.g. 42"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none bg-gray-50"
                value={searchParams.seatNumber}
                onChange={(e) => setSearchParams({...searchParams, seatNumber: e.target.value})}
              />
            </div>

            <div className="md:col-span-2 mt-2">
              <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">3. Luggage Details</h3>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Number of Bags</label>
              <input 
                type="number"
                min="1"
                max="20"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none bg-gray-50"
                value={searchParams.bags}
                onChange={(e) => {
                  setSearchParams({...searchParams, bags: e.target.value});
                  setEstimatedFare(100 + (parseInt(e.target.value || 1) * 20));
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
              <select 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none appearance-none bg-gray-50"
                value={searchParams.type}
                onChange={(e) => setSearchParams({...searchParams, type: e.target.value})}
              >
                <option value="Suitcase">Suitcase</option>
                <option value="Bag">Bag</option>
                <option value="Box">Box</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Instructions</label>
              <input 
                type="text"
                placeholder="e.g. Please meet me near the main staircase."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none bg-gray-50"
                value={searchParams.instructions}
                onChange={(e) => setSearchParams({...searchParams, instructions: e.target.value})}
              />
            </div>
          </div>
          
          {availablePortersCount !== null && (
            <div className={`mt-6 p-4 rounded-xl border flex items-center animate-fade-in ${availablePortersCount > 0 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <div className={`w-3 h-3 rounded-full mr-3 ${availablePortersCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="font-medium text-base">
                {availablePortersCount > 0 
                  ? `${availablePortersCount} Porter${availablePortersCount > 1 ? 's' : ''} available near this platform!` 
                  : 'No porters currently available at this platform. You can still request, but it may take longer.'}
              </span>
            </div>
          )}

          <div className="mt-10 border-t pt-8 bg-surface-light -mx-8 md:-mx-10 px-8 md:px-10 pb-4 rounded-b-xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600 font-semibold text-lg">Estimated Fare</span>
              <span className="text-3xl font-bold text-brand-navy">₹{estimatedFare}</span>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full btn-danger h-14 text-lg font-bold flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <Search size={24} className="mr-2" />
                  FIND PORTER
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FindPorter;
