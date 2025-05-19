import React, { useState, useEffect, useMemo } from 'react';

interface EmotionalTone {
  positive: number;
  negative: number;
  neutral: number;
}

interface StressIndicators {
  stressLevel: number;
  anxietyKeywords: number;
  sleepDisruption: number;
}

interface UsagePatterns {
  dailyAverage: number;
  peakHours: string[];
  weeklyTotal: number;
  platformBreakdown: Record<string, number>;
  hourlyUsage: {
    hour: string;
    activity: number;
  }[];
  usageConsistency: number;
  notificationFrequency: number;
}

interface ContentAnalysis {
  positiveContentRatio: number;
  negativeContentRatio: number;
  engagementRatio: number;
  mostUsedEmoji: string;
  postFrequency: string;
}

interface Recommendations {
  immediateActions: string[];
  longTermStrategies: string[];
  professionalHelp?: string[];
  platformSpecificTips: string[];
}

interface Comparison {
  platformAverage: number;
  ageGroupAverage: number;
  similarProfilesAverage: number;
}

interface MentalHealthReport {
  overallScore: number;
  emotionalTone: EmotionalTone;
  stressIndicators: StressIndicators;
  usagePatterns: UsagePatterns;
  contentAnalysis: ContentAnalysis;
  recommendations: Recommendations;
  comparison: Comparison;
  lastUpdated: string;
}

interface PlatformData {
  texts: string[];
  usageData: {
    dailyAverage: number;
    weeklyTotal: number;
    peakHours: string[];
    hourlyUsage: {
      hour: string;
      activity: number;
    }[];
    notificationCount: number;
    activeDays: string[];
  };
}

type SocialPlatform = 'twitter' | 'instagram';

