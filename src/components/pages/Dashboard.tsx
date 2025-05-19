import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { BarChart2, LineChart, Brain, ArrowUp, ArrowDown, Clock, Minimize, Maximize } from 'lucide-react';
import MoodChart from '../dashboard/MoodChart';
import HealthInsightCard from '../dashboard/HealthInsightCard';
import { ChartType, Widget } from '../types/types';
import MoodForecast from '../dashboard/MoodForecast';
import SmartSummary from '../dashboard/SmartSummary';
import TabNavigation from '../dashboard/TabNavigation';
import SocialMediaAnalysis from '../dashboard/SocialMediaAnalysis';
import MusicSuggestions from '../dashboard/MusicSuggestions';
import DeviceControl from '../dashboard/DeviceControl';
import Chatbot from '../AI chat/Chatbot';
import Watchs from '../3D simulation/SmartWatch';
import Admin from '../Admin/Admin';
import HealthMetrics from '../dashboard/HealthMetrics';
import PersonalizedRemedies from '../dashboard/PersonalizedRemedies';
import { useNavigate, useLocation } from 'react-router-dom';

interface HealthInsight {
  category: string;
  score: number;
  recommendation: string;
}

const Dashboard: React.FC = () => {
  const { userData, moodData } = useUser();
  const [selectedChart, setSelectedChart] = useState<ChartType>('bar');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get initial tab from URL or default to 'overview'
  const getInitialTab = () => {
    const tabFromUrl = location.pathname.split('/').pop();
    const validTabs = ['overview', 'mood', 'health', 'chatbot', 'Watchs', 'Admin', 'social'];
    return validTabs.includes(tabFromUrl) ? tabFromUrl : 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      navigate(`/dashboard/${tab}`);
    }
  };

  // Sync tab state with URL changes (only after initial load)
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }

    const tabFromUrl = location.pathname.split('/').pop();
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [location.pathname]);

  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'mood-analysis', title: 'Mood Analysis', isMinimized: false, position: { x: 0, y: 0 } },
    { id: 'health-insights', title: 'Health Insights', isMinimized: false, position: { x: 0, y: 0 } },
    { id: 'social-media', title: 'Social Media Analysis', isMinimized: false, position: { x: 0, y: 0 } },
    { id: 'remedies', title: 'Personalized Remedies', isMinimized: false, position: { x: 0, y: 0 } },
    { id: 'mood-forecast', title: 'Mood Forecast', isMinimized: false, position: { x: 0, y: 0 } },
    { id: 'music-suggestions', title: 'Music Suggestions', isMinimized: false, position: { x: 0, y: 0 } },
    { id: 'device-control', title: 'Device Control', isMinimized: false, position: { x: 0, y: 0 } },
    { id: 'health-metrics', title: 'Health Metrics', isMinimized: false, position: { x: 0, y: 0 } }
  ]);

  // Mock health insights data
  const healthInsights: HealthInsight[] = [
    {
      category: 'Mental Wellbeing',
      score: Math.round(Math.random() * 30 + 60),
      recommendation: 'Practice mindfulness for 10 minutes daily'
    },
    {
      category: 'Sleep Quality',
      score: Math.round(Math.random() * 40 + 50),
      recommendation: 'Maintain consistent sleep schedule'
    },
    {
      category: 'Physical Activity',
      score: Math.round(Math.random() * 50 + 40),
      recommendation: 'Aim for 30 minutes of exercise daily'
    },
    {
      category: 'Nutrition',
      score: Math.round(Math.random() * 40 + 50),
      recommendation: 'Increase vegetable and water intake'
    }
  ];

  const toggleWidgetMinimize = (id: string) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === id 
          ? { ...widget, isMinimized: !widget.isMinimized } 
          : widget
      )
    );
  };

  const handleChartTypeChange = (type: ChartType) => {
    setSelectedChart(type);
  };

  const renderChartIcon = (type: ChartType, Icon: React.ElementType) => {
    return (
      <button 
        onClick={() => handleChartTypeChange(type)}
        className={`p-2 rounded-lg ${selectedChart === type ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700'}`}
        aria-label={`Switch to ${type} chart`}
      >
        <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
      </button>
    );
  };

  const renderWidgetHeader = (id: string, title: string) => {
    const widget = widgets.find(w => w.id === id);
    if (!widget) return null;
    
    return (
      <div className="flex justify-between items-center mb-4 cursor-move">
        <h2 className="text-lg font-semibold flex items-center">
          {id === 'mood-analysis' && <Brain className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />}
          {id === 'health-insights' && <Brain className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />}
          {title}
        </h2>
        <div className="flex space-x-1">
          <button 
            onClick={() => toggleWidgetMinimize(id)}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={widget.isMinimized ? 'Maximize widget' : 'Minimize widget'}
          >
            {widget.isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
          </button>
        </div>
      </div>
    );
  };

  const renderWidget = (id: string) => {
    const widget = widgets.find(w => w.id === id);
    if (!widget) return null;
    
    if (widget.isMinimized) {
      return (
        <div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6 cursor-pointer hover:shadow-lg transition-shadow" 
          onClick={() => toggleWidgetMinimize(id)}
          aria-label={`Expand ${widget.title} widget`}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{widget.title}</h2>
            <Maximize className="h-4 w-4" />
          </div>
        </div>
      );
    }
    
    switch (id) {
      case 'mood-analysis':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
            {renderWidgetHeader(id, 'Mood Analysis')}
            <>
              <div className="flex space-x-2 mb-4">
                {renderChartIcon('bar', BarChart2)}
                {renderChartIcon('line', LineChart)}
              </div>
              <MoodChart 
                moodData={moodData} 
                chartType={selectedChart} 
                onChartTypeChange={handleChartTypeChange}
                interactive={true}
              />
            </>
          </div>
        );
      
      case 'health-insights':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
            {renderWidgetHeader(id, 'Health Insights')}
            <HealthInsightCard />
          </div>
        );
      
      case 'health-metrics':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
            {renderWidgetHeader(id, 'Health Metrics')}
            <HealthMetrics darkMode={false} />
          </div>
        );
      
      case 'social-media':
        return (
          <div className="mb-6">
            <SocialMediaAnalysis />
          </div>
        );
      
      case 'remedies':
        return <PersonalizedRemedies />;
      
      case 'mood-forecast':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
            {renderWidgetHeader(id, 'Mood Forecast')}
            <MoodForecast />
          </div>
        );
      
      case 'music-suggestions':
        return (
          <div className="mb-6">
            <MusicSuggestions currentMood="happy" />
          </div>
        );
      
      case 'device-control':
        return (
          <div className="mb-6">
            <DeviceControl isAdmin={true} />
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <SmartSummary />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {renderWidget('mood-analysis')}
                {renderWidget('mood-forecast')}
              </div>
              <div>
                {renderWidget('health-metrics')}
                {renderWidget('music-suggestions')}
              </div>
            </div>
          </>
        );
      
      case 'mood':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {renderWidget('mood-analysis')}
              {renderWidget('mood-forecast')}
            </div>
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
                <h2 className="text-lg font-semibold mb-4">Mood Trends</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Weekly Happiness</span>
                    <div className="flex items-center text-green-500">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      <span>{Math.round(Math.random() * 50 + 30)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Stress Level</span>
                    <div className="flex items-center text-red-500">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      <span>{Math.round(Math.random() * 30 + 10)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sadness</span>
                    <div className="flex items-center text-green-500">
                      <ArrowDown className="h-4 w-4 mr-1" />
                      <span>{Math.round(Math.random() * 20 + 5)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Neutral Mood</span>
                    <div className="flex items-center text-gray-500">
                      <ArrowDown className="h-4 w-4 mr-1" />
                      <span>{Math.round(Math.random() * 40 + 20)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
                <h2 className="text-lg font-semibold mb-4">Mood-Based Suggestions</h2>
                <div className="space-y-3">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg">
                    <h3 className="font-medium text-indigo-800 dark:text-indigo-300 text-sm">
                      Suggestion 1
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Practice mindfulness meditation for 10 minutes daily</p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg">
                    <h3 className="font-medium text-indigo-800 dark:text-indigo-300 text-sm">
                      Suggestion 2
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Increase vegetable intake in your meals</p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg">
                    <h3 className="font-medium text-indigo-800 dark:text-indigo-300 text-sm">
                      Suggestion 3
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Maintain consistent sleep schedule</p>
                  </div>
                </div>
              </div>
              {renderWidget('music-suggestions')}
            </div>
          </div>
        );
      
      case 'health':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {renderWidget('health-insights')}
              {renderWidget('remedies')}
            </div>
            <div>
              {renderWidget('health-metrics')}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
                <h2 className="text-lg font-semibold mb-4">Smart Notifications</h2>
                <div className="space-y-3">
                  {healthInsights
                    .filter(insight => insight.score < 70)
                    .map((insight, index) => (
                      <div key={index} className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium">{insight.category} Alert</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{insight.recommendation}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'chatbot':
        return (
          <div className="mb-6">
            <Chatbot />
          </div>
        );

      case 'Watchs':
        return (
          <div className="mb-6">
            <Watchs darkMode={false} />
          </div>
        );   

      case 'Admin':
        return (
          <div className="mb-6">
            <Admin darkMode={false} />
          </div>
        ); 
        
      case 'social':
        return (
          <div>
            {renderWidget('social-media')}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:pl-20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">
            Hello, {userData?.name || 'there'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your mental health overview
          </p>
        </header>
        
        <TabNavigation activeTab={activeTab} setActiveTab={handleTabChange} />
        
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Dashboard;