// src/components/Layout.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  User, 
  BookOpen, 
  Trophy, 
  MessageCircle, 
  Video, 
  Search, 
  LogOut,
  Menu,
  X,
  Zap,
  Award,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import AchievementListener from './AchievementListener';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  // Standard user navigation (applies to all non-admin users)
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/profile', icon: User, label: 'My Profile' },
    { path: '/add-skill', icon: BookOpen, label: 'Add Skill' },
    { path: '/skill-verification', icon: Award, label: 'Verification' },
    { path: '/browse', icon: Search, label: 'Find Match' },
    { path: '/sessions', icon: Video, label: 'My Sessions' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-slate-900 transition-colors duration-300">
      <AchievementListener />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 w-72 h-screen bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 ease-out overflow-y-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 dark:border-r dark:border-gray-700
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Zap className="text-white" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block truncate">
                  TeachXchange
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Learn • Teach • Exchange</p>
              </div>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                  title={item.label}
                >
                  <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400'}`} />
                  <span className={`font-medium truncate ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                  {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-white"></div>}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <User size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{localStorage.getItem('userName') || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">TeachXchange User</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-medium group"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-4 lg:px-8 bg-gradient-to-b from-white dark:from-gray-800 to-white/50 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <div className="hidden lg:block flex-1" />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;