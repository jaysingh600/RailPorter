import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const SafetyCenter = () => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Incident Form state
  const [incidentForm, setIncidentForm] = useState({
    bookingId: '', category: 'OTHER', description: ''
  });
  const [activeBookings, setActiveBookings] = useState([]);

  useEffect(() => {
    fetchContacts();
    fetchActiveBookings();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/emergency-contacts');
      setContacts(res.data.data);
    } catch (err) {
      toast.error('Failed to load emergency contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveBookings = async () => {
    try {
      // Find bookings where user might want to report something (recent or active)
      // Since it's shared by passenger and porter, we can just fetch /bookings/passenger or /bookings/porter
      // But we need to know the role. For simplicity, we just fetch from both or assume we have an endpoint.
      // Better: we can let them paste a booking ID, or we fetch their active bookings. 
      // I'll leave the dropdown empty for now and let them type the booking ID to keep it simple and foolproof.
    } catch (err) {}
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      relationship: formData.get('relationship'),
      phone: formData.get('phone'),
      isPrimary: formData.get('isPrimary') === 'on'
    };

    try {
      await api.post('/emergency-contacts', data);
      toast.success('Contact added');
      e.target.reset();
      fetchContacts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add contact');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Delete this emergency contact?')) return;
    try {
      await api.delete(`/emergency-contacts/${id}`);
      toast.success('Contact deleted');
      fetchContacts();
    } catch (err) {
      toast.error('Failed to delete contact');
    }
  };

  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    if (!incidentForm.bookingId || !incidentForm.description) {
      return toast.error('Booking ID and Description are required');
    }
    try {
      await api.post('/emergency/incidents', incidentForm);
      toast.success('Safety incident reported. Our team will review it shortly.');
      setIncidentForm({ bookingId: '', category: 'OTHER', description: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      
      <div className="bg-blue-900 rounded-2xl p-8 text-white shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center"><Shield className="mr-3" size={32} /> Safety Center</h1>
          <p className="mt-2 text-blue-100 max-w-lg">Your safety is our priority. Manage your emergency contacts, read our safety guidelines, or report an incident.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Emergency Contacts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Emergency Contacts</h2>
          
          <div className="space-y-4 mb-6">
            {contacts.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No emergency contacts saved.</p>
            ) : (
              contacts.map(c => (
                <div key={c._id} className={`p-4 rounded-xl border ${c.isPrimary ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'} flex justify-between items-center`}>
                  <div>
                    <h4 className="font-bold text-gray-900 flex items-center">
                      {c.name} {c.isPrimary && <span className="ml-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase">Primary</span>}
                    </h4>
                    <p className="text-sm text-gray-600">{c.relationship} • {c.phone}</p>
                  </div>
                  <button onClick={() => handleDeleteContact(c._id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                </div>
              ))
            )}
          </div>

          {contacts.length < 5 && (
            <form onSubmit={handleAddContact} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <h4 className="font-bold text-sm text-gray-700 mb-2">Add New Contact</h4>
              <input name="name" required placeholder="Full Name" className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input name="relationship" required placeholder="Relationship" className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                <input name="phone" required placeholder="10-digit Phone" pattern="[6-9][0-9]{9}" className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" name="isPrimary" className="mr-2 rounded text-blue-600" />
                Set as Primary Contact
              </label>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-blue-700 transition">Save Contact</button>
            </form>
          )}
        </div>

        {/* Report Incident & Guidelines */}
        <div className="space-y-8">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center">
              <AlertCircle className="mr-2 text-orange-500" size={20} /> Report an Incident
            </h2>
            <form onSubmit={handleSubmitIncident} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Booking ID</label>
                <input 
                  required 
                  value={incidentForm.bookingId}
                  onChange={(e) => setIncidentForm({...incidentForm, bookingId: e.target.value})}
                  placeholder="Paste your Booking ID here" 
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={incidentForm.category}
                  onChange={(e) => setIncidentForm({...incidentForm, category: e.target.value})}
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="MEDICAL">Medical Emergency</option>
                  <option value="THREAT">Threat / Safety Concern</option>
                  <option value="HARASSMENT">Harassment</option>
                  <option value="ACCIDENT">Accident</option>
                  <option value="LUGGAGE_ISSUE">Luggage Issue (Theft/Damage)</option>
                  <option value="PORTER_BEHAVIOUR">Porter Behaviour</option>
                  <option value="PASSENGER_BEHAVIOUR">Passenger Behaviour</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required 
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({...incidentForm, description: e.target.value})}
                  rows="3" 
                  placeholder="Describe what happened in detail..."
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-black transition shadow-sm">
                Submit Report
              </button>
            </form>
          </div>

          <div className="bg-green-50 rounded-2xl shadow-sm border border-green-100 p-6">
            <h3 className="font-bold text-green-900 mb-3">Safety Guidelines</h3>
            <ul className="text-sm text-green-800 space-y-2 list-disc pl-4">
              <li>Always verify the Porter's badge and app profile before handing over luggage.</li>
              <li>Keep your phone accessible during the service.</li>
              <li>Use the SOS button inside the active booking screen only in genuine emergencies.</li>
              <li>Do not leave valuable personal items (like laptops/jewelry) inside generic luggage.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SafetyCenter;
