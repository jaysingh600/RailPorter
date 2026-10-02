import React from 'react';
import { Link } from 'react-router-dom';

const BecomePorterCTA = () => {
  return (
    <section className="py-24 bg-[#1A365D] relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#0B192C] rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#0B192C] rounded-full blur-3xl opacity-50"></div>
      
      <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Earn by helping railway passengers.
        </h2>
        <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
          Join the RailPorter network. Get a digital identity, find customers easily at your station, and increase your daily earnings.
        </p>
        <Link 
          to="/porter/register"
          className="inline-block bg-white text-[#1A365D] px-8 py-4 rounded-md text-lg font-bold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
        >
          Register as a Porter
        </Link>
      </div>
    </section>
  );
};

export default BecomePorterCTA;
