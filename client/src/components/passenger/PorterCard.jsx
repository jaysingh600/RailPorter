import React from 'react';
import { ShieldCheck, Star, MapPin, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PorterCard = ({ porter }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    // In a real app, pass the porter ID to the booking flow
    navigate(`/passenger/booking/${porter._id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
              {/* Fallback avatar */}
              <img 
                src={porter.profileImage && porter.profileImage !== 'default.jpg' ? porter.profileImage : `https://api.dicebear.com/7.x/initials/svg?seed=${porter.name}`} 
                alt={porter.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{porter.name}</h3>
              <div className="flex items-center text-[#38A169] text-sm font-medium">
                <ShieldCheck size={16} className="mr-1" />
                Verified Porter
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-2 py-1 rounded text-sm font-bold flex items-center text-gray-700">
            <Star className="text-yellow-400 mr-1 shrink-0" size={14} fill="currentColor" />
            {porter.rating.toFixed(1)}
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="w-24 font-medium text-gray-700">Experience:</span>
            <span>{porter.experience} Years</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 font-medium text-gray-700">Languages:</span>
            <span>{porter.languages.join(' • ')}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <span className="w-24 font-medium">Platform:</span>
            <span>{porter.workingPlatforms && porter.workingPlatforms.length > 0 ? porter.workingPlatforms[0].name || `Platform ${porter.workingPlatforms[0]}` : 'N/A'}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <span className="w-24 font-medium">Status:</span>
            <span className="flex items-center text-green-600 font-medium">
              🟢 {porter.availabilityStatus === 'AVAILABLE' ? 'Available' : 'Busy'}
            </span>
          </div>
          <div className="flex items-center text-[#E53E3E] font-medium pt-1">
            <MapPin size={16} className="mr-1" />
            {porter.approximateDistance !== null && porter.approximateDistance !== undefined ? 
              `Approx. ${porter.approximateDistance} m away` : 
              'Location unavailable'}
          </div>
        </div>

        <div className="bg-[#F7FAFC] rounded-lg p-3 flex justify-between items-center border border-gray-100">
          <span className="text-sm font-medium text-gray-600">Estimated Fare</span>
          <div className="flex items-center font-bold text-[#0B192C] text-lg">
            <IndianRupee size={16} />
            {porter.baseRate}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 p-4 grid grid-cols-2 gap-3 bg-gray-50">
        <button 
          onClick={() => navigate(`/passenger/porter/${porter._id}`)}
          className="btn-secondary w-full text-sm py-2 bg-white border border-gray-200"
        >
          View Profile
        </button>
        
        {porter.availabilityStatus === 'AVAILABLE' || porter.isAvailable ? (
          <button 
            onClick={handleBookNow}
            className="btn-primary w-full text-sm py-2"
          >
            Book Now
          </button>
        ) : (
          <button 
            disabled
            className="w-full text-sm py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed font-medium"
          >
            Busy
          </button>
        )}
      </div>
    </div>
  );
};

export default PorterCard;
