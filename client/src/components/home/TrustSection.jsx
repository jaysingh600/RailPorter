import React from 'react';
import { ShieldCheck, HeartHandshake, Headset } from 'lucide-react';

const TrustSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B192C] mb-6 leading-tight">
              Your luggage deserves <span className="text-[#E53E3E]">reliable hands.</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We understand the anxiety of managing heavy luggage in crowded railway stations. RailPorter ensures you only connect with trustworthy individuals dedicated to providing safe and efficient service.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <ShieldCheck className="text-[#38A169] mt-1 mr-4 shrink-0" size={24} />
                <div>
                  <h4 className="text-lg font-bold text-gray-800">Secure Booking</h4>
                  <p className="text-gray-600">Your data and bookings are securely managed.</p>
                </div>
              </div>
              <div className="flex items-start">
                <HeartHandshake className="text-[#1A365D] mt-1 mr-4 shrink-0" size={24} />
                <div>
                  <h4 className="text-lg font-bold text-gray-800">Transparent Fare</h4>
                  <p className="text-gray-600">No hidden charges or last-minute surprises.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Headset className="text-[#0B192C] mt-1 mr-4 shrink-0" size={24} />
                <div>
                  <h4 className="text-lg font-bold text-gray-800">Support Available</h4>
                  <p className="text-gray-600">We are here to assist if anything goes wrong.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="bg-[#F7FAFC] rounded-2xl p-8 border border-gray-100 relative">
              <div className="absolute top-4 left-4 w-20 h-20 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
              <div className="absolute bottom-4 right-4 w-24 h-24 bg-green-100 rounded-full blur-2xl opacity-50"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-4 py-8">
                 <ShieldCheck className="text-[#38A169] w-16 h-16" />
                 <h3 className="text-2xl font-bold text-[#0B192C]">100% Verified Network</h3>
                 <p className="text-gray-600 max-w-sm">
                   We meticulously verify every porter on our platform to ensure a safe environment for all passengers.
                 </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TrustSection;
