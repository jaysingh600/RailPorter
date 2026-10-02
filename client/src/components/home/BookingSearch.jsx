import React, { useState, useContext } from 'react';
import { MapPin, Search, Navigation, User, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const BookingSearch = () => {
  const navigate = useNavigate();
  const { user, quickLogin } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const handleSearch = (e) => {
    e.preventDefault();
    if (user && user.role === 'passenger') {
      navigate('/passenger/find-porter');
    } else if (user) {
      toast.error('Please log in as a passenger to book a porter.');
    } else {
      setShowModal(true);
    }
  };

  const handleQuickLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await quickLogin(formData.name, formData.phone);
      toast.success('Access granted!');
      setShowModal(false);
      navigate('/passenger/find-porter');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="relative z-20 -mt-24 px-4 pb-16">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-panel p-6 md:p-8 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-5 items-end">
              
              <div className="w-full md:w-1/3">
                <label className="label-text">Railway Station</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-brand-accent transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="e.g., New Delhi (NDLS)" 
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="w-full md:w-1/5">
                <label className="label-text">Platform</label>
                <div className="relative group">
                  <Navigation className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-brand-accent transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="e.g., 4" 
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="w-full md:w-1/5">
                <label className="label-text">Luggage</label>
                <select className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none transition-all duration-300 appearance-none font-medium text-gray-700">
                  <option value="1-2">1-2 Bags</option>
                  <option value="3-5">3-5 Bags</option>
                  <option value="5+">5+ Bags</option>
                </select>
              </div>

              <div className="w-full md:w-[26%]">
                <button 
                  type="submit" 
                  className="w-full btn-primary h-[52px] flex items-center justify-center text-lg shadow-glow shadow-brand-accent/30"
                >
                  <Search size={20} className="mr-2" />
                  Find Porters
                </button>
              </div>

            </form>
          </div>
        </div>
      </section>

      {/* Quick Login Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Access</h3>
            <p className="text-gray-500 mb-6 text-sm">Enter your details to find porters instantly.</p>
            
            <form onSubmit={handleQuickLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0B192C] outline-none"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    required
                    pattern="[6-9][0-9]{9}"
                    title="10-digit Indian Mobile Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0B192C] outline-none"
                    placeholder="Enter 10-digit mobile"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#E53E3E] text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors flex justify-center items-center mt-2"
              >
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingSearch;
