#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <WiFiUdp.h>
#include <NTPClient.h>

#define SS_PIN D2
#define RST_PIN D3
#define BUZZER_PIN D0

MFRC522 mfrc522(SS_PIN, RST_PIN);

#define FIREBASE_HOST "schoolsecuritysystemusin-4c8fa-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "AIzaSyDCXvbE44rMmYlkSLMIsramC6tiBcLBNH4"

char ssid[] = "StarLink";
char password[] = "kashif321123";

#define SCANNED_CARD_PATH "/Authorized Card Scanned/"
#define UNAUTHORIZED_CARD_PATH "/Unauthorized Card Scanned/"

FirebaseData firebaseData;

// NTP
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 19800); // Use the pool.ntp.org server for time synchronization

void setup() {
  Serial.begin(9600);
  SPI.begin();
  mfrc522.PCD_Init();
  pinMode(BUZZER_PIN, OUTPUT);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(50);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("Connected to Wi-Fi network");
  Serial.println(WiFi.localIP());

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);

  Serial.println("Ready to read RFID cards...");

  // Initialize NTP client
  timeClient.begin();
  timeClient.setTimeOffset(5 * 60 * 60); // Set the time zone offset (5 hours for Pakistan)
  timeClient.forceUpdate(); // Force an immediate time and date update from the NTP server
}

void loop() {
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    delay(10);
    return;
  }

  Serial.print("Card ID: ");
  String cardID = "";

  for (byte i = 0; i < mfrc522.uid.size; i++) {
    cardID += mfrc522.uid.uidByte[i];
  }

  Serial.println(cardID);

  if (checkCardID(cardID)) {
    beepBuzzerOnce();
  } else {
    beepBuzzer();
  }

  mfrc522.PICC_HaltA();
  delay(10);

  // Update NTP time and date
  timeClient.update();

  // Get the current Unix timestamp
  unsigned long unixTime = timeClient.getEpochTime();

  // Convert Unix timestamp to a human-readable date and time
  String currentDate = unixTimeToDateString(unixTime);
  String currentTime = unixTimeToTimeString(unixTime);

  Serial.println("Current Date in Pakistan: " + currentDate);
  Serial.println("Current Time in Pakistan: " + currentTime);
}

bool checkCardID(String cardID) {
  if (!Firebase.getString(firebaseData, "/allowed-card-ids/" + cardID)) {
    Serial.println("Card ID not found in Firebase");
    logCardData(UNAUTHORIZED_CARD_PATH, cardID);
    return false;
  }

  String allowedCardID = firebaseData.stringData();

  if (allowedCardID == "null") {
    Serial.println("Card ID not found in Firebase");
    logCardData(UNAUTHORIZED_CARD_PATH, cardID);
    return false;
  }

  Serial.println("Card ID found in Firebase: " + allowedCardID);
  logCardData(SCANNED_CARD_PATH, cardID);
  return true;
}

void logCardData(String path, String cardID) {
  // Get the current Unix timestamp
  unsigned long unixTime = timeClient.getEpochTime();

  // Convert Unix timestamp to a human-readable date and time
  String data = "id: " + cardID + " , date: " + unixTimeToDateString(unixTime) + " , time: " + unixTimeToTimeString(unixTime);
  String date = unixTimeToDateString(unixTime);
  String time = unixTimeToTimeString(unixTime);
  path = path + unixTimeToDateString(unixTime)+","+unixTimeToTimeString(unixTime) ;

  if (Firebase.setString(firebaseData, path+"/date", date)) {
    Serial.println("Data logged to Firebase: " + date);
  } else {
    Serial.println("Failed to log data to Firebase: " + date);
  }

  
  if (Firebase.setString(firebaseData, path+"/time", time)) {
    Serial.println("Data logged to Firebase: " + time);
  } else {
    Serial.println("Failed to log data to Firebase: " + time);
  }
  
  if (Firebase.setString(firebaseData, path+"/cardID", cardID)) {
    Serial.println("Data logged to Firebase: " + cardID);
  } else {
    Serial.println("Failed to log data to Firebase: " + cardID);
  }
  
}

void beepBuzzerOnce() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(500);
  digitalWrite(BUZZER_PIN, LOW);
}

void beepBuzzer() {
  int i = 0;
  while (i <= 20) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZER_PIN, LOW);
    delay(100);
    i++;
  }
}

String unixTimeToDateString(unsigned long unixTime) {
  char buffer[20];
  struct tm *tm;
  time_t rawtime = unixTime;
  tm = localtime(&rawtime);
  sprintf(buffer, "%04d-%02d-%02d", tm->tm_year + 1900, tm->tm_mon + 1, tm->tm_mday);
  return String(buffer);
}

String unixTimeToTimeString(unsigned long unixTime) {
  char buffer[20];
  struct tm *tm;
  time_t rawtime = unixTime;
  tm = localtime(&rawtime);
  sprintf(buffer, "%02d:%02d:%02d", tm->tm_hour, tm->tm_min, tm->tm_sec);
  return String(buffer);
}
