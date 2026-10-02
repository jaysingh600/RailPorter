import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const RatingModal = ({ booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/reviews', {
        bookingId: booking._id,
        rating,
        comment
      });
      toast.success('Thank you for your feedback!');
      onSuccess(); // Triggers a re-fetch of history or closes modal
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        {/* Close btn */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors z-10">
          <X size={20} />
        </button>

        <div className="p-8 text-center border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rate your Porter</h2>
          <p className="text-sm text-gray-500">How was your experience with {booking.porter?.name}?</p>
          
          <div className="flex justify-center items-center mt-6 space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110 focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star 
                  size={36} 
                  className={star <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} 
                />
              </button>
            ))}
          </div>
          <div className="h-6 mt-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent!'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-gray-50">
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Add a comment (Optional)</label>
            <textarea
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none bg-white shadow-inner"
              rows="3"
              placeholder="Tell us what you liked..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting || rating === 0}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-md ${rating > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