// Consistent data generator based on URL with more variation
const generateConsistentData = (profileUrl: string, platform: SocialPlatform): PlatformData => {
  // Create consistent seed from URL
  const seed = Array.from(profileUrl).reduce((hash, char) => 
    (hash << 5) - hash + char.charCodeAt(0), 0) >>> 0;
  
  // Consistent pseudo-random number generator with more variation
  const random = (max = 1, min = 0, variation = 0) => {
    const x = Math.sin(seed + max * min * 1000 + variation) * 10000;
    return Math.abs(x - Math.floor(x)) * (max - min) + min;
  };

  // Platform-specific content variations
  const platformModifier = platform === 'twitter' ? 1.2 : 0.8;
  
  // Expanded text pools with different sentiments
  const positiveTexts = [
    "Had an amazing day today! The weather was perfect for a walk in the park #blessed",
    "Just completed my first 10K run! Never thought I could do it but here we are 🏃‍♂️ #fitnessgoals",
    "The support from my followers has been incredible lately. Thank you all for the love! ❤️",
    "Finished reading an inspiring book that changed my perspective on life. Highly recommend!",
    "My team just launched our biggest project yet! So proud of what we've accomplished together",
    "Spent quality time with family today. These moments are truly priceless 👨‍👩‍👧‍👦",
    "Achieved a personal milestone at work today! Celebrating small wins is important",
    "The sunset tonight was absolutely magical. Nature's beauty never fails to amaze me 🌅",
    "Learned a new skill today and already seeing progress. Never too late to grow!",
    "Gratitude journal entry: thankful for good health, loving friends, and new opportunities"
  ];

  const negativeTexts = [
    "Another night of staring at the ceiling. When will this insomnia end? 😣 #sleepless",
    "The pressure just keeps building up. Feeling like I'm drowning in responsibilities...",
    "Why do people have to be so negative online? Taking a break from social media for a while",
    "Missed another important deadline. The stress is becoming unbearable at this point",
    "Comparison is truly the thief of joy. Need to stop measuring myself against others",
    "Anxiety is through the roof today. Breathing exercises aren't even helping anymore",
    "The loneliness is crushing lately. Everyone seems to be moving forward except me",
    "Another argument with loved ones. When did everything become so complicated?",
    "The negative news cycle is really affecting my mental health. Need to unplug",
    "Feel like I'm stuck in a rut with no way out. When will things start looking up?"
  ];

  const neutralTexts = [
    "Checking out the new coffee shop downtown. The latte art is impressive ☕",
    "Just shared my latest blog post about urban gardening. Link in bio!",
    "Working from home today. The peace and quiet is much needed",
    "Weekend plans: catching up on laundry and maybe watching a movie or two",
    "The new software update has some interesting features. Still exploring them all",
    "Traffic was unusually light this morning. Got to work 15 minutes early!",
    "Trying out a new recipe for dinner tonight. Hope it turns out well",
    "My plants seem to be thriving with this new fertilizer. Growth is noticeable",
    "The library just got some new titles in. Time to renew my reading habit",
    "Found an interesting podcast about productivity. Will give it a listen during my commute"
  ];

  // Determine profile temperament (consistent for same URL)
  const positivityRatio = random(0.3, 0.8, 1) * platformModifier;
  const negativityRatio = random(0.1, 0.5, 2) * platformModifier;
  
  // Generate texts based on profile temperament with more variation
  const texts = Array.from({ length: 15 + Math.floor(random(10, 0, 3)) }, (_, i) => {
    const r = random(1, 0, i);
    if (r < positivityRatio) {
      return positiveTexts[Math.floor(random(positiveTexts.length, 0, i))];
    } else if (r < positivityRatio + negativityRatio) {
      return negativeTexts[Math.floor(random(negativeTexts.length, 0, i))];
    } else {
      return neutralTexts[Math.floor(random(neutralTexts.length, 0, i))];
    }
  });

  // Generate more varied usage patterns
  const usagePattern = Math.floor(random(4, 0, 4)); // 0-3 different patterns
  let dailyAverage, weeklyTotal, peakHours, notificationCount, activeDays;
  
  // Different usage pattern types
  switch(usagePattern) {
    case 0: // Heavy evening user
      dailyAverage = random(4.5, 3.0, 5) * (platform === 'twitter' ? 1.1 : 0.9);
      peakHours = platform === 'twitter' 
        ? ['7 PM-10 PM', '10 PM-1 AM'] 
        : ['6 PM-9 PM', '9 PM-12 AM'];
      notificationCount = Math.floor(random(120, 80, 6));
      activeDays = ['Mon', 'Wed', 'Fri', 'Sat', 'Sun'];
      break;
    case 1: // Balanced daytime user
      dailyAverage = random(2.5, 1.5, 7) * (platform === 'twitter' ? 1.0 : 1.0);
      peakHours = platform === 'twitter'
        ? ['12 PM-3 PM', '5 PM-8 PM']
        : ['1 PM-4 PM', '7 PM-10 PM'];
      notificationCount = Math.floor(random(60, 40, 8));
      activeDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      break;
    case 2: // Early morning user
      dailyAverage = random(1.8, 1.0, 9) * (platform === 'twitter' ? 0.9 : 1.1);
      peakHours = platform === 'twitter'
        ? ['6 AM-9 AM', '12 PM-3 PM']
        : ['7 AM-10 AM', '4 PM-7 PM'];
      notificationCount = Math.floor(random(50, 30, 10));
      activeDays = ['Tue', 'Thu', 'Sat'];
      break;
    case 3: // Weekend warrior
      dailyAverage = random(3.2, 2.0, 11) * (platform === 'twitter' ? 1.0 : 1.2);
      peakHours = platform === 'twitter'
        ? ['11 AM-2 PM', '8 PM-11 PM']
        : ['10 AM-1 PM', '9 PM-12 AM'];
      notificationCount = Math.floor(random(90, 60, 12));
      activeDays = ['Fri', 'Sat', 'Sun'];
      break;
    default:
      dailyAverage = random(2.0, 1.0, 13);
      peakHours = ['12 PM-3 PM'];
      notificationCount = Math.floor(random(50, 30, 14));
      activeDays = ['Mon', 'Wed', 'Fri'];
  }
  
  weeklyTotal = Math.round(dailyAverage * 7 * 100) / 100;

  // Generate hourly usage pattern with more variation
  const hourlyUsage = Array.from({ length: 24 }, (_, hour) => {
    let activity = 0;
    const normalizedHour = hour % 12 || 12;
    const period = hour < 12 ? 'AM' : 'PM';
    
    // Different patterns based on usage type
    if (usagePattern === 0) { // Evening user
      if (hour >= 18 && hour <= 23) {
        activity = random(40, 60, hour);
      } else if (hour >= 12 && hour <= 17) {
        activity = random(20, 35, hour);
      } else {
        activity = random(5, 15, hour);
      }
    } else if (usagePattern === 1) { // Daytime user
      if (hour >= 9 && hour <= 17) {
        activity = random(30, 50, hour);
      } else if (hour >= 18 && hour <= 21) {
        activity = random(20, 30, hour);
      } else {
        activity = random(0, 10, hour);
      }
    } else if (usagePattern === 2) { // Morning user
      if (hour >= 5 && hour <= 9) {
        activity = random(35, 55, hour);
      } else if (hour >= 12 && hour <= 15) {
        activity = random(20, 30, hour);
      } else {
        activity = random(5, 15, hour);
      }
    } else { // Weekend user
      if ((hour >= 10 && hour <= 14) || (hour >= 20 && hour <= 23)) {
        activity = random(35, 60, hour);
      } else {
        activity = random(5, 20, hour);
      }
    }
    
    // Add some random spikes
    if (random(1, 0, hour) > 0.9) {
      activity += random(15, 5, hour + 100);
    }
    
    return {
      hour: `${normalizedHour} ${period}`,
      activity: Math.floor(activity)
    };
  });

  return {
    texts,
    usageData: {
      dailyAverage,
      weeklyTotal,
      peakHours,
      hourlyUsage,
      notificationCount,
      activeDays
    }
  };
};

