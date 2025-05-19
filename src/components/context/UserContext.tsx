// src/context/UserContext.tsx
import React, { createContext, useState, ReactNode, useContext } from 'react';
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

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(() => {
    // Initialize from localStorage if available
    const savedData = localStorage.getItem('userData');
    return savedData ? JSON.parse(savedData) : null;
  });
  
  const [moodData, setMoodData] = useState<MoodData[]>(() => {
    const savedMood = localStorage.getItem('moodData');
    return savedMood ? JSON.parse(savedMood) : [];
  });
  
  const [healthInsights, setHealthInsights] = useState<HealthInsight[]>(() => {
    const savedInsights = localStorage.getItem('healthInsights');
    return savedInsights ? JSON.parse(savedInsights) : [];
  });
  
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem('isOnboarded') === 'true';
  });

  const logout = () => {
    // Clear all state
    setUserData(null);
    setMoodData([]);
    setHealthInsights([]);
    setIsOnboarded(false);
    
    // Clear localStorage
    localStorage.removeItem('userData');
    localStorage.removeItem('moodData');
    localStorage.removeItem('healthInsights');
    localStorage.removeItem('isOnboarded');
    
    // Clear sessionStorage
    sessionStorage.clear();
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        moodData,
        healthInsights,
        isOnboarded,
        setUserData: (data) => {
          setUserData(data);
          if (data) {
            localStorage.setItem('userData', JSON.stringify(data));
          } else {
            localStorage.removeItem('userData');
          }
        },
        setMoodData: (data) => {
          setMoodData(data);
          localStorage.setItem('moodData', JSON.stringify(data));
        },
        setHealthInsights: (insights) => {
          setHealthInsights(insights);
          localStorage.setItem('healthInsights', JSON.stringify(insights));
        },
        setIsOnboarded: (value) => {
          setIsOnboarded(value);
          localStorage.setItem('isOnboarded', String(value));
        },
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};