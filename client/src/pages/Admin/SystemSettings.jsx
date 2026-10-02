import React, { useEffect, useState } from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const defaultSettings = [
    { key: 'baseFare', label: 'Base Fare (₹)', type: 'number', description: 'Base charge for any porter service', default: 100 },
    { key: 'luggageCharge', label: 'Per Luggage Charge (₹)', type: 'number', description: 'Charge applied per extra piece of luggage', default: 20 },
    { key: 'platformCommission', label: 'Platform Commission (%)', type: 'number', description: 'Percentage taken by the platform per booking', default: 10 },
    { key: 'requestTimeout', label: 'Request Timeout (seconds)', type: 'number', description: 'Time before a porter request expires', default: 120 },
  ];

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      const settingsMap = {};
      res.data.data.forEach(setting => {
        settingsMap[setting.key] = setting.value;
      });
      
      // Merge with defaults
      const merged = {};
      defaultSettings.forEach(ds => {
        merged[ds.key] = settingsMap[ds.key] !== undefined ? settingsMap[ds.key] : ds.default;
      });
      
      setSettings(merged);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key, description) => {
    try {
      setIsSaving(true);
      await api.put(`/admin/settings/${key}`, { 
        value: Number(settings[key]),
        description
      });
      toast.success('Setting saved successfully');
    } catch (error) {
      toast.error('Failed to save setting');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
        <p className="text-sm text-gray-500 mt-1">Configure global platform rules and pricing dynamics.</p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex items-start">
        <AlertCircle className="text-yellow-500 mr-3 shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-yellow-800">
          <strong>Warning:</strong> Changes to pricing configurations only apply to new bookings. Active and historical bookings will retain their originally calculated fares to prevent data inconsistencies.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {defaultSettings.map((setting) => (
          <div key={setting.key} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-base font-bold text-gray-900">{setting.label}</h4>
              <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <input
                type={setting.type}
                value={settings[setting.key]}
                onChange={(e) => handleChange(setting.key, e.target.value)}
                className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-right font-mono"
              />
              <button 
                onClick={() => handleSave(setting.key, setting.description)}
                disabled={isSaving}
                className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Save size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemSettings;
