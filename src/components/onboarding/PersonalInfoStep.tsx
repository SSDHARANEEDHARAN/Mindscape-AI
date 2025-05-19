import React from 'react';
import { UserData } from '../types/types';

interface PersonalInfoStepProps {
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  nextStep: () => void;
  darkMode: boolean; // ✅ added darkMode
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  userData,
  updateUserData,
  nextStep,
  darkMode,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  const inputClasses = `w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
    darkMode
      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
      : 'dark:bg-white border-gray-300 text-black'
  }`;

  const labelClasses = `block text-sm font-medium mb-1 ${
    darkMode ? 'text-gray-300' : 'dark:text-gray-800'
  }`;

  return (
    <div className={`w-full max-w-md mx-auto ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <h2 className="text-2xl font-bold mb-6 text-center">Tell us about yourself</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className={labelClasses}>
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={userData.name}
            onChange={(e) => updateUserData({ name: e.target.value })}
            className={inputClasses}
            placeholder="John Doe"
            required
          />
        </div>

        {/* Age */}
        <div>
          <label htmlFor="age" className={labelClasses}>
            Age
          </label>
          <input
            type="number"
            id="age"
            value={userData.age || ''}
            onChange={(e) => updateUserData({ age: parseInt(e.target.value) || 0 })}
            className={inputClasses}
            placeholder="25"
            min="1"
            max="120"
            required
          />
        </div>

        {/* Height & Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="height" className={labelClasses}>
              Height (cm)
            </label>
            <input
              type="number"
              id="height"
              value={userData.height || ''}
              onChange={(e) => updateUserData({ height: parseInt(e.target.value) || 0 })}
              className={inputClasses}
              placeholder="175"
              min="50"
              max="250"
              required
            />
          </div>

          <div>
            <label htmlFor="weight" className={labelClasses}>
              Weight (kg)
            </label>
            <input
              type="number"
              id="weight"
              value={userData.weight || ''}
              onChange={(e) => updateUserData({ weight: parseInt(e.target.value) || 0 })}
              className={inputClasses}
              placeholder="70"
              min="1"
              max="300"
              required
            />
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoStep;
