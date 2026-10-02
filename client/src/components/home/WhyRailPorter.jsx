import React from 'react';
import { BadgeCheck, Search, IndianRupee, Clock, History, Star } from 'lucide-react';

const WhyRailPorter = () => {
  const features = [
    {
      icon: <BadgeCheck className="text-[#38A169] w-6 h-6" />,
      title: 'Verified Porters',
      desc: 'Every porter undergoes a strict background check and verification process.'
    },
    {
      icon: <Search className="text-[#1A365D] w-6 h-6" />,
      title: 'Platform-Based Search',
      desc: 'Find porters precisely where you need them, down to the platform number.'
    },
    {
      icon: <IndianRupee className="text-[#0B192C] w-6 h-6" />,
      title: 'Transparent Pricing',
      desc: 'No more haggling. Get clear, upfront estimates based on luggage quantity.'
    },
    {
      icon: <Clock className="text-[#E53E3E] w-6 h-6" />,
      title: 'Real-Time Status',
      desc: 'Track your booking status instantly from pending to completed.'
    },
    {
      icon: <History className="text-[#1A365D] w-6 h-6" />,
      title: 'Digital History',
      desc: 'Keep track of all your past trips and payments securely in one place.'
    },
    {
      icon: <Star className="text-[#38A169] w-6 h-6" />,
      title: 'Ratings & Reviews',
      desc: 'Book with confidence based on genuine ratings from other passengers.'
    }
  ];

  return (
    <section className="py-20 bg-[#F7FAFC]">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B192C] mb-4">Why Choose RailPorter?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">We bring transparency, reliability, and ease to railway luggage assistance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-6">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{feat.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyRailPorter;
