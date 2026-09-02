import requests

Sensores = {
    'ID02': {
        'ID': 2,
        'Highway': 'BR-101',
        'KM': 28.0,
        'GrassHeight': 14
    },
    'ID03': {
        'ID': 3,
        'Highway': 'BR-101',
        'KM': 45.3,
        'GrassHeight': 27
    },
    'ID04': {
        'ID': 4,
        'Highway': 'BR-116',
        'KM': 5.2,
        'GrassHeight': 27
    },
    'ID05': {
        'ID': 5,
        'Highway': 'BR-116',
        'KM': 18.7,
        'GrassHeight': 31
    },
    'ID06': {
        'ID': 6,
        'Highway': 'BR-116',
        'KM': 32.1,
        'GrassHeight': 9
    },
    'ID07': {
        'ID': 7,
        'Highway': 'BR-116',
        'KM': 50.0,
        'GrassHeight': 22
    },
    'ID08': {
        'ID': 8,
        'Highway': 'SP-348',
        'KM': 10.0,
        'GrassHeight': 6
    },
    'ID09': {
        'ID': 9,
        'Highway': 'SP-348',
        'KM': 25.4,
        'GrassHeight': 29
    },
    'ID10': {
        'ID': 10,
        'Highway': 'SP-348',
        'KM': 40.8,
        'GrassHeight': 15
    },
    'ID11': {
        'ID': 11,
        'Highway': 'BR-381',
        'KM': 8.3,
        'GrassHeight': 19
    },
    'ID12': {
        'ID': 12,
        'Highway': 'BR-381',
        'KM': 22.6,
        'GrassHeight': 33
    }
}

url = "http://127.0.0.1:5000/dados"

for sensor in Sensores.values():

    response = requests.post(
        url,
        json=sensor
    )

    print(response.json())
