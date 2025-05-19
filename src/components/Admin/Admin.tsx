import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Device,
  Message,
  SignalStage,
  MessageMode,
  SystemDevice,
  Diagnostic,
  DeviceType,
  ConnectionType
} from '../Admin/Components/types';
import { DeviceCard } from '../Admin/Components/DeviceCard';
import { MessageInput } from '../Admin/Components/MessageInput';
import { SignalFlow } from '../Admin/Components/SignalFlow';
import { DisplayPreview } from '../Admin/Components/DisplayPreview';
import { SystemConfig } from '../Admin/Components/SystemConfig';
import { Activity, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ThingSpeak Configuration
const THINGSPEAK_CHANNEL_ID = '2966398';
const THINGSPEAK_API_KEY = '3ON9J8UTPCIJXEAS';
const THINGSPEAK_API_URL = 'https://api.thingspeak.com/update.json';
const THINGSPEAK_FETCH_URL = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json`;

type HealthStatus = 'GOOD' | 'POOR_SIGNAL' | 'LOW_BATTERY';
type DeviceStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';

interface ConnectionInfo {
  type: ConnectionType;
  signalStrength: number;
  batteryLevel: number;
  lastUpdated: string;
}

// Create a mapping between DeviceType and ConnectionType
type DeviceConnectionMap = Record<DeviceType, ConnectionType>;

const deviceConnectionMap: DeviceConnectionMap = {
  DISPLAY: 'USB',
  ROUTER: 'WIFI',
  SENSOR: 'BLUETOOTH',
  CONTROLLER: 'BLUETOOTH'
};

// Enhanced device interface
interface EnhancedSystemDevice extends SystemDevice {
  connection: ConnectionInfo;
  health: HealthStatus;
  status: DeviceStatus;
}

interface AdminProps {
  darkMode: boolean;
}

interface UserAuth {
  username: string;
  isAdmin: boolean;
  isSathiya: boolean;
  isBuvana: boolean;
}

// Function to send data to ThingSpeak
const sendToThingSpeak = async (message: string) => {
  try {
    const response = await fetch(THINGSPEAK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: THINGSPEAK_API_KEY,
        field1: message,
        created_at: new Date().toISOString()
      })
    });
    
    const data = await response.json();
    console.log('ThingSpeak response:', data);
    return data;
  } catch (error) {
    console.error('Error sending to ThingSpeak:', error);
  }
};

const Admin: React.FC<AdminProps> = ({ darkMode }) => {
  const [manualMessages, setManualMessages] = useState<Message[]>([]);
  const [autoMessages, setAutoMessages] = useState<Message[]>([]);
  const [currentStage, setCurrentStage] = useState<SignalStage>('WAITING');
  const [messageMode, setMessageMode] = useState<MessageMode>('MANUAL');
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [connectedDevices, setConnectedDevices] = useState<EnhancedSystemDevice[]>([]);
  const [auth, setAuth] = useState<UserAuth | null>(null);
  const [username, setUsername] = useState<string>('');
  const [passkey, setPasskey] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [showInitialMessage, setShowInitialMessage] = useState(false);
  const [initialMessageShown, setInitialMessageShown] = useState(false);
  const autoIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const threeMinuteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for existing auth on initial load
  useEffect(() => {
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth) {
      const parsedAuth = JSON.parse(savedAuth);
      setAuth(parsedAuth);
    }
  }, []);

  // Load saved state when authenticated
  useEffect(() => {
    if (auth) {
      const savedState = localStorage.getItem('adminState');
      if (savedState) {
        const {
          manualMessages: savedManualMessages,
          autoMessages: savedAutoMessages,
          currentStage: savedCurrentStage,
          messageMode: savedMessageMode,
          currentMessage: savedCurrentMessage,
          connectedDevices: savedConnectedDevices
        } = JSON.parse(savedState);
        
        setManualMessages(savedManualMessages || []);
        setAutoMessages(savedAutoMessages || []);
        setCurrentStage(savedCurrentStage || 'WAITING');
        setMessageMode(savedMessageMode || 'MANUAL');
        setCurrentMessage(savedCurrentMessage || '');
        setConnectedDevices(savedConnectedDevices || []);
      }
    }
  }, [auth]);

  // Handle initial message and 3-minute timer
  useEffect(() => {
    if (auth) {
      // Show initial message for 3 seconds
      setShowInitialMessage(true);
      const initialMsg = "MindScape Social Media Ai Health Analyses with Wearable Device";
      setCurrentMessage(initialMsg);
      
      // Send initial message to ThingSpeak
      sendToThingSpeak(initialMsg);

      initialMessageTimerRef.current = setTimeout(() => {
        setShowInitialMessage(false);
        setCurrentMessage('');
        setInitialMessageShown(true);
      }, 3000);

      // Set up 3-minute timer for special message
      threeMinuteTimerRef.current = setTimeout(() => {
        const specialMsg = "MindScape Social Media Ai Health Analyses with Wearable Device";
        setCurrentMessage(specialMsg);
        // Send special message to ThingSpeak
        sendToThingSpeak(specialMsg);
        setTimeout(() => {
          setCurrentMessage('');
        }, 3000);
      }, 180000);

      return () => {
        if (initialMessageTimerRef.current) clearTimeout(initialMessageTimerRef.current);
        if (threeMinuteTimerRef.current) clearTimeout(threeMinuteTimerRef.current);
      };
    }
  }, [auth]);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (auth) {
      const stateToSave = {
        manualMessages,
        autoMessages,
        currentStage,
        messageMode,
        currentMessage,
        connectedDevices
      };
      localStorage.setItem('adminState', JSON.stringify(stateToSave));
    }
  }, [manualMessages, autoMessages, currentStage, messageMode, currentMessage, connectedDevices, auth]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous error
    setAuthError('');
    
    // Check credentials
    let authenticatedUser: UserAuth | null = null;
    
    if (username === 'Admin' && passkey === 'Trial') {
      authenticatedUser = {
        username: 'Trial-Integrity',
        isAdmin: true,
        isSathiya: false,
        isBuvana: false
      };
    } 
    else if (username === 'Admin' && passkey === 'IOT') {
      authenticatedUser = {
        username: 'IoT Wireless Management',
        isAdmin: false,
        isSathiya: false,
        isBuvana: true
      };
    } 
    else {
      setAuthError('Invalid username or passkey');
      return;
    }
    
    setAuth(authenticatedUser);
    localStorage.setItem('adminAuth', JSON.stringify(authenticatedUser));
  };

  const handleLogout = () => {
    setAuth(null);
    setUsername('');
    setPasskey('');
    setShowInitialMessage(false);
    setInitialMessageShown(false);
    if (initialMessageTimerRef.current) clearTimeout(initialMessageTimerRef.current);
    if (threeMinuteTimerRef.current) clearTimeout(threeMinuteTimerRef.current);
    if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
    localStorage.removeItem('adminAuth');
  };

  const simulateMessageFlow = async () => {
    const stages: SignalStage[] = ['WAITING', 'SENDING', 'RECEIVED', 'RETURNING', 'COMPLETE'];
    for (const stage of stages) {
      setCurrentStage(stage);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const handleSendMessage = useCallback(async (content: string) => {
    if (showInitialMessage || messageMode === 'AUTO') return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      deviceId: connectedDevices[0]?.id || '',
    };

    const updateMessages = (prev: Message[]): Message[] => {
      const updated = [...prev, newMessage];
      return updated.slice(-3);
    };

    setManualMessages(updateMessages);
    setCurrentMessage(content);

    // Send manual message to ThingSpeak
    sendToThingSpeak(content);

    try {
      await simulateMessageFlow();
      const updateStatus = (msgs: Message[]): Message[] =>
        msgs.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'SENT' } : msg
        );

      setManualMessages(updateStatus);
    } catch (error) {
      console.error('Failed to send message:', error);
      const updateStatus = (msgs: Message[]): Message[] =>
        msgs.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'FAILED' } : msg
        );

      setManualMessages(updateStatus);
    }
  }, [connectedDevices, messageMode, showInitialMessage]);

  useEffect(() => {
    if (messageMode === 'AUTO' && auth && initialMessageShown) {
      setAutoMessages([]);
      setCurrentStage('WAITING');

      autoIntervalRef.current = setInterval(() => {
        const mentalHealthTips = [
          "Stay hydrated! Drink water regularly.",
          "Your mental health matters",
          "Take a 5-minute break and stretch",
          "Practice deep breathing",
          "Remember to stand up and move around",
          "Track your mood today",
          "Your feelings are valid",
          "Pause and check in with yourself",
          "One step at a time is still progress",
          "Don't forget to smile—it boosts your mood",
          "You deserve rest, not guilt",
          "Take a moment to be proud of how far you've come",
          "Reflect on something you're grateful for",
          "Deep breath in… now slowly breathe out",
          "You are more than your bad days",
          "Step outside, get a bit of fresh air",
          "It's okay to ask for help",
          "Drink a glass of water and reset your focus",
          "Celebrate small wins today",
          "Stretch your arms, unclench your jaw",
          "Let go of what you can't control",
          "Put on your favorite song and vibe for a minute",
          "Check in—how's your mind feeling?",
          "Look away from the screen and relax your eyes",
          "Rest is productive too",
          "Keep going. You're doing better than you think"
        ];
        const randomTip = mentalHealthTips[Math.floor(Math.random() * mentalHealthTips.length)];
        setCurrentMessage(randomTip);
        
        // Send auto message to ThingSpeak
        sendToThingSpeak(randomTip);
        
        setAutoMessages(prev => [...prev.slice(-2), {
          id: Date.now().toString(),
          content: randomTip,
          timestamp: new Date().toISOString(),
          status: 'SENT',
          deviceId: connectedDevices[0]?.id || '',
        }]);
      }, 18000);

      return () => {
        if (autoIntervalRef.current) {
          clearInterval(autoIntervalRef.current);
        }
      };
    }
  }, [messageMode, auth, initialMessageShown, connectedDevices]);

  // Simulate real-time device status updates
  useEffect(() => {
    if (!auth || connectedDevices.length === 0) return;

    const updateInterval = setInterval(() => {
      setConnectedDevices(prevDevices => 
        prevDevices.map(device => {
          const newSignalStrength = simulateSignalStrength(device.connection.type);
          const newBatteryLevel = simulateBatteryDrain(device.connection.batteryLevel);
          
          return {
            ...device,
            connection: {
              ...device.connection,
              signalStrength: newSignalStrength,
              batteryLevel: newBatteryLevel,
              lastUpdated: new Date().toISOString()
            },
            health: newBatteryLevel < 20 ? 'LOW_BATTERY' : 
                   newSignalStrength < 50 ? 'POOR_SIGNAL' : 'GOOD'
          };
        })
      );
    }, 5000);

    return () => clearInterval(updateInterval);
  }, [auth, connectedDevices.length]);

  const simulateSignalStrength = (type: ConnectionType): number => {
    if (type === 'USB') return 95 + Math.floor(Math.random() * 5);
    if (type === 'BLUETOOTH') return 70 + Math.floor(Math.random() * 25);
    return 80 + Math.floor(Math.random() * 15);
  };

  const simulateBatteryDrain = (currentLevel: number): number => {
    return Math.max(0, currentLevel - (Math.random() * 0.5));
  };

  const handleDeviceConnect = (device: SystemDevice) => {
    const connectionType = deviceConnectionMap[device.type];

    const enhancedDevice: EnhancedSystemDevice = {
      ...device,
      status: 'ACTIVE',
      connection: {
        type: connectionType,
        signalStrength: simulateSignalStrength(connectionType),
        batteryLevel: 80 + Math.floor(Math.random() * 20),
        lastUpdated: new Date().toISOString()
      },
      health: 'GOOD'
    };

    setConnectedDevices(prev => [...prev, enhancedDevice]);
  };

  const handleModeSwitch = () => {
    setMessageMode(prev => {
      const newMode: MessageMode = prev === 'AUTO' ? 'MANUAL' : 'AUTO';
      
      // Clear any existing auto interval
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current);
        autoIntervalRef.current = null;
      }
      
      // Reset stage when switching modes
      setCurrentStage('WAITING');
      
      return newMode;
    });
  };

  const currentMessages = messageMode === 'MANUAL' ? manualMessages : autoMessages;

  const transformedDevices: Device[] = connectedDevices.map(dev => ({
    id: dev.id,
    name: dev.name,
    lastResponse: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    signalStrength: dev.connection.signalStrength,
    configurationComplete: true,
    currentStage,
    mode: messageMode,
    type: dev.type,
    status: dev.status,
    health: dev.health,
    messageMode: messageMode,
    connectionType: dev.connection.type,
    logs: [],
    diagnostics: {
      uptime: '5 hours',
      batteryLevel: dev.connection.batteryLevel,
      temperature: 30
    } as Diagnostic,
  }));

  if (!auth) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
          >
            <div className="flex items-center justify-center mb-6">
              <Activity className="w-8 h-8 text-blue-500 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                MindScape Admin
              </h1>
            </div>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="passkey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Passkey
                </label>
                <input
                  id="passkey"
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              {authError && (
                <div className="mb-4 text-sm text-red-600 dark:text-red-400">
                  {authError}
                </div>
              )}
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Login
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Activity className="w-6 h-6 text-blue-500 mr-2" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  MindScape Device Management
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm dark:text-white">
                  Logged in as: {auth.username} {auth.isAdmin ? '(Admin)' : ''}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold dark:text-white">Connected Devices</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm dark:text-white">Mode:</span>
                    <button
                      onClick={handleModeSwitch}
                      className={`px-3 py-1 rounded-full text-sm ${messageMode === 'AUTO'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'}`}
                    >
                      {messageMode}
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {transformedDevices.map(device => (
                    <DeviceCard key={device.id} device={device} />
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Signal Flow</h2>
                <SignalFlow currentStage={currentStage} mode={messageMode} />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Display Preview</h2>
                <DisplayPreview
                  width={500}
                  height={250}
                  content={currentMessage}
                  deviceName="MindScape Display"
                />
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">System Configuration</h2>
                <SystemConfig onDeviceConnect={handleDeviceConnect} />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Send Message</h2>
                <MessageInput
                  onSendMessage={handleSendMessage}
                  disabled={showInitialMessage || messageMode === 'AUTO' || (currentStage !== 'WAITING' && currentStage !== 'COMPLETE')}
                />
                {messageMode === 'AUTO' && (
                  <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                    Auto mode is active - manual messages are disabled
                  </div>
                )}
                <div className="mt-4 space-y-2">
                  <AnimatePresence>
                    {currentMessages.map(message => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                      >
                        <p className="text-sm dark:text-white">{message.content}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(message.timestamp).toLocaleTimeString()}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;