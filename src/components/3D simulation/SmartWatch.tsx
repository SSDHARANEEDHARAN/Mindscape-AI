/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Battery, Power, Zap,
  Heart, Music, ChevronLeft, Play, Pause, SkipBack, SkipForward,
  StopCircle, Activity, AlarmClock, Bell, Trash2,
  X, Radio, AlertCircle, Settings, MessageSquare, BellDot, Send,
  Watch, Clock, Volume2, VolumeX
} from 'lucide-react';

// Import sound effects
import alarmSound from '../music/Notification/Iphone - Ting _ Message.mp3';
import beepSound from '../music/Notification/Iphone - Ting _ Message.mp3';
import heartbeatSound from '../music/Notification/heartbeat.mp3';
import chargeSound from '../music/Notification/Iphone - Ting _ Message.mp3';
import dischargeSound from '../music/Notification/Iphone - Ting _ Message.mp3';

// Import music files
import mindscapeTheme from '../music/Collective Song For Watch/Nenje-Yezhu.mp3';
import relaxingWaves from '../music/Collective Song For Watch/Aalaporan-Thamizhan-MassTamilan.com.mp3';
import focusMode from '../music/Collective Song For Watch/Ethir-Neechal.mp3';

// Import default wallpaper
import defaultWallpaper from '../3D simulation/IMAGES/IMAGES.png';

interface Notification {
  id: number;
  message: string;
  timestamp: Date;
  type: 'health' | 'system' | 'alarm' | 'message' | 'charge';
  read: boolean;
  count?: number;
}

interface Song {
  id: number;
  title: string;
  artist: string;
  duration: string;
  path: string;
}

interface SystemStatus {
  batteryLevel: number;
  charging: boolean;
}

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => void) | null;
  onchargingtimechange: ((this: BatteryManager, ev: Event) => void) | null;
  ondischargingtimechange: ((this: BatteryManager, ev: Event) => void) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => void) | null;
}

declare global {
  interface Navigator {
    getBattery(): Promise<BatteryManager>;
  }
}

interface SmartWatchProps {
  darkMode: boolean;
}

