// src/components/Admin/types.ts

/**
 * Device Hardware Types
 */
export type DeviceType = 'ESP32' | 'BLUETOOTH' | 'RASPBERRY_PI' | 'NRF';

/**
 * Connection Status Types
 */
export type ConnectionStatus = 
  | 'CONNECTED' 
  | 'DISCONNECTED' 
  | 'CONNECTING' 
  | 'ERROR';

/**
 * Signal Flow Stages
 */
export type SignalStage = 
  | 'WAITING'
  | 'SENDING'
  | 'RECEIVED'
  | 'RETURNING'
  | 'COMPLETE'
  | 'ERROR';

/**
 * Device Health Status
 */
export type HealthStatus = 
  | 'HEALTHY' 
  | 'CAUTION' 
  | 'CRITICAL';

/**
 * Message Operation Modes
 */
export type MessageMode = 
  | 'AUTO' 
  | 'MANUAL';

/**
 * Connection Types
 */
export type ConnectionType = 
  | 'WIFI' 
  | 'BLUETOOTH' 
  | 'USB';

/**
 * System Device Interface
 */
export interface SystemDevice {
  id: string;
  name: string;
  type: DeviceType;  // Changed from ConnectionType to DeviceType
  status: ConnectionStatus;
  lastSeen: string;
  connectionType: ConnectionType; // Added this field
}

/**
 * Diagnostic Information
 */
export interface Diagnostic {
  uptime: string;
  lastError?: string;
  batteryLevel?: number;
  temperature?: number;
  signalStrength?: number;
}

/**
 * Log Entry
 */
export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error';
}

/**
 * Complete Device Interface
 */
export interface Device extends SystemDevice {
  lastResponse: string;
  signalStrength: number;
  configurationComplete: boolean;
  currentStage: SignalStage;
  health: HealthStatus;
  messageMode: MessageMode;
  logs: LogEntry[];
  diagnostics: Diagnostic;
}

/**
 * Message Interface
 */
export interface Message {
  id: string;
  content: string;
  timestamp: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  deviceId: string;
}

/**
 * Display Preview Props
 */
export interface DisplayPreviewProps {
  width: number;
  height: number;
  content: string;
  deviceName: string;
  darkMode?: boolean;
}

/**
 * Device Connection Mapping
 */
export type DeviceConnectionMap = {
  [key in DeviceType]: ConnectionType;
};

/**
 * Enhanced System Device with Connection Info
 */
export interface EnhancedSystemDevice extends SystemDevice {
  connection: {
    type: ConnectionType;
    signalStrength: number;
    batteryLevel?: number;
    lastUpdated: string;
  };
  health: HealthStatus;
}

/**
 * User Authentication Interface
 */
export interface UserAuth {
  username: string;
  isAdmin: boolean;
  isSathiya: boolean;
  isBuvana: boolean;
  lastLogin?: string;
}

/**
 * Admin Component Props
 */
export interface AdminProps {
  darkMode: boolean;
  onLogout?: () => void;
}