// Mock API responses with consistent data
const mockPlatformAPIs = {
  twitter: async (profileUrl: string): Promise<PlatformData> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return generateConsistentData(profileUrl, 'twitter');
  },
  instagram: async (profileUrl: string): Promise<PlatformData> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return generateConsistentData(profileUrl, 'instagram');
  }
};

// Enhanced NLP analysis functions
const analyzeEmotionalTone = (texts: string[]): EmotionalTone => {
  let positive = 0;
  let negative = 0;
  let neutral = 0;
  
  const positiveKeywords = [
    'happy', 'great', 'excited', 'proud', 'blessed', 'grateful', 'beautiful', 
    'achievement', 'amazing', 'perfect', 'incredible', 'inspiring', 'priceless',
    'magical', 'thankful', 'progress', 'quality time', 'support', 'love', 'joy'
  ];
  
  const negativeKeywords = [
    'overwhelmed', 'complicated', 'struggle', 'toxic', 'anxiety', 'hard', 
    'sleepless', 'pressure', 'drowning', 'negative', 'stress', 'unbearable',
    'comparison', 'loneliness', 'crushing', 'argument', 'stuck', 'insomnia',
    'missed', 'dread'
  ];
  
  texts.forEach(text => {
    const lowerText = text.toLowerCase();
    const posMatches = positiveKeywords.filter(kw => lowerText.includes(kw)).length;
    const negMatches = negativeKeywords.filter(kw => lowerText.includes(kw)).length;
    
    if (posMatches > negMatches) positive++;
    else if (negMatches > posMatches) negative++;
    else neutral++;
  });
  
  const total = texts.length || 1;
  return {
    positive: Math.round((positive / total) * 100),
    negative: Math.round((negative / total) * 100),
    neutral: Math.round((neutral / total) * 100)
  };
};

const detectStressIndicators = (texts: string[]): StressIndicators => {
  const anxietyKeywords = [
    'anxiety', 'overwhelmed', 'stress', 'pressure', 'worry', 'nervous',
    'dread', 'panic', 'tense', 'fear', 'apprehension', 'uneasy'
  ];
  
  const sleepKeywords = [
    'sleepless', 'can\'t sleep', 'insomnia', 'tired', 'exhausted',
    'fatigue', 'restless', 'awake', 'night', 'sleep deprivation'
  ];
  
  let anxietyCount = 0;
  let sleepCount = 0;
  
  texts.forEach(text => {
    const lowerText = text.toLowerCase();
    anxietyCount += anxietyKeywords.filter(kw => lowerText.includes(kw)).length;
    sleepCount += sleepKeywords.filter(kw => lowerText.includes(kw)).length;
  });
  
  // Calculate stress level with more nuanced factors
  const stressLevel = Math.min(100, Math.round(
    (anxietyCount * 6) + 
    (sleepCount * 4) + 
    (texts.length > 15 ? 10 : 0) + // More posts might indicate rumination
    (Math.random() * 15) // Some randomness
  ));
  
  return {
    stressLevel,
    anxietyKeywords: anxietyCount,
    sleepDisruption: sleepCount
  };
};

