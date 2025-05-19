import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { BarChart2, PieChart as PieChartIcon, Percent, LineChart as LineChartIcon } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { UserData } from '../types/types';

interface MoodData {
  category: string;
  percentage: number;
}

type ChartType = 'circular' | 'percentage' | 'bar' | 'line';

interface MoodChartProps {
  chartType: ChartType;
  onChartTypeChange?: (type: ChartType) => void;
}

const COLORS = {
  happy: '#4ade80',        // green-400
  sad: '#60a5fa',          // blue-400
  stressed: '#f87171',     // red-400
  neutral: '#a78bfa',      // purple-400
  aiHappy: '#16a34a',      // green-600
  aiSad: '#1d4ed8',        // blue-700
  aiStressed: '#dc2626',   // red-600
  aiNeutral: '#7c3aed'     // purple-600
};

const RADIAN = Math.PI / 180;

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent
}: LabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const analyzeMentalHealth = (userData: UserData | null): MoodData[] => {
  if (!userData) {
    return [
      { category: 'happy', percentage: 40 },
      { category: 'sad', percentage: 20 },
      { category: 'stressed', percentage: 25 },
      { category: 'neutral', percentage: 15 }
    ];
  }

  // Calculate scores for each factor (normalized to 0-10 scale)
  const calculateScreenScore = (screenTime?: number) => {
    if (!screenTime) return 5;
    if (screenTime <= 2) return 1;
    if (screenTime <= 4) return 3;
    if (screenTime <= 6) return 5;
    if (screenTime <= 8) return 7;
    return 10;
  };

  const calculateSleepScore = (sleepTime?: number) => {
    if (!sleepTime) return 5;
    if (sleepTime <= 4) return 1;
    if (sleepTime <= 5) return 3;
    if (sleepTime <= 7) return 5;
    if (sleepTime <= 8) return 8;
    return 10;
  };

  const calculateFoodScore = (morningFood?: string, eveningFood?: string) => {
    const healthyKeywords = ['Milk', 'Health Drinks', 'Tiffen', 'Natural Mix'];
    const unhealthyKeywords = ['Junk Food', 'Hotel Foods', 'Fries'];

    const analyzeMeal = (meal?: string) => {
      if (!meal) return 5;
      const isHealthy = healthyKeywords.some(keyword => meal.toLowerCase().includes(keyword));
      const isUnhealthy = unhealthyKeywords.some(keyword => meal.toLowerCase().includes(keyword));

      if (isHealthy) return 9;
      if (isUnhealthy) return 2;
      return 5;
    };

    const breakfastScore = analyzeMeal(morningFood);
    const dinnerScore = analyzeMeal(eveningFood);
    return (breakfastScore + dinnerScore) / 2;
  };

  const calculateAgeScore = (age?: number) => {
    if (!age) return 5;
    if (age < 18) return 8;
    if (age <= 25) return 6;
    if (age <= 35) return 5;
    if (age <= 50) return 4;
    return 3;
  };

  // Get all scores
  const screenScore = calculateScreenScore(userData.screenTime);
  const sleepScore = calculateSleepScore(userData.sleepTime);
  const foodScore = calculateFoodScore(userData.morningFood, userData.eveningFood);
  const ageScore = calculateAgeScore(userData.age);

  // Calculate mood components
  let stress = (0.4 * screenScore) - (0.3 * sleepScore) - (0.2 * foodScore) + (0.1 * ageScore) + 4;
  let happiness = (0.3 * sleepScore) + (0.2 * foodScore) + (0.1 * ageScore) - (0.3 * screenScore) + 5;
  let sadness = (0.3 * screenScore) - (0.2 * sleepScore) - (0.2 * foodScore) + (0.1 * ageScore) + 3;

  // Ensure values are within reasonable bounds
  stress = Math.max(0, Math.min(10, stress));
  happiness = Math.max(0, Math.min(10, happiness));
  sadness = Math.max(0, Math.min(10, sadness));

  // Calculate neutrality
  let neutrality = 10 - Math.abs(happiness - sadness);
  neutrality = Math.max(0, Math.min(10, neutrality));

  // Convert to percentages
  const total = happiness + sadness + stress + neutrality;
  const happyPercentage = Math.round((happiness / total) * 100);
  const sadPercentage = Math.round((sadness / total) * 100);
  const stressedPercentage = Math.round((stress / total) * 100);
  const neutralPercentage = Math.round((neutrality / total) * 100);

  // Adjust for rounding errors
  const diff = 100 - (happyPercentage + sadPercentage + stressedPercentage + neutralPercentage);
  const adjustedHappy = happyPercentage + diff;

  return [
    { category: 'happy', percentage: Math.max(0, Math.min(100, adjustedHappy)) },
    { category: 'sad', percentage: Math.max(0, Math.min(100, sadPercentage)) },
    { category: 'stressed', percentage: Math.max(0, Math.min(100, stressedPercentage)) },
    { category: 'neutral', percentage: Math.max(0, Math.min(100, neutralPercentage)) }
  ];
};

