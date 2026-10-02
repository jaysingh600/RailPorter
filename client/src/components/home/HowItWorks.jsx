import React from 'react';
import { MapPin, UserCheck, CalendarCheck, ShieldCheck } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <MapPin className="text-[#E53E3E] w-8 h-8" />,
      title: '1. Select Station',
      desc: 'Enter your railway station, platform number, and drop-off point.'
    },
    {
      icon: <UserCheck className="text-[#1A365D] w-8 h-8" />,
      title: '2. Find Porter',
      desc: 'Browse available verified porters near your specific platform.'
    },
    {
      icon: <CalendarCheck className="text-[#38A169] w-8 h-8" />,
      title: '3. Book Porter',
      desc: 'Confirm your booking with transparent, upfront fare estimates.'
    },
    {
      icon: <ShieldCheck className="text-[#0B192C] w-8 h-8" />,
      title: '4. Track & Complete',
      desc: 'Meet your porter, track status, and pay securely upon completion.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B192C] mb-4">How It Works</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Get your luggage moved in four simple steps. We have designed the process to be as fast and stress-free as possible.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line for Desktop */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gray-100 z-0"></div>
          
          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-[#F7FAFC] rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
              <p className="text-gray-600 px-4 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
