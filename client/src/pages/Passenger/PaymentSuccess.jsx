import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const { txnId } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await api.get(`/payments/${txnId}`);
        setReceipt(res.data.data);
      } catch (error) {
        toast.error('Failed to load receipt');
        navigate('/passenger/dashboard');
      }
    };
    fetchReceipt();
  }, [txnId, navigate]);

  if (!receipt) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div></div>;
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4 flex flex-col items-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
        <CheckCircle size={48} className="text-[#38A169]" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
      <p className="text-gray-500 text-center mb-8">Your transaction has been securely processed.</p>

      {/* Receipt Ticket */}
      <div className="bg-white w-full rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative mb-8">
        
        {/* Ticket cutouts */}
        <div className="absolute top-1/2 -left-4 w-8 h-8 bg-gray-50 rounded-full border-r border-gray-100"></div>
        <div className="absolute top-1/2 -right-4 w-8 h-8 bg-gray-50 rounded-full border-l border-gray-100"></div>
        
        <div className="p-6 border-b border-dashed border-gray-200 text-center">
          <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
          <p className="text-4xl font-bold text-gray-900">₹{receipt.amount}</p>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Transaction ID</span>
            <span className="font-mono font-medium text-gray-800">{receipt.transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span className="font-medium text-gray-800">{new Date(receipt.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Method</span>
            <span className="font-medium text-gray-800">{receipt.method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Porter</span>
            <span className="font-medium text-gray-800">{receipt.booking?.porter?.name}</span>
          </div>
        </div>
      </div>

      <div className="w-full space-y-3">
        <button className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold flex justify-center items-center hover:bg-gray-50 transition-colors">
          <Download size={18} className="mr-2" /> Download Receipt
        </button>
        <Link to="/passenger/payments" className="w-full bg-[#0B192C] text-white py-3 rounded-xl font-bold flex justify-center items-center hover:bg-[#1A365D] transition-colors">
          View Transaction History
        </Link>
        <Link to="/passenger/dashboard" className="w-full btn-primary py-3 flex justify-center items-center shadow-lg">
          Back to Dashboard <ArrowRight size={18} className="ml-2" />
        </Link>
      </div>

    </div>
  );
};

export default PaymentSuccess;
