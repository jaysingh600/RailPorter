import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Train, Menu, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Find Porter', path: (user && user.role === 'passenger') ? '/passenger/find-porter' : '/login' },
    { name: 'Become a Porter', path: '/porter/register' },
  ];

  const isHomePage = location.pathname === '/';
  const navBgClass = (isScrolled || !isHomePage) 
    ? 'bg-brand-navy/95 backdrop-blur-md shadow-glass py-3 border-b border-white/5' 
    : 'bg-transparent py-6';

  const positionClass = isHomePage ? 'fixed' : 'sticky top-0';

  return (
    <nav className={`${positionClass} w-full z-50 transition-all duration-300 ${navBgClass}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-2xl font-display font-bold text-white group">
          <div className="bg-gradient-to-tr from-rail-red to-rose-500 p-2 rounded-lg shadow-glow group-hover:scale-105 transition-transform">
            <Train className="text-white" size={24} />
          </div>
          <span className="tracking-tight">RAIL<span className="text-rail-red">PORTER</span></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 text-gray-300">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="hover:text-white transition-colors">
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons Desktop */}
        <div className="hidden md:flex items-center space-x-4 text-sm font-medium">
          {!user ? (
            <>
              <Link to="/login" className="text-white hover:text-rail-red transition-colors font-medium">Login</Link>
              <Link to="/register" className="btn-danger shadow-glow">Sign Up</Link>
            </>
          ) : (
            <>
              <NotificationBell />
              <Link to={`/${user.role}/dashboard`} className="text-white hover:text-gray-300">Dashboard</Link>
              <button onClick={handleLogout} className="text-white hover:text-red-400 transition-colors">Logout</button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0B192C]/95 backdrop-blur-lg border-t border-white/10 shadow-2xl absolute w-full left-0 top-full">
          <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="text-gray-300 hover:text-white text-lg block py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {/* Mobile Auth Buttons */}
            <div className="h-px bg-gray-700 my-2"></div>
            {!user ? (
              <div className="flex flex-col space-y-3 pt-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center text-white py-2 border border-gray-600 rounded-md">Login</Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-center bg-[#38A169] text-white py-2 rounded-md">Sign Up</Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 pt-2">
                <div className="flex justify-center mb-2"><NotificationBell /></div>
                <Link to={`/${user.role}/dashboard`} onClick={() => setIsMobileMenuOpen(false)} className="text-center text-white py-2 border border-gray-600 rounded-md">Dashboard</Link>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-center bg-[#E53E3E] text-white py-2 rounded-md">Logout</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
