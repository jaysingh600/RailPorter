import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, Banknote, ShieldCheck, FileText } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [method, setMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${id}`);
        const data = res.data.data;
        if (data.status !== 'COMPLETED') {
          toast.error('Booking is not yet completed');
          navigate('/passenger/dashboard');
        } else if (data.paymentStatus === 'PAID') {
          toast.success('This booking is already paid');
          navigate('/passenger/dashboard');
        } else {
          setBooking(data);
        }
      } catch (error) {
        toast.error('Failed to fetch booking details');
        navigate('/passenger/dashboard');
      }
    };
    fetchBooking();
  }, [id, navigate]);

  const handlePayment = async () => {
    if (!method) {
      toast.error('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.post('/payments/process', {
        bookingId: id,
        method
      });
      
      const { transactionId } = res.data.data || res.data;
      navigate(`/passenger/payment-success/${transactionId || id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
      setIsProcessing(false);
    }
  };

  if (!booking) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  }

  // The backend locks the final fare when marking COMPLETED
  // We use finalTotal if available, else fallback to estimatedTotal visually (backend still enforces)
  const fareToPay = booking.fare?.finalTotal || booking.fare?.estimatedTotal || 0;

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 font-medium mb-6">
        <ArrowLeft size={20} className="mr-2" /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Payment</h1>

      {/* Fare Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
            <span className="text-gray-500 text-sm">Booking ID</span>
            <span className="font-mono font-bold text-gray-800">#{booking._id.slice(-6).toUpperCase()}</span>
          </div>
          
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4 border border-green-200 overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.porter?.name || 'P'}`} alt="Porter" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Service provided by</p>
              <p className="font-bold text-gray-900">{booking.porter?.name}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
              <FileText size={14} className="mr-1" /> Fare Breakdown
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Base Fare</span>
                <span>₹{booking.fare?.baseFare || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Luggage Charge ({booking.luggageDetails?.count}x {booking.luggageDetails?.type})</span>
                <span>₹{booking.fare?.additionalLuggage || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>₹{booking.fare?.serviceCharge || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end bg-[#0B192C] text-white p-6">
          <span className="font-bold text-gray-300 text-lg">Final Fare</span>
          <span className="text-3xl font-bold text-[#38A169]">₹{fareToPay}</span>
        </div>
      </div>

      {/* Payment Methods */}
      <h3 className="font-bold text-gray-800 mb-3">Select Payment Method</h3>
      <div className="space-y-3 mb-8">
        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${method === 'UPI' ? 'border-[#0B192C] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
          <input type="radio" name="paymentMethod" value="UPI" className="sr-only" onChange={(e) => setMethod(e.target.value)} />
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${method === 'UPI' ? 'border-[#0B192C]' : 'border-gray-300'}`}>
            {method === 'UPI' && <div className="w-3 h-3 bg-[#0B192C] rounded-full"></div>}
          </div>
          <Smartphone size={24} className={method === 'UPI' ? 'text-[#0B192C]' : 'text-gray-400'} />
          <span className="ml-3 font-bold text-gray-800">UPI (GPay, PhonePe, Paytm)</span>
        </label>
        
        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${method === 'ONLINE' ? 'border-[#0B192C] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
          <input type="radio" name="paymentMethod" value="ONLINE" className="sr-only" onChange={(e) => setMethod(e.target.value)} />
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${method === 'ONLINE' ? 'border-[#0B192C]' : 'border-gray-300'}`}>
            {method === 'ONLINE' && <div className="w-3 h-3 bg-[#0B192C] rounded-full"></div>}
          </div>
          <CreditCard size={24} className={method === 'ONLINE' ? 'text-[#0B192C]' : 'text-gray-400'} />
          <span className="ml-3 font-bold text-gray-800">Credit / Debit Card</span>
        </label>

        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${method === 'CASH' ? 'border-[#0B192C] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
          <input type="radio" name="paymentMethod" value="CASH" className="sr-only" onChange={(e) => setMethod(e.target.value)} />
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${method === 'CASH' ? 'border-[#0B192C]' : 'border-gray-300'}`}>
            {method === 'CASH' && <div className="w-3 h-3 bg-[#0B192C] rounded-full"></div>}
          </div>
          <Banknote size={24} className={method === 'CASH' ? 'text-[#0B192C]' : 'text-gray-400'} />
          <span className="ml-3 font-bold text-gray-800">Pay with Cash to Porter</span>
        </label>
      </div>

      <button 
        onClick={handlePayment} 
        disabled={isProcessing || !method}
        className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg flex justify-center items-center ${isProcessing || !method ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-[#38A169] hover:bg-green-600 shadow-green-200/50'}`}
      >
        {isProcessing ? 'Processing securely...' : `Pay ₹${fareToPay}`}
      </button>
      
      <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center">
        <ShieldCheck size={14} className="mr-1 text-green-500" /> 100% Secure Encrypted Payment via RailPorter
      </p>
    </div>
  );
};

export default Payment;
