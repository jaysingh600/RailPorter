import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Porter behavior',
  'Wrong fare',
  'Booking issue',
  'Luggage issue',
  'Payment issue',
  'Other'
];

const ReportIssue = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ bookingId: '', category: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For boilerplate, we'll fetch completed bookings to populate a dropdown
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/passenger/history');
        setBookings(res.data.data);
      } catch (error) {
        console.error('Failed to fetch bookings');
      }
    };
    fetchBookings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookingId || !formData.category || !formData.description.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/complaints', formData);
      toast.success('Complaint submitted. Support will contact you shortly.');
      navigate('/passenger/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 font-medium mb-6">
        <ArrowLeft size={20} className="mr-2" /> Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-orange-50 px-8 py-6 border-b border-orange-100 flex items-center">
          <AlertTriangle size={32} className="text-orange-500 mr-4 shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
            <p className="text-sm text-gray-600 mt-1">We take your safety and satisfaction seriously. Please provide details below.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Select Booking</label>
            <select 
              className="input-field py-3 bg-gray-50 cursor-pointer"
              value={formData.bookingId}
              onChange={(e) => setFormData({...formData, bookingId: e.target.value})}
            >
              <option value="" disabled>Select a recent booking</option>
              {bookings.map(b => (
                <option key={b._id} value={b._id}>
                  {new Date(b.createdAt).toLocaleDateString()} - Platform {b.platform} (ID: #{b._id.slice(-6).toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Issue Category</label>
            <select 
              className="input-field py-3 bg-gray-50 cursor-pointer"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="" disabled>Select category</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Description</label>
            <textarea 
              className="input-field py-3 bg-gray-50 resize-none h-32"
              placeholder="Please describe exactly what happened..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              maxLength={1000}
            ></textarea>
            <p className="text-xs text-gray-400 mt-2 text-right">{formData.description.length}/1000</p>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full btn-primary py-4 text-lg mt-4 shadow-lg shadow-blue-200"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
