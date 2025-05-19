#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

// Use ESP32-compatible LCD library
LiquidCrystal_I2C lcd(0x27, 16, 2);  // 0x27 address, 16 columns, 2 rows

// Pin Configuration
#define BUZZER_PIN 12
#define WIFI_LED_PIN 32    // For WiFi connection status
#define ERROR_LED_PIN 35   // For connection failures

// WiFi Networks
const int MAX_NETWORKS = 3;
struct WiFiNetwork {
  const char* ssid;
  const char* password;
};

WiFiNetwork networks[MAX_NETWORKS] = {
  {"Airtel_Tics", "TimeToFly"},
  {"Sathiya", "MydrKuttyThangow"},
  {"AI", "AI-MINDSCAPE"}
};

// ThingSpeak Configuration
const String THINGSPEAK_CHANNEL_ID = "2966398";
const String THINGSPEAK_API_KEY = "3ON9J8UTPCIJXEAS";
const String THINGSPEAK_FETCH_URL = "https://api.thingspeak.com/channels/" + THINGSPEAK_CHANNEL_ID + "/feeds.json?results=1";

// Timing Configuration
#define MESSAGE_DISPLAY_TIME 3000    // 3 seconds
#define WIFI_BLINK_DURATION 5000     // 5 seconds blink after connection
#define FAILURE_BLINK_INTERVAL 5000  // Blink every 5 seconds when disconnected
#define FETCH_INTERVAL 10000         // 10 seconds
#define SCAN_TIMEOUT 10000           // 10 seconds

// LED States
enum LedState { LED_OFF, LED_ON, LED_BLINK_FAST };

// System State
struct SystemState {
  LedState wifiLedState = LED_OFF;
  LedState errorLedState = LED_OFF;
  unsigned long lastLedUpdate = 0;
  unsigned long messageStartTime = 0;
  unsigned long wifiConnectTime = 0;
  unsigned long lastFailureBlink = 0;
  String currentMessage = "";
  String lastDisplayedMessage = "";
  bool showingDefault = true;
  bool wifiConnected = false;
  bool connectionFailed = false;
  int currentNetworkIndex = 0;
};

SystemState state;

// Function prototypes
void beepBuzzer(int beeps = 1);
void printCentered(String text, int line);
void displayMultiLineMessage(String message);
void showDefaultMessage();
bool connectToWiFi();
void tryNextNetwork();
void fetchDataFromThingSpeak();
void handleConnectionError(String errorMessage);
void updateLeds();
void manageWiFiConnection();
bool isNewMessage(String message);

void setup() {
  Serial.begin(115200);
  
  // Initialize hardware
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(WIFI_LED_PIN, OUTPUT);
  pinMode(ERROR_LED_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(WIFI_LED_PIN, LOW);
  digitalWrite(ERROR_LED_PIN, LOW);
  
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();
  
  // Connect to WiFi
  manageWiFiConnection();
  
  // Show default message
  showDefaultMessage();
}

void loop() {
  updateLeds();
  
  // Return to default message after timeout
  if (!state.showingDefault && (millis() - state.messageStartTime >= MESSAGE_DISPLAY_TIME)) {
    showDefaultMessage();
  }
  
  // Handle connection failure
  if (state.connectionFailed) {
    tryNextNetwork();
  }
  
  // Fetch data when connected and showing default
  if (state.showingDefault && state.wifiConnected && !state.connectionFailed) {
    static unsigned long lastFetchTime = 0;
    if (millis() - lastFetchTime >= FETCH_INTERVAL) {
      fetchDataFromThingSpeak();
      lastFetchTime = millis();
    }
  }
}

bool isNewMessage(String message) {
  return message != state.lastDisplayedMessage;
}

void manageWiFiConnection() {
  if (!connectToWiFi()) {
    handleConnectionError("WiFi Connection Failed");
  }
}

bool connectToWiFi() {
  lcd.clear();
  printCentered("Scanning WiFi...", 0);
  
  // Scan for networks
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);
  int n = WiFi.scanNetworks();
  
  if (n == 0) {
    printCentered("No networks found", 1);
    return false;
  }

  // Try to connect to strongest available known network
  for (int i = 0; i < MAX_NETWORKS; i++) {
    for (int j = 0; j < n; j++) {
      if (strcmp(WiFi.SSID(j).c_str(), networks[i].ssid) == 0) {
        lcd.clear();
        printCentered("Connecting to:", 0);
        printCentered(networks[i].ssid, 1);
        
        WiFi.begin(networks[i].ssid, networks[i].password);
        state.wifiLedState = LED_BLINK_FAST;
        
        int attempts = 0;
        while (WiFi.status() != WL_CONNECTED && attempts < 20) {
          delay(500);
          lcd.setCursor(attempts % 4, 1);
          lcd.print(".");
          attempts++;
        }
        
        if (WiFi.status() == WL_CONNECTED) {
          state.wifiConnected = true;
          state.wifiConnectTime = millis();
          state.connectionFailed = false;
          state.currentNetworkIndex = i;
          
          lcd.clear();
          printCentered("Connected to:", 0);
          printCentered(networks[i].ssid, 1);
          beepBuzzer(2);
          delay(1000);
          return true;
        }
      }
    }
  }
  
  return false;
}

