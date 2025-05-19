import React from 'react';
import { UserData } from '../types/types';
import { Radio, Wifi, Monitor } from 'lucide-react';

interface DeviceIntegrationStepProps {
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  completeOnboarding: () => void;
  prevStep: () => void;
  darkMode: boolean;
}

const DeviceIntegrationStep: React.FC<DeviceIntegrationStepProps> = ({
  userData,
  updateUserData,
  completeOnboarding,
  prevStep,
  darkMode
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeOnboarding();
  };

  // Check if at least one device is selected
  const atLeastOneDeviceSelected = userData.hasLoraModule || userData.hasEsp32;

  return (
    <div className={`w-full max-w-md mx-auto ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <h2 className="text-2xl font-bold mb-6 text-center">Device Integration</h2>
      <p className={`text-center mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Connect at least one device for health tracking
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Raspberry Pi 5 */}
        <div className={`p-4 rounded-lg shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                id="loraModule"
                type="checkbox"
                checked={userData.hasLoraModule}
                onChange={(e) => updateUserData({ hasLoraModule: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="loraModule" className="font-medium flex items-center">
                <Radio className="w-5 h-5 mr-2 text-indigo-600" />
                Raspberry Pi 5
              </label>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Long-range data transmission for remote health monitoring
              </p>
            </div>
          </div>
        </div>

        {/* ESP32 Display */}
        <div className={`p-4 rounded-lg shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                id="esp32"
                type="checkbox"
                checked={userData.hasEsp32}
                onChange={(e) => updateUserData({ hasEsp32: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="esp32" className="font-medium flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-indigo-600" />
                ESP32 Display
              </label>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Real-time display of your health metrics and mood data
              </p>
            </div>
          </div>
        </div>

        {/* Google Sync (optional) */}
        <div className={`p-4 rounded-lg shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <Wifi className="w-5 h-5 mr-2 text-indigo-600" />
            <span className="font-medium">Google Sync (Optional)</span>
          </div>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Securely back up your health data to Google Cloud
          </p>
          <button
            type="button"
            className={`mt-2 text-sm px-3 py-1 rounded-full transition ${
              darkMode
                ? 'bg-indigo-900 text-indigo-300 hover:bg-indigo-800'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            Connect Google Account
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="pt-4 flex space-x-4">
          <button
            type="button"
            onClick={prevStep}
            className={`w-1/2 font-medium py-2 px-4 rounded-lg transition duration-200 ${
              darkMode
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!atLeastOneDeviceSelected}
            className={`w-1/2 font-medium py-2 px-4 rounded-lg transition duration-200 ${
              atLeastOneDeviceSelected
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Complete Setup
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeviceIntegrationStep;