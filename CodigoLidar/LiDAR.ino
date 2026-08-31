#include <esp_now.h>
#include <WiFi.h>
#include <string.h>
#include <Wire.h>
 
// Define I2C Connections (edit as required)
#define I2C_SDA 17
#define I2C_SCL 16
 
// Define communications parameters
#define I2C_ADDRESS 0x10  // TF-Luna I2C address
#define COMMAND 0x00      // Order
#define DATA_LENGTH 9     // Data length

// Define leds
#define ledVerde 25
#define ledAmarelo 32
#define ledVermelho 33
 
unsigned char buf1[] = { 0x5A, 0x05, 0x00, 0x01, 0x60 };
 
uint8_t broadcastAddress[] = {0x00, 0x70, 0x07, 0x1b, 0xe0, 0x28};
 
bool isPeerConnected = false;
void addPeer();
 
 
typedef struct struct_message {
  int id;
  int grassHeight;
  char highway[6];
  int km;
} struct_message;
 
struct_message myData;
 
esp_now_peer_info_t peerInfo;

void acenderLED(int grassHeight) {
  if (grassHeight <= 10) {
    digitalWrite(ledVerde, HIGH);
    digitalWrite(ledAmarelo, LOW);
    digitalWrite(ledVermelho, LOW);
  }
  else if (grassHeight < 30) {
    digitalWrite(ledVerde, LOW);
    digitalWrite(ledAmarelo, HIGH);
    digitalWrite(ledVermelho, LOW);
  }
  else if (grassHeight >= 30) {
    digitalWrite(ledVerde, LOW);
    digitalWrite(ledAmarelo, LOW);
    digitalWrite(ledVermelho, HIGH);
  }
 
}
 
void OnDataSent(const wifi_tx_info_t *info,
                esp_now_send_status_t status){
  Serial.println("\r\nStatus do último pacote enviado:\t");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Sucesso na entrega" : "Falha na entrega");
}
 
void addPeer() {
  // Remove o peer primeiro, se já estiver adicionado
  esp_now_del_peer(broadcastAddress);
 
  // Configura as informações do peer
  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = 0;  
  peerInfo.encrypt = false;
 
  if (esp_now_add_peer(&peerInfo) == ESP_OK) {
    Serial.println("Peer adicionado com sucesso");
    isPeerConnected = true;
  } else {
    Serial.println("Falha ao adicionar peer, tentando novamente...");
    isPeerConnected = false;
  }
}
 
 
void setup() {
  Serial.begin(115200);
 

 
  pinMode(ledVerde, OUTPUT);

  pinMode(ledAmarelo, OUTPUT); 

  pinMode(ledVermelho, OUTPUT);

  Wire.begin(I2C_SDA, I2C_SCL);
 
  // Initialize Serial port
  Serial.println("TF-Luna Ready");
 
 
  WiFi.mode(WIFI_STA);
 
  // Inicializa ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("Erro ao inicializar ESP-NOW");
    return;
  }
 
  // Registra o callback para o status de envio
  esp_now_register_send_cb(OnDataSent);
 
  addPeer(); // Adiciona o peer
}
 
 
 
void loop() {
  // put your main code here, to run repeatedly:
 
  Wire.beginTransmission(I2C_ADDRESS);
  // Send Instructions
  Wire.write(buf1, 5);
  // End I2C Data Transmission
  Wire.endTransmission();
 
  // Request data from TF-Luna
  Wire.requestFrom(I2C_ADDRESS, DATA_LENGTH);
  // Create array to hold data
  uint8_t data[DATA_LENGTH] = { 0 };
  // Variables for distance, signal strength and chip temperature
  uint16_t distance = 0; 
  uint16_t strength = 0;
  int16_t temperature = 0;
  // Checksum and index variables
  int checksum = 0;
  int index = 0;
 
  // Read data into array
  while (Wire.available() > 0 && index < DATA_LENGTH) {
    data[index++] = Wire.read();
  }
  // If data is complete then extract values
  if (index == DATA_LENGTH) {
    distance = 140  - (data[2] + data[3] * 256);     //  Distance definida para medir em uma altura de 140 cm acima do solo para testes
    strength = data[4] + data[5] * 256;     // Signal strength
    temperature = data[6] + data[7] * 256;  // Chip temperature
 
    // Print values to Serial Monitor
    Serial.print("Distance: ");
    Serial.print(distance);
    Serial.println(" cm: ");
    Serial.print("Signal Strength: ");
    Serial.println(strength);
    Serial.print("Chip Temperature: ");
    Serial.print(temperature / 8.0 - 256.0);
    Serial.println(" C");
  }
  // Short delay for TF-Luna
  delay(10);

  myData.id = 1; //Id/highway/km são variáveis próprias de cada sensor, não requer lógica, somente determinar diretamente
  myData.grassHeight = distance;
  strcpy(myData.highway, "BR-101");
  myData.km = 12;
 
  esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
  if (result == ESP_OK) {
    Serial.println("Enviada com sucesso");
  } else {
    Serial.println("Erro ao enviar os dados");
    if (!isPeerConnected) {
      addPeer(); // Tenta adicionar o peer novamente
    }
  }

  acenderLED(distance);

  delay(5000);
 
  // Tenta reconectar se o peer não estiver conectado
  if (!isPeerConnected) {
    addPeer();
  }
}