void tryNextNetwork() {
  static unsigned long lastAttemptTime = 0;
  
  if (millis() - lastAttemptTime >= FAILURE_BLINK_INTERVAL) {
    state.currentNetworkIndex = (state.currentNetworkIndex + 1) % MAX_NETWORKS;
    state.connectionFailed = !connectToWiFi();
    lastAttemptTime = millis();
  }
}

void updateLeds() {
  unsigned long currentMillis = millis();
  
  // Update WiFi LED (pin 32)
  if (state.wifiConnected) {
    if (currentMillis - state.wifiConnectTime < WIFI_BLINK_DURATION) {
      // Fast blink for 5 seconds after connection
      digitalWrite(WIFI_LED_PIN, (currentMillis / 250) % 2 ? HIGH : LOW);
    } else {
      // Turn OFF after blinking period
      digitalWrite(WIFI_LED_PIN, LOW);
    }
  } else {
    digitalWrite(WIFI_LED_PIN, LOW); // Off when not connected
  }
  
  // Update Error LED (pin 35) - Blink every 5 seconds when disconnected
  if (state.connectionFailed) {
    if (currentMillis - state.lastFailureBlink >= FAILURE_BLINK_INTERVAL) {
      digitalWrite(ERROR_LED_PIN, HIGH);
      delay(100); // Short pulse
      digitalWrite(ERROR_LED_PIN, LOW);
      state.lastFailureBlink = currentMillis;
    }
  } else {
    digitalWrite(ERROR_LED_PIN, LOW); // Off when connected
  }
}

void fetchDataFromThingSpeak() {
  if (!WiFi.isConnected()) {
    handleConnectionError("WiFi Disconnected");
    return;
  }
  
  HTTPClient http;
  http.begin(THINGSPEAK_FETCH_URL);
  int httpCode = http.GET();
  
  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, payload);
    
    if (error) {
      handleConnectionError("JSON Parse Error");
      return;
    }
    
    JsonArray feeds = doc["feeds"];
    if (feeds.size() > 0) {
      String value = feeds[0]["field1"].as<String>();
      
      // Only display if it's a new message
      if (isNewMessage(value)) {
        state.currentMessage = value;
        state.lastDisplayedMessage = value;
        displayMultiLineMessage(value);
      }
    }
  } else if (httpCode != -1) {
    handleConnectionError("API Error: " + String(httpCode));
  }
  
  http.end();
}

void displayMultiLineMessage(String message) {
  lcd.clear();
  
  // Split message into two 16-character lines
  String line1 = message.substring(0, 16);
  String line2 = message.length() > 16 ? message.substring(16, 32) : "";
  
  printCentered(line1, 0);
  printCentered(line2, 1);
  
  state.messageStartTime = millis();
  state.showingDefault = false;
  beepBuzzer(1);
}

void showDefaultMessage() {
  lcd.clear();
  printCentered("INT MINDSCAPE AI", 0);
  printCentered("CNPT_WEARABLE DEVICE", 1);
  state.showingDefault = true;
}

void handleConnectionError(String errorMessage) {
  state.connectionFailed = true;
  state.lastFailureBlink = millis();
  displayMultiLineMessage(errorMessage);
  beepBuzzer(3);
}

void printCentered(String text, int line) {
  text.trim();
  int startPos = (16 - text.length()) / 2;
  if (startPos < 0) startPos = 0;
  
  // Clear the line
  lcd.setCursor(0, line);
  for (int i = 0; i < 16; i++) {
    lcd.print(" ");
  }
  
  // Print centered text
  lcd.setCursor(startPos, line);
  lcd.print(text);
}

void beepBuzzer(int beeps) {
  for (int i = 0; i < beeps; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZER_PIN, LOW);
    if (beeps > 1) delay(300);
  }
}