import React, { useEffect, useState } from 'react';
import { Search, Plus, Map, Power, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const StationManagement = () => {
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // New Station Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: '',
    state: '',
    numberOfPlatforms: 1
  });

  const fetchStations = async () => {
    try {
      const res = await api.get('/stations'); // We need an admin route if we want to see deactivated stations, but this is fine for now
      setStations(res.data.data);
    } catch (error) {
      toast.error('Failed to load stations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleAddStation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/stations', formData);
      toast.success('Station added successfully');
      setIsAdding(false);
      setFormData({ name: '', code: '', city: '', state: '', numberOfPlatforms: 1 });
      fetchStations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add station');
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this station?')) {
      try {
        await api.delete(`/admin/stations/${id}`);
        toast.success('Station removed');
        fetchStations();
      } catch (error) {
        toast.error('Failed to remove station');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Station Configuration</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center font-bold text-sm shadow-sm transition-colors"
        >
          {isAdding ? 'Cancel' : <><Plus size={18} className="mr-2" /> Add Station</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Add New Railway Station</h3>
          <form onSubmit={handleAddStation} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Station Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Patna Junction" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Station Code</label>
              <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none uppercase" placeholder="e.g. PNBE" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">City</label>
              <input type="text" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Patna" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">State</label>
              <input type="text" required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Bihar" />
            </div>
            <div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md h-[42px]">Save</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Station</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stations.map(station => (
                <tr key={station._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-blue-600">
                        <Map size={16} />
                      </div>
                      <span className="font-bold text-gray-900">{station.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-gray-700">{station.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{station.city}, {station.state}</td>
                  <td className="px-6 py-4">
                    {station.isActive ? 
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle size={12} className="mr-1"/> Active</span> :
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700"><Power size={12} className="mr-1"/> Inactive</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeactivate(station._id)} className="text-red-500 hover:text-red-700 mr-4 text-sm font-medium">Remove</button>
                    <Link to={`/admin/stations/${station._id}`} className="text-blue-600 hover:text-blue-800 text-sm font-bold inline-flex items-center">
                      Manage <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </td>
                </tr>
              ))}
              {stations.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No stations configured.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StationManagement;
