import React from 'react';
import { Link } from 'react-router-dom';
import { Train, Mail, Link as LinkIcon, Share2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0B192C] text-gray-300 pt-16 pb-8 mt-auto border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-white mb-4">
              <Train className="text-[#38A169]" />
              <span>RAILPORTER</span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Making railway travel seamless by connecting passengers with trusted, verified porters instantly.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors"><Share2 size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><LinkIcon size={20} /></a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-[#38A169] transition-colors">About Us</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-[#38A169] transition-colors">How It Works</Link></li>
              <li><Link to="/contact" className="hover:text-[#38A169] transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/find-porter" className="hover:text-[#38A169] transition-colors">Find a Porter</Link></li>
              <li><Link to="/porter/register" className="hover:text-[#38A169] transition-colors">Become a Porter</Link></li>
              <li><Link to="/help" className="hover:text-[#38A169] transition-colors">Help Center</Link></li>
            </ul>
          </div>
          
          {/* Contact & Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm mb-4">
              <li className="flex items-center space-x-2"><Mail size={16} /> <span>support@railporter.com</span></li>
            </ul>
            <div className="flex flex-col space-y-2 text-sm mt-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} RailPorter. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Designed for seamless journeys.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
