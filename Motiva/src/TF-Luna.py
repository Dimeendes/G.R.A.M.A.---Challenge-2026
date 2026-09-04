import serial
from serial.tools import list_ports
import json
from pathlib import Path
from flask import Flask, jsonify, request
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


# ============================================================
# GET - OBTÉM TODOS OS DADOS
# ============================================================

@app.route("/dados", methods=["GET"])
def obter_dados():

    try:

        if not DATA_FILE.exists():
            return jsonify([])

        with open(
            DATA_FILE,
            "r",
            encoding="utf-8"
        ) as arquivo:

            dados = json.load(arquivo)

        return jsonify(dados)

    except Exception as erro:

        print("Erro ao ler JSON:", erro)

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

        # ================================================
        # VALIDA OS CAMPOS
        # ================================================

        campos_obrigatorios = [
            "id",
            "highWay",
            "km",
            "grassHeight"
        ]

        for campo in campos_obrigatorios:

            if campo not in novo_dado:

                return jsonify({
                    "erro": f"Campo '{campo}' não encontrado"
                }), 400

        # ================================================
        # ADICIONA TIMESTAMP
        # ================================================

        novo_dado["TimeStamp"] = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        # ================================================
        # GARANTE QUE A PASTA EXISTE
        # ================================================

        DATA_FILE.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        # ================================================
        # CARREGA HISTÓRICO
        # ================================================

        if DATA_FILE.exists():

            try:

                with open(
                    DATA_FILE,
                    "r",
                    encoding="utf-8"
                ) as arquivo:

                    dados = json.load(arquivo)

                if not isinstance(dados, list):
                    dados = []

            except json.JSONDecodeError:

                dados = []

        else:

            dados = []

        # ================================================
        # ADICIONA NOVO DADO
        # ================================================

        dados.append(novo_dado)

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

        print("Novo dado recebido pela API:")
        print(novo_dado)

        return jsonify({
            "status": "ok",
            "mensagem": "Dado recebido com sucesso",
            "dado": novo_dado
        }), 201

    except Exception as erro:

        print("Erro ao receber dado:", erro)

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

        # Adiciona timestamp
        novo_dado["TimeStamp"] = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        DATA_FILE.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        # Carrega histórico
        if DATA_FILE.exists():

            try:

                with open(
                    DATA_FILE,
                    "r",
                    encoding="utf-8"
                ) as arquivo:

                    dados = json.load(arquivo)

                if not isinstance(dados, list):
                    dados = []

            except json.JSONDecodeError:

                dados = []

        else:

            dados = []

        # Adiciona
        dados.append(novo_dado)

        # Salva
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

        print("Novo dado salvo:")
        print(novo_dado)
        print()

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

    if __name__ == "__main__":
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