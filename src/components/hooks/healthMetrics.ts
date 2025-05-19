import { UserData, HealthInsight } from '../types/types';

const API_KEY = 'AIzaSyBy0KCb5kFziYZC5gXkFgB3mXEmMzsatTE';
const AI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

let sessionHealthMetrics: HealthInsight[] | null = null;

export const getHealthMetrics = async (userData: UserData): Promise<HealthInsight[]> => {
  if (sessionHealthMetrics) return sessionHealthMetrics;

  const baseMetrics = calculateComprehensiveHealthMetrics(userData);
  const aiEnhancedMetrics = await getAIHealthInsights(baseMetrics, userData);

  sessionHealthMetrics = aiEnhancedMetrics;
  return aiEnhancedMetrics;
};

const calculateComprehensiveHealthMetrics = (userData: UserData): HealthInsight[] => {
  const sleepQuality = calculateSleepQualityScore(userData);
  const nutritionScore = calculateNutritionScore(userData);
  const physicalHealth = calculatePhysicalHealthScore(userData, sleepQuality, nutritionScore);
  const mentalWellbeing = calculateMentalWellbeingScore(userData, sleepQuality);

  return [
    {
      category: 'Physical Health',
      score: physicalHealth,
      recommendation: ''
    },
    {
      category: 'Sleep Quality',
      score: sleepQuality,
      recommendation: ''
    },
    {
      category: 'Nutrition',
      score: nutritionScore,
      recommendation: ''
    },
    {
      category: 'Mental Wellbeing',
      score: mentalWellbeing,
      recommendation: ''
    }
  ];
};

const calculatePhysicalHealthScore = (
  userData: UserData,
  sleepScore: number,
  dietScore: number
): number => {
  // Calculate all components
  const bmiScore = calculateBMIScore(userData.height, userData.weight) * 0.4;
  const sleepComponent = (sleepScore / 100) * 0.2;
  const dietComponent = (dietScore / 100) * 0.2;
  const screenTimeScore = calculateScreenTimeScore(userData.screenTime) * 0.15;
  const medicalBonus = calculateMedicalBonus(userData.medicalCheckups) * 0.05;

  // Combine all components
  const totalScore = Math.round(
    (bmiScore + sleepComponent + dietComponent + screenTimeScore + medicalBonus) * 100
  );

  return Math.min(100, Math.max(0, totalScore));
};

const calculateBMIScore = (height: number, weight: number): number => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  if (bmi < 18.5) return 60;  // Underweight
  if (bmi < 25) return 90;    // Healthy
  if (bmi < 30) return 70;    // Overweight
  return 50;                  // Obese
};

const calculateScreenTimeScore = (screenTime: number): number => {
  if (screenTime <= 2) return 100;
  if (screenTime <= 4) return 80;
  if (screenTime <= 6) return 60;
  if (screenTime <= 8) return 40;
  if (screenTime <= 10) return 20;
  return 0;
};

const calculateMedicalBonus = (checkups: string[]): number => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return checkups.some(c => new Date(c) > sixMonthsAgo) ? 100 : 0;
};

const calculateSleepQualityScore = (userData: UserData): number => {
  const optimalSleepHours = 8;
  const maxRecommendedScreenTime = 10;
  
  const sleepDurationScore = Math.min(70, 
    Math.max(0, (userData.sleepTime / optimalSleepHours) * 70)
  );
  
  const screenTimePenalty = Math.min(30, 
    (userData.screenTime / maxRecommendedScreenTime) * 30
  );
  
  return Math.round(sleepDurationScore + (30 - screenTimePenalty));
};

