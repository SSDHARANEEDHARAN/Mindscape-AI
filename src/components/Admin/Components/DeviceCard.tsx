import React, { useState } from 'react';
import { Device } from './types';
import { Wifi, WifiOff, AlertTriangle, Check, ChevronDown, ChevronUp, Terminal, Activity, Battery, Thermometer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeviceCardProps {
  device: Device;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (device.status) {
      case 'CONNECTED':
        return <Wifi className="w-5 h-5 text-green-500" />;
      case 'DISCONNECTED':
        return <WifiOff className="w-5 h-5 text-red-500" />;
      case 'ERROR':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getHealthColor = () => {
    switch (device.health) {
      case 'HEALTHY':
        return 'bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800';
      case 'CAUTION':
        return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800';
      case 'CRITICAL':
        return 'bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <motion.div 
      className={`p-4 rounded-lg shadow-lg border ${getHealthColor()} transition-all duration-300`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold dark:text-white">{device.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{device.type}</p>
        </div>
        {getStatusIcon()}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm dark:text-gray-300">Last Response: {device.lastResponse}</p>
          <p className="text-sm dark:text-gray-300">
            Signal: {device.signalStrength}%
          </p>
        </div>
        
        <div className="flex items-center mt-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
            <motion.div 
              className="h-2 bg-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${device.signalStrength}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {device.configurationComplete && (
          <div className="flex items-center text-green-500 mt-2">
            <Check className="w-4 h-4 mr-1" />
            <span className="text-sm">Configuration Complete</span>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 flex items-center justify-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Show Details
            </>
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center text-sm">
                    <Activity className="w-4 h-4 mr-2" />
                    <span>Uptime: {device.diagnostics.uptime}</span>
                  </div>
                  {device.diagnostics.batteryLevel && (
                    <div className="flex items-center text-sm">
                      <Battery className="w-4 h-4 mr-2" />
                      <span>Battery: {device.diagnostics.batteryLevel}%</span>
                    </div>
                  )}
                  {device.diagnostics.temperature && (
                    <div className="flex items-center text-sm">
                      <Thermometer className="w-4 h-4 mr-2" />
                      <span>Temperature: {device.diagnostics.temperature}°C</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Terminal className="w-4 h-4 mr-2" />
                    <h4 className="text-sm font-semibold">Recent Logs</h4>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 max-h-32 overflow-y-auto">
                    {device.logs.map((log, index) => (
                      <div
                        key={index}
                        className={`text-xs py-1 ${
                          log.type === 'error'
                            ? 'text-red-600 dark:text-red-400'
                            : log.type === 'warning'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <span className="opacity-75">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        {' - '}
                        {log.message}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};