import sqlite3
from pathlib import Path

DB_FILE = Path(__file__).resolve().parents[2] / "data" / "dados.db"


def buscar_medicoes():
    conexao = sqlite3.connect(DB_FILE)
    conexao.row_factory = sqlite3.Row

    cursor = conexao.cursor()

    cursor.execute("""
        SELECT
            sensor_id,
            highWay,
            km,
            grassHeight,
            TimeStamp AS timestamp
        FROM medicoes
        ORDER BY sensor_id, TimeStamp
    """)

    dados = [dict(linha) for linha in cursor.fetchall()]

    conexao.close()

    return dados

def atualizar_previsao(sensor_id, crescimento_semanal, data_prevista):
    conexao = sqlite3.connect(DB_FILE)
    cursor = conexao.cursor()

    cursor.execute("""
        UPDATE medicoes
        SET crescimento_semanal = ?,
            data_prevista_critica = ?
        WHERE id = (
            SELECT MAX(id)
            FROM medicoes
            WHERE sensor_id = ?
        )
    """, (
        crescimento_semanal,
        data_prevista,
        sensor_id
    ))

    conexao.commit()
    conexao.close()