const calculateNutritionScore = (userData: UserData): number => {
  const healthyKeywords = [
    'fruits', 'vegetables', 'whole grains', 'lean protein', 
    'nuts', 'salad', 'fish', 'chicken', 'yogurt', 'legumes'
  ];
  
  const unhealthyKeywords = [
    'fast food', 'processed', 'sugary', 'fried', 
    'junk', 'soda', 'candy', 'dessert', 'pastries'
  ];
  
  let score = 70;
  
  const morningMeal = userData.morningFood.toLowerCase();
  const isHealthyMorning = healthyKeywords.some(k => morningMeal.includes(k));
  const isUnhealthyMorning = unhealthyKeywords.some(k => morningMeal.includes(k));
  
  if (isHealthyMorning) score += 15;
  if (isUnhealthyMorning) score -= 20;
  
  const eveningMeal = userData.eveningFood.toLowerCase();
  const isHealthyEvening = healthyKeywords.some(k => eveningMeal.includes(k));
  const isUnhealthyEvening = unhealthyKeywords.some(k => eveningMeal.includes(k));
  
  if (isHealthyEvening) score += 15;
  if (isUnhealthyEvening) score -= 20;
  
  return Math.max(0, Math.min(100, score));
};

const calculateMentalWellbeingScore = (userData: UserData, sleepQuality: number): number => {
  const sleepImpact = sleepQuality * 0.4;
  const screenTimeImpact = (100 - (userData.screenTime * 5)) * 0.3;
  const nutritionImpact = (calculateNutritionScore(userData) / 100) * 30;
  
  return Math.round(sleepImpact + screenTimeImpact + nutritionImpact);
};

const getAIHealthInsights = async (metrics: HealthInsight[], userData: UserData): Promise<HealthInsight[]> => {
  try {
    const prompt = `As a health expert, analyze these metrics and provide specific recommendations:
    
    User Profile:
    - Age: ${userData.age}
    - Height: ${userData.height}cm
    - Weight: ${userData.weight}kg
    - Screen Time: ${userData.screenTime} hours/day
    - Sleep: ${userData.sleepTime} hours/night
    - Breakfast: ${userData.morningFood}
    - Dinner: ${userData.eveningFood}
    - Recent Checkups: ${userData.medicalCheckups.length > 0 ? 'Yes' : 'No'}
    
    Health Metrics:
    ${metrics.map(m => `- ${m.category}: ${m.score}/100`).join('\n')}
    
    Provide concise, actionable recommendations for each category:`;

    const response = await fetch(`${AI_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return metrics.map(metric => {
      const categoryPattern = new RegExp(`${metric.category}.*?:?\\s*([^-]+)(?=-|$)`, 'i');
      const match = aiResponse.match(categoryPattern);
      
      return {
        ...metric,
        recommendation: match ? match[1].trim() : getFallbackRecommendation(metric.category, metric.score)
      };
    });

  } catch (error) {
    console.error('AI API Error:', error);
    return metrics.map(metric => ({
      ...metric,
      recommendation: getFallbackRecommendation(metric.category, metric.score)
    }));
  }
};

const getFallbackRecommendation = (category: string, score: number): string => {
  switch(category) {
    case 'Physical Health':
      if (score > 85) return 'Excellent physical health! Maintain your current routine.';
      if (score > 70) return 'Good physical health. Consider adding strength training 2-3 times weekly.';
      if (score > 50) return 'Needs improvement. Aim for 150 mins of moderate exercise weekly.';
      return 'Consult a healthcare provider for personalized advice.';
    
    case 'Sleep Quality':
      if (score > 85) return 'Excellent sleep habits! Keep your consistent schedule.';
      if (score > 70) return 'Good sleep. Try reducing screen time before bed by 30 minutes.';
      if (score > 50) return 'Sleep needs work. Establish a regular bedtime routine.';
      return 'Severe sleep issues detected. Consider professional evaluation.';
    
    case 'Nutrition':
      if (score > 85) return 'Excellent diet! Continue eating balanced meals.';
      if (score > 70) return 'Good diet. Try adding more vegetables to your meals.';
      if (score > 50) return 'Diet needs improvement. Reduce processed food intake.';
      return 'Poor nutrition habits. Consider consulting a nutritionist.';
    
    case 'Mental Wellbeing':
      if (score > 85) return 'Great mental health! Keep practicing self-care.';
      if (score > 70) return 'Good mental state. Try daily mindfulness exercises.';
      if (score > 50) return 'Could be better. Reduce stress through regular breaks.';
      return 'Mental health concerns detected. Consider speaking with a professional.';
    
    default:
      return 'Focus on balanced lifestyle habits for better health.';
  }
};

export const clearHealthMetricsCache = () => {
  sessionHealthMetrics = null;
};