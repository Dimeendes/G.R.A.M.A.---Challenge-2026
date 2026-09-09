#include <esp_now.h>
#include <WiFi.h>
 
// Estrutura exemplo para receber dados
// Deve corresponder à estrutura do remetente
typedef struct struct_message {
    int id;
    char highWay[10];
    int km;
    int grassHeight;
} struct_message;
 
// Crie uma struct_message chamada myData
struct_message myData;
 
unsigned long lastReceiveTime = 0;  // Última vez que recebemos dados
const unsigned long timeout = 5000; // Tempo limite para considerar que a conexão foi perdida (em milissegundos)
 
// Função de callback que será executada quando os dados forem recebidos
void OnDataRecv(const esp_now_recv_info_t *info, const uint8_t *incomingData, int len) {
  memcpy(&myData, incomingData, sizeof(myData));
  lastReceiveTime = millis(); // Atualiza a última vez que recebemos dados
}
void setup() {
  // Inicializa o Monitor Serial
  Serial.begin(115200);
  // Configura o dispositivo como uma estação Wi-Fi
  WiFi.mode(WIFI_STA);
  // Inicializa ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("Erro ao inicializar ESP-NOW");
    return;
  }
 
  // Uma vez que o ESPNow é inicializado com sucesso, registramos para receber CB para
  // obter informações do pacote recebido
  esp_now_register_recv_cb(OnDataRecv);
}
 
void loop() {
  // Verifica se o tempo desde a última recepção de dados excede o tempo limite
  if (millis() - lastReceiveTime > timeout) {
  }
  Serial.println(myData.id);
  Serial.println(myData.highWay);
  Serial.println(myData.km);
  Serial.println(myData.grassHeight);
  delay(5000); // Ajuste conforme necessário
}