/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Wifi, Bluetooth, Usb, RefreshCw, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

// Types
type ConnectionType = 'WIFI' | 'BLUETOOTH' | 'USB';
type DeviceType = 'ESP32' | 'RASPBERRY_PI' | 'BLUETOOTH' | 'NRF';
type DeviceStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'PAIRING';

interface SystemDevice {
  id: string;
  name: string;
  type: ConnectionType;
  status: DeviceStatus;
  lastSeen: string;
  signalStrength?: number;
  paired?: boolean;
}

interface ExtendedSystemDevice extends SystemDevice {
  deviceType: DeviceType;
  password?: string;
}

// Type extensions for browser APIs
declare global {
  interface Navigator {
    connection?: {
      type: string;
      effectiveType: string;
    };
    bluetooth?: {
      requestDevice(options: { acceptAllDevices: boolean }): Promise<{
        id: string;
        name?: string;
      }>;
    };
    usb?: {
      requestDevice(options: { filters: unknown[] }): Promise<{
        serialNumber?: string;
        productName?: string;
      }>;
    };
  }
}

export const SystemConfig: React.FC<{ onDeviceConnect: (device: SystemDevice) => void }> = ({ onDeviceConnect }) => {
  const [devices, setDevices] = useState<ExtendedSystemDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedType, setSelectedType] = useState<ConnectionType>('WIFI');
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType>('ESP32');
  const [pairingDevice, setPairingDevice] = useState<ExtendedSystemDevice | null>(null);
  const [password, setPassword] = useState('');

  const scanForDevices = async () => {
    setScanning(true);
    setDevices([]);

    try {
      switch (selectedType) {
        case 'WIFI':
          await handleWiFiScan();
          break;
        case 'BLUETOOTH':
          await handleBluetoothScan();
          break;
        case 'USB':
          await handleUSBScan();
          break;
      }
    } catch {
      // Errors are handled in individual scan functions
    } finally {
      setScanning(false);
    }
  };

  const handleWiFiScan = async () => {
    if (!navigator.connection) {
      console.warn('Network Information API not supported');
      return;
    }

    const wifiDevice: ExtendedSystemDevice = {
      id: `wifi-${Date.now()}`,
      name: 'Current Network',
      type: 'WIFI',
      status: 'CONNECTED',
      lastSeen: new Date().toISOString(),
      deviceType: selectedDeviceType,
      paired: true,
      signalStrength: 80 // Default value, would come from API in real implementation
    };
    setDevices([wifiDevice]);
  };

  const handleBluetoothScan = async () => {
    if (!navigator.bluetooth) {
      console.warn('Web Bluetooth API not supported');
      return;
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true
      });

      if (device) {
        const btDevice: ExtendedSystemDevice = {
          id: device.id,
          name: device.name || 'Bluetooth Device',
          type: 'BLUETOOTH',
          status: 'DISCONNECTED',
          lastSeen: new Date().toISOString(),
          deviceType: selectedDeviceType
        };
        setDevices([btDevice]);
      }
    } catch {
      console.log('Bluetooth pairing cancelled');
    }
  };

  const handleUSBScan = async () => {
    if (!navigator.usb) {
      console.warn('WebUSB API not supported');
      return;
    }

    try {
      const device = await navigator.usb.requestDevice({ filters: [] });
      if (device) {
        const usbDevice: ExtendedSystemDevice = {
          id: device.serialNumber || `usb-${Date.now()}`,
          name: device.productName || 'USB Device',
          type: 'USB',
          status: 'DISCONNECTED',
          lastSeen: new Date().toISOString(),
          deviceType: selectedDeviceType
        };
        setDevices([usbDevice]);
      }
    } catch {
      console.log('USB device selection cancelled');
    }
  };

  const handlePairDevice = (device: ExtendedSystemDevice) => {
    setPairingDevice(device);
    setPassword('');
  };

  const confirmPairing = () => {
    if (!pairingDevice) return;

    // Update device status to pairing
    setDevices(prevDevices => 
      prevDevices.map(d => 
        d.id === pairingDevice.id ? { ...d, status: 'PAIRING' } : d
      )
    );

    // Simulate pairing process
    setTimeout(() => {
      setDevices(prevDevices => 
        prevDevices.map(d => 
          d.id === pairingDevice.id 
            ? { ...d, status: 'CONNECTED', paired: true } 
            : d
        )
      );
      
      setPairingDevice(null);
      
      // Notify parent component without deviceType
      const { deviceType, ...systemDevice } = pairingDevice;
      onDeviceConnect({ ...systemDevice, status: 'CONNECTED' });
    }, 2000);
  };

  const getConnectionIcon = (type: ConnectionType) => {
    switch (type) {
      case 'WIFI': return <Wifi className="w-5 h-5" />;
      case 'BLUETOOTH': return <Bluetooth className="w-5 h-5" />;
      case 'USB': return <Usb className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: DeviceStatus) => {
    switch (status) {
      case 'CONNECTED': return <Check className="w-4 h-4 text-green-500" />;
      case 'DISCONNECTED': return <X className="w-4 h-4 text-red-500" />;
      case 'CONNECTING':
      case 'PAIRING': 
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
    }
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        {/* Device Type and Connection Type selectors */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Device Type</h3>
            <div className="flex space-x-2">
              {(['ESP32', 'RASPBERRY_PI', 'BLUETOOTH', 'NRF'] as DeviceType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedDeviceType(type)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    selectedDeviceType === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Connection Type</h3>
            <div className="flex space-x-2">
              {(['WIFI', 'BLUETOOTH', 'USB'] as ConnectionType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    selectedType === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
                  }`}
                >
                  {getConnectionIcon(type)}
                  <span>{type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scan button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Available Devices</h3>
          <motion.button
            onClick={scanForDevices}
            disabled={scanning}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Scanning...' : 'Scan'}</span>
          </motion.button>
        </div>

        {/* Devices list */}
        <div className="space-y-2">
          {devices.map(device => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getConnectionIcon(device.type)}
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Type: {device.deviceType}</span>
                      {device.type === 'WIFI' && (
                        <span className="text-gray-500 dark:text-gray-400">
                          Signal: {device.signalStrength || 'N/A'}%
                        </span>
                      )}
                      <span className="flex items-center">
                        {getStatusIcon(device.status)}
                        <span className="ml-1 text-gray-500 dark:text-gray-400">
                          {device.status.toLowerCase()}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handlePairDevice(device)}
                  disabled={device.paired || device.status === 'PAIRING'}
                  className={`px-4 py-2 rounded-lg ${
                    device.paired
                      ? 'bg-green-500 text-white cursor-default'
                      : device.status === 'PAIRING'
                      ? 'bg-yellow-500 text-white cursor-default'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {device.paired ? 'Paired' : device.status === 'PAIRING' ? 'Pairing...' : 'Pair'}
                </button>
              </div>
            </motion.div>
          ))}

          {devices.length === 0 && !scanning && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              {selectedType === 'BLUETOOTH' 
                ? 'Click scan to search for Bluetooth devices'
                : selectedType === 'USB'
                ? 'Click scan to search for USB devices'
                : 'Click scan to search for WiFi networks'}
            </p>
          )}
        </div>

        {/* Pairing modal */}
        {pairingDevice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">
                Pair with {pairingDevice.name}
              </h3>
              
              {pairingDevice.type === 'WIFI' && (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Please enter the password for {pairingDevice.name}
                  </p>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="WiFi password"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              {(pairingDevice.type === 'BLUETOOTH' || pairingDevice.type === 'USB') && (
                <p className="text-gray-600 dark:text-gray-300">
                  Confirm pairing with {pairingDevice.name}?
                </p>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setPairingDevice(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPairing}
                  disabled={pairingDevice.type === 'WIFI' && !password}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};