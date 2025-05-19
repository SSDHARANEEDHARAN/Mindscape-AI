import React from 'react';
import { Brain, Activity, MessageSquare, Share2, BarChart2 } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 className="h-4 w-4 mr-2" /> },
    { id: 'mood', label: 'Mood', icon: <Brain className="h-4 w-4 mr-2" /> },
    { id: 'health', label: 'Health', icon: <Activity className="h-4 w-4 mr-2" /> },
    { id: 'social', label: 'Social', icon: <Share2 className="h-4 w-4 mr-2" /> },
    { id: 'chatbot', label: 'AI Assistant', icon: <MessageSquare className="h-4 w-4 mr-2" /> },
    { id: 'Admin', label: 'Admin Controls', icon: <MessageSquare className="h-4 w-4 mr-2" /> },
    { id: 'Watchs', label: '3D Live Prview', icon: <MessageSquare className="h-4 w-4 mr-2" /> }
  ];
  
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex space-x-1 min-w-max">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-all duration-300 ${
              activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-md transform scale-105' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;