import React, { useState } from 'react';
import { Heart, Smartphone, Moon, AlertCircle, RefreshCw } from 'lucide-react';

const SmartSummary: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-6 transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Your Wellbeing Snapshot</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            AI-powered insights to help you thrive
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
            <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">Positive Mood</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your routines are working well - keep it up!
            </p>
          </div>
        </div>
        
        <div className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
            <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">Digital Balance</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Evening screen time may affect your sleep
            </p>
          </div>
        </div>
        
        <div className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-3">
            <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">Restful Sleep</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your bedtime routine is effective - well done!
            </p>
          </div>
        </div>
        
        <div className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full mr-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">Stress Signals</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Try relaxing activities before bedtime
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">
          Why this matters
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          We help you understand how daily habits affect your wellbeing, so you can make small changes for big improvements in how you feel every day.
        </p>
      </div>
    </div>
  );
};

export default SmartSummary;