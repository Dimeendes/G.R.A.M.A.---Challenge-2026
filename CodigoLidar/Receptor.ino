#include <esp_now.h>
#include <WiFi.h>
#include <string.h>
 
unsigned char buf1[] = {
  0x5A, 0x05, 0x00, 0x01, 0x60
};
 
uint8_t broadcastAdress[] = {
  0x00, 0x70, 0x07, 0x26, 0x33, 0xcc
};
uint8_t lidarAddress[6];
bool lidarAddressKnown = false;
 
bool isPeerConnected = false;
 
typedef struct struct_message_recv {
  int id;
  char highWay[10];
  int km;
  int grassHeight;
  int verificacao;
} struct_message_recv;
 
typedef struct struct_message_sent {
  int id;
  int comando;
} struct_message_sent;
 
struct_message_recv DataReceived;
struct_message_sent DataSent;
int verificacaoSolicitada = 0;
 
unsigned long lastReceiveTime = 0;
const unsigned long timeout = 5000;
 
esp_now_peer_info_t peerInfo;
 
 
// =========================
// ADICIONAR PEER
// =========================
 
void addPeer() {
 
  if (esp_now_is_peer_exist(broadcastAdress)) {
    esp_now_del_peer(broadcastAdress);
  }
 
  memset(&peerInfo, 0, sizeof(peerInfo));
 
  memcpy(peerInfo.peer_addr, broadcastAdress, 6);
 
  peerInfo.channel = 0;
  peerInfo.encrypt = false;
 
  if (esp_now_add_peer(&peerInfo) == ESP_OK) {
 
    isPeerConnected = true;
 
    Serial.println("Peer adicionado com sucesso!");
 
  } else {
 
    isPeerConnected = false;
 
    Serial.println("Erro ao adicionar peer!");
  }
}
 
 
// =========================
// RECEBER ESP-NOW
// =========================
 
void OnDataRecv(
  const esp_now_recv_info_t *info,
  const uint8_t *incomingData,
  int len
) {
 
  if (len != sizeof(DataReceived)) {
 
    Serial.print("Tamanho de pacote inesperado: ");
    Serial.println(len);
 
    return;
  }
 
  memcpy(
    &DataReceived,
    incomingData,
    sizeof(DataReceived)
  );
 
  memcpy(lidarAddress, info->src_addr, sizeof(lidarAddress));
  lidarAddressKnown = true;
 
  if (
    verificacaoSolicitada != 0 &&
    DataReceived.id == verificacaoSolicitada &&
    DataReceived.verificacao == 1
  ) {
    Serial.print("VERIFICADO:");
    Serial.print(DataReceived.id);
    Serial.print(":");
    Serial.println(DataReceived.grassHeight);
    verificacaoSolicitada = 0;
  }
 
  lastReceiveTime = millis();
 
}
 
 
// =========================
// ENVIO ESP-NOW
// =========================
 
void OnDataSent(
  const wifi_tx_info_t *info,
  esp_now_send_status_t status
) {
 
  Serial.print("Status do envio: ");
 
  if (status == ESP_NOW_SEND_SUCCESS) {
    Serial.println("SUCESSO");
  } else {
    Serial.println("FALHA");
  }
}
 
 
// =========================
// SETUP
// =========================
 
void setup() {
 
  Serial.begin(115200);
 
  WiFi.mode(WIFI_STA);
 
  Serial.print("MAC deste ESP32: ");
  Serial.println(WiFi.macAddress());
 
  if (esp_now_init() != ESP_OK) {
 
    Serial.println("Erro ao inicializar ESP-NOW");
 
    return;
  }
 
  addPeer();
 
  esp_now_register_send_cb(OnDataSent);
 
  esp_now_register_recv_cb(OnDataRecv);
 
  Serial.println("ESP-NOW iniciado!");
}
 
 
// =========================
// LOOP
// =========================
 
void loop() {
 
  // -------------------------
  // RECEBER COMANDO DO PYTHON
  // -------------------------
 
  if (Serial.available()) {
 
    char mensagemRecebida[30];
 
    int tamanho = Serial.readBytesUntil(
      '\n',
      mensagemRecebida,
      sizeof(mensagemRecebida) - 1
    );
 
    mensagemRecebida[tamanho] = '\0';
 
    // Remove \r caso venha \r\n
    mensagemRecebida[strcspn(mensagemRecebida, "\r")] = '\0';
 
    Serial.print("Recebida do Python: ");
    Serial.println(mensagemRecebida);
 
 
    // -------------------------
    // VERIFICAR SENSOR
    // -------------------------
 
    if (strncmp(mensagemRecebida, "VERIFICAR:", 10) == 0) {
 
      int idSensor = atoi(
        &mensagemRecebida[10]
      );
 
      Serial.print("ID do sensor: ");
      Serial.println(idSensor);
 
 
      // Limpa a struct
      memset(
        &DataSent,
        0,
        sizeof(DataSent)
      );
 
 
      // Preenche comando
      DataSent.id = idSensor;
      DataSent.comando = 1;
 
 
      if (!lidarAddressKnown) {
        Serial.println("ERRO: nenhum pacote do LiDAR foi recebido ainda");
        return;
      }
 
      verificacaoSolicitada = idSensor;
 
      // Envia para o LiDAR que transmitiu o último pacote
      esp_err_t resultado = esp_now_send(
        lidarAddress,
        (uint8_t *)&DataSent,
        sizeof(DataSent)
      );
 
 
      if (resultado == ESP_OK) {
        Serial.println("Comando enviado ao LiDAR via ESP-NOW");
 
        Serial.println("Comando VERIFICAR enviado!");
          Serial.println();
          Serial.println("===== DADOS ENVIADOS =====");
 
          Serial.print("ID: ");
          Serial.println(DataSent.id);
 
       
 
          Serial.println("===========================");
 
      } else {
 
        Serial.print(
          "Erro ao enviar : "
        );
 
        Serial.println(resultado);
      }
    }
  }
 
 
  // -------------------------
  // TIMEOUT
  // -------------------------
 
  if (
    lastReceiveTime != 0 &&
    millis() - lastReceiveTime > timeout
  ) {}
  Serial.println();
  Serial.println("===== DADOS RECEBIDOS =====");
 
  Serial.println(DataReceived.id);
 
  Serial.println(DataReceived.highWay);
 
  Serial.println(DataReceived.km);
 
  Serial.println(DataReceived.grassHeight);

  Serial.println(DataReceived.verificacao);

  Serial.println("===========================");
  delay(1000);
}