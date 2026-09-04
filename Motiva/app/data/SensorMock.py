import requests
import time

Sensores = {
    'ID02': {
        'id': 2,
        'highWay': 'BR-101',
        'km': 28.0,
        'grassHeight': 14
    },
    'ID03': {
        'id': 3,
        'highWay': 'BR-101',
        'km': 45.3,
        'grassHeight': 27
    },
    'ID04': {
        'id': 4,
        'highWay': 'BR-116',
        'km': 5.2,
        'grassHeight': 27
    },
    'ID05': {
        'id': 5,
        'highWay': 'BR-116',
        'km': 18.7,
        'grassHeight': 31
    },
    'ID06': {
        'id': 6,
        'highWay': 'BR-116',
        'km': 32.1,
        'grassHeight': 9
    },
    'ID07': {
        'id': 7,
        'highWay': 'BR-116',
        'km': 50.0,
        'grassHeight': 22
    },
    'ID08': {
        'id': 8,
        'highWay': 'SP-348',
        'km': 10.0,
        'grassHeight': 6
    },
    'ID09': {
        'id': 9,
        'highWay': 'SP-348',
        'km': 25.4,
        'grassHeight': 29
    },
    'ID10': {
        'id': 10,
        'highWay': 'SP-348',
        'km': 40.8,
        'grassHeight': 15
    },
    'ID11': {
        'id': 11,
        'highWay': 'BR-381',
        'km': 8.3,
        'grassHeight': 19
    },
    'ID12': {
        'id': 12,
        'highWay': 'BR-381',
        'km': 22.6,
        'grassHeight': 33
    }
}

url = "http://127.0.0.1:5000/dados"

while True:
    for sensor in Sensores.values():

        if sensor['grassHeight'] >= 30:
            sensor['grassHeight'] = 9
        else:
            sensor['grassHeight'] += 1

        print(f"Enviando dados do sensor {sensor['id']} para o servidor...")
        print(f"Altura da grama: {sensor['grassHeight']}")

        try:
            response = requests.post(
                url,
                json=sensor,
                timeout=10
            )
            response.raise_for_status()

            try:
                print(response.json())
            except requests.exceptions.JSONDecodeError:
                print(
                    "Resposta da API não é JSON: "
                    f"HTTP {response.status_code}, "
                    f"Content-Type {response.headers.get('Content-Type')}, "
                    f"corpo: {response.text!r}"
                )
        except requests.exceptions.RequestException as erro:
            print(f"Erro ao enviar sensor {sensor['id']}: {erro}")
    time.sleep(30)
