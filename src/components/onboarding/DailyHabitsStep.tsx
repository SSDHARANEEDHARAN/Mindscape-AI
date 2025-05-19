import React, { useState, useRef, useEffect } from 'react';
import { UserData } from '../types/types';
import { Coffee, Moon, Smartphone } from 'lucide-react';

interface DailyHabitsStepProps {
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  darkMode: boolean;
}

const morningFoodOptions = [
  'Tea',
  'Coffee',
  'Milk',
  'Health Drinks',
  'Tiffen',
  'Natural Mix',
  'Others'
];

const eveningFoodOptions = [
  'Junk Food',
  'Tea',
  'Coffee',
  'Small Tiffen',
  'Hotel Foods',
  'Fries',
  'Others'
];

const DailyHabitsStep: React.FC<DailyHabitsStepProps> = ({
  userData,
  updateUserData,
  nextStep,
  prevStep,
  darkMode,
}) => {
  const [disabilityResponse, setDisabilityResponse] = useState<string>('');
  const [healthConditionResponse, setHealthConditionResponse] = useState<string>('');
  const [medicalCheckupDate, setMedicalCheckupDate] = useState<string>('');
  const [hospitalName, setHospitalName] = useState<string>('');
  const [hospitalDistrict, setHospitalDistrict] = useState<string>('');
  
  // Morning food state
  const [showMorningFoodOptions, setShowMorningFoodOptions] = useState(false);
  const [morningFoodInputValue, setMorningFoodInputValue] = useState(userData.morningFood || '');
  
  // Evening food state
  const [showEveningFoodOptions, setShowEveningFoodOptions] = useState(false);
  const [eveningFoodInputValue, setEveningFoodInputValue] = useState(userData.eveningFood || '');
  
  const morningFoodRef = useRef<HTMLDivElement>(null);
  const eveningFoodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (morningFoodRef.current && !morningFoodRef.current.contains(event.target as Node)) {
        setShowMorningFoodOptions(false);
      }
      if (eveningFoodRef.current && !eveningFoodRef.current.contains(event.target as Node)) {
        setShowEveningFoodOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabilityResponse === 'Unwell' && healthConditionResponse === '') {
      alert('Please fill in all required fields.');
      return;
    }
    nextStep();
  };

  const handleMorningFoodSelect = (food: string) => {
    if (food === 'Others') {
      setMorningFoodInputValue('');
      updateUserData({ morningFood: '' });
    } else {
      setMorningFoodInputValue(food);
      updateUserData({ morningFood: food });
    }
    setShowMorningFoodOptions(false);
  };

  const handleMorningInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMorningFoodInputValue(value);
    updateUserData({ morningFood: value });
  };

  const handleEveningFoodSelect = (food: string) => {
    if (food === 'Others') {
      setEveningFoodInputValue('');
      updateUserData({ eveningFood: '' });
    } else {
      setEveningFoodInputValue(food);
      updateUserData({ eveningFood: food });
    }
    setShowEveningFoodOptions(false);
  };

  const handleEveningInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEveningFoodInputValue(value);
    updateUserData({ eveningFood: value });
  };

  const baseInputClass = `w-full px-4 py-2 rounded-lg border focus:ring-2 focus:border-transparent ${
    darkMode
      ? 'bg-gray-800 text-white border-gray-600 focus:ring-indigo-400'
      : 'dark:bg-white text-black border-gray-300 focus:ring-indigo-500'
  }`;

  const baseSelectClass = `w-full px-4 py-2 rounded-lg border focus:ring-2 focus:border-transparent ${
    darkMode
      ? 'bg-gray-800 text-white border-gray-600 focus:ring-indigo-400'
      : 'dark:bg-white text-black border-gray-300 focus:ring-indigo-500'
  }`;

  const dropdownItemClass = `px-4 py-2 cursor-pointer ${
    darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-indigo-50'
  }`;

  return (
    <div className={`w-full max-w-md mx-auto ${darkMode ? 'text-white' : 'text-black'}`}>
      <h2 className="text-2xl font-bold mb-6 text-center">Your Daily Habits</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Morning Food Dropdown */}
        <div className="relative" ref={morningFoodRef}>
          <label htmlFor="morningFood" className="text-sm font-medium mb-1 flex items-center">
            <Coffee className="w-4 h-4 mr-2" />
            Morning Food
          </label>
          <input
            type="text"
            id="morningFood"
            value={morningFoodInputValue}
            onChange={handleMorningInputChange}
            onFocus={() => setShowMorningFoodOptions(true)}
            className={baseInputClass}
            placeholder="Select or type your morning food"
            required
          />
          {showMorningFoodOptions && (
            <div
              className={`absolute z-10 mt-1 w-full shadow-lg rounded-lg py-1 border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              {morningFoodOptions.map((food) => (
                <div
                  key={`morning-${food}`}
                  className={dropdownItemClass}
                  onClick={() => handleMorningFoodSelect(food)}
                >
                  {food}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evening Food Dropdown */}
        <div className="relative" ref={eveningFoodRef}>
          <label htmlFor="eveningFood" className="text-sm font-medium mb-1">
            Evening Food
          </label>
          <input
            type="text"
            id="eveningFood"
            value={eveningFoodInputValue}
            onChange={handleEveningInputChange}
            onFocus={() => setShowEveningFoodOptions(true)}
            className={baseInputClass}
            placeholder="Select or type your evening food"
            required
          />
          {showEveningFoodOptions && (
            <div
              className={`absolute z-10 mt-1 w-full shadow-lg rounded-lg py-1 border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              {eveningFoodOptions.map((food) => (
                <div
                  key={`evening-${food}`}
                  className={dropdownItemClass}
                  onClick={() => handleEveningFoodSelect(food)}
                >
                  {food}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="sleepTime" className="text-sm font-medium mb-1 flex items-center">
            <Moon className="w-4 h-4 mr-2" />
            Sleep Time (hours)
          </label>
          <input
            type="number"
            id="sleepTime"
            value={userData.sleepTime || ''}
            onChange={(e) => updateUserData({ sleepTime: parseInt(e.target.value) || 0 })}
            className={baseInputClass}
            placeholder="8"
            min="1"
            max="24"
            required
          />
        </div>

        <div>
          <label htmlFor="screenTime" className="text-sm font-medium mb-1 flex items-center">
            <Smartphone className="w-4 h-4 mr-2" />
            Screen Time (hours)
          </label>
          <input
            type="number"
            id="screenTime"
            value={userData.screenTime || ''}
            onChange={(e) => updateUserData({ screenTime: parseInt(e.target.value) || 0 })}
            className={baseInputClass}
            placeholder="4"
            min="0"
            max="24"
            required
          />
        </div>

        {/* Disability Question */}
        <div>
          <label htmlFor="disability" className="text-sm font-medium mb-1">
            Do you identify as a person with a physical disability or require accommodations?
          </label>
          <select
            id="disability"
            value={disabilityResponse}
            onChange={(e) => setDisabilityResponse(e.target.value)}
            className={baseSelectClass}
          >
            <option value="">Select an option</option>
            <option value="Unwell">Unwell</option>
            <option value="No, I do not.">No, I do not.</option>
            <option value="I prefer not to say.">I prefer not to say.</option>
          </select>
        </div>

        {/* If Unwell */}
        {disabilityResponse === 'Unwell' && (
          <div>
            <label htmlFor="healthCondition" className="text-sm font-medium mb-1">
              Any health condition?
            </label>
            <select
              id="healthCondition"
              value={healthConditionResponse}
              onChange={(e) => setHealthConditionResponse(e.target.value)}
              className={baseSelectClass}
            >
              <option value="">Select an option</option>
              <option value="Yes, I have a health condition that may require accommodations.">
                Yes
              </option>
              <option value="No, I do not have any health conditions.">
                No (last checkup 2 months ago)
              </option>
              <option value="I prefer not to disclose this information.">
                Prefer not to say
              </option>
            </select>
          </div>
        )}

        {/* Medical Info if health condition exists */}
        {healthConditionResponse === 'Yes, I have a health condition that may require accommodations.' && (
          <div>
            <label htmlFor="medicalCheckupDate" className="text-sm font-medium mb-1">
              Date of your last medical checkup
            </label>
            <input
              type="date"
              id="medicalCheckupDate"
              value={medicalCheckupDate}
              onChange={(e) => setMedicalCheckupDate(e.target.value)}
              className={baseInputClass}
              required
            />

            <div className="pt-4">
              <label htmlFor="hospitalName" className="text-sm font-medium mb-1">
                Hospital Name (optional):
              </label>
              <input
                type="text"
                id="hospitalName"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className={baseInputClass}
                placeholder="Enter Hospital Name"
              />

              <label htmlFor="hospitalDistrict" className="text-sm font-medium mb-1">
                Hospital District (optional):
              </label>
              <input
                type="text"
                id="hospitalDistrict"
                value={hospitalDistrict}
                onChange={(e) => setHospitalDistrict(e.target.value)}
                className={baseInputClass}
                placeholder="Enter Hospital District"
              />
            </div>
          </div>
        )}

        <div className="pt-4 flex space-x-4">
          <button
            type="button"
            onClick={prevStep}
            className={`w-1/2 font-medium py-2 px-4 rounded-lg transition duration-200 ${
              darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            Back
          </button>
          <button
            type="submit"
            className={`w-1/2 font-medium py-2 px-4 rounded-lg transition duration-200 ${
              darkMode
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default DailyHabitsStep;