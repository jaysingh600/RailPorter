import React, { useState } from 'react';
import PassengerHomeTab from '../../components/passenger/PassengerHomeTab';
import PassengerHistoryTab from '../../components/passenger/PassengerHistoryTab';
import PassengerProfileTab from '../../components/passenger/PassengerProfileTab';
import PassengerHelpTab from '../../components/passenger/PassengerHelpTab';
import { Home, Clock, UserCircle, HelpCircle } from 'lucide-react';

const PassengerDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-0">
      
      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {activeTab === 'home' && <PassengerHomeTab />}
        {activeTab === 'history' && <PassengerHistoryTab />}
        {activeTab === 'profile' && <PassengerProfileTab />}
        {activeTab === 'help' && <PassengerHelpTab />}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('home')} 
          className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Home size={22} className={activeTab === 'home' ? 'fill-current' : ''} />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('history')} 
          className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Clock size={22} className={activeTab === 'history' ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] font-medium mt-1">Bookings</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <UserCircle size={22} className={activeTab === 'profile' ? 'fill-current' : ''} />
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </button>

        <button 
          onClick={() => setActiveTab('help')} 
          className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'help' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <HelpCircle size={22} className={activeTab === 'help' ? 'fill-current' : ''} />
          <span className="text-[10px] font-medium mt-1">Help</span>
        </button>
      </div>

      {/* Desktop Navigation Hints (optional sidebar approach for larger screens) */}
      <div className="hidden md:flex fixed left-4 top-24 flex-col gap-4">
         <button onClick={() => setActiveTab('home')} className={`p-3 rounded-full shadow-md ${activeTab === 'home' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><Home/></button>
         <button onClick={() => setActiveTab('history')} className={`p-3 rounded-full shadow-md ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><Clock/></button>
         <button onClick={() => setActiveTab('profile')} className={`p-3 rounded-full shadow-md ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><UserCircle/></button>
         <button onClick={() => setActiveTab('help')} className={`p-3 rounded-full shadow-md ${activeTab === 'help' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><HelpCircle/></button>
      </div>

    </div>
  );
};

export default PassengerDashboard;
