import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Activity, Bed, Smartphone } from 'lucide-react';

interface HealthInsight {
  category: string;
  score: number;
  recommendation: string;
  improvementTips?: string[];
  needsImprovement?: boolean;
  factors?: string[];
  icon: React.ReactNode;
}

interface HealthMetricsDashboardProps {
  darkMode: boolean;
}

const HealthMetricsDashboard: React.FC<HealthMetricsDashboardProps> = ({ darkMode }) => {
  const { userData } = useUser();
  const [metrics, setMetrics] = useState<HealthInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInitialized, setAiInitialized] = useState(false);
  const [ai, setAi] = useState<GoogleGenerativeAI | null>(null);

  // Initialize AI once
  useEffect(() => {
    if (!aiInitialized) {
      const genAI = new GoogleGenerativeAI('AIzaSyBy0KCb5kFziYZC5gXkFgB3mXEmMzsatTE');
      setAi(genAI);
      setAiInitialized(true);
    }
  }, [aiInitialized]);

  useEffect(() => {
    const calculateHealthMetrics = async (): Promise<HealthInsight[]> => {
      if (!userData) return [];

      // Calculate all metrics using the correct formulas
      const calculateSleepScore = () => {
        const recommendedSleep = 8; // 8 hours recommended for adults
        const sleepPercentage = (userData.sleepTime / recommendedSleep) * 100;
        
        // No minimum score - show actual percentage (12.5% for 1 hour sleep)
        return Math.min(100, sleepPercentage);
      };

      const calculateScreenTimeScore = () => {
        const screenTimePercentage = (userData.screenTime / 24) * 100;
        // Screen Time Suitability = 100 - Screen Time Percentage
        return 100 - screenTimePercentage;
      };

      const calculatePhysicalHealthScore = () => {
        const bmi = Math.round(userData.weight / ((userData.height / 100) ** 2));
        return bmi < 18 ? 65 : bmi < 25 ? 85 : bmi < 30 ? 70 : 55;
      };

      try {
        // First calculate with the accurate formulas
        const sleepScore = calculateSleepScore();
        const screenTimeScore = calculateScreenTimeScore();
        const physicalScore = calculatePhysicalHealthScore();
        const healthRiskPercentage = 100 - sleepScore;

        // Then enhance with AI analysis if available
        if (ai) {
          const model = ai.getGenerativeModel({ model: "gemini-pro" });
          
          const userContext = `User Profile:
            - Age: ${userData.age}
            - Height: ${userData.height}cm
            - Weight: ${userData.weight}kg
            - Sleep: ${userData.sleepTime}h/night
            - Screen Time: ${userData.screenTime}h/day
            - Morning Meal: ${userData.morningFood}
            - Evening Meal: ${userData.eveningFood}
            - Activity Level: ${userData.activityLevel || 'moderate'}

            Based on these accurate metrics:
            - Sleep Percentage: ${sleepScore.toFixed(1)}%
            - Screen Time Suitability: ${screenTimeScore.toFixed(1)}%
            - Health Risk Increase: ${healthRiskPercentage.toFixed(1)}%
            - BMI: ${Math.round(userData.weight / ((userData.height / 100) ** 2))}

            Provide:
            1. Personalized sleep quality evaluation
            2. Screen time impact analysis
            3. Two actionable improvement tips for each
            4. Health risk assessment

            Return JSON format:
            {
              sleep: {
                recommendation: string,
                tips: string[],
                factors: string[]
              },
              screen: {
                recommendation: string,
                tips: string[],
                factors: string[]
              },
              healthRisk: string
            }`;
          
          const result = await model.generateContent(userContext);
          const response = await result.response.text();
          const healthData = JSON.parse(response.trim());

          return [
            { 
              category: 'Sleep Quality', 
              score: sleepScore,
              recommendation: healthData.sleep.recommendation || 
                `${userData.sleepTime}h sleep (${sleepScore.toFixed(1)}% of recommended)`,
              improvementTips: healthData.sleep.tips || [
                userData.sleepTime < 7 ? 'Aim for 7-9 hours of sleep' : 'Maintain consistent sleep schedule',
                'Create a dark, cool sleeping environment'
              ],
              needsImprovement: sleepScore < 70,
              factors: healthData.sleep.factors || [
                'Duration', 
                `Health Impact: ${healthRiskPercentage.toFixed(1)}% higher risk`
              ],
              icon: <Bed className="h-5 w-5" />
            },
            { 
              category: 'Screen Time', 
              score: screenTimeScore,
              recommendation: healthData.screen.recommendation || 
                `${userData.screenTime}h daily (${(100 - screenTimeScore).toFixed(1)}% of day)`,
              improvementTips: healthData.screen.tips || [
                userData.screenTime > 2 ? 'Take regular breaks every 30 minutes' : 'Maintain current healthy habits',
                'Avoid screens 1 hour before bedtime'
              ],
              needsImprovement: screenTimeScore < 70,
              factors: healthData.screen.factors || [
                'Daily Duration', 
                'Pre-bedtime Usage',
                `Daily Percentage: ${(100 - screenTimeScore).toFixed(1)}%`
              ],
              icon: <Smartphone className="h-5 w-5" />
            },
            { 
              category: 'Physical Health', 
              score: physicalScore,
              recommendation: healthData.healthRisk || 
                `BMI: ${Math.round(userData.weight / ((userData.height / 100) ** 2))} (${physicalScore < 70 ? 'Needs improvement' : 'Healthy'})`,
              improvementTips: [
                physicalScore < 70 ? 'Increase physical activity' : 'Maintain current routine',
                'Balance your macronutrients'
              ],
              needsImprovement: physicalScore < 70,
              factors: [
                'BMI', 
                'Weight',
                `Health Risk: ${healthRiskPercentage.toFixed(1)}% higher`
              ],
              icon: <Activity className="h-5 w-5" />
            }
          ];
        }

        // Fallback without AI
        return [
          { 
            category: 'Sleep Quality', 
            score: sleepScore,
            recommendation: `${userData.sleepTime}h sleep (${sleepScore.toFixed(1)}% of recommended)`,
            improvementTips: [
              userData.sleepTime < 7 ? 'Aim for 7-9 hours of sleep' : 'Maintain consistent sleep schedule',
              'Create a dark, cool sleeping environment'
            ],
            needsImprovement: sleepScore < 70,
            factors: [
              'Duration', 
              `Health Impact: ${healthRiskPercentage.toFixed(1)}% higher risk`
            ],
            icon: <Bed className="h-5 w-5" />
          },
          { 
            category: 'Screen Time', 
            score: screenTimeScore,
            recommendation: `${userData.screenTime}h daily (${(100 - screenTimeScore).toFixed(1)}% of day)`,
            improvementTips: [
              userData.screenTime > 2 ? 'Take regular breaks every 30 minutes' : 'Maintain current healthy habits',
              'Avoid screens 1 hour before bedtime'
            ],
            needsImprovement: screenTimeScore < 70,
            factors: [
              'Daily Duration', 
              'Pre-bedtime Usage',
              `Daily Percentage: ${(100 - screenTimeScore).toFixed(1)}%`
            ],
            icon: <Smartphone className="h-5 w-5" />
          },
          { 
            category: 'Physical Health', 
            score: physicalScore,
            recommendation: `BMI: ${Math.round(userData.weight / ((userData.height / 100) ** 2))} (${physicalScore < 70 ? 'Needs improvement' : 'Healthy'})`,
            improvementTips: [
              physicalScore < 70 ? 'Increase physical activity' : 'Maintain current routine',
              'Balance your macronutrients'
            ],
            needsImprovement: physicalScore < 70,
            factors: [
              'BMI', 
              'Weight',
              `Health Risk: ${healthRiskPercentage.toFixed(1)}% higher`
            ],
            icon: <Activity className="h-5 w-5" />
          }
        ];
      } catch (error) {
        console.error("Health analysis failed:", error);
        // Basic fallback with accurate formulas
        const sleepScore = (userData.sleepTime / 8) * 100;
        const screenTimeScore = 100 - (userData.screenTime / 24) * 100;
         
        const bmi = Math.round(userData.weight / ((userData.height / 100) ** 2));
        const physicalScore = bmi < 18 ? 65 : bmi < 25 ? 85 : bmi < 30 ? 70 : 55;

        return [
          { 
            category: 'Sleep Quality', 
            score: sleepScore,
            recommendation: `${userData.sleepTime}h sleep (${sleepScore.toFixed(1)}% of recommended)`,
            improvementTips: [
              'Establish consistent bedtime routine',
              'Reduce screen time before bed'
            ],
            needsImprovement: sleepScore < 70,
            factors: ['Duration', 'Health Impact'],
            icon: <Bed className="h-5 w-5" />
          },
          { 
            category: 'Screen Time', 
            score: screenTimeScore,
            recommendation: `${userData.screenTime}h daily (${(100 - screenTimeScore).toFixed(1)}% of day)`,
            improvementTips: [
              'Use blue light filters in evening',
              'Set app usage limits'
            ],
            needsImprovement: screenTimeScore < 70,
            factors: ['Daily Duration', 'Percentage of Day'],
            icon: <Smartphone className="h-5 w-5" />
          },
          { 
            category: 'Physical Health', 
            score: physicalScore,
            recommendation: `BMI: ${bmi} (${bmi < 18 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese'})`,
            improvementTips: [
              'Incorporate strength training',
              'Balance macronutrients'
            ],
            needsImprovement: bmi < 18 || bmi >= 25,
            factors: ['BMI', 'Activity Level'],
            icon: <Activity className="h-5 w-5" />
          }
        ];
      }
    };

    const timer = setTimeout(async () => {
      const calculatedMetrics = await calculateHealthMetrics();
      setMetrics(calculatedMetrics);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [userData, ai]);

  // Color coding for scores
  const getScoreColor = (score: number) => 
    score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

  if (loading) {
    return (
      <div className={`flex justify-center p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${darkMode ? 'border-blue-500' : 'border-blue-400'}`}></div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 max-w-md mx-auto transition-colors duration-300 shadow-xl ${
      darkMode ? 'bg-white' :'dark:bg-gray-800'
    }`}>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.category} className={`rounded-lg p-4 transition-colors duration-300 shadow-lg ${
            darkMode ?  'bg-gray-50' : 'dark:bg-gray-700' 
          }`}>
            <div className="flex items-center">
              <div className="relative w-14 h-14 mr-3">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke={darkMode ? '#E5E7EB' : '#4B5563'} 
                    strokeWidth="8"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke={getScoreColor(metric.score)} 
                    strokeWidth="8"
                    strokeDasharray={`${metric.score * 2.51}, 251`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <span 
                  className="absolute inset-0 flex items-center justify-center text-sm font-bold" 
                  style={{ color: getScoreColor(metric.score) }}
                >
                  {Math.round(metric.score)}%
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-2 ${
                    darkMode ?  'bg-gray-200' : 'dark:bg-gray-600'
                  }`}>
                    {metric.icon}
                  </div>
                  <h3 className={`font-medium ${
                    darkMode ?   'text-gray-900' : 'dark:text-white'
                  }`}>
                    {metric.category}
                  </h3>
                </div>
                <p className={`text-sm mt-1 ${
                  darkMode ?   'text-gray-600' : 'dark:text-gray-300'
                }`}>
                  {metric.recommendation}
                </p>
                {metric.factors && (
                  <p className={`text-xs mt-1 ${
                    darkMode ?  'text-gray-500' : 'dark:text-gray-400'
                  }`}>
                    Factors: {metric.factors.join(', ')}
                  </p>
                )}
              </div>
            </div>
            
            {metric.needsImprovement && metric.improvementTips && (
              <div className={`mt-3 p-3 rounded text-xs ${
                darkMode ?   'bg-blue-50 text-blue-800' : 'dark:bg-gray-600 dark:text-blue-200'
              }`}>
                <p className="font-medium">Action Plan:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {metric.improvementTips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthMetricsDashboard;