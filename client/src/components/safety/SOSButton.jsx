import React, { useState } from 'react';
import { AlertOctagon, X, PhoneCall, AlertTriangle } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const SOSButton = ({ bookingId, currentLocation, activeEmergency, onSOSCreated }) => {
  const [showModal, setShowModal] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  const handleTriggerSOS = async () => {
    try {
      setIsTriggering(true);
      const res = await api.post('/emergency/sos', {
        bookingId,
        location: currentLocation ? {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          accuracy: currentLocation.accuracy,
          updatedAt: new Date()
        } : undefined
      });
      toast.success('SOS Alert Triggered. Help is on the way.');
      setShowModal(false);
      if (onSOSCreated) onSOSCreated(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to trigger SOS');
    } finally {
      setIsTriggering(false);
    }
  };

  if (activeEmergency) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center mr-3 animate-pulse">
            <AlertOctagon className="text-red-600" size={20} />
          </div>
          <div>
            <p className="font-bold text-red-900">Safety Alert Active</p>
            <p className="text-xs text-red-700 font-medium mt-0.5">
              Status: {activeEmergency.status}
            </p>
          </div>
        </div>
        <a href="tel:112" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center">
          <PhoneCall size={16} className="mr-2" />
          Call 112
        </a>
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center"
      >
        <AlertOctagon className="mr-2" size={20} />
        SOS / Emergency
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <div className="bg-red-600 p-6 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg animate-pulse">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Emergency Assistance</h3>
            </div>
            
            <div className="p-6 text-center">
              <p className="text-gray-700 text-lg mb-6">
                Are you sure you want to trigger an emergency alert?
              </p>
              <p className="text-sm text-gray-500 mb-8 bg-gray-50 p-4 rounded-lg">
                This will immediately notify the RailPorter safety team and share your active booking context and location.
              </p>
              
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={handleTriggerSOS}
                  disabled={isTriggering}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-sm transition-colors text-lg flex items-center justify-center disabled:opacity-70"
                >
                  {isTriggering ? 'Triggering...' : 'Yes, Trigger SOS'}
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  disabled={isTriggering}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-colors text-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;
