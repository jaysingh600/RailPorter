import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, Star } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Hero = () => {
  const { user } = useContext(AuthContext);
  const findPorterRoute = (user && user.role === 'passenger') ? '/passenger/find-porter' : '/login';

  return (
    <section className="relative bg-brand-navy text-white pt-40 pb-48 px-4 overflow-hidden">
      {/* Premium Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-navy via-[#112240] to-brand-navy"></div>
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-rail-red/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-1/4 w-[30rem] h-[30rem] bg-brand-accent/20 rounded-full blur-[120px] pointer-events-none animation-delay-2000"></div>
      
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>
      
      <div className="container mx-auto max-w-6xl relative z-10 text-center flex flex-col items-center">
        
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-white/20 animate-slide-up">
          <Star className="text-rail-orange w-4 h-4 fill-current" />
          <span className="text-sm font-medium tracking-wide">India's #1 Railway Porter Network</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-extrabold mb-6 leading-tight tracking-tight animate-slide-up" style={{ animationDelay: '100ms' }}>
          Travel Light, <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rail-red via-rose-400 to-rail-orange">
            Travel Right.
          </span>
        </h1>
        
        <p className="text-lg md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light animate-slide-up" style={{ animationDelay: '200ms' }}>
          Skip the hassle of heavy luggage. Find verified railway porters instantly at your platform. Safe, transparent, and hassle-free.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 w-full animate-slide-up" style={{ animationDelay: '300ms' }}>
          <Link 
            to={findPorterRoute} 
            className="w-full sm:w-auto btn-danger text-lg px-8 py-4 flex items-center justify-center group"
          >
            Find a Porter Now
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </Link>
          <Link 
            to="/porter/register" 
            className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white/20 hover:border-white/40 transition-all duration-300"
          >
            Join as Porter
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center space-x-3 text-gray-300 justify-center">
            <ShieldCheck className="w-6 h-6 text-rail-green" />
            <span className="font-medium">100% Verified Porters</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-300 justify-center">
            <Clock className="w-6 h-6 text-rail-orange" />
            <span className="font-medium">Instant Availability</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-300 justify-center">
            <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <span className="font-medium">Transparent Pricing</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
