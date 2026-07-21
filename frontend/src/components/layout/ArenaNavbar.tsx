import React, { useState, useEffect } from 'react';
import { Search, Bell, MessageSquare, Menu, X, ChevronDown, User, Trophy, Users, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface ArenaNavbarProps {
  isLoggedIn?: boolean;
}

export const ArenaNavbar: React.FC<ArenaNavbarProps> = ({ isLoggedIn = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Tournaments', path: '/tournaments' },
    { name: 'Teams', path: '/teams' },
    { name: 'Leaderboards', path: '/leaderboards' },
    { name: 'Community', path: '/community' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${
        isScrolled
          ? 'bg-[#0A0A0A]/85 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-white/5'
          : 'bg-[#0A0A0A] border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-1 group">
              <span className="text-2xl font-black tracking-tighter text-white uppercase group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-300">
                Arena
              </span>
              <span className="text-2xl font-black tracking-tighter text-[#39FF14] uppercase drop-shadow-[0_0_8px_rgba(57,255,20,0.4)] group-hover:drop-shadow-[0_0_12px_rgba(57,255,20,0.7)] transition-all duration-300">
                Hub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-3 py-2 lg:px-4 rounded-lg text-sm lg:text-base font-semibold tracking-wide transition-all duration-300 overflow-hidden group ${
                  isActive(link.path)
                    ? 'text-[#39FF14]'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="relative z-10">{link.name}</span>
                {/* Active Indicator & Hover Glow */}
                <span 
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-t-md bg-[#39FF14] transition-all duration-300 ${
                    isActive(link.path) 
                      ? 'w-1/2 opacity-100 shadow-[0_-2px_8px_rgba(57,255,20,0.8)]' 
                      : 'w-0 opacity-0 group-hover:w-1/3 group-hover:opacity-50'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Right Section (Desktop) */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            
            {/* Action Icons */}
            <div className="flex items-center gap-3 lg:gap-4 border-r border-white/10 pr-4 lg:pr-6">
              <button className="text-gray-400 hover:text-[#39FF14] transition-colors duration-300 hover:scale-110 active:scale-95" aria-label="Search">
                <Search size={20} strokeWidth={2.5} />
              </button>
              
              <button className="relative text-gray-400 hover:text-white transition-colors duration-300 hover:scale-110 active:scale-95 group" aria-label="Notifications">
                <Bell size={20} strokeWidth={2.5} className="group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#39FF14] text-[9px] font-bold text-black items-center justify-center border-2 border-[#0A0A0A]">
                    3
                  </span>
                </span>
              </button>

              <button className="text-gray-400 hover:text-white transition-colors duration-300 hover:scale-110 active:scale-95 group" aria-label="Messages">
                <MessageSquare size={20} strokeWidth={2.5} className="group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              </button>
            </div>

            {/* Auth / Profile Area */}
            {isLoggedIn ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsProfileDropdownOpen(false), 200)}
                  className="flex items-center gap-3 p-1 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#39FF14] to-blue-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#0A0A0A] overflow-hidden">
                      <img 
                        src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=0A0A0A" 
                        alt="User Profile" 
                        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-bold text-white leading-tight">AlexPro</span>
                    <span className="text-xs text-[#39FF14] font-medium tracking-wide">Level 42</span>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180 text-[#39FF14]' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <div 
                  className={`absolute right-0 mt-3 w-56 rounded-xl bg-[#111111] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden transition-all duration-300 origin-top-right ${
                    isProfileDropdownOpen 
                      ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto' 
                      : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
                  }`}
                >
                  <div className="py-2">
                    {[
                      { icon: User, label: 'Dashboard' },
                      { icon: Users, label: 'My Teams' },
                      { icon: Trophy, label: 'My Tournaments' },
                      { icon: Settings, label: 'Settings' }
                    ].map((item, idx) => (
                      <button key={idx} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors group">
                        <item.icon size={16} className="text-gray-400 group-hover:text-[#39FF14] transition-colors" />
                        {item.label}
                      </button>
                    ))}
                    <div className="h-px bg-white/10 my-2"></div>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors group">
                      <LogOut size={16} className="text-red-500 group-hover:text-red-400 transition-colors" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button className="px-5 py-2 rounded-lg text-sm font-bold tracking-wide text-white border border-white/20 hover:border-[#39FF14] hover:text-[#39FF14] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#39FF14]">
                  LOGIN
                </button>
                <button className="px-5 py-2 rounded-lg text-sm font-bold tracking-wide text-black bg-[#39FF14] hover:bg-[#32e012] hover:shadow-[0_0_15px_rgba(57,255,20,0.5)] transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white">
                  GET STARTED
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2 focus:outline-none focus:ring-2 focus:ring-[#39FF14] rounded-lg transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu (Slide-out) */}
      <div 
        className={`fixed inset-0 top-[80px] z-40 bg-[#0A0A0A]/95 backdrop-blur-xl md:hidden transition-transform duration-300 ease-in-out border-t border-white/10 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6 overflow-y-auto">
          
          {/* Mobile Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search ArenaHub..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF14] transition-colors"
              aria-label="Search ArenaHub"
            />
          </div>

          {/* Mobile Links */}
          <div className="flex flex-col gap-4 mb-auto">
            {navLinks.map((link, idx) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-xl font-bold tracking-wide py-2 border-b border-white/5 transition-colors ${
                  isActive(link.path) ? 'text-[#39FF14]' : 'text-gray-300 hover:text-white'
                }`}
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Auth/Profile */}
          <div className="pt-8 mt-8 border-t border-white/10 pb-[100px]">
            {isLoggedIn ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#39FF14] to-blue-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#0A0A0A] overflow-hidden">
                      <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=0A0A0A" alt="User" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">AlexPro</h3>
                    <p className="text-[#39FF14] text-sm font-medium">Level 42</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#39FF14]">
                    <User size={18} className="text-[#39FF14]" /> Profile
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#39FF14]">
                    <Settings size={18} className="text-[#39FF14]" /> Settings
                  </button>
                </div>
                <button className="w-full py-4 mt-4 bg-red-500/10 text-red-500 font-bold rounded-xl border border-red-500/20 active:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <button className="w-full py-4 rounded-xl text-lg font-bold tracking-wide text-white border border-white/20 hover:border-[#39FF14] transition-colors focus:outline-none focus:ring-2 focus:ring-[#39FF14]">
                  LOGIN
                </button>
                <button className="w-full py-4 rounded-xl text-lg font-bold tracking-wide text-black bg-[#39FF14] hover:bg-[#32e012] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all focus:outline-none focus:ring-2 focus:ring-white">
                  GET STARTED
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
};

export default ArenaNavbar;