const nlmAnalysis = (data: MoodData[]): MoodData[] => {
  return data.map(item => {
    let adjustment = 0;
    if (item.category === 'happy') adjustment = -5;
    if (item.category === 'stressed') adjustment = 10;
    if (item.category === 'sad') adjustment = 5;
    return {
      category: item.category,
      percentage: Math.max(0, Math.min(100, item.percentage + adjustment))
    };
  });
};

const datasetAnalysis = (data: MoodData[]): MoodData[] => {
  return data.map(item => {
    let adjustment = 0;
    if (item.category === 'happy') adjustment = -10;
    if (item.category === 'neutral') adjustment = 5;
    if (item.category === 'stressed') adjustment = 15;
    return {
      category: item.category,
      percentage: Math.max(0, Math.min(100, item.percentage + adjustment))
    };
  });
};

const MoodChart: React.FC<MoodChartProps> = ({
  chartType,
  onChartTypeChange
}) => {
  const { userData } = useUser();
  const [aiData, setAiData] = useState<MoodData[]>([]);
  const [nlmData, setNlmData] = useState<MoodData[]>([]);
  const [datasetComparison, setDatasetComparison] = useState<MoodData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  const getSessionKey = useCallback((key: string) =>
    userData?.id ? `session_mood_${key}_${userData.id}` : `session_mood_${key}`,
    [userData?.id]
  );

  const initializeSessionData = useCallback(() => {
    if (!userData) return;

    const sessionKey = getSessionKey('mood_data');
    const cachedData = sessionStorage.getItem(sessionKey);

    if (cachedData) {
      const {
        aiData: cachedAiData,
        nlmData: cachedNlmData,
        datasetComparison: cachedDataset,
        analysisResult: cachedAnalysis
      } = JSON.parse(cachedData);

      setAiData(cachedAiData);
      setNlmData(cachedNlmData);
      setDatasetComparison(cachedDataset);
      setAnalysisResult(cachedAnalysis);
      return;
    }

    setIsLoading(true);
    try {
      const baseData = analyzeMentalHealth(userData);
      const aiAnalysis = baseData;
      const nlmResult = nlmAnalysis(baseData);
      const datasetResult = datasetAnalysis(baseData);

      let analysis = "Based on your profile: ";
      const recommendations = [];

      if (userData.sleepTime && userData.sleepTime < 7) {
        analysis += "Your sleep duration seems low, which may affect mood. ";
        recommendations.push("Aim for 7-9 hours of sleep");
      }

      if (userData.screenTime && userData.screenTime > 6) {
        analysis += "High screen time can contribute to stress. ";
        recommendations.push("Take regular screen breaks");
      }

      if (userData.age && userData.age < 25) {
        analysis += "Young adults often experience more mood variability. ";
      }

      if (!analysis.includes("sleep") && !analysis.includes("screen")) {
        analysis += "Your lifestyle factors appear balanced. ";
      }

      if (recommendations.length > 0) {
        analysis += "Recommendations: " + recommendations.join(", ") + ".";
      } else {
        analysis += "Maintain healthy habits for optimal mental wellbeing.";
      }

      const sessionData = {
        aiData: aiAnalysis,
        nlmData: nlmResult,
        datasetComparison: datasetResult,
        analysisResult: analysis
      };

      sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));

      setAiData(aiAnalysis);
      setNlmData(nlmResult);
      setDatasetComparison(datasetResult);
      setAnalysisResult(analysis);
    } catch (error) {
      console.error('Error initializing mood data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userData, getSessionKey]);

  useEffect(() => {
    initializeSessionData();
  }, [initializeSessionData]);

  const data = useMemo(() => analyzeMentalHealth(userData), [userData]);

  const timeSeriesData = useMemo(() => [
    {
      name: 'Mon',
      happy: data[0].percentage,
      sad: data[1].percentage,
      stressed: data[2].percentage,
      neutral: data[3].percentage,
      aiHappy: aiData[0]?.percentage || 0,
      aiSad: aiData[1]?.percentage || 0,
      aiStressed: aiData[2]?.percentage || 0,
      aiNeutral: aiData[3]?.percentage || 0
    },
    {
      name: 'Tue',
      happy: data[0].percentage - 5,
      sad: data[1].percentage + 5,
      stressed: data[2].percentage,
      neutral: data[3].percentage,
      aiHappy: (aiData[0]?.percentage || 0) - 5,
      aiSad: (aiData[1]?.percentage || 0) + 5,
      aiStressed: aiData[2]?.percentage || 0,
      aiNeutral: aiData[3]?.percentage || 0
    },
    {
      name: 'Wed',
      happy: data[0].percentage - 10,
      sad: data[1].percentage,
      stressed: data[2].percentage + 10,
      neutral: data[3].percentage,
      aiHappy: (aiData[0]?.percentage || 0) - 10,
      aiSad: aiData[1]?.percentage || 0,
      aiStressed: (aiData[2]?.percentage || 0) + 10,
      aiNeutral: aiData[3]?.percentage || 0
    },
    {
      name: 'Thu',
      happy: data[0].percentage + 5,
      sad: data[1].percentage - 5,
      stressed: data[2].percentage - 5,
      neutral: data[3].percentage + 5,
      aiHappy: (aiData[0]?.percentage || 0) + 5,
      aiSad: (aiData[1]?.percentage || 0) - 5,
      aiStressed: (aiData[2]?.percentage || 0) - 5,
      aiNeutral: (aiData[3]?.percentage || 0) + 5
    },
    {
      name: 'Fri',
      happy: data[0].percentage + 10,
      sad: data[1].percentage - 10,
      stressed: data[2].percentage,
      neutral: data[3].percentage,
      aiHappy: (aiData[0]?.percentage || 0) + 10,
      aiSad: (aiData[1]?.percentage || 0) - 10,
      aiStressed: aiData[2]?.percentage || 0,
      aiNeutral: aiData[3]?.percentage || 0
    },
    {
      name: 'Sat',
      happy: data[0].percentage + 15,
      sad: data[1].percentage - 5,
      stressed: data[2].percentage - 10,
      neutral: data[3].percentage,
      aiHappy: (aiData[0]?.percentage || 0) + 15,
      aiSad: (aiData[1]?.percentage || 0) - 5,
      aiStressed: (aiData[2]?.percentage || 0) - 10,
      aiNeutral: aiData[3]?.percentage || 0
    },
    {
      name: 'Sun',
      happy: data[0].percentage,
      sad: data[1].percentage,
      stressed: data[2].percentage,
      neutral: data[3].percentage,
      aiHappy: aiData[0]?.percentage || 0,
      aiSad: aiData[1]?.percentage || 0,
      aiStressed: aiData[2]?.percentage || 0,
      aiNeutral: aiData[3]?.percentage || 0
    }
  ], [data, aiData]);

  const renderChartSelector = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {!showComparison && ['circular', 'percentage', 'bar', 'line'].map((type) => (
        <button
          key={type}
          onClick={() => onChartTypeChange?.(type as ChartType)}
          className={`p-2 rounded-md flex items-center transition-colors ${chartType === type
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
        >
          {type === 'circular' && <PieChartIcon className="h-4 w-4 mr-1" />}
          {type === 'percentage' && <Percent className="h-4 w-4 mr-1" />}
          {type === 'bar' && <BarChart2 className="h-4 w-4 mr-1" />}
          {type === 'line' && <LineChartIcon className="h-4 w-4 mr-1" />}
          <span className="text-sm capitalize">{type}</span>
        </button>
      ))}
      <button
        onClick={() => setShowComparison(!showComparison)}
        className={`p-2 rounded-md flex items-center transition-colors ${showComparison
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
      >
        <span className="text-sm">AI Comparison</span>
      </button>
    </div>
  );

  const renderComparisonChart = () => {
    const combinedData = data.map((item, index) => ({
      ...item,
      aiPercentage: aiData[index]?.percentage || 0,
      nlmPercentage: nlmData[index]?.percentage || 0,
      datasetPercentage: datasetComparison[index]?.percentage || 0
    }));

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Comparison Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-medium mb-2">Your Data vs AI Analysis</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="percentage" fill={COLORS.happy} name="Your Data" />
                <Bar dataKey="aiPercentage" fill={COLORS.aiHappy} name="AI Analysis" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-medium mb-2">All Comparisons</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="percentage" fill={COLORS.happy} name="Your Data" />
                <Bar dataKey="aiPercentage" fill={COLORS.aiHappy} name="AI Analysis" />
                <Bar dataKey="nlmPercentage" fill={COLORS.sad} name="NLM Pattern" />
                <Bar dataKey="datasetPercentage" fill={COLORS.stressed} name="Dataset Avg" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderChart = () => {
    if (showComparison) {
      return (
        <div className="h-64 w-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium mb-4">AI Comparison Analysis</p>
            <p className="text-gray-600 dark:text-gray-400">Viewing detailed comparison below</p>
          </div>
        </div>
      );
    }

    switch (chartType) {
      case 'circular':
        return (
          <div className="relative">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="percentage"
                  nameKey="category"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.category as keyof typeof COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case 'percentage':
        return (
          <div className="h-full w-full flex flex-col justify-center">
            {data.map((entry, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="capitalize">{entry.category}</span>
                  <span>{entry.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-1000"
                    style={{
                      width: `${entry.percentage}%`,
                      backgroundColor: COLORS[entry.category as keyof typeof COLORS]
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'bar':
        return (
          <div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 'auto']} />
                <Tooltip />
                <Bar dataKey="happy" fill={COLORS.happy} stackId="a" name="Happy" />
                <Bar dataKey="sad" fill={COLORS.sad} stackId="a" name="Sad" />
                <Bar dataKey="stressed" fill={COLORS.stressed} stackId="a" name="Stressed" />
                <Bar dataKey="neutral" fill={COLORS.neutral} stackId="a" name="Neutral" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'line':
        return (
          <div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 'auto']} />
                <Tooltip />
                <Area dataKey="happy" stroke={COLORS.happy} fill={COLORS.happy} name="Happy" />
                <Area dataKey="sad" stroke={COLORS.sad} fill={COLORS.sad} name="Sad" />
                <Area dataKey="stressed" stroke={COLORS.stressed} fill={COLORS.stressed} name="Stressed" />
                <Area dataKey="neutral" stroke={COLORS.neutral} fill={COLORS.neutral} name="Neutral" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return null;
    }
  };

  const getCurrentMoodPercentages = () => {
    const currentData = showComparison ? aiData : data;
    return {
      happy: currentData?.find(item => item.category === 'happy')?.percentage || 0,
      sad: currentData?.find(item => item.category === 'sad')?.percentage || 0,
      stressed: currentData?.find(item => item.category === 'stressed')?.percentage || 0,
      neutral: currentData?.find(item => item.category === 'neutral')?.percentage || 0
    };
  };

  const currentMood = getCurrentMoodPercentages();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {showComparison ? 'AI Mood Analysis' : 'Your Mood Chart'}
        </h2>
        {renderChartSelector()}
      </div>

      <div className="h-64 w-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          renderChart()
        )}
      </div>

      {/* Mood percentage boxes - only show when not in comparison mode */}
      {!showComparison && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div 
            className="p-2 rounded-lg text-center" 
            style={{ 
              backgroundColor: `${COLORS.happy}20`,
              color: COLORS.happy
            }}
          >
            <span className="block text-sm">Happy</span>
            <span className="font-bold">
              {currentMood.happy}%
            </span>
          </div>
          <div 
            className="p-2 rounded-lg text-center" 
            style={{ 
              backgroundColor: `${COLORS.sad}20`,
              color: COLORS.sad
            }}
          >
            <span className="block text-sm">Sad</span>
            <span className="font-bold">
              {currentMood.sad}%
            </span>
          </div>
          <div 
            className="p-2 rounded-lg text-center" 
            style={{ 
              backgroundColor: `${COLORS.stressed}20`,
              color: COLORS.stressed
            }}
          >
            <span className="block text-sm">Stressed</span>
            <span className="font-bold">
              {currentMood.stressed}%
            </span>
          </div>
          <div 
            className="p-2 rounded-lg text-center" 
            style={{ 
              backgroundColor: `${COLORS.neutral}20`,
              color: COLORS.neutral
            }}
          >
            <span className="block text-sm">Neutral</span>
            <span className="font-bold">
              {currentMood.neutral}%
            </span>
          </div>
        </div>
      )}

      {showComparison && !isLoading && renderComparisonChart()}

      {analysisResult && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="font-semibold mb-2">AI Insights</h3>
          <p>{analysisResult}</p>
        </div>
      )}
    </div>
  );
};

export default MoodChart;