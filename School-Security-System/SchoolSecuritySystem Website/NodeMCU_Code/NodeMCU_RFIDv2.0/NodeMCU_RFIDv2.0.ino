#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN  D2
#define RST_PIN D3
#define BUZZER_PIN D0

MFRC522 mfrc522(SS_PIN, RST_PIN);

const char *ssid = "POOP_UP";
const char *password = "123123123";
const char* device_token = "9d3c4286ebf6a9ce";

String URL = "http://192.168.10.95/SchoolSecuritySystem/phpcode/getdata.php";
String getData, Link;
String OldCardID = "";
unsigned long previousMillis = 0;

void setup() {
  delay(10);
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init(SS_PIN, RST_PIN);
  connectToWiFi();
}

void loop() {
  if (!WiFi.isConnected()) {
    connectToWiFi();
  }

  if (millis() - previousMillis >= 15000) {
    previousMillis = millis();
    OldCardID = "";
  }
  delay(50);

  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  String CardID = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    CardID += mfrc522.uid.uidByte[i];
  }
  digitalWrite(BUZZER_PIN, HIGH); // Turn on the buzzer
  delay(1000); // Wait for 1 second
  digitalWrite(BUZZER_PIN, LOW); // Turn off the buzzer
  delay(1000);

  if (CardID == OldCardID) {
    return;
  } else {
    OldCardID = CardID;
  }

  SendCardID(CardID);
  delay(100);
}

void SendCardID(String Card_uid) {
  Serial.println("Sending the Card ID");
  if (WiFi.isConnected()) {
    WiFiClient client;
    HTTPClient http;
    getData = "?card_uid=" + String(Card_uid) ;
    Link = URL + getData;
    http.begin(client, Link);

    int httpCode = http.GET();
    String payload = http.getString();

    digitalWrite(BUZZER_PIN, HIGH);
  delay(500);
  digitalWrite(BUZZER_PIN, LOW);

    Serial.println(httpCode);
    Serial.println(Card_uid);
    Serial.println(payload);

    if (httpCode == 200) {
      if (payload.substring(0, 5) == "login") {
        String user_name = payload.substring(5);
      }
      else if (payload.substring(0, 6) == "logout") {
        String user_name = payload.substring(6);
      }
      else if (payload == "succesful") {
      }
      else if (payload == "available") {
      }
      delay(100);
      http.end();
    }
  }
}

void beepBuzzerOnce() {
  digitalWrite(BUZZER_PIN, HIGH); // Turn on the buzzer
  delay(1000); // Wait for 1 second
  digitalWrite(BUZZER_PIN, LOW); // Turn off the buzzer
  delay(1000);
}

void connectToWiFi() {
  WiFi.mode(WIFI_OFF);
  delay(10);
  WiFi.mode(WIFI_STA);
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(50);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("Connected");
  
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  delay(10);
}
