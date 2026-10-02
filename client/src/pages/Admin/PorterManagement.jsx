import React, { useEffect, useState } from 'react';
import { Search, ShieldCheck, XCircle, MoreVertical, AlertTriangle, CheckCircle, RefreshCcw } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const PorterManagement = () => {
  const [porters, setPorters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [actionModal, setActionModal] = useState({ isOpen: false, type: null, porterId: null });
  const [reason, setReason] = useState('');

  const fetchPorters = async () => {
    try {
      const res = await api.get('/admin/porters');
      setPorters(res.data.data);
    } catch (error) {
      toast.error('Failed to load porters');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPorters();
  }, []);

  const handleAction = async () => {
    if ((actionModal.type === 'suspend' || actionModal.type === 'reject') && !reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      const endpoint = `/admin/porters/${actionModal.porterId}/${actionModal.type}`;
      const payload = { reason };
      
      await api.patch(endpoint, payload);
      toast.success(`Porter ${actionModal.type} successful`);
      
      setActionModal({ isOpen: false, type: null, porterId: null });
      setReason('');
      fetchPorters();
    } catch (error) {
      if (error.response?.data?.hasActiveBooking) {
        toast.error('Cannot suspend: Porter has an active booking!');
      } else {
        toast.error(`Failed to ${actionModal.type} porter`);
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED': return <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium">Verified</span>;
      case 'PENDING': return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-medium">Pending</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-medium">Rejected</span>;
      case 'SUSPENDED': return <span className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center"><AlertTriangle size={12} className="mr-1"/>Suspended</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Porter Management</h2>
        
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Search porters..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Station</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {porters.map((porter) => (
                <tr key={porter._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                        {porter.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{porter.name}</p>
                        <p className="text-xs text-gray-500">Exp: {porter.experience} yrs | ★ {porter.rating?.toFixed(1) || '0.0'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{porter.phone}</p>
                    <p className="text-xs text-gray-500">{porter.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{porter.station?.name || 'N/A'}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(porter.verificationStatus)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                    {porter.verificationStatus === 'PENDING' && (
                      <>
                        <button onClick={() => setActionModal({ isOpen: true, type: 'verify', porterId: porter._id })} className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md">Verify</button>
                        <button onClick={() => setActionModal({ isOpen: true, type: 'reject', porterId: porter._id })} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md">Reject</button>
                      </>
                    )}
                    {porter.verificationStatus === 'VERIFIED' && (
                      <button onClick={() => setActionModal({ isOpen: true, type: 'suspend', porterId: porter._id })} className="text-orange-600 hover:text-orange-900 bg-orange-50 px-3 py-1 rounded-md">Suspend</button>
                    )}
                    {(porter.verificationStatus === 'SUSPENDED' || porter.verificationStatus === 'REJECTED') && (
                      <button onClick={() => setActionModal({ isOpen: true, type: 'activate', porterId: porter._id })} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md">Activate</button>
                    )}
                  </td>
                </tr>
              ))}
              {porters.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No porters found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 capitalize">{actionModal.type} Porter</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to {actionModal.type} this porter?
              </p>
              
              {(actionModal.type === 'suspend' || actionModal.type === 'reject') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Required)</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="3"
                    placeholder="Enter reason..."
                  ></textarea>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => { setActionModal({ isOpen: false, type: null, porterId: null }); setReason(''); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAction}
                  className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors capitalize ${
                    actionModal.type === 'suspend' || actionModal.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Confirm {actionModal.type}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PorterManagement;
