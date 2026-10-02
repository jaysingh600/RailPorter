import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';

const PassengerComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints/me');
        setComplaints(res.data.data);
      } catch (error) {
        console.error('Failed to fetch complaints');
      } finally {
        setIsLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN':
      case 'UNDER_REVIEW':
        return <Clock size={20} className="text-yellow-500" />;
      case 'RESOLVED':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'REJECTED':
      case 'CLOSED':
        return <XCircle size={20} className="text-gray-500" />;
      default:
        return <AlertTriangle size={20} className="text-blue-500" />;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-yellow-50 text-yellow-700';
      case 'UNDER_REVIEW': return 'bg-blue-50 text-blue-700';
      case 'RESOLVED': return 'bg-green-50 text-green-700';
      case 'REJECTED': return 'bg-red-50 text-red-700';
      case 'CLOSED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[#0B192C]">My Complaints</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : complaints.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
          <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No complaints filed</h3>
          <p className="text-gray-500">You haven't raised any dispute tickets.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map(complaint => (
            <div key={complaint._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row gap-6">
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(complaint.status)}
                    <h3 className="text-lg font-bold text-gray-900">{complaint.subject}</h3>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide ${getStatusBg(complaint.status)}`}>
                    {complaint.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span>Booking #{complaint.booking?._id?.slice(-6).toUpperCase() || 'N/A'}</span>
                  <span>•</span>
                  <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{complaint.category}</span>
                </div>
                
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg italic">
                  "{complaint.description}"
                </p>

                {(complaint.adminResponse || complaint.resolution) && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Admin Response</h4>
                    <p className="text-sm text-gray-700">{complaint.adminResponse || complaint.resolution}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PassengerComplaints;
