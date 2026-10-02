import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Navigation } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const StationDetails = () => {
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [pickupPoints, setPickupPoints] = useState({}); // mapped by platformId
  const [isLoading, setIsLoading] = useState(true);

  // Forms
  const [showPlatformForm, setShowPlatformForm] = useState(false);
  const [newPlatformNumber, setNewPlatformNumber] = useState('');
  
  const [showPickupFormFor, setShowPickupFormFor] = useState(null); // platformId
  const [newPickupName, setNewPickupName] = useState('');

  const loadData = async () => {
    try {
      const stRes = await api.get(`/stations/${id}`);
      setStation(stRes.data.data);

      const plRes = await api.get(`/stations/${id}/platforms`);
      setPlatforms(plRes.data.data);

      // Load pickup points for each platform
      const pointsObj = {};
      await Promise.all(plRes.data.data.map(async (plat) => {
        const ptRes = await api.get(`/platforms/${plat._id}/pickup-points`);
        pointsObj[plat._id] = ptRes.data.data;
      }));
      setPickupPoints(pointsObj);
    } catch (error) {
      toast.error('Failed to load station details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddPlatform = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/platforms', { station: id, platformNumber: newPlatformNumber });
      toast.success('Platform added');
      setNewPlatformNumber('');
      setShowPlatformForm(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add platform');
    }
  };

  const handleAddPickup = async (e, platformId) => {
    e.preventDefault();
    try {
      await api.post('/admin/pickup-points', { station: id, platform: platformId, name: newPickupName });
      toast.success('Pickup Point added');
      setNewPickupName('');
      setShowPickupFormFor(null);
      loadData();
    } catch (error) {
      toast.error('Failed to add pickup point');
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (!station) return <div className="p-8 text-center">Station not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/admin/stations" className="text-gray-500 hover:text-gray-900 inline-flex items-center text-sm font-bold">
        <ArrowLeft size={16} className="mr-1" /> Back to Stations
      </Link>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{station.name} <span className="text-gray-400 font-mono text-xl ml-2">({station.code})</span></h1>
          <p className="text-gray-500 mt-1">{station.city}, {station.state}</p>
        </div>
        <button 
          onClick={() => setShowPlatformForm(!showPlatformForm)}
          className="bg-[#38A169] hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center shadow-sm"
        >
          <Plus size={18} className="mr-1" /> Add Platform
        </button>
      </div>

      {showPlatformForm && (
        <form onSubmit={handleAddPlatform} className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm flex items-end space-x-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Platform Number</label>
            <input type="text" required value={newPlatformNumber} onChange={e=>setNewPlatformNumber(e.target.value)} placeholder="e.g. 1" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md">Save Platform</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map(platform => (
          <div key={platform._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800 flex items-center">
                <Navigation size={18} className="mr-2 text-blue-500" /> Platform {platform.platformNumber}
              </h3>
            </div>
            <div className="p-5 flex-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Pickup Points</h4>
              <ul className="space-y-2 mb-4">
                {pickupPoints[platform._id]?.map(pt => (
                  <li key={pt._id} className="text-sm font-medium text-gray-700 flex items-center bg-gray-50 px-3 py-2 rounded-md border border-gray-100">
                    <MapPin size={14} className="mr-2 text-red-400" /> {pt.name}
                  </li>
                ))}
                {(!pickupPoints[platform._id] || pickupPoints[platform._id].length === 0) && (
                  <li className="text-sm text-gray-400 italic">No pickup points added.</li>
                )}
              </ul>

              {showPickupFormFor === platform._id ? (
                <form onSubmit={(e) => handleAddPickup(e, platform._id)} className="mt-4 space-y-2">
                  <input type="text" required placeholder="Point name (e.g. Gate A)" value={newPickupName} onChange={e=>setNewPickupName(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500" />
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => setShowPickupFormFor(null)} className="flex-1 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md border border-gray-200">Cancel</button>
                    <button type="submit" className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700">Save</button>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={() => { setShowPickupFormFor(platform._id); setNewPickupName(''); }}
                  className="w-full mt-2 py-2 text-sm text-blue-600 font-bold border border-dashed border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  + Add Pickup Point
                </button>
              )}
            </div>
          </div>
        ))}
        {platforms.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
            No platforms configured for this station yet.
          </div>
        )}
      </div>

    </div>
  );
};

export default StationDetails;
