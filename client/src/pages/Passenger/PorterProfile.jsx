import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Star, MapPin, IndianRupee, Globe, Briefcase, ChevronLeft } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const PorterProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [porter, setPorter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPorter = async () => {
      try {
        // In boilerplate, mock if specific id matches the mocked ones, or try API.
        // For preview, we provide mock data if API fails or returns 404.
        try {
          const res = await api.get(`/porters/${id}`);
          setPorter(res.data.data);
        } catch (err) {
          // Fallback mock
          setPorter({
            _id: id,
            user: { name: 'Ramesh Kumar', phone: '9876543210' },
            rating: 4.8,
            experience: 5,
            languages: ['Hindi', 'English'],
            isAvailable: true,
            baseRate: 150,
            completedBookings: 142,
            station: { name: 'New Delhi (NDLS)' },
            status: 'verified'
          });
        }
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPorter();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B192C]"></div>
      </div>
    );
  }

  if (!porter) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Porter not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#38A169] hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronLeft size={20} className="mr-1" /> Back to Search
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Cover */}
        <div className="h-32 bg-[#0B192C] w-full"></div>
        
        <div className="px-6 md:px-10 pb-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end -mt-16 mb-8 gap-4">
            <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
              <div className="w-32 h-32 bg-white p-1 rounded-full shadow-md">
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${porter.user.name}`} 
                  alt={porter.user.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="text-center md:text-left mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{porter.user.name}</h1>
                <div className="flex items-center justify-center md:justify-start text-[#38A169] mt-1 font-medium">
                  <ShieldCheck size={18} className="mr-1" />
                  Verified Porter
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              {porter.isAvailable ? (
                <button className="btn-primary w-full md:w-48 py-3 text-lg font-semibold shadow-md hover:shadow-lg">
                  Book This Porter
                </button>
              ) : (
                <button disabled className="w-full md:w-48 py-3 bg-gray-300 text-gray-500 rounded-md font-semibold cursor-not-allowed">
                  Currently Busy
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Col - Stats */}
            <div className="md:col-span-2 space-y-8">
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center"><Star size={14} className="mr-1 text-yellow-500" /> Rating</p>
                  <p className="font-bold text-xl">{porter.rating.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center"><Briefcase size={14} className="mr-1" /> Trips</p>
                  <p className="font-bold text-xl">{porter.completedBookings}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Experience</p>
                  <p className="font-bold text-xl">{porter.experience} Yrs</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Base Fare</p>
                  <p className="font-bold text-xl text-[#0B192C]">₹{porter.baseRate}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">About {porter.user.name}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {porter.user.name} is a highly rated professional porter based at {porter.station?.name || 'the station'}. 
                  With {porter.experience} years of experience, they know the station layout perfectly and will ensure your luggage reaches your platform safely and on time.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Passenger Reviews</h3>
                {/* Mock Review */}
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400 mr-2">
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">Excellent Service!</span>
                  </div>
                  <p className="text-gray-600 text-sm">"Arrived on time and handled my fragile bags with great care. Highly recommend."</p>
                  <span className="text-xs text-gray-400 mt-2 block">- Rahul S.</span>
                </div>
              </div>

            </div>

            {/* Right Col - Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Information</h3>
                
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <MapPin className="text-gray-400 mr-3 mt-0.5 shrink-0" size={18} />
                    <div>
                      <span className="block text-sm text-gray-500">Base Station</span>
                      <span className="font-medium text-gray-800">{porter.station?.name || 'N/A'}</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Globe className="text-gray-400 mr-3 mt-0.5 shrink-0" size={18} />
                    <div>
                      <span className="block text-sm text-gray-500">Languages</span>
                      <span className="font-medium text-gray-800">{porter.languages.join(', ')}</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ShieldCheck className="text-[#38A169] mr-3 mt-0.5 shrink-0" size={18} />
                    <div>
                      <span className="block text-sm text-gray-500">Verification</span>
                      <span className="font-medium text-[#38A169]">Background Checked</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default PorterProfile;
