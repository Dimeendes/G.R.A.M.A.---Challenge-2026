import pandas as pd
from app.database.database import *

# ==========================
# 1. CARREGAR DADOS
# ==========================
def executar_algoritmo():
    import pandas as pd
    from app.database.database import buscar_medicoes, atualizar_previsao

    dados = buscar_medicoes()
    if not dados:
        return

    df = pd.DataFrame(dados)

    df = df.rename(columns={
        "sensor_id": "id",
        "timestamp": "data",
        "grassHeight": "altura_cm"})


    # Converter tipos
    df["data"] = pd.to_datetime(df["data"])
    df["altura_cm"] = pd.to_numeric(df["altura_cm"], errors="coerce")


    df = (
        df.sort_values(["id", "data"]).groupby("id").tail(5).reset_index(drop=True)
    )
    # ==========================
    # 2. REMOVER OUTLIERS (IQR)
    # ==========================

    Q1 = df["altura_cm"].quantile(0.25)
    Q3 = df["altura_cm"].quantile(0.75)

    IQR = Q3 - Q1

    limite_inferior = Q1 - 1.5 * IQR
    limite_superior = Q3 + 1.5 * IQR

    df_limpo = df[
        (df["altura_cm"] >= limite_inferior) &
        (df["altura_cm"] <= limite_superior)
    ]

    # ==========================
    # 3. CALCULAR CRESCIMENTO
    # ==========================

    # Altura média por id e data
    historico = (
        df_limpo
        .groupby(["id", "data"])["altura_cm"]
        .mean()
        .reset_index()
        .sort_values(["id", "data"])
    )

    # Diferença entre medições consecutivas
    historico["crescimento_semanal"] = (
        historico.groupby("id")["altura_cm"]
        .diff()
    )

    # Ignora reduções de altura (cortes de grama)
    historico = historico[
        historico["crescimento_semanal"] > 0
    ]

    # Média de crescimento por id
    media_crescimento = (
        historico.groupby("id")["crescimento_semanal"]
        .mean()
        .round(2)
    )

    # ==========================
    # 4. EXIBIR RESULTADOS
    # ==========================

    print("--- RESUMO DA LIMPEZA ---")
    print(f"Total de linhas originais: {len(df)}")
    print(f"Total de linhas após remover outliers: {len(df_limpo)}")
    print(f"Outliers removidos: {len(df) - len(df_limpo)}")

    print("\n--- MÉDIA DE CRESCIMENTO POR ID ---")
    for id, crescimento in media_crescimento.items():
        print(f"id {id}: {crescimento:.2f} cm por semana")

    # ==========================
    # 6. PREVISÃO DE CRESCIMENTO ATÉ O NÍVEL CRÍTICO
    # ==========================

    ALTURA_CRITICA = 30

    ultima_medicao = (
        df_limpo
        .sort_values("data")
        .groupby("id")
        .last()
    )

    previsao = []

    for id, dados in ultima_medicao.iterrows():

        altura_atual = dados["altura_cm"]

        if id in media_crescimento.index:

            crescimento = media_crescimento[id]

            if crescimento > 0:

                altura_faltante = ALTURA_CRITICA - altura_atual

                if altura_faltante > 0:

                    semanas = altura_faltante / crescimento

                    data_critica = (
                        dados["data"] +
                        pd.Timedelta(weeks=semanas)
                    )

                    previsao.append({
                        "id": id,
                        "altura_atual_cm": altura_atual,
                        "crescimento_semana_cm": crescimento,
                        "semanas_para_critico": semanas,
                        "data_prevista_critica": data_critica.strftime("%d/%m/%Y")
                    })

                else:

                    previsao.append({
                        "id": id,
                        "altura_atual_cm": altura_atual,
                        "crescimento_semana_cm": crescimento,
                        "semanas_para_critico": 0,
                        "data_prevista_critica": "Já está crítico"
                    })


    df_previsao = pd.DataFrame(previsao)
    for _, linha in df_previsao.iterrows():

        atualizar_previsao(
            sensor_id=int(linha["id"]),
            crescimento_semanal=float(linha["crescimento_semana_cm"]),
            data_prevista=linha["data_prevista_critica"]
        )

    print("\n🌱 MONITORAMENTO DA VEGETAÇÃO")
    print("-" * 50)

    for _, linha in df_previsao.iterrows():

        altura = linha["altura_atual_cm"]
        semanas = linha["semanas_para_critico"]

        # Classificação Motiva
        if altura < 10:
            status = "🟢 Normal"
        elif altura <= 30:
            status = "🟡 Atenção"
        else:
            status = "🔴 Crítico"


        print(
            f"""
    📍 Id: {linha['id']}
    🌿 Altura atual: {altura:.1f} cm
    🚦 Status: {status}
    📅 Data estimada para nível crítico: {linha['data_prevista_critica']}
    ⏳ Tempo restante: {semanas:.1f} semanas
    """
        )

    print("-" * 50)