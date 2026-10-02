import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, User, AlertTriangle, ShieldCheck, CheckCircle } from 'lucide-react';
import LiveMap from '../../components/map/LiveMap';

const EmergencyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [emergency, setEmergency] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolutionNote, setResolutionNote] = useState('');

  const fetchEmergency = async () => {
    try {
      const res = await api.get(`/admin/emergencies/${id}`);
      setEmergency(res.data.data);
    } catch (err) {
      toast.error('Failed to load emergency details');
      navigate('/admin/safety');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergency();
  }, [id]);

  const handleAcknowledge = async () => {
    try {
      await api.patch(`/admin/emergencies/${id}/acknowledge`);
      toast.success('Emergency acknowledged');
      fetchEmergency();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to acknowledge');
    }
  };

  const handleResolve = async () => {
    if (!resolutionNote.trim()) {
      return toast.error('Resolution note is required');
    }
    try {
      await api.patch(`/admin/emergencies/${id}/resolve`, { resolution: resolutionNote });
      toast.success('Emergency marked as resolved');
      fetchEmergency();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.patch(`/admin/emergencies/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchEmergency();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;
  if (!emergency) return null;

  const isResolved = emergency.status === 'RESOLVED' || emergency.status === 'CLOSED';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={() => navigate('/admin/safety')} className="p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Emergency Details</h2>
          <p className="text-sm text-gray-500 font-mono">ID: #{emergency._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Info & Map */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
                  <AlertTriangle className="mr-2 text-red-500" /> {emergency.type.replace('_', ' ')}
                </h3>
                <p className="text-sm text-gray-500">Category: <span className="font-bold text-gray-700">{emergency.category}</span></p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                emergency.status === 'OPEN' ? 'bg-red-100 text-red-800' : 
                emergency.status === 'ACKNOWLEDGED' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {emergency.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Triggered By</p>
                <p className="font-bold text-gray-900 flex items-center">
                  <User size={14} className="mr-1 text-gray-400"/> {emergency.triggeredBy?.name}
                </p>
                <p className="text-xs text-gray-600 capitalize mt-0.5">{emergency.triggeredByRole} • {emergency.triggeredBy?.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Report Time</p>
                <p className="font-bold text-gray-900">{new Date(emergency.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {emergency.description && (
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg text-sm border">{emergency.description}</p>
              </div>
            )}
            
            {emergency.resolution && (
              <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-xs text-green-800 font-bold mb-1 flex items-center"><CheckCircle size={14} className="mr-1"/> Resolution Details</p>
                <p className="text-green-900 text-sm">{emergency.resolution}</p>
                <p className="text-xs text-green-700 mt-2">Resolved by {emergency.resolvedBy?.name} at {new Date(emergency.resolvedAt).toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-bold text-gray-900 flex items-center">
                <MapPin className="mr-2 text-blue-500" size={18} /> Emergency Location
              </h3>
            </div>
            {emergency.location?.latitude ? (
              <LiveMap 
                passengerLocation={{ lat: emergency.location.latitude, lng: emergency.location.longitude }}
                porterLocation={null}
              />
            ) : (
              <div className="p-12 text-center text-gray-500 bg-gray-50">
                No GPS coordinates were captured for this event.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Actions & Booking context */}
        <div className="space-y-6">
          <div className="bg-[#0B192C] text-white rounded-xl shadow-md p-6">
            <h3 className="font-bold mb-4 text-lg">Admin Actions</h3>
            
            {!isResolved ? (
              <div className="space-y-4">
                {emergency.status === 'OPEN' && (
                  <button onClick={handleAcknowledge} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition">
                    <ShieldCheck size={18} className="mr-2"/> Acknowledge
                  </button>
                )}
                
                {emergency.status === 'ACKNOWLEDGED' && (
                  <button onClick={() => handleUpdateStatus('UNDER_REVIEW')} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition">
                    Mark Under Review
                  </button>
                )}

                <div className="pt-4 border-t border-gray-700">
                  <label className="block text-xs text-gray-300 mb-2">Resolution Note</label>
                  <textarea 
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-green-500 outline-none mb-3"
                    rows="3"
                    placeholder="How was this resolved?"
                  ></textarea>
                  <button onClick={handleResolve} className="w-full bg-[#38A169] hover:bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center transition shadow-lg">
                    <CheckCircle size={18} className="mr-2"/> Resolve Emergency
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-900/50 text-green-400 p-4 rounded-lg border border-green-800 text-center font-medium">
                This emergency has been resolved and closed.
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Booking Context</h3>
            {emergency.booking ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Booking ID</span>
                  <span className="font-bold font-mono text-gray-800">#{emergency.booking._id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Station</span>
                  <span className="font-medium text-gray-800">{emergency.booking.station?.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Platform</span>
                  <span className="font-medium text-gray-800">{emergency.booking.platform?.name}</span>
                </div>
                <div className="pt-2">
                  <span className="text-gray-500 block mb-1">Passenger</span>
                  <span className="font-bold text-gray-900 block">{emergency.booking.passenger?.name}</span>
                  <span className="text-gray-600">{emergency.booking.passenger?.phone}</span>
                </div>
                <div className="pt-2">
                  <span className="text-gray-500 block mb-1">Porter</span>
                  <span className="font-bold text-gray-900 block">{emergency.booking.porter?.name || 'Unassigned'}</span>
                  <span className="text-gray-600">{emergency.booking.porter?.phone}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Booking details unavailable.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyDetails;
