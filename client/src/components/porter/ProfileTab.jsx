import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ShieldCheck, LogOut, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

const ProfileTab = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock profile data for boilerplate
  const [profile, setProfile] = useState({
    languages: 'Hindi, English',
    experience: 5,
    baseRate: 150
  });

  const handleSave = async () => {
    try {
      // await api.put('/porter/profile', profile);
      toast.success('Profile updated successfully');
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
      <h2 className="text-2xl font-bold text-[#0B192C]">Profile Settings</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center p-6">
        <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full mb-4 border-4 border-white shadow-md">
           <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} alt="Profile" className="w-full h-full rounded-full" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
        <p className="text-gray-500 mb-3">{user?.phone}</p>
        
        <div className="inline-flex items-center px-3 py-1 bg-green-50 text-[#38A169] text-sm font-bold rounded-full border border-green-200">
          <ShieldCheck size={16} className="mr-1" /> Verified Porter
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800">Professional Details</h3>
          <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="text-[#38A169] text-sm font-bold">
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Languages</label>
            {isEditing ? (
              <input type="text" value={profile.languages} onChange={(e)=>setProfile({...profile, languages: e.target.value})} className="input-field py-2" />
            ) : (
              <p className="font-medium text-gray-900">{profile.languages}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Experience</label>
              {isEditing ? (
                <input type="number" value={profile.experience} onChange={(e)=>setProfile({...profile, experience: e.target.value})} className="input-field py-2" />
              ) : (
                <p className="font-medium text-gray-900">{profile.experience} Years</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Base Fare</label>
              {isEditing ? (
                <input type="number" value={profile.baseRate} onChange={(e)=>setProfile({...profile, baseRate: e.target.value})} className="input-field py-2" />
              ) : (
                <p className="font-medium text-gray-900">₹{profile.baseRate}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <button className="w-full p-4 flex justify-between items-center text-left hover:bg-gray-50 border-b border-gray-100">
          <span className="font-medium text-gray-800">Terms & Conditions</span>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
        <button className="w-full p-4 flex justify-between items-center text-left hover:bg-gray-50 border-b border-gray-100">
          <span className="font-medium text-gray-800">Help & Support</span>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
        <button onClick={handleLogout} className="w-full p-4 flex items-center text-left hover:bg-red-50 text-[#E53E3E]">
          <LogOut size={18} className="mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;
