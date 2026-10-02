import React from 'react';
import { LifeBuoy, AlertTriangle, FileText, ExternalLink, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PassengerHelpTab = () => {
  const faqs = [
    { q: 'How is the fare calculated?', a: 'Fare is based on the porter\'s base rate plus charges for additional luggage pieces.' },
    { q: 'Can I cancel my booking?', a: 'Yes, you can cancel freely before the porter reaches your platform.' },
    { q: 'How do I identify my porter?', a: 'You can check the porter\'s profile photo in the active booking tab. Verified porters wear an official badge.' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Help & Support</h2>
      <p className="text-gray-500 mb-6">How can we assist you today?</p>

      {/* Quick Support Blocks */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 hover:bg-blue-100 transition-colors cursor-pointer flex flex-col items-center text-center">
          <LifeBuoy size={28} className="text-blue-600 mb-3" />
          <h3 className="font-bold text-gray-900 text-sm">Contact Us</h3>
          <p className="text-[10px] text-gray-500 mt-1">24/7 Chat Support</p>
        </div>
        <Link to="/passenger/report-issue" className="bg-orange-50 border border-orange-100 rounded-xl p-5 hover:bg-orange-100 transition-colors cursor-pointer flex flex-col items-center text-center block">
          <AlertTriangle size={28} className="text-orange-600 mb-3" />
          <h3 className="font-bold text-gray-900 text-sm">Report Issue</h3>
          <p className="text-[10px] text-gray-500 mt-1">Lost luggage, disputes</p>
        </Link>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center">
          <FileText size={18} className="text-gray-400 mr-2" />
          <h3 className="font-bold text-gray-800">Frequently Asked Questions</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
              <summary className="flex justify-between items-center font-medium text-gray-900">
                {faq.q}
                <span className="transition group-open:rotate-90">
                  <ChevronRight size={18} className="text-gray-400" />
                </span>
              </summary>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* External Links */}
      <div className="space-y-3 mt-8">
        <button className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center text-left hover:bg-gray-50">
          <span className="font-medium text-gray-800">Cancellation Policy</span>
          <ExternalLink size={16} className="text-gray-400" />
        </button>
        <button className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center text-left hover:bg-gray-50">
          <span className="font-medium text-gray-800">Terms of Service</span>
          <ExternalLink size={16} className="text-gray-400" />
        </button>
      </div>

    </div>
  );
};

export default PassengerHelpTab;
