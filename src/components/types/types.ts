/* eslint-disable @typescript-eslint/no-explicit-any */

export interface UserData {
  [x: string]: any;
  medicalCheckups: string[];
  challenge: string;
  
  // Personal details
  name: string;
  age: number;
  height: number;
  weight: number;

  // Daily habits
  morningFood: string;
  eveningFood: string;
  sleepTime: number;
  screenTime: number;

  // Device data
  hasLoraModule: boolean;
  hasEsp32: boolean;
}

export type MoodCategory = 'happy' | 'sad' | 'stressed' | 'neutral';

export interface MoodData {
  category: MoodCategory;
  percentage: number;
  timestamp: string; // ISO 8601 format (e.g., "2023-04-06T12:00:00Z")
}

export type ChartType = 'circular' | 'percentage' | 'bar' | 'line' | 'pie';

export interface HealthInsight {
  category: string;
  score: number;
  recommendation: string;
}

export interface Widget {
  id: string;
  title: string;
  isMinimized: boolean;
  position: {
    x: number;
    y: number;
  };
}

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
}

export type MusicMood = MoodCategory | 'relaxed';

export interface MusicSuggestion {
  title: string;
  artist: string;
  mood: MusicMood;
  duration: string; // Format example: "3:45"
  imageUrl?: string;
}

export type SocialMediaPlatform = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'other';
export type SentimentType = 'positive' | 'negative' | 'mixed' | 'neutral';

export interface SocialMediaSentiment {
  platform: SocialMediaPlatform;
  sentiment: SentimentType;
  score: number; // 0 to 100
  recommendation: string;
}

export type DeviceType = 'lora' | 'esp32' | 'bluetooth' | 'wifi';
export type ConnectionStatus = 'connected' | 'disconnected' | 'pairing';

export interface DeviceStatus {
  id: string;
  name: string;
  type: DeviceType;
  status: ConnectionStatus;
  lastSeen: string; // ISO 8601 format
  batteryLevel?: number; // 0 to 100
}

export type AlertPriority = 'low' | 'medium' | 'high';

export interface VoiceAlert {
  id: string;
  message: string;
  priority: AlertPriority;
  repeat: boolean;
  time?: string; // Optional scheduling
}

// Additional utility types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}