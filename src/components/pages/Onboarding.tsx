import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { UserData } from '../types/types';
import PersonalInfoStep from '../onboarding/PersonalInfoStep';
import DailyHabitsStep from '../onboarding/DailyHabitsStep';
import DeviceIntegrationStep from '../onboarding/DeviceIntegrationStep';

interface OnboardingProps {
  darkMode: boolean;
}

const defaultUserData: UserData = {
  name: '',
  age: 0,
  height: 0,
  weight: 0,
  morningFood: '',
  eveningFood: '',
  sleepTime: 0,
  screenTime: 0,
  hasLoraModule: false,
  hasEsp32: false,
  medicalCheckups: [],
  challenge: '',
};

const Onboarding: React.FC<OnboardingProps> = ({ darkMode }) => {
  const [step, setStep] = useState<number>(1);
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const { setUserData: setContextUserData, setIsOnboarded } = useUser();
  const navigate = useNavigate();
  
  const updateUserData = (data: Partial<UserData>): void => {
    setUserData(prev => ({ ...prev, ...data }));
  };
  
  const nextStep = (): void => setStep(prev => prev + 1);
  const prevStep = (): void => setStep(prev => prev - 1);
  
  const completeOnboarding = (): void => {
    setContextUserData(userData);
    setIsOnboarded(true);
    navigate('/dashboard');
  };
  
  const renderStep = (): React.ReactNode => {
    switch (step) {
      case 1:
        return (
          <PersonalInfoStep 
            userData={userData} 
            updateUserData={updateUserData} 
            nextStep={nextStep}
            darkMode={darkMode}
          />
        );
      case 2:
        return (
          <DailyHabitsStep 
            userData={userData} 
            updateUserData={updateUserData} 
            nextStep={nextStep}
            prevStep={prevStep}
            darkMode={darkMode}
          />
        );
      case 3:
        return (
          <DeviceIntegrationStep 
            userData={userData} 
            updateUserData={updateUserData} 
            completeOnboarding={completeOnboarding}
            prevStep={prevStep}
            darkMode={darkMode}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
      darkMode ?  'bg-gray-50' :'dark:bg-gray-900'
    }`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center p-3 rounded-full mb-4 ${
            darkMode ? 'bg-indigo-100': 'dark:bg-indigo-900/50' 
          }`}>
            <Brain className={`h-8 w-8 ${darkMode ? 'text-indigo-600' : 'dark:text-indigo-300'}`} />
          </div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-900' : 'dark:text-white'}`}>Mindscape</h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-600' : 'dark:text-gray-300'}`}>
            AI-Powered Mental Health Analysis
          </p>
        </div>
        
        <div className={`rounded-xl shadow-lg p-6 mb-8 transition-colors duration-300 ${
          darkMode ?  'bg-white' : 'dark:bg-gray-800'
        }`}>
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                    i === step 
                      ? darkMode 
                        ? 'bg-indigo-500 text-black' 
                        : 'dark:bg-indigo-500 text-black'
                      : i < step 
                        ? darkMode 
                          ?  'bg-indigo-400 text-indigo-800'
                          :  'dark:bg-indigo-400/50 text-indigo-300'
                        : darkMode 
                          ?  'bg-gray-200 text-gray-500' 
                          :  'dark:bg-gray-600 text-gray-400' 
                  }`}
                >
                  {i}
                </div>
                <span className={`text-xs mt-1 ${
                  darkMode ? 'text-gray-600' : 'dark:text-gray-300'
                }`}>
                  {i === 1 ? 'Personal' : i === 2 ? 'Habits' : 'Devices'}
                </span>
              </div>
            ))}
          </div>
          
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;