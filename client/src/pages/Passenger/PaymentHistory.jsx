import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments/passenger/history');
        setPayments(res.data.data);
      } catch (error) {
        toast.error('Failed to load transaction history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0B192C]"></div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center mb-6">
        <Link to="/passenger/dashboard" className="mr-4 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-[#0B192C]">Transaction History</h1>
      </div>

      {payments.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <Clock size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Transactions Yet</h3>
          <p className="text-gray-500">You haven't made any payments for porter services.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map(payment => (
            <div key={payment._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center mb-1">
                    <span className="text-sm font-bold text-gray-900 mr-3">Order #{payment.booking?._id.slice(-6).toUpperCase()}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{payment.transactionId}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#38A169]">₹{payment.amount}</p>
                  <span className={`text-xs font-bold flex items-center justify-end mt-1 ${payment.status === 'SUCCESS' ? 'text-green-600' : 'text-red-500'}`}>
                    {payment.status === 'SUCCESS' ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                    {payment.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3 overflow-hidden border border-gray-200">
                     <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${payment.porter?.name || 'P'}`} alt="Porter" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Service by</p>
                    <p className="font-bold text-gray-800 text-sm">{payment.porter?.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">Method</p>
                  <p className="font-bold text-gray-800 text-sm">{payment.method}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
