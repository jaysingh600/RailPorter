import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const PassengerRegister = () => {
  const { register: registerForm, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'passenger'
      };
      
      await register(payload);
      toast.success('Registration successful! Welcome to RailPorter.');
      navigate('/passenger/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-4 mb-12">
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-[#0B192C] mb-2">Create an Account</h2>
        <p className="text-center text-gray-500 mb-6">Join RailPorter as a passenger</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Full Name</label>
            <input 
              type="text" 
              {...registerForm('name', { required: 'Full name is required' })}
              className={`input-field ${errors.name ? 'border-red-500' : ''}`}
              placeholder="John Doe"
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
          </div>

          <div>
            <label className="label-text">Email Address</label>
            <input 
              type="email" 
              {...registerForm('email', { 
                required: 'Email is required',
                pattern: { value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, message: 'Invalid email format' }
              })}
              className={`input-field ${errors.email ? 'border-red-500' : ''}`}
              placeholder="john@example.com"
            />
            {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
          </div>

          <div>
            <label className="label-text">Mobile Number</label>
            <input 
              type="text" 
              {...registerForm('phone', { 
                required: 'Mobile number is required',
                pattern: { value: /^[6-9]\d{9}$/, message: 'Must be a valid 10-digit Indian mobile number' }
              })}
              className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="9876543210"
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
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Min. 6 characters"
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
                required: 'Please confirm your password',
                validate: value => value === password || "The passwords do not match"
              })}
              className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>}
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={`btn-primary w-full py-3 mt-4 flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-[#38A169] font-medium hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default PassengerRegister;
