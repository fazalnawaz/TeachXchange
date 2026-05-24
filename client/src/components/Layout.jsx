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

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const userRole = localStorage.getItem('userRole') || 'learner';

  const navItems = {
    learner: [
      { path: '/dashboard', icon: Home, label: 'Dashboard' },
      { path: '/profile', icon: User, label: 'My Profile' },
      { path: '/add-skill', icon: BookOpen, label: 'Add Skill' },
      { path: '/skill-verification', icon: Award, label: 'Verification' },
      { path: '/browse', icon: Search, label: 'Find Match' },
      { path: '/sessions', icon: Video, label: 'My Sessions' },
      { path: '/messages', icon: MessageCircle, label: 'Messages' },
      { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    ],
    teacher: [
      { path: '/dashboard', icon: Home, label: 'Dashboard' },
      { path: '/profile', icon: User, label: 'My Profile' },
      { path: '/add-skill', icon: BookOpen, label: 'Add Skill' },
      { path: '/skill-verification', icon: Award, label: 'Verification' },
      { path: '/sessions', icon: Video, label: 'My Sessions' },
      { path: '/messages', icon: MessageCircle, label: 'Messages' },
      { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    ],
    admin: [
      { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
      { path: '/admin/users', icon: User, label: 'Manage Users' },
      { path: '/admin/reports', icon: Trophy, label: 'Reports' },
    ],
  };

  const currentNav = navItems[userRole] || navItems.learner;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-slate-900 transition-colors duration-300">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 w-72 h-screen bg-white shadow-xl transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 dark:bg-gray-900 dark:border-gray-800
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Zap className="text-white" size={20} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                TeachXchange
              </span>
            </Link>
            <p className="text-xs text-gray-500 mt-2">Learn. Teach. Exchange.</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-r-4 border-purple-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info Footer */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-4 p-2 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{localStorage.getItem('userName') || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="sticky top-0 z-30 flex items-center justify-end gap-3 px-4 py-3 lg:px-8 bg-gradient-to-b from-gray-50/95 to-transparent dark:from-gray-900/95 backdrop-blur-sm">
          <NotificationBell />
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-gray-600" />}
          </button>
        </div>
        <div className="container mx-auto px-4 pb-8 lg:px-8 -mt-2">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;