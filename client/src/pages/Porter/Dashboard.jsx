import React, { useState } from 'react';
import HomeTab from '../../components/porter/HomeTab';
import EarningsTab from '../../components/porter/EarningsTab';
import ProfileTab from '../../components/porter/ProfileTab';
import PorterReviewsTab from '../../components/porter/PorterReviewsTab';
import { Home, IndianRupee, UserCircle, Star } from 'lucide-react';

const PorterDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-0">
      
      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'earnings' && <EarningsTab />}
        {activeTab === 'reviews' && <PorterReviewsTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-4 z-50">
        <button 
          onClick={() => setActiveTab('home')} 
          className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'home' ? 'text-[#0B192C]' : 'text-gray-400'}`}
        >
          <Home size={24} className={activeTab === 'home' ? 'fill-current' : ''} />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('earnings')} 
          className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'earnings' ? 'text-[#38A169]' : 'text-gray-400'}`}
        >
          <IndianRupee size={24} />
          <span className="text-[10px] font-medium mt-1">Earnings</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('reviews')} 
          className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'reviews' ? 'text-yellow-500' : 'text-gray-400'}`}
        >
          <Star size={24} className={activeTab === 'reviews' ? 'fill-current' : ''} />
          <span className="text-[10px] font-medium mt-1">Reviews</span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')} 
          className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'profile' ? 'text-[#0B192C]' : 'text-gray-400'}`}
        >
          <UserCircle size={24} className={activeTab === 'profile' ? 'fill-current' : ''} />
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </button>
      </div>

      {/* Desktop Navigation Hints (optional, since it's mobile-first) */}
      <div className="hidden md:flex fixed left-4 top-24 flex-col gap-4">
         <button onClick={() => setActiveTab('home')} className={`p-3 rounded-full shadow-md ${activeTab === 'home' ? 'bg-[#0B192C] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><Home/></button>
         <button onClick={() => setActiveTab('earnings')} className={`p-3 rounded-full shadow-md ${activeTab === 'earnings' ? 'bg-[#38A169] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><IndianRupee/></button>
         <button onClick={() => setActiveTab('reviews')} className={`p-3 rounded-full shadow-md ${activeTab === 'reviews' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><Star/></button>
         <button onClick={() => setActiveTab('profile')} className={`p-3 rounded-full shadow-md ${activeTab === 'profile' ? 'bg-[#0B192C] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><UserCircle/></button>
      </div>

    </div>
  );
};

export default PorterDashboard;
