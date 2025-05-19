const { ipcRenderer } = require('electron');
const wifi = require('node-wifi');

// Initialize wifi module
wifi.init({
  iface: null // auto-select interface
});

// Expose WiFi functions to renderer
contextBridge.exposeInMainWorld('electron', {
  scanWifi: async () => {
    try {
      const networks = await wifi.scan();
      return networks.map(network => ({
        ssid: network.ssid,
        signalStrength: Math.round(network.quality),
        security: network.security
      }));
    } catch (error) {
      console.error('WiFi scan error:', error);
      throw error;
    }
  },
  
  connectToWifi: async (ssid, password) => {
    try {
      await wifi.connect({ ssid, password });
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  },
  
  getCurrentWifi: async () => {
    try {
      const connection = await wifi.getCurrentConnections();
      if (connection.length > 0) {
        return {
          ssid: connection[0].ssid,
          signalStrength: Math.round(connection[0].quality)
        };
      }
      return null;
    } catch (error) {
      console.error('Current connection error:', error);
      return null;
    }
  }
});