const calculateUsageScore = (usageData: {
  dailyAverage: number;
  hourlyUsage: { hour: string; activity: number }[];
  notificationCount: number;
}): number => {
  // Score based on daily average (higher usage = higher potential negative impact)
  const dailyScore = Math.min(100, Math.round(
    (usageData.dailyAverage / 6) * 100
  ));
  
  // Score based on late-night usage
  const lateNightUsage = usageData.hourlyUsage
    .filter(h => {
      const hour = parseInt(h.hour.split(' ')[0]);
      const period = h.hour.split(' ')[1];
      return (period === 'PM' && hour >= 10) || (period === 'AM' && hour <= 5);
    })
    .reduce((sum, h) => sum + h.activity, 0);
  
  const lateNightScore = Math.min(50, Math.round(
    (lateNightUsage / 150) * 50
  ));
  
  // Score based on notification frequency
  const notificationScore = Math.min(30, Math.round(
    (usageData.notificationCount / 200) * 30
  ));
  
  return Math.round(
    (dailyScore * 0.6) + 
    (lateNightScore * 0.25) + 
    (notificationScore * 0.15)
  );
};

const generateRecommendations = (report: {
  emotionalTone: EmotionalTone;
  stressIndicators: StressIndicators;
  usagePatterns: UsagePatterns;
  platform: SocialPlatform;
}): Recommendations => {
  const recommendations: Recommendations = {
    immediateActions: [],
    longTermStrategies: [],
    platformSpecificTips: []
  };
  
  // Immediate actions 
  if (report.usagePatterns.dailyAverage > 3) {
    recommendations.immediateActions.push(
      "Set app usage limits to 2 hours per day on your device",
      "Designate tech-free zones (bedroom, dining table) and times (first hour after waking)"
    );
  }
  
  if (report.stressIndicators.stressLevel > 60) {
    recommendations.immediateActions.push(
      "Practice the 4-7-8 breathing technique: inhale 4s, hold 7s, exhale 8s",
      "Implement a 30-minute digital detox right now - step away from all screens"
    );
  }
  
  if (report.usagePatterns.notificationFrequency > 50) {
    recommendations.immediateActions.push(
      "Disable non-essential notifications immediately",
      "Schedule notification check-ins 3 times daily instead of instant alerts"
    );
  }
  
  // Long-term strategies
  recommendations.longTermStrategies.push(
    "Establish a consistent sleep schedule with 7-9 hours of quality sleep",
    "Develop at least two offline hobbies that don't involve screens",
    "Implement a 'no screens' policy for at least one weekend day per month"
  );
  
  if (report.emotionalTone.negative > 30) {
    recommendations.longTermStrategies.push(
      "Practice gratitude journaling every morning - list 3 things you're thankful for",
      "Curate your feed by unfollowing accounts that trigger negative emotions"
    );
  }
  
  if (report.usagePatterns.usageConsistency < 50) {
    recommendations.longTermStrategies.push(
      "Create a content schedule to maintain healthier posting habits",
      "Track your mood before and after social media use to identify patterns"
    );
  }
  
  // Platform-specific tips
  if (report.platform === 'twitter') {
    recommendations.platformSpecificTips.push(
      "Use Twitter Lists to organize content and reduce chaotic scrolling",
      "Enable 'Quality Filter' in settings to reduce low-quality content",
      "Consider using TweetDeck for more controlled Twitter consumption"
    );
  } else {
    recommendations.platformSpecificTips.push(
      "Use the 'Mute' feature liberally for accounts that trigger comparison",
      "Enable 'Activity Reminder' to get alerts after 45 minutes of continuous use",
      "Try switching to a black-and-white display mode to reduce visual appeal"
    );
  }
  
  // Professional help suggestions
  if (report.stressIndicators.stressLevel > 80 || report.emotionalTone.negative > 50) {
    recommendations.professionalHelp = [
      "Schedule a consultation with a licensed therapist specializing in digital wellness",
      "Explore cognitive behavioral therapy apps like Woebot or Sanvello",
      "Contact the National Mental Health Helpline at 1-800-662-HELP (4357)"
    ];
  }
  
  return recommendations;
};

