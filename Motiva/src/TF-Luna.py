import serial
from serial.tools import list_ports
from pathlib import Path
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
from datetime import datetime
import sqlite3
import requests
import os
import queue
 
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
 
from services.algoritmo import executar_algoritmo
 
conexao_serial = None
serial_lock = threading.Lock()
fila_verificacoes = queue.Queue()
 
app = Flask(__name__)
CORS(app)
 
# ============================================================
# GOOGLE ROUTES API
# ============================================================
 
GOOGLE_ROUTES_API_KEY = os.getenv("GOOGLE_ROUTES_API_KEY")
 
 
@app.route("/rota", methods=["POST"])
def calcular_rota():
    try:
        print("================================")
        print("REQUISIÇÃO /rota RECEBIDA")
        print("Dados:", request.get_json())
        print("API KEY configurada:", GOOGLE_ROUTES_API_KEY is not None)
        print("================================")
        data = request.get_json()
 
        if not data:
            return jsonify({
                "erro": "Nenhum dado recebido"
            }), 400
 
        origin = data.get("origin")
        destination = data.get("destination")
 
        if not origin or not destination:
            return jsonify({
                "erro": "Origem e destino são obrigatórios"
            }), 400
 
        url = (
            "https://routes.googleapis.com/"
            "directions/v2:computeRoutes"
        )
 
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_ROUTES_API_KEY,
            "X-Goog-FieldMask": (
                "routes.distanceMeters,"
                "routes.duration,"
                "routes.polyline.encodedPolyline"
            )
        }
 
        body = {
            "origin": {
                "location": {
                    "latLng": {
                        "latitude": origin["latitude"],
                        "longitude": origin["longitude"]
                    }
                }
            },
            "destination": {
                "location": {
                    "latLng": {
                        "latitude": destination["latitude"],
                        "longitude": destination["longitude"]
                    }
                }
            },
            "travelMode": "DRIVE",
            "routingPreference": "TRAFFIC_AWARE",
            "computeAlternativeRoutes": False,
            "languageCode": "pt-BR",
            "units": "METRIC"
        }
 
        resposta = requests.post(
            url,
            headers=headers,
            json=body,
            timeout=15
        )
 
        if resposta.status_code != 200:
            print("Erro Google Routes:")
            print(resposta.text)
 
            return jsonify({
                "erro": "Erro na Google Routes API",
                "detalhes": resposta.text
            }), resposta.status_code
 
        resultado = resposta.json()
 
        if not resultado.get("routes"):
            return jsonify({
                "erro": "Nenhuma rota encontrada"
            }), 404
 
        rota = resultado["routes"][0]
 
        return jsonify({
            "distanceMeters": rota.get("distanceMeters"),
            "duration": rota.get("duration"),
            "encodedPolyline":
                rota["polyline"]["encodedPolyline"]
        })
 
    except Exception as erro:
        print("Erro ao calcular rota:", erro)
 
        return jsonify({
            "erro": str(erro)
        }), 500
 
# ============================================================
# CONFIGURAÇÕES
# ============================================================
 
BAUD_RATE = 115200
API_PORT = 5000
 
BASE_DIR = Path(__file__).resolve().parent.parent
DB_FILE = BASE_DIR / "data" / "dados.db"
def conectar_esp32():
    global conexao_serial
 
    porta = encontrar_porta()
 
    if porta is None:
        print("Nenhum ESP32 encontrado.")
        return False
 
    try:
        conexao_serial = serial.Serial(
            porta,
            BAUD_RATE,
            timeout=1
        )
 
        print(f"ESP32 conectado em {porta}")
 
        return True
 
    except serial.SerialException as erro:
        print("Erro ao conectar ao ESP32:", erro)
        conexao_serial = None
        return False
   
def inicializarBanco():
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)
 
    conexao = sqlite3.connect(DB_FILE)
    cursor = conexao.cursor()
 
    cursor.execute('''
     CREATE TABLE IF NOT EXISTS medicoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sensor_id INTEGER NOT NULL,
            highWay TEXT NOT NULL,
            km REAL NOT NULL,
            grassHeight REAL NOT NULL,
            TimeStamp TEXT NOT NULL
            )
            ''')
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_sensor_id ON medicoes (sensor_id)''')
 
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_timestamp ON medicoes (TimeStamp)''')
    for column_name, column_type in [
        ("crescimento_semanal", "REAL"),
        ("semanas_para_critico", "REAL"),
        ("data_prevista_critica", "TEXT"),
    ]:
        try:
            cursor.execute(
                f"ALTER TABLE medicoes ADD COLUMN {column_name} {column_type}"
            )
        except sqlite3.OperationalError:
            pass
   
    conexao.commit()
    conexao.close()
 
# ============================================================
# GET - OBTÉM TODOS OS DADOS
# ============================================================
 
@app.route("/dados", methods=["GET"])
def obter_dados():
    try:
        conexao = sqlite3.connect(DB_FILE)
        conexao.row_factory = sqlite3.Row
        cursor = conexao.cursor()
 
        cursor.execute('''
            SELECT
                sensor_id AS id,
                highWay,
                km,
                grassHeight,
                crescimento_semanal,
                semanas_para_critico,
                data_prevista_critica,
                TimeStamp
            FROM medicoes
            where id IN(select max(id) from medicoes group by sensor_id)
            ORDER BY sensor_id
        ''')
        dados = [dict(linha) for linha in cursor.fetchall()]
 
        conexao.close()
        return jsonify(dados)
   
    except Exception as erro:
        print("Erro ao ler banco:", erro)
        return jsonify({
            "erro": "Erro ao ler os dados"
        }), 500
 
# ============================================================
# POST - RECEBE DADOS DE UM SENSOR
# ============================================================
 
@app.route("/dados", methods=["POST"])
def receber_dado_api():
    try:
        novo_dado = request.get_json()
 
        if not novo_dado:
            return jsonify({
                "erro": "Nenhum dado recebido"
            }), 400
 
        campos_obrigatorios = ["id", "highWay", "km", "grassHeight"]
 
        for campo in campos_obrigatorios:
            if campo not in novo_dado:
                return jsonify({
                    "erro": f"Campo '{campo}' ausente"
                }), 400
 
        if salvar_dado(novo_dado):
            return jsonify({
                "mensagem": "Dado salvo com sucesso"
            }), 201
        else:
            return jsonify({
                "erro": "Erro ao salvar o dado"
            }), 500
    except Exception as erro:
        print("Erro ao receber dado", erro)
        return jsonify({
            "erro": "Erro ao processar os dados"
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
    global conexao_serial
 
    if not conectar_esp32():
        return
 
    while True:
        try:
 
            if conexao_serial is None or not conexao_serial.is_open:
                print("Conexão serial perdida.")
                break
 
            linha = (
                conexao_serial
                .readline()
                .decode("utf-8", errors="ignore")
                .strip()
            )
 
            if not linha:
                continue
 
            print("SERIAL RECEBIDO:", linha)
 
            # ==================================================
            # RESPOSTA DE VERIFICAÇÃO
            # ==================================================
 
            if linha.startswith("VERIFICADO:"):
 
                partes = linha.split(":")
 
                if len(partes) >= 3:
 
                    try:
                        id_sensor = int(partes[1])
                        altura = float(partes[2])
                        resultado = {
                            "sensor_id": id_sensor,
                            "altura": altura
                        }
 
                        print("================================")
                        print("RESPOSTA DE VERIFICAÇÃO")
                        print(resultado)
                        print("================================")
 
                        fila_verificacoes.put(resultado)
 
                    except ValueError:
                        print("Resposta de verificação inválida.")
 
                continue
 
            # ==================================================
            # DADOS NORMAIS DO SENSOR
            # ==================================================
 
            if not linha.isdigit():
                continue
 
            id_sensor = int(linha)
 
            highway = (
                conexao_serial
                .readline()
                .decode("utf-8", errors="ignore")
                .strip()
            )
 
            km = (
                conexao_serial
                .readline()
                .decode("utf-8", errors="ignore")
                .strip()
            )
 
            grass_height = (
                conexao_serial
                .readline()
                .decode("utf-8", errors="ignore")
                .strip()
            )
 
            if not highway or not km or not grass_height:
                continue
 
            try:
                km = float(km)
                grass_height = float(grass_height)
 
            except ValueError:
                print("Dados inválidos recebidos.")
                continue
 
            novo_dado = {
                "id": id_sensor,
                "highWay": highway,
                "km": km,
                "grassHeight": grass_height
            }
 
            salvar_dado(novo_dado)
 
        except KeyboardInterrupt:
 
            print("Encerrando conexão serial...")
            break
 
        except serial.SerialException as erro:
 
            print("Erro na comunicação serial:")
            print(erro)
 
            break
 
    if conexao_serial is not None and conexao_serial.is_open:
        conexao_serial.close()
 
    conexao_serial = None
 
    print("Conexão serial encerrada.")
 
 
# ============================================================
# FUNÇÃO CENTRAL PARA SALVAR DADOS
# ============================================================
 
def salvar_dado(novo_dado):
 
    try:
 
        novo_dado["TimeStamp"] = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S")
 
        conexao = sqlite3.connect(DB_FILE)
        cursor = conexao.cursor()
 
        cursor.execute('''
            INSERT INTO medicoes (
                sensor_id,
                highWay,
                km,
                grassHeight,
                TimeStamp
            ) VALUES (?, ?, ?, ?, ?)
        ''', (
            novo_dado["id"],
            novo_dado["highWay"],
            novo_dado["km"],
            novo_dado["grassHeight"],
            novo_dado["TimeStamp"]
        ))
        conexao.commit()
        conexao.close()
 
        executar_algoritmo()
 
        return True
    except Exception as erro:
 
        print("Erro ao salvar dado:", erro)
 
        return False
 
# ============================================================
# INICIAR VERIFICAÇÃO DE DADOS(ENVIAR COMANDOS AO ESP)
# ============================================================
 
def verificar(id_sensor, timeout=30):
    global conexao_serial
 
    if conexao_serial is None:
        print("ESP32 não conectado.")
        return None
 
    if not conexao_serial.is_open:
        print("Porta serial está fechada.")
        return None
 
    try:
 
        mensagem = f"VERIFICAR:{int(id_sensor)}\n"
 
        print()
        print("================================")
        print("ENVIANDO VERIFICAÇÃO")
        print("Sensor:", id_sensor)
        print("Mensagem:", repr(mensagem))
        print("Porta:", conexao_serial.port)
 
        with serial_lock:
 
            conexao_serial.write(
                mensagem.encode("utf-8")
            )
 
            conexao_serial.flush()
 
        print("Comando enviado com sucesso!")
        print("Aguardando resposta do ESP32...")
 
        # ==================================================
        # AGUARDA RESPOSTA
        # ==================================================
 
        tempo_inicio = datetime.now()
 
        while True:
 
            tempo_decorrido = (
                datetime.now() - tempo_inicio
            ).total_seconds()
 
            if tempo_decorrido >= timeout:
                print("Timeout aguardando verificação.")
                return None
 
            try:
 
                resultado = fila_verificacoes.get(
                    timeout=1
                )
 
                # Verifica se a resposta pertence ao sensor solicitado
                if resultado["sensor_id"] == int(id_sensor):
 
                    print("================================")
                    print("VERIFICAÇÃO RECEBIDA")
                    print(resultado)
                    print("================================")
 
                    return resultado
 
                # Se for de outro sensor, devolve para a fila
                fila_verificacoes.put(resultado)
 
            except queue.Empty:
                continue
 
    except serial.SerialException as erro:
 
        print("Erro ao enviar comando de verificação:")
        print(erro)
 
        return None
 
@app.route("/verificar", methods=["POST"])
def solicitar_verificacao():
 
    try:
 
        data = request.get_json()
 
        if not data or "id" not in data:
            return jsonify({
                "erro": "Campo 'id' ausente"
            }), 400
 
        id_sensor = int(data["id"])
 
        print("================================")
        print("SOLICITAÇÃO HTTP DE VERIFICAÇÃO")
        print("Sensor:", id_sensor)
        print("================================")
 
        resultado = verificar(id_sensor)
 
        if resultado is None:
 
            return jsonify({
                "erro": "O sensor não respondeu dentro do tempo limite.",
                "sensor_id": id_sensor
            }), 504
 
        return jsonify({
            "sensor_id": resultado["sensor_id"],
            "altura": resultado["altura"],
            "mensagem": "Nova medição realizada com sucesso."
        }), 200
 
    except ValueError:
 
        return jsonify({
            "erro": "O ID do sensor deve ser numérico"
        }), 400
 
    except Exception as erro:
 
        print("Erro ao solicitar verificação:", erro)
 
        return jsonify({
            "erro": str(erro)
        }), 500
 
   
# ============================================================
# INICIALIZAÇÃO
# ============================================================
 
if __name__ == "__main__":
 
    # ================================================
    # INICIA FLASK
    # ================================================
 
    inicializarBanco()
 
    print("================================")
    print("API iniciada")
    print(f"Porta: {API_PORT}")
    print("GET: /dados")
    print("POST: /dados")
    print("================================")
    print("Rotas dos sensores:")
    print("POST: /rota")
    print("================================")
 
    serial_thread = threading.Thread(
        target=receber_dados,
        daemon=True
    )
 
    serial_thread.start()
 
    app.run(
        host="0.0.0.0",
        port=API_PORT,
        debug=False,
        use_reloader=False
    )
 