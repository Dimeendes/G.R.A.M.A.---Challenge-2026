import serial
from serial.tools import list_ports
from pathlib import Path
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
from datetime import datetime
import sqlite3
<<<<<<< HEAD

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from services.algoritmo import executar_algoritmo
=======
>>>>>>> ea0358c13f88c25e5fbe7f44d745e37281cc3efe


# ============================================================
# CONFIGURAÇÕES
# ============================================================

BAUD_RATE = 115200
API_PORT = 5000

BASE_DIR = Path(__file__).resolve().parent.parent
DB_FILE = BASE_DIR / "data" / "dados.db"

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
<<<<<<< HEAD
        CREATE INDEX IF NOT EXISTS idx_sensor_id ON medicoes (sensor_id)''')
=======
        CREATE INDEX IF NOT EXISTS idx_sensor_id ON medicoes (sensor_id''')
>>>>>>> ea0358c13f88c25e5fbe7f44d745e37281cc3efe

    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_timestamp ON medicoes (TimeStamp)''')
    try: 
        cursor.execute("""
        ALTER TABLE medicoes ADD COLUMN crescimento_semanal REAL
        """)

        cursor.execute("""
        ALTER TABLE medicoes ADD COLUMN data_prevista_critica TEXT
        """)
    except sqlite3.OperationalError:
        pass
    
    conexao.commit()
    conexao.close()

# ============================================================
# FLASK
# ============================================================

app = Flask(__name__)
CORS(app)


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
            SELECT sensor_id AS id, highWay, km, grassHeight, TimeStamp
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

            # Ignora mensagens de boot/debug
            if not id_sensor.isdigit():
                continue

            # ================================================
            # LÊ HIGHWAY
            # ================================================

            highway = (
                conexao
                .readline()
                .decode("utf-8", errors="ignore")
                .strip()
            )

            # ================================================
            # LÊ KM
            # ================================================

            km = (
                conexao
                .readline()
                .decode("utf-8", errors="ignore")
                .strip()
            )

            # ================================================
            # LÊ ALTURA
            # ================================================

            grass_height = (
                conexao
                .readline()
                .decode("utf-8", errors="ignore")
                .strip()
            )

            # ================================================
            # VALIDA
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
            # CRIA OBJETO
            # ================================================

            novo_dado = {

                "id": id_sensor,

                "highWay": highway,

                "km": km,

                "grassHeight": grass_height

            }

            # ================================================
            # ENVIA PARA A MESMA LÓGICA DA API
            # ================================================

            salvar_dado(novo_dado)

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
<<<<<<< HEAD

        executar_algoritmo()
=======
>>>>>>> ea0358c13f88c25e5fbe7f44d745e37281cc3efe

        return True
    except Exception as erro:

        print("Erro ao salvar dado:", erro)

        return False

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