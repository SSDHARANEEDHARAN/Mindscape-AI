/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { useUser } from '../hooks/useUser';

interface ForecastData {
  day: string;
  mood: number;
  predicted?: boolean;
}

const STORAGE_KEY = 'moodForecastData';

const MoodForecast: React.FC = () => {
  const { userData } = useUser();
  const [forecastData, setForecastData] = useState<ForecastData[]>(() => {
    // Load from localStorage if available
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState(() => {
    const savedInsight = localStorage.getItem(`${STORAGE_KEY}_insight`);
    return savedInsight || '';
  });

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (forecastData.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(forecastData));
      localStorage.setItem(`${STORAGE_KEY}_insight`, aiInsight);
    }
  }, [forecastData, aiInsight]);

  // Clear data when user logs out
  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(`${STORAGE_KEY}_insight`);
    };

    // You'll need to trigger this from your logout button click
    // This is just a placeholder - implement according to your auth system
    window.addEventListener('userLogout', handleLogout);
    return () => window.removeEventListener('userLogout', handleLogout);
  }, []);

  // Generate AI-powered mood forecast
  const generateAIForecast = useCallback(async () => {
    // Skip if we already have data (unless it's older than 4 hours)
    const lastUpdated = localStorage.getItem(`${STORAGE_KEY}_timestamp`);
    if (lastUpdated && Date.now() - parseInt(lastUpdated) < 4 * 3600000 && forecastData.length > 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      if (!userData) {
        generateAlgorithmicForecast();
        return;
      }

      // Prepare data for AI analysis
      const analysisData = {
        userProfile: {
          age: userData.age,
          sleepPattern: userData.sleepTime,
          screenTime: userData.screenTime,
          diet: {
            morning: userData.morningFood,
            evening: userData.eveningFood
          }
        },
        currentTime: new Date().toISOString()
      };

      // Call AI prediction API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBy0KCb5kFziYZC5gXkFgB3mXEmMzsatTE`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this user data and predict mood levels for the next 5 days. Consider sleep patterns, diet, and screen time. Return only a JSON array with mood percentages (0-100) and an AI insight (max 50 words). Data: ${JSON.stringify(analysisData)}`
            }]
          }]
        })
      });

      const result = await response.json();
      const aiResponse = JSON.parse(result.candidates[0].content.parts[0].text);
      
      const now = new Date();
      const days = ['Today'];
      
      // Generate day labels for the next 4 days
      for (let i = 1; i <= 4; i++) {
        const date = new Date();
        date.setDate(now.getDate() + i);
        days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      }

      // Create forecast data with AI predictions
      const forecast = days.map((day, index) => ({
        day,
        mood: aiResponse.predictions[index],
        predicted: index > 0
      }));

      setForecastData(forecast);
      setAiInsight(aiResponse.insight);
      localStorage.setItem(`${STORAGE_KEY}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error('AI prediction failed:', error);
      generateAlgorithmicForecast();
    } finally {
      setIsLoading(false);
    }
  }, [userData]);

  // Fallback algorithmic forecast
  const generateAlgorithmicForecast = useCallback(() => {
    const now = new Date();
    const days = ['Today', 'Tomorrow'];
    
    for (let i = 2; i <= 4; i++) {
      const date = new Date();
      date.setDate(now.getDate() + i);
      days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    // Base mood calculation using user data or defaults
    let baseMood = 70;
    
    if (userData) {
      // Adjust based on sleep
      if (userData.sleepTime < 6) baseMood -= 10;
      else if (userData.sleepTime >= 8) baseMood += 5;

      // Adjust based on screen time
      if (userData.screenTime > 6) baseMood -= 8;
      else if (userData.screenTime < 3) baseMood += 5;

      // Diet adjustments
      if (userData.morningFood.includes('sugar') || userData.morningFood.includes('processed')) baseMood -= 5;
      if (userData.eveningFood.includes('vegetables') || userData.eveningFood.includes('protein')) baseMood += 5;
    }

    // Generate forecast with variations
    const data = days.map((day, index) => {
      let mood = baseMood;
      
      if (index > 0) {
        const randomFactor = Math.random() * 15 - 7; // -7 to +7
        mood += randomFactor;
        
        // Weekend effect
        const dayOfWeek = new Date();
        dayOfWeek.setDate(now.getDate() + index);
        if ([0, 6].includes(dayOfWeek.getDay())) {
          mood += 8;
        }
      }
      
      mood = Math.max(30, Math.min(95, Math.round(mood)));
      
      return {
        day,
        mood,
        predicted: index > 0
      };
    });

    setForecastData(data);
    setAiInsight("Based on general patterns" + (userData ? " and your profile" : ""));
    localStorage.setItem(`${STORAGE_KEY}_timestamp`, Date.now().toString());
  }, [userData]);

  // Generate forecast when component mounts and when user data changes
  useEffect(() => {
    // Only generate new forecast if we don't have data or it's older than 4 hours
    const lastUpdated = localStorage.getItem(`${STORAGE_KEY}_timestamp`);
    if (!lastUpdated || Date.now() - parseInt(lastUpdated) >= 4 * 3600000 || forecastData.length === 0) {
      generateAIForecast();
    } else {
      setIsLoading(false);
    }
      
    // Update every 4 hours
    const interval = setInterval(generateAIForecast, 4 * 3600000);
    return () => clearInterval(interval);
  }, [generateAIForecast, forecastData.length]);

  const getTrendIcon = () => {
    if (forecastData.length < 2 || isLoading) return null;
    const currentMood = forecastData[0].mood;
    const tomorrowMood = forecastData[1].mood;
    const diff = tomorrowMood - currentMood;
    
    if (diff > 5) {
      return <ArrowUp className="h-5 w-5 text-green-500" />;
    } else if (diff < -5) {
      return <ArrowDown className="h-5 w-5 text-red-500" />;
    } else {
      return null;
    }
  };

  const getTrendText = () => {
    if (isLoading) return "AI is analyzing your mood patterns...";
    if (forecastData.length < 2) return "Insufficient data for prediction";
    
    const currentMood = forecastData[0].mood;
    const tomorrowMood = forecastData[1].mood;
    const diff = Math.abs(tomorrowMood - currentMood);
    
    if (tomorrowMood > currentMood + 5) {
      return `AI predicts your mood will improve by ${diff}% tomorrow`;
    } else if (tomorrowMood < currentMood - 5) {
      return `AI forecasts a ${diff}% mood decrease tomorrow`;
    } else {
      return "Your mood is predicted to remain stable";
    }
  };

  const getRecommendation = () => {
    if (isLoading || forecastData.length < 2) return null;
    
    const currentMood = forecastData[0].mood;
    const tomorrowMood = forecastData[1].mood;
    const diff = tomorrowMood - currentMood;
    
    if (tomorrowMood < 60 || (tomorrowMood < currentMood && diff < -10)) {
      return (
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">AI Mood Alert</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {aiInsight || "Our AI detected a potential mood decline. Consider these personalized suggestions:"}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getPersonalizedSuggestions = () => {
    if (isLoading || forecastData.length < 2) return null;
    
    const tomorrowMood = forecastData[1].mood;
    const activities = [];
    const boosters = [];
    
    if (userData) {
      // Sleep-related suggestions
      if (userData.sleepTime < 6) {
        activities.push("Try going to bed 30 minutes earlier");
        boosters.push("Avoid screens 1 hour before bedtime");
      }
      
      // Diet-related suggestions
      if (userData.morningFood.includes('sugar') || userData.morningFood.includes('processed')) {
        activities.push("Replace breakfast with protein-rich foods");
      }
      
      // Screen time suggestions
      if (userData.screenTime > 6) {
        activities.push("Schedule 5-minute screen breaks every hour");
        boosters.push("Try a digital detox for 2 hours tomorrow");
      }
    }
    
    // Mood-specific suggestions
    if (tomorrowMood < 60) {
      if (!activities.length) activities.push("Guided meditation session");
      if (!boosters.length) boosters.push("Call a supportive friend");
    } else if (tomorrowMood > 75) {
      boosters.push("Engage in a creative activity");
    }
    
    // Default suggestions if none matched
    if (!activities.length) activities.push("10-minute mindfulness exercise");
    if (!boosters.length) boosters.push("Take a walk in nature");
    
    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg">
          <p className="text-xs font-medium text-indigo-800 dark:text-indigo-300">AI Recommended</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">{activities[0]}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-lg">
          <p className="text-xs font-medium text-green-800 dark:text-green-300">Mood Booster</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">{boosters[0]}</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium">AI Mood Prediction</h3>
          <div className="flex items-center mt-1">
            {getTrendIcon()}
            <p className="text-sm text-gray-600 dark:text-gray-300 ml-1">
              {isLoading ? "Generating AI predictions..." : getTrendText()}
            </p>
          </div>
        </div>
      </div>
      
      {isLoading && forecastData.length === 0 ? (
        <div className="h-48 flex items-center justify-center">
          <p className="text-gray-500">Analyzing your data with AI...</p>
        </div>
      ) : (
        <>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={forecastData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, "Mood level"]}
                  labelFormatter={(label) => forecastData.find(d => d.day === label)?.predicted 
                    ? `${label} (AI predicted)` 
                    : label}
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {getRecommendation()}
          {getPersonalizedSuggestions()}
        </>
      )}
    </div>
  );
};

export default MoodForecast;