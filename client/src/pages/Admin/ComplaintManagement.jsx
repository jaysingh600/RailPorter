import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Search, MessageSquare } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [resolution, setResolution] = useState('');

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/admin/complaints');
      setComplaints(res.data.data);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolve = async (id) => {
    if (!adminResponse.trim() && !resolution.trim()) {
      toast.error('Please enter a response or resolution note');
      return;
    }
    
    try {
      await api.patch(`/complaints/admin/${id}`, {
        status: 'RESOLVED',
        adminResponse,
        resolution
      });
      toast.success('Complaint marked as resolved');
      setResolvingId(null);
      setAdminResponse('');
      setResolution('');
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to resolve complaint');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Complaint Management</h2>
        
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Search complaints..." 
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
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Raised By</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {complaints.map((complaint) => (
                <React.Fragment key={complaint._id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">
                      #{complaint.booking?._id?.slice(-6).toUpperCase() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {complaint.subject}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{complaint.raisedBy?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{complaint.raisedBy?.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {complaint.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                        complaint.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      {(complaint.status === 'OPEN' || complaint.status === 'IN_REVIEW') && (
                        <button 
                          onClick={() => setResolvingId(resolvingId === complaint._id ? null : complaint._id)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md transition-colors inline-flex items-center"
                        >
                          <CheckCircle size={14} className="mr-1"/> Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                  {/* Expanded Row for description/resolution */}
                  {resolvingId === complaint._id && (
                    <tr className="bg-blue-50/50">
                      <td colSpan="6" className="px-6 py-4">
                        <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                          <div className="flex items-start mb-4">
                            <AlertCircle size={20} className="text-red-500 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-bold text-gray-900 mb-1">Issue Description:</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <MessageSquare size={20} className="text-blue-500 mr-2 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-900 mb-2">Admin Response (Sent to passenger):</p>
                              <textarea 
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm mb-3"
                                rows="2"
                                placeholder="E.g. We have reviewed your case..."
                                value={adminResponse}
                                onChange={(e) => setAdminResponse(e.target.value)}
                              ></textarea>
                              
                              <p className="text-sm font-bold text-gray-900 mb-2">Internal Resolution Note:</p>
                              <textarea 
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm"
                                rows="2"
                                placeholder="E.g. Refund processed. Porter warned."
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                              ></textarea>
                              <div className="mt-3 flex justify-end space-x-3">
                                <button onClick={() => setResolvingId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                                <button onClick={() => handleResolve(complaint._id)} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-sm">Submit & Resolve</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {complaints.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No complaints found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplaintManagement;