const analyzeContentPatterns = (texts: string[], platform: SocialPlatform): ContentAnalysis => {
  // Determine most used emoji
  const emojiRegex = /[\p{Emoji}]/gu;
  const emojiCounts: Record<string, number> = {};
  
  texts.forEach(text => {
    const emojis = text.match(emojiRegex) || [];
    emojis.forEach(emoji => {
      emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
    });
  });
  
  const mostUsedEmoji = Object.keys(emojiCounts).reduce((a, b) => 
    emojiCounts[a] > emojiCounts[b] ? a : b, '❤️') || 'None';
  
  // Determine post frequency pattern
  const postCount = texts.length;
  let postFrequency;
  if (postCount > 20) {
    postFrequency = 'Very Frequent (multiple times daily)';
  } else if (postCount > 10) {
    postFrequency = 'Frequent (daily)';
  } else if (postCount > 5) {
    postFrequency = 'Moderate (every few days)';
  } else {
    postFrequency = 'Infrequent (weekly or less)';
  }
  
  // Platform-specific engagement
  const engagementRatio = platform === 'twitter' 
    ? 30 + (Math.random() * 50) // 30-80%
    : 20 + (Math.random() * 60); // 20-80%
  
  const emotionalTone = analyzeEmotionalTone(texts);
  
  return {
    positiveContentRatio: emotionalTone.positive,
    negativeContentRatio: emotionalTone.negative,
    engagementRatio: parseFloat(engagementRatio.toFixed(1)),
    mostUsedEmoji,
    postFrequency
  };
};

const calculateUsageConsistency = (activeDays: string[]): number => {
  const dayValues: Record<string, number> = {
    'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 
    'Fri': 5, 'Sat': 6, 'Sun': 7
  };
  
  const activeDayNumbers = activeDays.map(day => dayValues[day]).sort();
  if (activeDayNumbers.length === 0) return 0;
  
  // Calculate consistency based on spread of active days
  const spread = activeDayNumbers[activeDayNumbers.length - 1] - activeDayNumbers[0];
  const consistency = 100 - ((spread / 7) * 100);
  
  return Math.max(0, Math.min(100, Math.round(consistency)));
};

