#include <esp_now.h>
#include <WiFi.h>
#include <string.h>
#include <Wire.h>
#include <ESP32Servo.h>
 
// Define I2C Connections
#define I2C_SDA 17
#define I2C_SCL 16
 
// Define communications parameters
#define I2C_ADDRESS 0x10  
#define COMMAND 0x00    
#define DATA_LENGTH 9    
 
// Define leds
#define ledVerde 25
#define ledAmarelo 32
#define ledVermelho 33
 
// Define servo
Servo servo;
 
// Define variáveis de verificação
#define idSensor 1
 
int angulos[] = {0, 10, 20, 30, 40};
 
unsigned char buf1[] = { 0x5A, 0x05, 0x00, 0x01, 0x60 };
 
uint8_t broadcastAddress[] = {0x00, 0x70, 0x07, 0x1b, 0xe0, 0x28};
 
bool isPeerConnected = false;
void addPeer();
 
 
typedef struct struct_message_sent {
  int id;
  char highway[10];
  int km;
  int grassHeight;
  int verificacao;
} struct_message_Sent;
 
typedef struct struct_message_recv{
  int id;
  int comando;
}struct_message_recv;
 
struct_message_sent DataSent;
struct_message_recv DataReceived;
 
unsigned long lastReceiveTime = 0;  // Última vez que recebemos dados
const unsigned long timeout = 5000; // Tempo limite para considerar que a conexão foi perdida (em milissegundos)
 
esp_now_peer_info_t peerInfo;
 
int medirAltura(){
  Wire.beginTransmission(I2C_ADDRESS);
  Wire.write(buf1,5);
  Wire.endTransmission();
 
  Wire.requestFrom(I2C_ADDRESS, DATA_LENGTH);
 
  uint8_t data[DATA_LENGTH] = { 0 };
  int index = 0;
 
  while(Wire.available() > 0 && index < DATA_LENGTH){
    data[index++] = Wire.read();
  }
 
  if(index == DATA_LENGTH){
    int distance = data[2] + data[3] * 256;
    int alturaGrama = 70 - distance;
 
    return alturaGrama;
  }
  return 0;
}
 
 
 
void OnDataRecv(
  const esp_now_recv_info_t *info,
  const uint8_t *incomingData,
  int len
) {
 
  Serial.println("================================");
  Serial.println("PACOTE ESP-NOW RECEBIDO!");
  Serial.print("Tamanho recebido: ");
  Serial.println(len);
  Serial.print("Tamanho esperado: ");
  Serial.println(sizeof(DataReceived));
 
  if (len != sizeof(DataReceived)) {
    Serial.println("ERRO: tamanho do pacote diferente!");
    Serial.println("================================");
    return;
  }
 
  memcpy(&DataReceived, incomingData, sizeof(DataReceived));
 
  Serial.print("ID recebido: ");
  Serial.println(DataReceived.id);
 
  Serial.print("Comando recebido: ");
  Serial.println(DataReceived.comando);
 
  lastReceiveTime = millis();
 
  Serial.println("================================");
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
 
bool Verificar(){
  if(DataReceived.id == idSensor && DataReceived.comando == 1){
    return true;
  }else{
    return false;
  }
}
 
int realizarMedicao(){
  int somaAltura = 0;
  for(int i = 0; i < 5; i++){
    servo.write(angulos[i]);
 
    delay(500);
    int altura = medirAltura();
 
    Serial.print("Angulo: ");
    Serial.print(angulos[i]);
    Serial.print(" | Altura: ");
    Serial.print(altura);
    Serial.println(" cm");
 
    somaAltura += altura;
  }
  servo.write(angulos[0]);
  return somaAltura / 5;
}
 
void setup() {
  Serial.begin(115200);
 
  servo.attach(27);
 
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
  esp_now_register_recv_cb(OnDataRecv);
 
  addPeer(); // Adiciona o peer
}
 
 
 
void loop() {
  DataSent.verificacao = 0;
  int alturaMedia;
  if (Verificar()) {
 
    Serial.println("################################");
    Serial.println("VERIFICACAO RECEBIDA!");
    Serial.print("Sensor: ");
    Serial.println(DataReceived.id);
    Serial.print("Comando: ");
    Serial.println(DataReceived.comando);
    Serial.println("################################");
 
    alturaMedia = realizarMedicao();
 
    Serial.print("Altura da verificacao: ");
    Serial.print(alturaMedia);
    Serial.println(" cm");
 
    DataReceived.comando = 0;
    DataSent.verificacao = 1;
  }else{
    alturaMedia = realizarMedicao();
    
  }
  
  DataSent.id = idSensor;
  strcpy(DataSent.highway, "BR-101");
  DataSent.grassheight = alturaMedia;
  DataSent.km = 12;
  esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &DataSent, sizeof(DataSent));
  if (result == ESP_OK) {
    Serial.println("Enviada com sucesso");
  } else {
    Serial.println("Erro ao enviar os dados");
    if (!isPeerConnected) {
      addPeer(); // Tenta adicionar o peer novamente
    }}
  delay(1000);
 
 
  // Tenta reconectar se o peer não estiver conectado
  if (!isPeerConnected) {
    addPeer();
  }
}