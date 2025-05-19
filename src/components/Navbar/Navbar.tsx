import React, { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Brain, Settings, User, Moon, Sun, 
  MessageSquare, LogOut, ChevronRight, 
  Home, BarChart2, HeartPulse, Smartphone
} from 'lucide-react';
import { useUser } from '../hooks/useUser';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

interface NavItemProps {
  to?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

const clearStoredMessages = (userId: string | undefined) => {
  if (userId) {
    // Clear chat messages
    localStorage.removeItem(`mindscape_chat_${userId}`);
    // Clear mood analysis cache
    localStorage.removeItem(`mindscape_mood_analysis_${userId}`);
    localStorage.removeItem(`mindscape_mood_nlm_${userId}`);
    localStorage.removeItem(`mindscape_mood_dataset_${userId}`);
    // Clear any other user-specific cache
  }
};

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  const { isOnboarded, userData, logout } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = useCallback(() => {
    clearStoredMessages(userData?.id);
    logout();
    navigate('/', { replace: true });
    window.location.reload();
  }, [logout, navigate, userData?.id]);

  // Check if current route is active
  const isActiveRoute = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/overview');
    }
    return location.pathname.startsWith(path);
  };

  const NavItem: React.FC<NavItemProps> = React.memo(({ 
    to, 
    icon: Icon, 
    label, 
    onClick,
    isActive = false
  }) => {
    const isHovered = hoveredItem === label;
    const active = isActive || (to ? isActiveRoute(to) : false);
    
    const content = (
      <div className={`flex items-center p-3 rounded-lg transition-all duration-200
        ${isHovered || active ? 
          'bg-blue-500/20 shadow-md' : 
          'hover:bg-gray-100/10'}
      `}>
        <Icon className={`h-5 w-5 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
        {isSidebarOpen && (
          <span className={`ml-3 text-sm font-medium ${darkMode ? 'text-white' : 'text-blue-900'}`}>
            {label}
          </span>
        )}
      </div>
    );

    return (
      <div 
        className="relative mb-1"
        onMouseEnter={() => setHoveredItem(label)}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={onClick}
      >
        {to ? (
          <Link to={to}>
            {content}
          </Link>
        ) : (
          <div className="cursor-pointer">
            {content}
          </div>
        )}
        
        {!isSidebarOpen && isHovered && (
          <div className={`absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 
            ${darkMode ? 'bg-gray-800' : 'bg-white'} 
            text-sm font-medium rounded-md shadow-xl z-50 whitespace-nowrap
            ${darkMode ? 'text-white' : 'text-blue-900'}`}
          >
            {label}
            <div className={`absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 
              border-t-4 border-b-4 border-l-0 border-r-8 
              ${darkMode ? 'border-r-gray-800' : 'border-r-white'}
              border-t-transparent border-b-transparent`} 
            />
          </div>
        )}
      </div>
    );
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  return (
    <>
      {/* Edge Trigger Area */}
      {!isSidebarOpen && (
        <div 
          className={`fixed top-1/2 left-0 w-1 h-32 rounded-r-lg transition-all duration-300 cursor-pointer z-40
            ${darkMode ? 'bg-blue-500/70 hover:bg-blue-400' : 'bg-blue-600/70 hover:bg-blue-500'}
          `}
          style={{ marginTop: '-64px' }}
          onMouseEnter={toggleSidebar}
          aria-label="Open navigation menu"
        />
      )}
      
      {/* Main Sidebar */}
      {isSidebarOpen && (
        <div
          onMouseLeave={() => setIsSidebarOpen(false)}
          className={`fixed top-0 left-0 h-full w-56 flex flex-col justify-between py-6 px-4 z-50
            ${darkMode ? 'bg-gray-800/95 backdrop-blur-sm' : 'bg-blue-50/95 backdrop-blur-sm'}
            border-r ${darkMode ? 'border-gray-700' : 'border-blue-200'}
            shadow-2xl transition-all duration-300
          `}
        >
          <div>
            {/* Logo/Header Area */}
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center">
                <Brain className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                {isSidebarOpen && (
                  <span className={`ml-3 text-lg font-semibold ${darkMode ? 'text-white' : 'text-blue-900'}`}>
                    MindScape
                  </span>
                )}
              </div>
              <button 
                onClick={toggleSidebar}
                className={`p-1 rounded-full hover:bg-white/10 transition-colors
                  ${darkMode ? 'text-gray-300' : 'text-blue-600'}
                `}
                aria-label="Close navigation menu"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1" aria-label="Main navigation">
              {/* Show Home ONLY when logged out */}
              {!isOnboarded && (
                <NavItem to="/" icon={Home} label="Home" />
              )}
              
              {/* Show these only when logged in */}
              {isOnboarded && (
                <>
                  <NavItem to="/dashboard/overview" icon={BarChart2} label="Overview" />
                  <NavItem to="/dashboard/mood" icon={Brain} label="Mood" />
                  <NavItem to="/dashboard/health" icon={HeartPulse} label="Health" />
                  <NavItem to="/dashboard/social" icon={User} label="Social" />
                  <NavItem to="/dashboard/chatbot" icon={MessageSquare} label="AI Chat" />
                  <NavItem to="/dashboard/Watchs" icon={Smartphone} label="Smart Watch" />
                </>
              )}
            </nav>
          </div>

          {/* Bottom Section */}
          <div className="space-y-4">
            {isOnboarded && (
              <NavItem to="/dashboard/Admin" icon={Settings} label="Admin Profile" />
            )}
            
            <div className={`pt-4 ${darkMode ? 'border-t border-gray-700/50' : 'border-t border-blue-200/50'}`}>
              <div className="flex items-center justify-between mb-4 px-2">
                <button 
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-full transition-all duration-200
                    ${darkMode ? 'hover:bg-gray-700/50 text-yellow-300' : 'hover:bg-blue-100 text-blue-600'}
                  `}
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
                
                {isOnboarded && (
                  <button 
                    onClick={handleLogout}
                    className={`flex items-center p-2 rounded-full transition-colors
                      ${darkMode ? 'hover:bg-gray-700/50 text-red-400' : 'hover:bg-blue-100 text-red-500'}
                    `}
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                    {isSidebarOpen && (
                      <span className="ml-2 text-sm font-medium">
                        Logout
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div> 
      )}
    </>
  );
};

export default React.memo(Navbar);