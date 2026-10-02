import React, { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';

const PorterRegister = () => {
  const { register: registerForm, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  const password = watch('password');
  const selectedStation = watch('station');

  // Load stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await api.get('/stations');
        setStations(res.data.data);
      } catch (error) {
        toast.error('Failed to load stations');
      }
    };
    fetchStations();
  }, []);

  // Load platforms when station changes
  useEffect(() => {
    if (selectedStation) {
      const fetchPlatforms = async () => {
        try {
          const res = await api.get(`/stations/${selectedStation}/platforms`);
          setPlatforms(res.data.data);
          setSelectedPlatforms([]); // Reset
        } catch (error) {
          toast.error('Failed to load platforms');
        }
      };
      fetchPlatforms();
    } else {
      setPlatforms([]);
      setSelectedPlatforms([]);
    }
  }, [selectedStation]);

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const onSubmit = async (data) => {
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one working platform');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'porter',
        station: data.station,
        workingPlatforms: selectedPlatforms,
        experience: data.experience,
        languages: data.languages.split(',').map(l => l.trim())
      };
      
      await register(payload);
      toast.success('Registration submitted! Your profile is pending verification.');
      navigate('/porter/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-4 mb-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-[#0B192C] mb-2">Register as a Porter</h2>
        <p className="text-center text-gray-500 mb-8">Join our network and start earning securely.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">Personal Details</h3>
              
              <div>
                <label className="label-text">Full Name</label>
                <input 
                  type="text" 
                  {...registerForm('name', { required: 'Full name is required' })}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
              </div>

              <div>
                <label className="label-text">Email Address</label>
                <input 
                  type="email" 
                  {...registerForm('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, message: 'Invalid email' }
                  })}
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
              </div>

              <div>
                <label className="label-text">Mobile Number</label>
                <input 
                  type="text" 
                  {...registerForm('phone', { 
                    required: 'Mobile is required',
                    pattern: { value: /^[6-9]\d{9}$/, message: 'Valid 10-digit mobile required' }
                  })}
                  className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
              </div>

              <div>
                <label className="label-text">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    {...registerForm('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Min 6 characters' }
                    })}
                    className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button 
                    type="button" 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
              </div>

              <div>
                <label className="label-text">Confirm Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  {...registerForm('confirmPassword', { 
                    required: 'Confirm your password',
                    validate: value => value === password || "Passwords do not match"
                  })}
                  className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>}
              </div>
            </div>

            {/* Professional Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">Professional Details</h3>

              <div>
                <label className="label-text">Base Station</label>
                <select 
                  {...registerForm('station', { required: 'Please select a station' })}
                  className={`input-field bg-white ${errors.station ? 'border-red-500' : ''}`}
                >
                  <option value="">Select a Station</option>
                  {stations.map(st => (
                    <option key={st._id} value={st._id}>{st.name}</option>
                  ))}
                </select>
                {errors.station && <span className="text-xs text-red-500">{errors.station.message}</span>}
              </div>

              {platforms.length > 0 && (
                <div>
                  <label className="label-text">Working Platforms *</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {platforms.map(p => (
                      <label key={p._id} className="flex items-center space-x-2 text-sm border p-2 rounded-md cursor-pointer hover:bg-gray-50">
                        <input 
                          type="checkbox" 
                          checked={selectedPlatforms.includes(p._id)}
                          onChange={() => handlePlatformToggle(p._id)}
                          className="rounded text-[#38A169] focus:ring-[#38A169]"
                        />
                        <span>{p.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="label-text">Years of Experience</label>
                <input 
                  type="number" 
                  min="0"
                  {...registerForm('experience', { required: 'Experience is required', min: 0 })}
                  className={`input-field ${errors.experience ? 'border-red-500' : ''}`}
                />
                {errors.experience && <span className="text-xs text-red-500">{errors.experience.message}</span>}
              </div>

              <div>
                <label className="label-text">Languages Known</label>
                <input 
                  type="text" 
                  {...registerForm('languages', { required: 'Please enter languages' })}
                  placeholder="e.g. Hindi, English"
                  className={`input-field ${errors.languages ? 'border-red-500' : ''}`}
                />
                <span className="text-xs text-gray-400">Comma separated</span>
                {errors.languages && <span className="text-xs text-red-500 block">{errors.languages.message}</span>}
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={`btn-primary w-full py-3 mt-4 flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : 'Register as Porter'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already registered? <Link to="/login" className="text-[#38A169] font-medium hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default PorterRegister;
