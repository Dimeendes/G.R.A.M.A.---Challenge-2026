#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "Motiva-ESP32";
const char* password = "motiva123";

WebServer server(80);

// Ajuste estes pinos conforme a sua ligação do TF-Luna.
const int TF_LUNA_RX_PIN = 16;
const int TF_LUNA_TX_PIN = 17;
const float SENSOR_HEIGHT_CM = 70.0;

volatile uint16_t latestDistanceCm = 0;
volatile uint16_t latestStrength = 0;
volatile bool hasReading = false;

uint16_t parseTfLunaDistance(const uint8_t* frame) {
  return (uint16_t(frame[2]) | (uint16_t(frame[3]) << 8));
}

uint16_t parseTfLunaStrength(const uint8_t* frame) {
  return (uint16_t(frame[4]) | (uint16_t(frame[5]) << 8));
}

void readTfLuna() {
  static uint8_t buffer[9];
  static uint8_t index = 0;

  while (Serial2.available()) {
    uint8_t byte = Serial2.read();

    if (index == 0 && byte != 0x59) {
      continue;
    }

    buffer[index++] = byte;

    if (index >= 9) {
      if (buffer[0] == 0x59 && buffer[1] == 0x59) {
        latestDistanceCm = parseTfLunaDistance(buffer);
        latestStrength = parseTfLunaStrength(buffer);
        hasReading = true;
      }
      index = 0;
    }
  }
}

void handleSensor() {
  float distanceCm = hasReading ? latestDistanceCm : 0;
  float grassHeight = max(0.0f, SENSOR_HEIGHT_CM - distanceCm);

  String payload = "{\"sensor\":{\"id\":1,\"highway\":\"BR-101\",\"km\":12.5,\"distanceCm\":" + String(distanceCm, 1) + ",\"grassHeight\":" + String(grassHeight, 1) + ",\"strength\":" + String(latestStrength) + "}}";

  server.send(200, "application/json", payload);
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, TF_LUNA_RX_PIN, TF_LUNA_TX_PIN);

  WiFi.softAP(ssid, password);
  delay(100);

  server.on("/sensor", HTTP_GET, handleSensor);
  server.begin();

  Serial.println("ESP32 pronto");
  Serial.println(WiFi.softAPIP());
}

void loop() {
  readTfLuna();
  server.handleClient();
}