const SocialMediaMentalHealthAnalyzer: React.FC = () => {
  const [profileUrl, setProfileUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<MentalHealthReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<SocialPlatform | null>(null);

  // Cache reports by URL to ensure consistency
  const reportCache = useMemo(() => new Map<string, MentalHealthReport>(), []);

  useEffect(() => {
    if (profileUrl) {
      if (profileUrl.includes('twitter.com') || profileUrl.includes('x.com')) {
        setPlatform('twitter');
      } else if (profileUrl.includes('instagram.com')) {
        setPlatform('instagram');
      } else {
        setPlatform(null);
      }
    }
  }, [profileUrl]);

  const analyzeProfile = async () => {
    if (!profileUrl || !platform) return;
    
    // Check cache first to avoid re-analysis
    if (reportCache.has(profileUrl)) {
      setReport(reportCache.get(profileUrl)!);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setReport(null);

    try {
      // Get platform data
      const platformResponse = await mockPlatformAPIs[platform](profileUrl);
      
      // Perform analysis
      const emotionalTone = analyzeEmotionalTone(platformResponse.texts);
      const stressIndicators = detectStressIndicators(platformResponse.texts);
      const contentAnalysis = analyzeContentPatterns(platformResponse.texts, platform);
      const usageConsistency = calculateUsageConsistency(platformResponse.usageData.activeDays);
      
      // Calculate usage score with more factors
      const usageScore = calculateUsageScore({
        dailyAverage: platformResponse.usageData.dailyAverage,
        hourlyUsage: platformResponse.usageData.hourlyUsage,
        notificationCount: platformResponse.usageData.notificationCount
      });
      
      // Generate consistent comparison scores based on URL
      const seed = Array.from(profileUrl).reduce((hash, char) => 
        (hash << 5) - hash + char.charCodeAt(0), 0);
      const platformAvg = 65 + (seed % 20); // 65-85
      const ageGroupAvg = 60 + (seed % 25); // 60-85
      const similarProfilesAvg = 55 + (seed % 30); // 55-85
      
      // Calculate overall score (weighted average)
      const overallScore = Math.round(
        (emotionalTone.positive * 0.35) + 
        ((100 - stressIndicators.stressLevel) * 0.3) +
        ((100 - usageScore) * 0.25) +
        (usageConsistency * 0.1)
      );
      
      // Generate report
      const reportData: MentalHealthReport = {
        overallScore,
        emotionalTone,
        stressIndicators,
        usagePatterns: {
          dailyAverage: parseFloat(platformResponse.usageData.dailyAverage.toFixed(1)),
          peakHours: platformResponse.usageData.peakHours,
          weeklyTotal: Math.round(platformResponse.usageData.weeklyTotal),
          platformBreakdown: { [platform]: 100 },
          hourlyUsage: platformResponse.usageData.hourlyUsage,
          usageConsistency,
          notificationFrequency: platformResponse.usageData.notificationCount
        },
        contentAnalysis,
        recommendations: generateRecommendations({
          emotionalTone,
          stressIndicators,
          usagePatterns: {
            dailyAverage: platformResponse.usageData.dailyAverage,
            weeklyTotal: platformResponse.usageData.weeklyTotal,
            peakHours: platformResponse.usageData.peakHours,
            hourlyUsage: platformResponse.usageData.hourlyUsage,
            platformBreakdown: { [platform]: 100 },
            usageConsistency,
            notificationFrequency: platformResponse.usageData.notificationCount
          },
          platform
        }),
        comparison: {
          platformAverage: platformAvg,
          ageGroupAverage: ageGroupAvg,
          similarProfilesAverage: similarProfilesAvg
        },
        lastUpdated: new Date().toLocaleString()
      };
      
      // Cache the report
      reportCache.set(profileUrl, reportData);
      setReport(reportData);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze profile. Please try again with a valid URL.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">
        Social Media Mental Health Analyzer
      </h2>
      
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="Paste profile URL (e.g., twitter.com/username, instagram.com/username)"
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {platform && (
              <p className="text-sm text-gray-500 mt-1">
                Analyzing {platform} profile
              </p>
            )}
          </div>
          <button
            onClick={analyzeProfile}
            disabled={isAnalyzing || !platform}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : 'Analyze Profile'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Note: This demo uses simulated data. A production version would connect to real social media APIs.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-red-700 dark:text-red-300 mb-6">
          {error}
        </div>
      )}

      {report && (
        <div className="space-y-8">
          {/* Health Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h3 className="font-bold text-xl">Mental Health Assessment</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Based on {platform} activity analysis • Last updated: {report.lastUpdated}
                </p>
              </div>
              <div className="flex items-center mt-4 md:mt-0">
                <div className="text-center">
                  <span className={`text-4xl font-bold ${
                    report.overallScore >= 80 ? 'text-green-600' : 
                    report.overallScore >= 60 ? 'text-yellow-500' : 'text-red-600'
                  }`}>
                    {report.overallScore}
                  </span>
                  <span className="text-lg font-medium text-gray-500">/100</span>
                </div>
                <div className="ml-4">
                  <p className={`font-medium ${
                    report.overallScore >= 80 ? 'text-green-600' : 
                    report.overallScore >= 60 ? 'text-yellow-500' : 'text-red-600'
                  }`}>
                    {report.overallScore >= 80 ? 'Excellent' : 
                     report.overallScore >= 60 ? 'Moderate' : 'Needs Improvement'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Compared to {report.comparison.platformAverage} (platform avg)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className={`h-3 rounded-full ${
                  report.overallScore >= 80 ? 'bg-green-500' : 
                  report.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${report.overallScore}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Emotional Tone</p>
                <p className="font-medium">
                  {report.emotionalTone.positive}% positive
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Stress Level</p>
                <p className="font-medium">
                  {report.stressIndicators.stressLevel}/100
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Daily Usage</p>
                <p className="font-medium">
                  {report.usagePatterns.dailyAverage} hrs/day
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Usage Consistency</p>
                <p className="font-medium">
                  {report.usagePatterns.usageConsistency}%
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Analysis Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emotional Tone Analysis */}
            <div className="bg-white dark:bg-gray-700 p-5 rounded-xl shadow">
              <h4 className="font-semibold text-lg mb-3">Emotional Tone Analysis</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-green-600">Positive</span>
                    <span className="text-sm font-medium">{report.emotionalTone.positive}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${report.emotionalTone.positive}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-yellow-500">Neutral</span>
                    <span className="text-sm font-medium">{report.emotionalTone.neutral}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-yellow-500 h-2.5 rounded-full" 
                      style={{ width: `${report.emotionalTone.neutral}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-red-600">Negative</span>
                    <span className="text-sm font-medium">{report.emotionalTone.negative}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-red-600 h-2.5 rounded-full" 
                      style={{ width: `${report.emotionalTone.negative}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-3">
                {report.emotionalTone.positive > report.emotionalTone.negative ? 
                 "Your content shows predominantly positive emotions, which is great for mental wellbeing." : 
                 "Your content contains significant negative expressions that may warrant attention."}
              </p>
            </div>

            {/* Stress Indicators */}
            <div className="bg-white dark:bg-gray-700 p-5 rounded-xl shadow">
              <h4 className="font-semibold text-lg mb-3">Stress Indicators</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Overall Stress Level</span>
                    <span className={`text-sm font-medium ${
                      report.stressIndicators.stressLevel > 70 ? 'text-red-600' :
                      report.stressIndicators.stressLevel > 40 ? 'text-yellow-500' : 'text-green-600'
                    }`}>
                      {report.stressIndicators.stressLevel}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        report.stressIndicators.stressLevel > 70 ? 'bg-red-600' :
                        report.stressIndicators.stressLevel > 40 ? 'bg-yellow-500' : 'bg-green-600'
                      }`}
                      style={{ width: `${report.stressIndicators.stressLevel}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Anxiety Keywords</p>
                    <p className="font-medium">
                      {report.stressIndicators.anxietyKeywords} detected
                    </p>
                    <p className="text-xs text-gray-500">
                      {report.stressIndicators.anxietyKeywords > 5 ? 
                       "High frequency of stress-related language" : 
                       "Minimal anxiety indicators"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sleep Mentions</p>
                    <p className="font-medium">
                      {report.stressIndicators.sleepDisruption} references
                    </p>
                    <p className="text-xs text-gray-500">
                      {report.stressIndicators.sleepDisruption > 3 ? 
                       "Possible sleep disturbances indicated" : 
                       "Normal sleep patterns"}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  {report.stressIndicators.stressLevel > 70 ? 
                   "Your activity shows strong stress indicators that may require intervention. Consider implementing stress-reduction techniques." :
                   report.stressIndicators.stressLevel > 40 ?
                   "Moderate stress indicators detected. Mindfulness practices may help manage stress levels." :
                   "Minimal stress indicators detected in your activity. Your patterns appear healthy."}
                </p>
              </div>
            </div>

            {/* Usage Patterns */}
            <div className="bg-white dark:bg-gray-700 p-5 rounded-xl shadow">
              <h4 className="font-semibold text-lg mb-3">Usage Patterns</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Daily Average</p>
                    <p className="font-medium text-xl">
                      {report.usagePatterns.dailyAverage} hours
                    </p>
                    <p className="text-xs text-gray-500">
                      {report.usagePatterns.dailyAverage > 3 ? 
                       "Above recommended limits (suggested <2 hrs)" : 
                       "Within healthy range"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Weekly Total</p>
                    <p className="font-medium text-xl">
                      {report.usagePatterns.weeklyTotal} hours
                    </p>
                    <p className="text-xs text-gray-500">
                      {report.usagePatterns.weeklyTotal > 21 ? 
                       "Significant time investment (suggested <14 hrs)" : 
                       "Moderate usage"}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Peak Activity Hours</p>
                  <div className="flex flex-wrap gap-2">
                    {report.usagePatterns.peakHours.map((hour, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                        {hour}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {report.usagePatterns.peakHours.some(h => h.includes('PM') && 
                     (h.includes('10') || h.includes('11') || h.includes('12'))) ?
                     "Evening and late-night usage patterns detected (may affect sleep)" :
                     "Primary usage during daytime hours"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Daily Notification Frequency</p>
                  <p className="font-medium">
                    {report.usagePatterns.notificationFrequency} alerts/day
                  </p>
                  <p className="text-xs text-gray-500">
                    {report.usagePatterns.notificationFrequency > 80 ? 
                     "Very high frequency (may cause distraction and stress)" :
                     report.usagePatterns.notificationFrequency > 40 ?
                     "Moderate frequency" : "Low frequency"}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Analysis */}
            <div className="bg-white dark:bg-gray-700 p-5 rounded-xl shadow">
              <h4 className="font-semibold text-lg mb-3">Content Engagement</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Positive Content</p>
                    <p className="font-medium text-xl">
                      {report.contentAnalysis.positiveContentRatio}%
                    </p>
                    <p className="text-xs text-gray-500">
                      of your posts show positive sentiment
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Engagement Rate</p>
                    <p className="font-medium text-xl">
                      {report.contentAnalysis.engagementRatio.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      average interaction per post
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Most Used Emoji</p>
                    <p className="font-medium text-2xl">
                      {report.contentAnalysis.mostUsedEmoji}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Posting Frequency</p>
                    <p className="font-medium">
                      {report.contentAnalysis.postFrequency}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Platform Distribution</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${report.usagePatterns.platformBreakdown[platform!]}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Primary platform: {platform}
                  </p>
                </div>
                
                <p className="text-sm text-gray-500">
                  {report.contentAnalysis.positiveContentRatio > 60 ?
                   "Your content creates a generally positive online presence, which correlates with better mental wellbeing." :
                   "Consider balancing your content with more positive expressions to improve your digital experience."}
                </p>
              </div>
            </div>
          </div>

          {/* Hourly Usage Visualization */}
          <div className="bg-white dark:bg-gray-700 p-5 rounded-xl shadow">
            <h4 className="font-semibold text-lg mb-4">Hourly Activity Pattern</h4>
            <div className="overflow-x-auto">
              <div className="flex items-end h-64 gap-px min-w-max">
                {report.usagePatterns.hourlyUsage.map((hourData, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className={`w-full ${
                        parseInt(hourData.hour.split(' ')[0]) >= 10 && hourData.hour.includes('PM') ||
                        parseInt(hourData.hour.split(' ')[0]) <= 5 && hourData.hour.includes('AM') 
                          ? 'bg-red-400 dark:bg-red-600' 
                          : 'bg-indigo-400 dark:bg-indigo-600'
                      } rounded-t-sm`}
                      style={{ height: `${hourData.activity * 1.5}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1">
                      {hourData.hour.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Red bars indicate late-night usage (10PM-5AM) which may disrupt sleep patterns.
            </p>
          </div>

          {/* Recommendations */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl">
            <h4 className="font-semibold text-lg mb-4">Personalized Recommendations</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">Immediate Actions</h5>
                <ul className="space-y-2">
                  {report.recommendations.immediateActions.map((action, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">Long-term Strategies</h5>
                <ul className="space-y-2">
                  {report.recommendations.longTermStrategies.map((strategy, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>{strategy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {report.recommendations.platformSpecificTips && report.recommendations.platformSpecificTips.length > 0 && (
              <div className="mt-6 bg-white dark:bg-gray-700 p-4 rounded-lg">
                <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">{platform === 'twitter' ? 'Twitter' : 'Instagram'} Specific Tips</h5>
                <ul className="space-y-2">
                  {report.recommendations.platformSpecificTips.map((tip, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {report.recommendations.professionalHelp && report.recommendations.professionalHelp.length > 0 && (
              <div className="mt-6 bg-white dark:bg-gray-700 p-4 rounded-lg">
                <h5 className="font-medium text-red-600 dark:text-red-400 mb-2">Professional Help Suggestions</h5>
                <ul className="space-y-2">
                  {report.recommendations.professionalHelp.map((help, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{help}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Comparison Section */}
          <div className="bg-white dark:bg-gray-700 p-5 rounded-xl shadow">
            <h4 className="font-semibold text-lg mb-4">Comparison Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-300">Platform Average</p>
                <p className="text-2xl font-bold">{report.comparison.platformAverage}/100</p>
                <p className="text-xs text-gray-500">
                  Average score for {platform} users
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-purple-600 dark:text-purple-300">Age Group Average</p>
                <p className="text-2xl font-bold">{report.comparison.ageGroupAverage}/100</p>
                <p className="text-xs text-gray-500">
                  Average for users in your demographic
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-300">Similar Profiles</p>
                <p className="text-2xl font-bold">{report.comparison.similarProfilesAverage}/100</p>
                <p className="text-xs text-gray-500">
                  Average for profiles with similar activity
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaMentalHealthAnalyzer;