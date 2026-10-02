import React from 'react';
import Hero from '../../components/home/Hero';
import BookingSearch from '../../components/home/BookingSearch';
import HowItWorks from '../../components/home/HowItWorks';
import WhyRailPorter from '../../components/home/WhyRailPorter';
import TrustSection from '../../components/home/TrustSection';
import BecomePorterCTA from '../../components/home/BecomePorterCTA';

const Home = () => {
  return (
    <div className="w-full flex flex-col min-h-screen">
      <Hero />
      <BookingSearch />
      <HowItWorks />
      <WhyRailPorter />
      <TrustSection />
      <BecomePorterCTA />
    </div>
  );
};

export default Home;
