import React, { useEffect, useState } from 'react';
import { Search, AlertOctagon, CheckCircle, Navigation, Shield, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { socketService } from '../../utils/socket';

const SafetyDashboard = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Basic filtering for demo
  const [filter, setFilter] = useState('ALL');

  const fetchEmergencies = async () => {
    try {
      const res = await api.get('/admin/emergencies'); // Returns paginated data by default
      setEmergencies(res.data.data);
    } catch (error) {
      toast.error('Failed to load emergencies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();

    const socket = socketService.connect();
    socketService.getSocket()?.emit('join_user_room', { userId: 'admin', role: 'admin' }); // Join admin:safety handled in backend via role

    socket.on('emergency:sos', (newEmergency) => {
      // Audio alert
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
      
      toast.error('🚨 NEW SOS ALERT RECEIVED!', { duration: 10000 });
      setEmergencies(prev => [newEmergency, ...prev]);
    });

    return () => {
      socket.off('emergency:sos');
    };
  }, []);

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT': return <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold animate-pulse">URGENT</span>;
      case 'HIGH': return <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-bold border border-orange-200">HIGH</span>;
      case 'MEDIUM': return <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold border border-yellow-200">MEDIUM</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-bold border border-gray-200">LOW</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return <span className="text-red-600 font-bold flex items-center"><AlertOctagon size={14} className="mr-1"/> OPEN</span>;
      case 'ACKNOWLEDGED': return <span className="text-blue-600 font-bold flex items-center"><Shield size={14} className="mr-1"/> ACKNOWLEDGED</span>;
      case 'RESOLVED': return <span className="text-green-600 font-bold flex items-center"><CheckCircle size={14} className="mr-1"/> RESOLVED</span>;
      default: return <span className="text-gray-600 font-bold">{status}</span>;
    }
  };

  const filteredEmergencies = emergencies.filter(e => {
    if (filter === 'ACTIVE') return ['OPEN', 'ACKNOWLEDGED', 'UNDER_REVIEW'].includes(e.status);
    if (filter === 'RESOLVED') return ['RESOLVED', 'CLOSED'].includes(e.status);
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Safety & Emergency Command</h2>
          <p className="text-sm text-gray-500 mt-1">Real-time monitoring of SOS alerts and safety incidents.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['ALL', 'ACTIVE', 'RESOLVED'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)} 
              className={`px-4 py-1.5 rounded-md text-xs font-bold ${filter === f ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">
              <tr>
                <th className="px-6 py-4">Alert Info</th>
                <th className="px-6 py-4">Booking / Location</th>
                <th className="px-6 py-4">Triggered By</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmergencies.map((e) => (
                <tr key={e._id} className={`hover:bg-gray-50 transition-colors ${e.status === 'OPEN' && e.type === 'SOS' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{e.type.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">{new Date(e.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">ID: #{e._id.slice(-6).toUpperCase()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-mono text-sm font-bold text-gray-600 mb-1">#{e.booking?._id?.slice(-6).toUpperCase() || 'N/A'}</p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Navigation size={12} className="mr-1"/> {e.booking?.station?.name || 'Unknown'} - {e.booking?.platform?.name || 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900 text-sm">{e.triggeredBy?.name || 'Unknown'}</p>
                    <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${e.triggeredByRole === 'passenger' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {e.triggeredByRole?.toUpperCase()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {getPriorityBadge(e.priority)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {getStatusBadge(e.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/admin/safety/${e._id}`} className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors inline-block">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredEmergencies.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Shield className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No safety alerts matching the current filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SafetyDashboard;