const SmartWatch: React.FC<SmartWatchProps> = ({ darkMode }) => {
  // Core state
  const [time, setTime] = useState(new Date());
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [brightness, setBrightness] = useState(80);
  const [wallpaper, setWallpaper] = useState<string | null>(defaultWallpaper);
  const [showAppDrawer, setShowAppDrawer] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const [notificationMode, setNotificationMode] = useState<'auto' | 'manual'>('auto');
  const [manualMessage, setManualMessage] = useState('');
  const [, setSystemBattery] = useState(100);
  const [, setIsSystemCharging] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [activePopupNotification, setActivePopupNotification] = useState<Notification | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showChargingNotification, setShowChargingNotification] = useState(false);
  const [chargingNotificationMessage, setChargingNotificationMessage] = useState('');
  const [lastNotificationTime, setLastNotificationTime] = useState<number | null>(null);

  // System status state
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    batteryLevel: 100,
    charging: false
  });

  // Notification system
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showMessagesView, setShowMessagesView] = useState(false);

  // Alarm/Stopwatch
  const [alarmTime, setAlarmTime] = useState("");
  const [isAlarmSet, setIsAlarmSet] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<{ id: number, time: number }[]>([]);
  const [nextAlarmTrigger, setNextAlarmTrigger] = useState<number | null>(null);

  // Music player
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);
  const heartbeatAudioRef = useRef<HTMLAudioElement | null>(null);
  const chargeAudioRef = useRef<HTMLAudioElement | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

  const songs: Song[] = useMemo(() => [
    { id: 1, title: "MindScape Theme", artist: "AI Composer", duration: "3:45", path: mindscapeTheme },
    { id: 2, title: "Relaxing Waves", artist: "Nature Sounds", duration: "5:20", path: relaxingWaves },
    { id: 3, title: "Focus Mode", artist: "Productivity", duration: "4:30", path: focusMode }
  ], []);

  // Health monitoring
  const [heartRate, setHeartRate] = useState(72);
  const [isHeartbeatPlaying, setIsHeartbeatPlaying] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stopwatchInterval = useRef<number>();
  const alarmTimeout = useRef<number>();
  const autoNotificationInterval = useRef<number>();
  const notificationTimeout = useRef<number>();
  const chargingNotificationTimeout = useRef<number>();
  const lapIdCounter = useRef(0);
  const lastChargingState = useRef<boolean>(false);

  // Check if there are unread notifications
  const hasUnreadNotifications = useMemo(() => {
    return notifications.some(n => !n.read);
  }, [notifications]);

  // Format time in 12-hour Indian format
  const formatIndianTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  // Format date in Indian format
  const formatIndianDate = useCallback((date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // Play sound effect with mute check
  const playSound = useCallback((soundRef: React.MutableRefObject<HTMLAudioElement | null>, soundFile: string) => {
    if (isMuted) return;

    if (!soundRef.current) {
      soundRef.current = new Audio(soundFile);
    }
    soundRef.current.currentTime = 0;
    soundRef.current.play().catch((error) => console.error("Audio play failed:", error));
  }, [isMuted]);

  // Show temporary charging notification
  const showTemporaryChargingNotification = useCallback((message: string) => {
    setChargingNotificationMessage(message);
    setShowChargingNotification(true);

    if (chargingNotificationTimeout.current) {
      clearTimeout(chargingNotificationTimeout.current);
    }

    chargingNotificationTimeout.current = window.setTimeout(() => {
      setShowChargingNotification(false);
    }, 3000);
  }, []);

  // Add notification helper
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const count = notificationMode === 'auto' ? notificationCount + 1 : undefined;
    const newNotification = {
      id: Date.now(),
      ...notification,
      timestamp: new Date(),
      read: false,
      count
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 99)]); // Limit to 100 notifications
    setNotificationCount(prev => prev + 1);

    // Show popup for new notifications (except charge notifications)
    if (isPoweredOn && notification.type !== 'charge') {
      setActivePopupNotification(newNotification);
      setShowNotificationPopup(true);

      // Hide popup after 5 seconds
      if (notificationTimeout.current) {
        clearTimeout(notificationTimeout.current);
      }
      notificationTimeout.current = window.setTimeout(() => {
        setShowNotificationPopup(false);
      }, 5000);
    }

    // Vibrate watch for new notifications
    if (isPoweredOn) {
      setIsVibrating(true);
      setTimeout(() => setIsVibrating(false), 500);

      // Play notification sound for 3 seconds
      if (!isMuted) {
        playSound(notificationAudioRef, beepSound);
        setTimeout(() => {
          if (notificationAudioRef.current) {
            notificationAudioRef.current.pause();
            notificationAudioRef.current.currentTime = 0;
          }
        }, 3000);
      }
    }
  }, [isPoweredOn, notificationCount, notificationMode, playSound, isMuted]);

  // Get system battery status
  const getSystemBatteryStatus = useCallback(async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        const wasCharging = lastChargingState.current;
        const newCharging = battery.charging;
        const newLevel = Math.floor(battery.level * 100);

        setSystemBattery(newLevel);
        setIsSystemCharging(newCharging);
        lastChargingState.current = newCharging;

        // Update system status with real battery value
        setSystemStatus({
          batteryLevel: newLevel,
          charging: newCharging
        });

        // Only show notification if charging state changed
        if (wasCharging !== newCharging && isPoweredOn) {
          if (newCharging) {
            playSound(chargeAudioRef, chargeSound);
            showTemporaryChargingNotification("Charger connected");
            addNotification({
              message: "Charger connected - Battery charging",
              type: 'charge'
            });
          } else {
            playSound(chargeAudioRef, dischargeSound);
            showTemporaryChargingNotification("Charger disconnected");
            addNotification({
              message: "Charger disconnected - Running on battery",
              type: 'charge'
            });
          }
        }

        battery.addEventListener('chargingchange', () => {
          const wasCharging = lastChargingState.current;
          const newCharging = battery.charging;
          setIsSystemCharging(newCharging);
          lastChargingState.current = newCharging;

          // Update system status with real battery value
          setSystemStatus({
            batteryLevel: Math.floor(battery.level * 100),
            charging: newCharging
          });

          if (wasCharging !== newCharging && isPoweredOn) {
            if (newCharging) {
              playSound(chargeAudioRef, chargeSound);
              showTemporaryChargingNotification("Charger connected");
              addNotification({
                message: "Charger connected - Battery charging",
                type: 'charge'
              });
            } else {
              playSound(chargeAudioRef, dischargeSound);
              showTemporaryChargingNotification("Charger disconnected");
              addNotification({
                message: "Charger disconnected - Running on battery",
                type: 'charge'
              });
            }
          }
        });

        battery.addEventListener('levelchange', () => {
          const newLevel = Math.floor(battery.level * 100);
          setSystemBattery(newLevel);
          // Update system status with real battery value
          setSystemStatus(prev => ({
            ...prev,
            batteryLevel: newLevel
          }));
        });
      } catch (error) {
        console.error('Error accessing battery API:', error);
      }
    }
  }, [isPoweredOn, playSound, showTemporaryChargingNotification, addNotification]);

  // Initialize system data
  const initializeSystemData = useCallback(() => {
    const savedWallpaper = localStorage.getItem('systemWallpaper');
    if (savedWallpaper) {
      setWallpaper(savedWallpaper);
    } else {
      // Set default wallpaper if none is saved
      setWallpaper(defaultWallpaper);
    }
    const savedBrightness = localStorage.getItem('brightness');
    if (savedBrightness) {
      setBrightness(parseInt(savedBrightness));
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setNotificationCount(0);
  }, []);

  // Delete single notification
  const deleteNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Send manual notification
  const sendManualNotification = useCallback(() => {
    if (manualMessage.trim()) {
      addNotification({
        message: manualMessage,
        type: 'message'
      });
      setManualMessage('');
    }
  }, [addNotification, manualMessage]);

  // Calculate next alarm time
  const calculateNextAlarm = useCallback((alarmTime: string) => {
    if (!alarmTime) return null;

    const now = new Date();
    const [hours, minutes] = alarmTime.split(':').map(Number);
    const alarmDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0,
      0
    );

    // If alarm time is already passed today, set for tomorrow
    if (alarmDate.getTime() < now.getTime()) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }

    return alarmDate.getTime();
  }, []);

  // Alarm functions
  const triggerAlarm = useCallback(() => {
    addNotification({
      message: "Alarm! Time to wake up!",
      type: 'alarm'
    });
    setIsAlarmSet(false);
    if (!isMuted) {
      playSound(alarmAudioRef, alarmSound);
    }
    setIsVibrating(true);
    setTimeout(() => setIsVibrating(false), 1000);
  }, [addNotification, playSound, isMuted]);

  const setAlarm = useCallback(() => {
    if (alarmTime) {
      const nextTrigger = calculateNextAlarm(alarmTime);
      setNextAlarmTrigger(nextTrigger);
      setIsAlarmSet(true);

      addNotification({
        message: `Alarm set for ${alarmTime}`,
        type: 'system'
      });
    }
  }, [alarmTime, calculateNextAlarm, addNotification]);

  const cancelAlarm = useCallback(() => {
    setIsAlarmSet(false);
    if (alarmTimeout.current) window.clearTimeout(alarmTimeout.current);
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
    setNextAlarmTrigger(null);

    addNotification({
      message: "Alarm cancelled",
      type: 'system'
    });
  }, [addNotification]);

  // Stopwatch functions
  const startStopwatch = useCallback(() => {
    setIsStopwatchRunning(true);
    const startTime = Date.now() - stopwatchTime;

    stopwatchInterval.current = window.setInterval(() => {
      setStopwatchTime(Date.now() - startTime);
    }, 10);
  }, [stopwatchTime]);

  const stopStopwatch = useCallback(() => {
    setIsStopwatchRunning(false);
    if (stopwatchInterval.current) window.clearInterval(stopwatchInterval.current);
  }, []);

  const resetStopwatch = useCallback(() => {
    stopStopwatch();
    setStopwatchTime(0);
    setLaps([]);
    lapIdCounter.current = 0;
  }, [stopStopwatch]);

  const recordLap = useCallback(() => {
    lapIdCounter.current += 1;
    setLaps(prev => [...prev, { id: lapIdCounter.current, time: stopwatchTime }]);
    playSound(beepAudioRef, beepSound);
  }, [stopwatchTime, playSound]);

  const deleteLap = useCallback((id: number) => {
    setLaps(prev => prev.filter(lap => lap.id !== id));
  }, []);

  // Music player functions
  const setupAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(songs[currentSongIndex].path);
      audioRef.current.addEventListener('ended', () => {
        setCurrentSongIndex(prev => (prev + 1) % songs.length);
        if (isPlaying) {
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play().catch((error) => console.error("Audio play failed:", error));
            }
          }, 100);
        }
      });

      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          const duration = audioRef.current.duration || 1;
          setProgress((audioRef.current.currentTime / duration) * 100);
        }
      });
    }
  }, [currentSongIndex, isPlaying, songs]);

  const playPause = useCallback(() => {
    setupAudio();

    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch((error) => console.error("Audio play failed:", error));
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, setupAudio]);

  const nextSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setCurrentSongIndex(prev => (prev + 1) % songs.length);
    setProgress(0);
    setIsPlaying(false);

    if (isPlaying) {
      setTimeout(() => {
        playPause();
      }, 100);
    }
  }, [isPlaying, playPause, songs.length]);

  const prevSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setCurrentSongIndex(prev => (prev - 1 + songs.length) % songs.length);
    setProgress(0);
    setIsPlaying(false);

    if (isPlaying) {
      setTimeout(() => {
        playPause();
      }, 100);
    }
  }, [isPlaying, playPause, songs.length]);

  // Heart rate functions
  const toggleHeartbeatSound = useCallback(() => {
    if (!heartbeatAudioRef.current) {
      heartbeatAudioRef.current = new Audio(heartbeatSound);
      heartbeatAudioRef.current.loop = true;
    }

    if (isHeartbeatPlaying) {
      heartbeatAudioRef.current.pause();
    } else if (!isMuted) {
      heartbeatAudioRef.current.play().catch((error) => console.error("Audio play failed:", error));
    }
    setIsHeartbeatPlaying(!isHeartbeatPlaying);
  }, [isHeartbeatPlaying, isMuted]);

  // Format time for display
  const formatTime = useCallback((ms: number) => {
    const date = new Date(ms);
    return date.toISOString().substr(11, 8).replace(/^00:/, '');
  }, []);

  // Toggle power
  const togglePower = useCallback(() => {
    setIsPoweredOn(prev => {
      if (!prev) {
        initializeSystemData();
      } else {
        stopStopwatch();
        if (alarmTimeout.current) window.clearTimeout(alarmTimeout.current);
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        if (alarmAudioRef.current) {
          alarmAudioRef.current.pause();
          alarmAudioRef.current.currentTime = 0;
        }
        if (heartbeatAudioRef.current) {
          heartbeatAudioRef.current.pause();
          setIsHeartbeatPlaying(false);
        }
        if (notificationAudioRef.current) {
          notificationAudioRef.current.pause();
          notificationAudioRef.current.currentTime = 0;
        }
        if (chargeAudioRef.current) {
          chargeAudioRef.current.pause();
          chargeAudioRef.current.currentTime = 0;
        }
        if (chargingNotificationTimeout.current) {
          clearTimeout(chargingNotificationTimeout.current);
          setShowChargingNotification(false);
        }
      }
      return !prev;
    });
  }, [initializeSystemData, stopStopwatch]);

  // Handle wallpaper change
  const handleWallpaperChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setWallpaper(result);
        localStorage.setItem('systemWallpaper', result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle left toggle button press
  const handleLeftTogglePress = useCallback(() => {
    if (currentView === 'home') {
      setCurrentView('heartrate');
      toggleHeartbeatSound();
    } else {
      setCurrentView('home');
      if (isHeartbeatPlaying) {
        toggleHeartbeatSound();
      }
    }
  }, [currentView, isHeartbeatPlaying, toggleHeartbeatSound]);

  // Handle right toggle button press
  const handleRightTogglePress = useCallback(() => {
    if (currentView === 'home') {
      setShowAppDrawer(true);
    } else {
      setCurrentView('home');
    }
  }, [currentView]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (!prev) {
        // Muting all sounds
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        if (alarmAudioRef.current) {
          alarmAudioRef.current.pause();
          alarmAudioRef.current.currentTime = 0;
        }
        if (heartbeatAudioRef.current) {
          heartbeatAudioRef.current.pause();
          setIsHeartbeatPlaying(false);
        }
        if (notificationAudioRef.current) {
          notificationAudioRef.current.pause();
          notificationAudioRef.current.currentTime = 0;
        }
        if (chargeAudioRef.current) {
          chargeAudioRef.current.pause();
          chargeAudioRef.current.currentTime = 0;
        }
      }
      return !prev;
    });
  }, []);

  // Update time and check alarm every second
  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = new Date();
      setTime(now);

      if (nextAlarmTrigger && now.getTime() >= nextAlarmTrigger) {
        triggerAlarm();
        const nextTrigger = calculateNextAlarm(alarmTime);
        setNextAlarmTrigger(nextTrigger);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [nextAlarmTrigger, alarmTime, triggerAlarm, calculateNextAlarm]);

  // Initialize system data and update periodically
  useEffect(() => {
    let systemInterval: number;
    let batteryInterval: number;

    const initSystem = async () => {
      try {
        await getSystemBatteryStatus();
        initializeSystemData();

        systemInterval = window.setInterval(() => {
          setHeartRate(prev => Math.max(60, Math.min(120, prev + (Math.random() > 0.5 ? 1 : -1))));
        }, 5000);

        // Check battery status every minute
        batteryInterval = window.setInterval(async () => {
          try {
            await getSystemBatteryStatus();
          } catch (error) {
            console.error('Error checking battery status:', error);
          }
        }, 60000);
      } catch (error) {
        console.error('Error initializing system:', error);
      }
    };

    initSystem();

    return () => {
      if (systemInterval) {
        window.clearInterval(systemInterval);
      }
      if (batteryInterval) {
        window.clearInterval(batteryInterval);
      }
    };
  }, [getSystemBatteryStatus, initializeSystemData]);

  // Generate automatic health notifications every 3 minutes
  useEffect(() => {
    if (!isPoweredOn || notificationMode !== 'auto') {
      if (autoNotificationInterval.current) {
        window.clearInterval(autoNotificationInterval.current);
      }
      return;
    }

    const healthMessages = [
      "Stay hydrated! Drink water regularly.",
      "MindScape: Your mental health matters",
      "Take a 5-minute break and stretch",
      "MindScape: Practice deep breathing",
      "Remember to stand up and move around",
      "MindScape: Track your mood today",
      "MindScape: Your feelings are valid",
      "Pause and check in with yourself",
      "MindScape: One step at a time is still progress",
      "Don't forget to smile—it boosts your mood",
      "MindScape: You deserve rest, not guilt",
      "Take a moment to be proud of how far you've come",
      "MindScape: Reflect on something you're grateful for",
      "Deep breath in… now slowly breathe out",
      "MindScape: You are more than your bad days",
      "Step outside, get a bit of fresh air",
      "MindScape: It's okay to ask for help",
      "Drink a glass of water and reset your focus",
      "MindScape: Celebrate small wins today",
      "Stretch your arms, unclench your jaw",
      "MindScape: Let go of what you can't control",
      "Put on your favorite song and vibe for a minute",
      "MindScape: Check in—how's your mind feeling?",
      "Look away from the screen and relax your eyes",
      "MindScape: Rest is productive too",
      "Keep going. You're doing better than you think"
    ];

    // Function to send a health notification
    const sendHealthNotification = () => {
      const now = Date.now();

      // Only send if 3 minutes have passed since last notification
      if (lastNotificationTime && now - lastNotificationTime < 180000) {
        return;
      }

      setLastNotificationTime(now);

      // Send health notification
      const randomHealthIndex = Math.floor(Math.random() * healthMessages.length);
      addNotification({
        message: healthMessages[randomHealthIndex],
        type: 'health'
      });
    };

    // Initial notification
    sendHealthNotification();

    // Set up interval for subsequent notifications
    autoNotificationInterval.current = window.setInterval(sendHealthNotification, 180000);

    return () => {
      if (autoNotificationInterval.current) {
        window.clearInterval(autoNotificationInterval.current);
      }
    };
  }, [isPoweredOn, notificationMode, addNotification, lastNotificationTime]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
        alarmAudioRef.current = null;
      }
      if (beepAudioRef.current) {
        beepAudioRef.current.pause();
        beepAudioRef.current = null;
      }
      if (heartbeatAudioRef.current) {
        heartbeatAudioRef.current.pause();
        heartbeatAudioRef.current = null;
      }
      if (notificationAudioRef.current) {
        notificationAudioRef.current.pause();
        notificationAudioRef.current = null;
      }
      if (chargeAudioRef.current) {
        chargeAudioRef.current.pause();
        chargeAudioRef.current = null;
      }
      if (chargingNotificationTimeout.current) {
        clearTimeout(chargingNotificationTimeout.current);
      }
    };
  }, []);

  // Save brightness preference
  useEffect(() => {
    localStorage.setItem('brightness', brightness.toString());
  }, [brightness]);

  // Notification Icon component
  const NotificationIcon = useCallback(() => (
    <div
      className={`relative ml-1 ${hasUnreadNotifications ? 'animate-pulse' : ''}`}
      onClick={() => {
        setCurrentView('messages');
        setShowMessagesView(true);
        markAllAsRead();
      }}
      style={{
        animation: hasUnreadNotifications ? 'pulse 1s infinite alternate' : 'none'
      }}
    >
      {hasUnreadNotifications ? (
        <BellDot
          size={14}
          className={`${darkMode ?  'text-red-500' : 'dark:text-red-400'} cursor-pointer`}
        />
      ) : (
        <Bell
          size={14}
          className={`${darkMode ?  'text-gray-500':'dark:text-gray-400' } cursor-pointer`}
        />
      )}
      {hasUnreadNotifications && (
        <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 ${darkMode ? 'bg-red-400' : 'dark:bg-red-500'} rounded-full border ${darkMode ? 'border-gray-800' : 'border-white'}`}></div>
      )}
    </div>
  ), [hasUnreadNotifications, markAllAsRead, darkMode]);

  // Notification Popup component
  const NotificationPopup = useCallback(() => {
    if (!showNotificationPopup || !activePopupNotification) return null;

    return (
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${darkMode ?  'dark:bg-white':'bg-gray-700'} p-4 rounded-lg shadow-xl z-50 w-64`}>
        <div className="flex items-start gap-2">
          {activePopupNotification.type === 'health' ? (
            <Heart size={20} className="text-red-500 mt-0.5" />
          ) : activePopupNotification.type === 'system' ? (
            <AlertCircle size={20} className="text-yellow-500 mt-0.5" />
          ) : activePopupNotification.type === 'alarm' ? (
            <AlarmClock size={20} className="text-orange-500 mt-0.5" />
          ) : (
            <Bell size={20} className="text-blue-500 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`font-medium ${darkMode ?  'text-gray-800' : 'dark:text-white'}`}>{activePopupNotification.message}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              {formatIndianTime(activePopupNotification.timestamp)}
            </p>
          </div>
          <button
            onClick={() => setShowNotificationPopup(false)}
            className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }, [showNotificationPopup, activePopupNotification, formatIndianTime, darkMode]);

  // Charging Notification Popup component
  const ChargingNotificationPopup = useCallback(() => {
    if (!showChargingNotification) return null;

    return (
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-xl z-50 w-64`}>
        <div className="flex items-start gap-2">
          <Zap size={20} className="text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{chargingNotificationMessage}</p>
          </div>
        </div>
      </div>
    );
  }, [showChargingNotification, chargingNotificationMessage, darkMode]);

  // App drawer component
  const AppDrawer = useCallback(() => (
    <div className={`absolute inset-0 p-4 flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={() => {
            setCurrentView('alarm');
            setShowAppDrawer(false);
          }}
          className={`flex flex-col items-center p-4 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <AlarmClock size={32} className="mb-2" />
          <span className={darkMode ? 'text-white' : ''}>Alarm</span>
        </button>
        <button
          onClick={() => {
            setCurrentView('music');
            setShowAppDrawer(false);
          }}
          className={`flex flex-col items-center p-4 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <Music size={32} className="mb-2" />
          <span className={darkMode ? 'text-white' : ''}>Music</span>
        </button>
        <button
          onClick={() => {
            setCurrentView('messages');
            setShowAppDrawer(false);
            setShowMessagesView(true);
            markAllAsRead();
          }}
          className={`flex flex-col items-center p-4 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} relative`}
        >
          <MessageSquare size={32} className="mb-2" />
          <span className={darkMode ? 'text-white' : ''}>Messages</span>
          {hasUnreadNotifications && (
            <div className={`absolute top-2 right-2 w-2 h-2 ${darkMode ? 'bg-red-400' : 'bg-red-500'} rounded-full`} />
          )}
        </button>
        <button
          onClick={() => {
            setCurrentView('settings');
            setShowAppDrawer(false);
          }}
          className={`flex flex-col items-center p-4 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <Settings size={32} className="mb-2" />
          <span className={darkMode ? 'text-white' : ''}>Settings</span>
        </button>
      </div>
      <button
        onClick={() => setShowAppDrawer(false)}
        className={`mt-6 px-6 py-2 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200'} rounded-lg`}
      >
        Close
      </button>
    </div>
  ), [darkMode, hasUnreadNotifications, markAllAsRead]);

  // Messages view component
  const MessagesView = useCallback(() => (
    <div className={`absolute inset-0 flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className={`p-4 border-b flex items-center gap-2 ${darkMode ? 'border-gray-800' : ''}`}>
        <button onClick={() => {
          setShowMessagesView(false);
          setCurrentView('home');
        }} className={darkMode ? 'text-white' : ''}>
          <ChevronLeft size={20} />
        </button>
        <h2 className={`text-lg font-medium flex-1 ${darkMode ? 'text-white' : ''}`}>Messages</h2>
        <button
          onClick={clearAllNotifications}
          className="text-red-500"
          title="Delete all messages"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No messages</p>
          </div>
        ) : (
          notifications.map((note) => (
            <div
              key={note.id}
              className={`p-4 border-b ${darkMode ? 'border-gray-800 hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3 flex-1">
                  {note.type === 'health' ? (
                    <Heart size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                  ) : note.type === 'system' ? (
                    <AlertCircle size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  ) : note.type === 'alarm' ? (
                    <AlarmClock size={18} className="text-orange-400 mt-0.5 flex-shrink-0" />
                  ) : note.type === 'charge' ? (
                    <Zap size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Bell size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={
                      note.type === 'health' ? 'text-blue-500' :
                        note.type === 'system' ? 'text-yellow-500' :
                          note.type === 'alarm' ? 'text-orange-500' :
                            note.type === 'charge' ? 'text-green-500' :
                              darkMode ? 'text-white' : 'text-gray-800'
                    }>
                      {note.message}
                    </p>
                    <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      <Clock size={12} />
                      <span>{formatIndianTime(note.timestamp)}</span>
                      {note.count !== undefined && (
                        <span className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} px-1 rounded`}>#{note.count}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteNotification(note.id)}
                  className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'} ml-2`}
                  title="Delete message"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  ), [notifications, deleteNotification, clearAllNotifications, formatIndianTime, darkMode]);

  // Render current view
  const renderView = useCallback(() => {
    if (!isPoweredOn) {
      return (
        <div className={`flex flex-col items-center justify-center h-full p-4 ${darkMode ?   'bg-white' : 'bg-gray-400'}`}>
          <Power className={`w-16 h-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'} animate-pulse`} />
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
            {systemStatus.charging ? `Charging ${systemStatus.batteryLevel}%` : 'Powered off'}
          </p>
        </div>
      );
    }

    if (showAppDrawer) {
      return <AppDrawer />;
    }

    if (showMessagesView) {
      return <MessagesView />;
    }

    switch (currentView) {
      case 'settings':
        return (
          <div className={`p-4 h-full overflow-y-auto ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setCurrentView('home')} className={darkMode ? 'text-white' : ''}>
                <ChevronLeft size={20} />
              </button>
              <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : ''}`}>Settings</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : ''}`}>Brightness: {brightness}%</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : ''}`}>Sound</label>
                <button
                  onClick={toggleMute}
                  className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 ${isMuted ? (darkMode ? 'bg-gray-700' : 'bg-gray-200') : 'bg-blue-600 text-white'}`}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  <span>{isMuted ? 'Muted' : 'Sound On'}</span>
                </button>
              </div>

              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : ''}`}>Wallpaper</label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}
                >
                  Change Wallpaper
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleWallpaperChange}
                  className="hidden"
                />
                <button
                  onClick={() => {
                    setWallpaper(defaultWallpaper);
                    localStorage.removeItem('systemWallpaper');
                  }}
                  className={`w-full mt-2 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}
                >
                  Reset to Default
                </button>
              </div>

              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : ''}`}>Notification Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNotificationMode('auto')}
                    className={`flex-1 py-2 rounded-lg ${notificationMode === 'auto' ? 'bg-blue-600 text-white' : (darkMode ? 'bg-gray-700' : 'bg-gray-200')}`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => setNotificationMode('manual')}
                    className={`flex-1 py-2 rounded-lg ${notificationMode === 'manual' ? 'bg-blue-600 text-white' : (darkMode ? 'bg-gray-700' : 'bg-gray-200')}`}
                  >
                    Manual
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : ''}`}>System Status</label>
                <div className={`p-3 ${darkMode ?  'bg-gray-800' : 'bg-gray-100' } rounded-lg`}>
                  <div className={`flex items-center gap-2 mb-1 ${darkMode ? 'text-gray-300' : ''}`}>
                    <Battery size={16} />
                    <span>Battery: {systemStatus.batteryLevel}% ({systemStatus.charging ? 'Charging' : 'Discharging'})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'alarm':
        return (
          <div className={`p-4 h-full overflow-y-auto ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setCurrentView('home')} className={darkMode ? 'text-white' : ''}>
                <ChevronLeft size={20} />
              </button>
              <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : ''}`}>Alarm & Stopwatch</h2>
            </div>

            <div className="space-y-8">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-white' : ''}`}>Set Alarm</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={alarmTime}
                    onChange={(e) => setAlarmTime(e.target.value)}
                    className={`p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                  />
                  {isAlarmSet ? (
                    <button
                      onClick={cancelAlarm}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      onClick={setAlarm}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                      Set
                    </button>
                  )}
                </div>
                {isAlarmSet && nextAlarmTrigger && (
                  <p className={`text-sm mt-2 ${darkMode ? 'text-green-400' : 'text-green-500'}`}>
                    Alarm set for {new Date(nextAlarmTrigger).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                )}
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-white' : ''}`}>Stopwatch</h3>
                <div className={`text-3xl font-mono text-center mb-4 ${darkMode ? 'text-white' : ''}`}>
                  {formatTime(stopwatchTime)}
                </div>
                <div className="flex justify-center gap-4">
                  {isStopwatchRunning ? (
                    <>
                      <button
                        onClick={stopStopwatch}
                        className="p-3 bg-red-500 text-white rounded-full"
                      >
                        <StopCircle size={24} />
                      </button>
                      <button
                        onClick={recordLap}
                        className="p-3 bg-blue-500 text-white rounded-full"
                      >
                        <Activity size={24} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={startStopwatch}
                        className="p-3 bg-green-500 text-white rounded-full"
                      >
                        <Play size={24} />
                      </button>
                      <button
                        onClick={resetStopwatch}
                        className="p-3 bg-gray-500 text-white rounded-full"
                      >
                        <Radio size={24} />
                      </button>
                    </>
                  )}
                </div>

                {laps.length > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : ''}`}>Laps:</h4>
                      <button
                        onClick={resetStopwatch}
                        className="text-xs text-red-500"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-1">
                      {laps.map((lap) => (
                        <div key={lap.id} className={`flex justify-between items-center p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <span className={darkMode ? 'text-white' : ''}>Lap {laps.findIndex(l => l.id === lap.id) + 1}</span>
                          <div className="flex items-center gap-2">
                            <span className={darkMode ? 'text-white' : ''}>{formatTime(lap.time)}</span>
                            <button
                              onClick={() => deleteLap(lap.id)}
                              className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
                              title="Delete lap"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'music':
        return (
          <div className={`p-4 h-full flex flex-col ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setCurrentView('home')} className={darkMode ? 'text-white' : ''}>
                <ChevronLeft size={20} />
              </button>
              <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : ''}`}>Music Player</h2>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className={`w-full max-w-xs rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="text-center mb-6">
                  <Music size={48} className="mx-auto text-blue-500 mb-2" />
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : ''}`}>{songs[currentSongIndex].title}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{songs[currentSongIndex].artist}</p>
                </div>

                <div className={`flex justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                  <span>{formatTime((progress / 100) * (3 * 60 * 1000))}</span>
                  <span>{songs[currentSongIndex].duration}</span>
                </div>

                <div className={`h-1 rounded-full mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex justify-center items-center gap-6">
                  <button onClick={prevSong} className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    <SkipBack size={24} />
                  </button>
                  <button
                    onClick={playPause}
                    className="p-4 bg-blue-500 text-white rounded-full"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <button onClick={nextSong} className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    <SkipForward size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'heartrate':
        return (
          <div className={`p-4 h-full flex flex-col ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => {
                setCurrentView('home');
                if (isHeartbeatPlaying) {
                  toggleHeartbeatSound();
                }
              }} className={darkMode ? 'text-white' : ''}>
                <ChevronLeft size={20} />
              </button>
              <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : ''}`}>Heart Rate</h2>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative">
                <Heart
                  size={80}
                  className="text-red-500 animate-pulse"
                  style={{ animationDuration: `${60000 / (heartRate * 1.5)}ms` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white bg-red-500 rounded-full w-16 h-16 flex items-center justify-center">
                    {heartRate}
                  </span>
                </div>
              </div>
              <p className={`mt-4 text-lg ${darkMode ? 'text-white' : ''}`}>BPM</p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last updated: {formatIndianTime(time)}</p>
              <button
                onClick={toggleHeartbeatSound}
                className={`mt-4 px-4 py-2 rounded-lg ${isHeartbeatPlaying ? 'bg-red-500 text-white' : (darkMode ? 'bg-gray-700' : 'bg-gray-200')}`}
              >
                {isHeartbeatPlaying ? 'Stop Heartbeat Sound' : 'Play Heartbeat Sound'}
              </button>
            </div>
          </div>
        );

      default: // Home view
        return (
          <div
            className="relative h-full flex flex-col items-center justify-center"
            style={wallpaper ? {
              backgroundImage: `url(${wallpaper})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : { backgroundColor: darkMode ? 'rgb(17, 24, 39)' : 'rgb(243, 244, 246)' }}
          >
            {/* Status bar at top */}
            <div className="absolute top-5 left-0 right-0 px-4 flex justify-between items-center text-xs">
              <div className="flex items-center gap-1">
                <NotificationIcon />
              </div>
              <div className={`flex items-center gap-1 ${darkMode ? 'text-gray-300' : 'text-white'}`}>
                {systemStatus.charging && <Zap size={12} className="text-yellow-400 animate-pulse" />}
                <Battery size={20} />
                <span>{systemStatus.batteryLevel}%</span>
              </div>
            </div>

            {/* Notification popup */}
            <NotificationPopup />

            {/* Charging notification popup */}
            <ChargingNotificationPopup />

            {/* Time display at bottom */}
            <div className="absolute bottom-16 left-0 right-0 text-center">
              <div className={`text-3xl font-light ${darkMode ? 'text-gray-100' : 'text-white'}`}>
                {formatIndianTime(time)}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-200'}`}>
                {formatIndianDate(time)}
              </div>
            </div>

            {/* Small heart rate toggle button (left side) */}
            {currentView === 'home' && (
              <button
                onClick={() => {
                  setCurrentView('heartrate');
                  toggleHeartbeatSound();
                }}
                className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-10 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-400/50'} backdrop-blur-sm rounded-r-full flex items-center justify-center`}
              >
                <Heart size={16} className="text-white" />
              </button>
            )}

            {/* Small app drawer toggle button (right side) */}
            {currentView === 'home' && (
              <button
                onClick={() => setShowAppDrawer(true)}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-10 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-400/50'} backdrop-blur-sm rounded-l-full flex items-center justify-center`}
              >
                <Settings size={16} className="text-white" />
              </button>
            )}
          </div>
        );
    }
  }, [
    isPoweredOn,
    showAppDrawer,
    showMessagesView,
    currentView,
    brightness,
    wallpaper,
    systemStatus,
    alarmTime,
    isAlarmSet,
    nextAlarmTrigger,
    stopwatchTime,
    isStopwatchRunning,
    laps,
    currentSongIndex,
    isPlaying,
    songs,
    heartRate,
    isHeartbeatPlaying,
    time,
    hasUnreadNotifications,
    showNotificationPopup,
    activePopupNotification,
    showChargingNotification,
    chargingNotificationMessage,
    NotificationIcon,
    NotificationPopup,
    ChargingNotificationPopup,
    AppDrawer,
    MessagesView,
    formatTime,
    formatIndianTime,
    formatIndianDate,
    toggleHeartbeatSound,
    cancelAlarm,
    setAlarmTime,
    setAlarm,
    stopStopwatch,
    recordLap,
    startStopwatch,
    resetStopwatch,
    deleteLap,
    prevSong,
    playPause,
    nextSong,
    handleWallpaperChange,
    notificationMode,
    progress,
    isMuted,
    toggleMute,
    darkMode
  ]);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${darkMode ? 'bg-gray-100' : 'dark:bg-gray-900'}`}>
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Watch className={darkMode ? 'text-blue-400' : 'text-blue-500'} size={32} />
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-500'}`}>AI Smart Watch</h1>
        </div>
        <p className={darkMode ? 'text-gray-400' : 'dark:text-gray-600'}>
          Experience the future of communication visually
        </p>
      </div>

      {/* Watch body - increased size */}
      <div className={`relative w-96 h-[28rem] rounded-3xl border-8 ${
        darkMode ?  'border-gray-300' :'dark:border-gray-600'
      } bg-white shadow-xl overflow-hidden ${
        !isPoweredOn ? 'opacity-80' : ''
      } ${isVibrating ? 'animate-vibrate' : ''}`}
        style={{ filter: `brightness(${brightness}%)` }}>

        {/* Watch screen content */}
        <div className="h-full w-full text-gray-900">
          {renderView()}
        </div>

        {/* Physical buttons */}
        {/* Left side button - shows heart rate */}
        <button
          onClick={handleLeftTogglePress}
          className={`absolute -left-[12px] top-1/3 w-2 h-10 ${
            darkMode ? 'bg-gray-500' : 'bg-gray-300'
          } rounded-l`}
        />

        {/* Right side button - shows app drawer */}
        <button
          onClick={handleRightTogglePress}
          className={`absolute -right-[16px] top-1/3 w-2 h-10 ${
            darkMode ? 'bg-gray-500' : 'bg-gray-300'
          } rounded-r`}
        />

        {/* Power button */}
        <button
          onClick={togglePower}
          className={`absolute -right-2 top-1/3 w-2 h-8 ${
            darkMode ? 'bg-gray-500' : 'bg-gray-400'
          } rounded-r`}
        />

        {/* Bottom button - powers off the watch */}
        <button
          onClick={togglePower}
          className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 w-10 h-2 ${
            darkMode ? 'bg-gray-500' : 'bg-gray-300'
          } rounded-full`}
        />
      </div>

      {/* External controls - Notification Mode Panel */}
      <div className={`mt-8 p-6 rounded-lg w-full max-w-2xl ${
        darkMode ?  'bg-gray-100' : 'dark:bg-gray-900'
      }`}>
        <h2 className={`text-xl font-bold mb-4 text-center ${
          darkMode ? 'dark:text-white' : ''
        }`}>
          Notification Mode Control Panel
        </h2>

        <div className="mb-6">
          <h3 className={`font-medium mb-2 ${
            darkMode ? 'dark:text-gray-300' : ''
          }`}>
            Notification Mode
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setNotificationMode('auto')}
              className={`flex-1 py-3 rounded-lg ${
                notificationMode === 'auto' ? 'bg-blue-600  text-gray-200' : 
                darkMode ? 'bg-gray-700  text-white' : 'bg-gray-300'
              }`}
            >
              Auto Mode
            </button>
            <button
              onClick={() => setNotificationMode('manual')}
              className={`flex-1 py-3 rounded-lg ${
                notificationMode === 'manual' ? 'bg-blue-600 text-white' : 
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-300'
              }`}
            >
              Manual Mode
            </button>
          </div>
        </div>

        {notificationMode === 'manual' && (
          <div className="space-y-4">
            <h3 className={`font-medium ${
              darkMode ? 'dark:text-gray-300' : ''
            }`}>
              Send Custom Notification
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualMessage}
                onChange={(e) => setManualMessage(e.target.value)}
                placeholder="Enter your message"
                className={`flex-1 p-3 border rounded-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600 dark:text-gray-300 placeholder-gray-400' : ' dark:text-black'
                }`}
              />
              <button
                onClick={sendManualNotification}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Send
              </button>
            </div>
          </div>
        )}

        {notificationMode === 'auto' && (
          <div className="space-y-4">
            <h3 className={`font-medium ${
              darkMode ? 'dark:text-gray-300' : ''
            }`}>
              Auto Notification Settings
            </h3>
            <div className={`p-4 rounded-lg ${
              darkMode ? 'bg-gray-100' : 'dark:bg-gray-900'
            }`}>
              <div className={`flex items-center gap-2 mb-2 ${
                darkMode ? 'dark:text-gray-300' : ''
              }`}>
                <Clock size={18} />
                <span>Health notifications sent every 3 minutes</span>
              </div>
              <div className={`flex items-center gap-2 ${
                darkMode ? 'dark:text-gray-300' : ''
              }`}>
                <Bell size={18} />
                <span>Total notifications sent: {notificationCount}</span>
              </div>
            </div>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              In auto mode, the watch will automatically generate health reminders periodically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartWatch;