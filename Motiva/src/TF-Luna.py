import serial
from serial.tools import list_ports
import json
from pathlib import Path
from flask import Flask, jsonify
from flask_cors import CORS
import threading
from datetime import datetime
 
 
# ============================================================
# CONFIGURAÇÕES
# ============================================================
 
BAUD_RATE = 115200
API_PORT = 5000
 
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "dados.json"
 
 
# ============================================================
# FLASK
# ============================================================
 
app = Flask(__name__)
CORS(app)
 
 
@app.route("/dados", methods=["GET"])
def obter_dados():
    try:
        if not DATA_FILE.exists():
            return jsonify({
                "erro": "Arquivo dados.json ainda não existe"
            }), 404
 
        with open(DATA_FILE, "r", encoding="utf-8") as arquivo:
            dados = json.load(arquivo)
 
        return jsonify(dados)
 
    except Exception as erro:
        print("Erro ao ler JSON:", erro)
 
        return jsonify({
            "erro": "Erro ao ler os dados"
        }), 500
 
 
# ============================================================
# SERIAL
# ============================================================
 
def encontrar_porta():
    portas = list(list_ports.comports())
 
    if not portas:
        print("Nenhuma porta serial encontrada.")
        return None
 
    print("Portas encontradas:")
 
    for porta in portas:
        print(f"  {porta.device} - {porta.description}")
 
    return portas[0].device
 
 
def receber_dados():
 
    porta = encontrar_porta()
 
    if porta is None:
        return
 
    try:
        conexao = serial.Serial(
            porta,
            BAUD_RATE,
            timeout=1
        )
 
        print()
        print("================================")
        print("ESP32 conectado")
        print("Porta:", porta)
        print("Baud rate:", BAUD_RATE)
        print("================================")
        print()
 
    except serial.SerialException as erro:
        print("Erro ao abrir porta serial:")
        print(erro)
        return
 
    # Cria a pasta data caso não exista
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
 
    while True:
 
        try:
 
            # ================================================
            # LÊ O ID
            # ================================================
 
            id_sensor = (
                conexao
                .readline()
                .decode("utf-8", errors="ignore")
                .strip()
            )
 
            # Ignora mensagens de boot/debug do ESP32
            if not id_sensor.isdigit():
                continue
 
            # ================================================
            # LÊ OS OUTROS CAMPOS
            # ================================================
 
            highway = (
                conexao
                .readline()
                .decode("utf-8", errors="ignore")
                .strip()
            )
 
            km = (
                conexao
                .readline()
                .decode("utf-8", errors="ignore")
                .strip()
            )
 
            grass_height = (
                conexao
                .readline()
                .decode("utf-8", errors="ignore")
                .strip()
            )
 
            # ================================================
            # VALIDA OS DADOS
            # ================================================
 
            if not highway or not km or not grass_height:
                continue
 
            try:
                id_sensor = int(id_sensor)
                km = int(km)
                grass_height = int(grass_height)
 
            except ValueError:
                print("Dados inválidos recebidos.")
                continue
 
            # ================================================
            # CRIA OBJETO JSON
            # ================================================
 
            dados = {
                "id": id_sensor,
                "highWay": highway,
                "km": km,
                "grassHeight": grass_height,
                "TimeStamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
    
            # ================================================
            # SALVA JSON
            # ================================================
 
            with open(
                DATA_FILE,
                "w",
                encoding="utf-8"
            ) as arquivo:
 
                json.dump(
                    dados,
                    arquivo,
                    indent=4,
                    ensure_ascii=False
                )
 
            print("Novo dado recebido:")
            print(dados)
            print()
 
        except KeyboardInterrupt:
            print()
            print("Encerrando conexão serial...")
            break
 
        except serial.SerialException as erro:
            print("Erro na comunicação serial:")
            print(erro)
            break
 
    conexao.close()
 
 
# ============================================================
# INICIALIZAÇÃO
# ============================================================
 
if __name__ == "__main__":
 
    # Inicia o servidor Flask em uma thread
    servidor = threading.Thread(
        target=lambda: app.run(
            host="0.0.0.0",
            port=API_PORT,
            debug=False,
            use_reloader=False
        )
    )
 
    servidor.daemon = True
    servidor.start()
 
    print()
    print("================================")
    print("API iniciada")
    print(f"Porta: {API_PORT}")
    print("Endpoint: /dados")
    print("================================")
    print()
 
    # Inicia leitura da serial
    receber_dados()