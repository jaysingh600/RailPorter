import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, Star, Edit3, Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';
import { useNavigate, Link } from 'react-router-dom';

const PassengerProfileTab = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  const [pastReviews, setPastReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsRes, analyticsRes] = await Promise.all([
          api.get('/reviews/me'),
          api.get('/analytics/passenger/me')
        ]);
        setPastReviews(reviewsRes.data.data);
        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      // await api.put('/passenger/profile', formData);
      toast.success('Profile updated successfully (Mock)');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center">
        <div className="w-20 h-20 bg-gray-200 rounded-full mr-5 border-2 border-white shadow-md relative group">
           <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`} alt="Profile" className="w-full h-full rounded-full" />
           <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Edit3 size={18} className="text-white" />
           </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
          <p className="text-gray-500 text-sm">Passenger Account</p>
        </div>
      </div>

      {/* My Stats Section */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">Total Bookings</p>
            <p className="text-2xl font-bold text-blue-900">{analytics.bookings.total}</p>
          </div>
          <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center">
            <p className="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-900">{analytics.bookings.completed}</p>
          </div>
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
            <p className="text-red-600 text-xs font-bold uppercase tracking-wider mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-red-900">{analytics.bookings.cancelled}</p>
          </div>
          <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl text-center">
            <p className="text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-purple-900">
              ₹{analytics.payments.find(p => p._id === 'SUCCESS')?.amount?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      )}

      {/* Personal Info Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Personal Information</h3>
          {isEditing ? (
            <button onClick={handleSave} className="text-blue-600 flex items-center font-bold text-sm bg-blue-50 px-3 py-1 rounded-full"><Save size={14} className="mr-1"/> Save</button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-blue-600 flex items-center font-bold text-sm"><Edit3 size={14} className="mr-1"/> Edit</button>
          )}
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Full Name</label>
            {isEditing ? (
              <input type="text" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="input-field py-2 bg-gray-50" />
            ) : (
              <p className="font-medium text-gray-900">{formData.name}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Phone Number</label>
            {isEditing ? (
              <input type="tel" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} className="input-field py-2 bg-gray-50" />
            ) : (
              <p className="font-medium text-gray-900">{formData.phone}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Email Address</label>
            {isEditing ? (
              <input type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="input-field py-2 bg-gray-50" />
            ) : (
              <p className="font-medium text-gray-900">{formData.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* My Complaints Link */}
      <Link to="/passenger/complaints" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
        <div>
          <h3 className="font-bold text-gray-800">My Complaints</h3>
          <p className="text-xs text-gray-500">Track your dispute tickets</p>
        </div>
        <div className="text-blue-600 bg-blue-50 p-2 rounded-full">
          <AlertTriangle size={18} />
        </div>
      </Link>

      {/* Past Reviews Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">My Past Reviews</h3>
        </div>
        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-gray-500">Loading reviews...</div>
          ) : pastReviews.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No reviews submitted yet.</div>
          ) : (
            pastReviews.map(review => (
              <div key={review._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-gray-900">Porter: {review.porter?.name}</span>
                  <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < review.rating ? 'fill-current' : 'text-gray-300'} />
                  ))}
                </div>
                {review.comment && <p className="text-sm text-gray-600 italic">"{review.comment}"</p>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full bg-white rounded-xl shadow-sm border border-red-100 p-4 flex justify-center items-center text-red-600 font-bold hover:bg-red-50 transition-colors">
        <LogOut size={18} className="mr-2" /> Log Out
      </button>

    </div>
  );
};

export default PassengerProfileTab;
