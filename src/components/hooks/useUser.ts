// src/hooks/useUser.ts
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { UserData, MoodData, HealthInsight } from '../types/types';

interface UserContextType {
  userData: UserData | null;
  moodData: MoodData[];
  healthInsights: HealthInsight[];
  isOnboarded: boolean;
  setUserData: (data: UserData | null) => void;
  setMoodData: (data: MoodData[]) => void;
  setHealthInsights: (insights: HealthInsight[]) => void;
  setIsOnboarded: (value: boolean) => void;
  logout: () => void;
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};