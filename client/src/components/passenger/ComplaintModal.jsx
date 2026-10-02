import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const ComplaintModal = ({ booking, onClose, onSuccess }) => {
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Porter behavior', 
    'Wrong fare', 
    'Booking issue', 
    'Luggage issue', 
    'Payment issue', 
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !subject || !description) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/complaints', {
        bookingId: booking._id,
        category,
        subject,
        description
      });
      toast.success('Complaint submitted successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        {/* Close btn */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors z-10">
          <X size={20} />
        </button>

        <div className="p-6 md:p-8 bg-red-50 border-b border-red-100 flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-900 mb-1">Raise a Complaint</h2>
            <p className="text-sm text-red-700">Booking #{booking._id.slice(-6).toUpperCase()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 bg-white">
          
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Issue Category</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-gray-50"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
            <input
              type="text"
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-gray-50"
              placeholder="Brief summary of the issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Detailed Description</label>
            <textarea
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none resize-none bg-gray-50"
              rows="4"
              placeholder="Please provide details about what happened..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              required
            ></textarea>
          </div>
          
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`flex-[2] py-3 rounded-xl font-bold text-white transition-all shadow-md ${isSubmitting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintModal;
