import React, { useState } from 'react';
import { Radio, Wifi, Monitor, Lock, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface DeviceControlProps {
  isAdmin?: boolean;
}

const DeviceControl: React.FC<DeviceControlProps> = ({ isAdmin = false }) => {
  const [loraStatus, setLoraStatus] = useState('connected');
  const [esp32Status, setEsp32Status] = useState('connected');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate device status check
    setTimeout(() => {
      setLoraStatus(Math.random() > 0.3 ? 'connected' : 'disconnected');
      setEsp32Status(Math.random() > 0.3 ? 'connected' : 'disconnected');
      setIsRefreshing(false);
    }, 1500);
  };
  
  const handleSendMessage = () => {
    if (!message) return;
    
    setIsSending(true);
    
    // Simulate sending message to devices
    setTimeout(() => {
      setMessage('');
      setIsSending(false);
    }, 2000);
  };
  
  const getStatusIcon = (status: string) => {
    if (status === 'connected') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Wifi className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          Device Control
        </h2>
        {!isAdmin && (
          <div className="flex items-center text-amber-600 dark:text-amber-400">
            <Lock className="h-4 w-4 mr-1" />
            <span className="text-xs">Admin only</span>
          </div>
        )}
      </div>
      
      {!isAdmin ? (
        <div className="bg-gray-50 dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          <Lock className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 dark:text-gray-400 mb-3">
            You need admin privileges to control connected devices
          </p>
          <button className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed">
            Request Access
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Radio className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="font-medium">LoRa Module</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs mr-2 capitalize">{loraStatus}</span>
                  {getStatusIcon(loraStatus)}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Long-range data transmission for remote health monitoring
              </p>
              <div className="flex space-x-2">
                <button 
                  className={`text-xs px-3 py-1 rounded-full ${
                    loraStatus === 'connected' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                  }`}
                >
                  Connected
                </button>
                <button className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  Configure
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Monitor className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="font-medium">ESP32 Display</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs mr-2 capitalize">{esp32Status}</span>
                  {getStatusIcon(esp32Status)}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Real-time display of health metrics and mood data
              </p>
              <div className="flex space-x-2">
                <button 
                  className={`text-xs px-3 py-1 rounded-full ${
                    esp32Status === 'connected' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                  }`}
                >
                  Connected
                </button>
                <button className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  Configure
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-2">Send Message to Devices</h3>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message to display on ESP32..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                disabled={isSending}
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !message}
                className={`px-4 py-2 rounded-lg text-white text-sm ${
                  isSending || !message
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } transition duration-200 flex items-center`}
              >
                {isSending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send'
                )}
              </button>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="broadcastAll"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="broadcastAll" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Broadcast to all connected devices
              </label>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
            </button>
            
            <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              View Connection Logs
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DeviceControl;