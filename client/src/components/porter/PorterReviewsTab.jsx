import React, { useState, useEffect, useContext } from 'react';
import { Star } from 'lucide-react';
import api from '../../utils/axios';
import { AuthContext } from '../../context/AuthContext';

const PorterReviewsTab = () => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ rating: 0, totalReviews: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch porter's own profile for stats
        const profileRes = await api.get('/porter/profile');
        setStats({
          rating: profileRes.data.data.rating || 0,
          totalReviews: profileRes.data.data.totalReviews || 0
        });

        // Fetch reviews
        const res = await api.get(`/reviews/porter/${user._id}`);
        setReviews(res.data.data);
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?._id) {
      fetchReviews();
    }
  }, [user]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B192C]"></div></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-2xl font-bold text-gray-900">My Ratings & Reviews</h2>

      {/* Aggregate Score */}
      <div className="bg-gradient-to-r from-[#0B192C] to-[#1A365D] rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm font-medium mb-1">Overall Rating</p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold">{stats.rating.toFixed(1)}</span>
            <div className="flex mb-2 text-yellow-400">
              <Star className="fill-current" size={24} />
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-300 text-sm font-medium mb-1">Total Reviews</p>
          <span className="text-3xl font-bold text-[#38A169]">{stats.totalReviews}</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Recent Passenger Feedback</h3>
        </div>
        
        {reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Star size={48} className="mx-auto text-gray-300 mb-4" />
            <p>No reviews yet. Complete more bookings to get rated!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map(review => (
              <div key={review._id} className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden shrink-0">
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.reviewer?.name}`} alt="Passenger" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-gray-900 block">{review.reviewer?.name || 'Passenger'}</span>
                      <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < review.rating ? 'fill-current' : 'text-gray-200'} />
                    ))}
                  </div>
                </div>
                
                {review.comment && (
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg italic">
                    "{review.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PorterReviewsTab;
