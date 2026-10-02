import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Eye, EyeOff, Train } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await login(data.identifier, data.password);
      toast.success('Login successful!');
      navigate(`/${res.user.role}/dashboard`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center -mt-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex overflow-hidden">
        
        {/* Left Side - Branding */}
        <div className="hidden md:flex w-1/2 bg-[#0B192C] text-white flex-col justify-center items-center p-12 text-center relative">
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
           <Train size={64} className="text-[#38A169] mb-6 relative z-10" />
           <h2 className="text-3xl font-bold mb-4 relative z-10">Welcome Back to RailPorter</h2>
           <p className="text-gray-300 relative z-10">
             Your reliable partner for railway luggage assistance. Access your dashboard to manage bookings or find porters.
           </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">Sign In</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label-text">Email or Mobile Number</label>
              <input 
                type="text" 
                {...register('identifier', { required: 'Email or Mobile is required' })}
                className={`input-field ${errors.identifier ? 'border-red-500' : ''}`}
                placeholder="Enter email or 10-digit mobile"
              />
              {errors.identifier && <span className="text-xs text-red-500 mt-1">{errors.identifier.message}</span>}
            </div>
            
            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  {...register('password', { required: 'Password is required' })}
                  className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="text-xs text-red-500 mt-1">{errors.password.message}</span>}
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className={`btn-primary w-full py-3 flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Login'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account? <Link to="/register" className="text-[#38A169] font-medium hover:underline">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
