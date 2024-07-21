#include <ESP8266HTTPClient.h>
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

char ssid[] = "POOP_UP";
char password[] = "123123123";

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
    setNotificationStatus();
    unathorizedData(UNAUTHORIZED_CARD_PATH, cardID);
    return false;
  }
  Serial.println("Card ID found in Firebase");
  logCardData(SCANNED_CARD_PATH, cardID);
  return true;
}

void unathorizedData(String path, String cardID) {
   unsigned long unixTime = timeClient.getEpochTime();
  String date = unixTimeToDateString(unixTime);
  String time = unixTimeToTimeString(unixTime);
  path = path+"/"+date+ "/"+date+" "+cardID ;

  String timeStatus = inOrOutTime(time);

  Firebase.setString(firebaseData, path+"/date", date);
  Firebase.setString(firebaseData, path+"/"+timeStatus, time);
  Firebase.setString(firebaseData, path+"/cardID", cardID);
  
}

void logCardData(String path, String cardID) {
  // Get the current Unix timestamp
  unsigned long unixTime = timeClient.getEpochTime();
  
  String date = unixTimeToDateString(unixTime);
  String time = unixTimeToTimeString(unixTime);
  path = path+"/"+date+ "/"+date+" "+cardID ;

  String timeStatus = inOrOutTime(time);

  if(checkTeacher(cardID ,time,date)){
    Serial.println("it is Teacher");
    Firebase.setString(firebaseData, path+"/date", date);
    Firebase.setString(firebaseData, path+"/"+timeStatus, time);
    Firebase.setString(firebaseData, path+"/cardID", cardID);

    
    
  }
  else{
    Serial.println("It is Student");
    Firebase.setString(firebaseData, path+"/date", date);
    Firebase.setString(firebaseData, path+"/"+timeStatus, time);
    Firebase.setString(firebaseData, path+"/cardID", cardID);
    
    String StudentInOutRef = "AllStudentsInOutTime/"+date+"/"+cardID+"/";
    Firebase.setString(firebaseData, StudentInOutRef+timeStatus, time);    
    
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
  sprintf(buffer, "%02d-%02d-%04d", tm->tm_mday , tm->tm_mon + 1,tm->tm_year + 1900 );
  return String(buffer);
}

String unixTimeToTimeString(unsigned long unixTime) {
  char buffer[20];
  struct tm *tm;
  time_t rawtime = unixTime;
  tm = localtime(&rawtime);
  sprintf(buffer, "%02d:%02d", tm->tm_hour, tm->tm_min);
  return String(buffer);
}
void setNotificationStatus() {
   String path = "SecurityOfficerProfile/";
   String status = "yes";

   if (Firebase.setString(firebaseData, path+"notificationStatus", status)) {
    Serial.println("Data logged to Firebase: " + status);
  } else {
    Serial.println("Failed to log data to Firebase: " + status);
  }
  
}
String inOrOutTime(String currentTime) {
  
  Serial.println("Current Time: " + currentTime);

  // Get school timing from Firebase
  String closingTime = "";
  String openingTime = "";

  Firebase.getString(firebaseData, "/SchoolTiming/closingTime");
  closingTime = firebaseData.stringData();
    
  Firebase.getString(firebaseData, "/SchoolTiming/openingTime");
  openingTime = firebaseData.stringData();
  
  String status="";
 
  if (compareTime(currentTime, openingTime) && compareTime(closingTime, currentTime)) {
    Serial.println("Inside school hours");
    status = "inTime";
    // Perform actions for being inside school hours
  } else {
    Serial.println("Outside school hours");
    status = "outTime";
    // Perform actions for being outside school hours
  }
  return status;
}

bool compareTime(String time1, String time2) {
  // Compare two time strings in the format HH:mm
  int hour1 = time1.substring(0, 2).toInt();
  int minute1 = time1.substring(3, 5).toInt();

  int hour2 = time2.substring(0, 2).toInt();
  int minute2 = time2.substring(3, 5).toInt();

  // Convert hours and minutes to total minutes for easier comparison
  int totalMinutes1 = hour1 * 60 + minute1;
  int totalMinutes2 = hour2 * 60 + minute2;

  return totalMinutes1 >= totalMinutes2;
}

bool checkTeacher(String cardID ,String time ,String date) {
  // Use the cardID to check if it exists in the TeacherData node of Firebase
  String timeStatus = inOrOutTime(time);
  if (Firebase.getString(firebaseData, "/TeacherData/" + cardID)) {
    String uidPath = "/TeacherData/" + cardID + "/uid";
    Firebase.getString(firebaseData, uidPath);
    String uid = firebaseData.stringData();
    
    String TeacherAttendanceRef = "AttendanceRecord/TeachersAttendance/"+date+"/"+uid+"/";
    Firebase.setString(firebaseData, TeacherAttendanceRef+timeStatus, time);
    // Teacher with the given cardID found in Firebase
    Serial.println("Teacher found in Firebase");
    return true;
  } else {
    // Teacher with the given cardID not found in Firebase
    Serial.println("Teacher not found in Firebase");
    return false;
  }
}
