import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Upload, LayoutDashboard, Brain, Sparkles, ChevronDown, Settings, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import AboutModal from './AboutModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
    <nav className="glass-effect sticky top-0 z-50 border-b border-white/20 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-primary-600 to-blue-600 p-2.5 rounded-2xl shadow-lg">
                <Brain className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold gradient-text">SmartLens</span>
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/50 dark:to-orange-900/50 rounded-full">
                  <Sparkles className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">AI</span>
                </div>
              </div>
            </div>
          </Link>

          {user ? (
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Navigation Links */}
              <Link
                to="/dashboard"
                className={`hidden md:flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  isActive('/dashboard')
                    ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60'
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/upload"
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  isActive('/upload')
                    ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-lg'
                    : 'bg-gradient-to-r from-primary-500 to-blue-500 text-white hover:from-primary-600 hover:to-blue-600 shadow-md hover:shadow-lg'
                }`}
              >
                <Upload className="h-5 w-5" />
                <span className="hidden sm:inline">Upload</span>
              </Link>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-200 group cursor-pointer"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white dark:ring-gray-700">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
                      showDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowDropdown(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-64 card p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mt-2 md:hidden"
                        onClick={() => setShowDropdown(false)}
                      >
                        <LayoutDashboard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dashboard</span>
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-gray-700 dark:text-gray-300 mt-1"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium">Settings</span>
                      </Link>

                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          setShowAboutModal(true);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors text-gray-700 dark:text-gray-300 mt-1"
                      >
                        <HelpCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium">About SmartLens AI</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400 mt-1"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              {/* Theme Toggle for non-logged in users */}
              <ThemeToggle />
              
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 font-semibold transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
    
    {/* About Modal - Outside nav for proper positioning */}
    {showAboutModal && <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />}
  </>
  );
};

export default Navbar;
