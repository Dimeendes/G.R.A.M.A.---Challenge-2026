const DEFAULT_API_URL =
  process.env.EXPO_PUBLIC_ESP32_URL ||
  'http://10.0.2.2:5000';
  //'http://10.123.33.196:5000';

const DEFAULT_TIMEOUT_MS = 10000;

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeSensorRecord(rawSensor, fallbackId = 1) {
  if (!rawSensor || typeof rawSensor !== 'object') {
    return {
      id: fallbackId,
      highway: 'ESP32',
      km: 0,
      grassHeight: 0,
    };
  }

  return {
    id: rawSensor.id ?? rawSensor.sensorId ?? fallbackId,

    highway:
      rawSensor.highway ??
      rawSensor.highWay ??
      rawSensor.road ??
      'ESP32',

    km: normalizeNumber(
      rawSensor.km ??
      rawSensor.positionKm ??
      rawSensor.kmMarker,
      0
    ),

    grassHeight: normalizeNumber(
      rawSensor.grassHeight ??
      rawSensor.heightCm ??
      rawSensor.height ??
      rawSensor.value,
      0
    ),
  };
}

export function normalizeEsp32Payload(payload) {
  if (Array.isArray(payload)) {
    return payload.map((sensor, index) =>
      normalizeSensorRecord(sensor, index + 1)
    );
  }

  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.sensors)) {
      return payload.sensors.map((sensor, index) =>
        normalizeSensorRecord(sensor, index + 1)
      );
    }

    if (payload.sensor) {
      return [
        normalizeSensorRecord(payload.sensor, 1),
      ];
    }

    return [
      normalizeSensorRecord(payload, 1),
    ];
  }

  throw new Error(
    'Formato de dados do ESP32 inválido'
  );
}

async function fetchJsonWithTimeout(
  url,
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Falha na requisição: ${response.status}`
      );
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchEsp32Sensors(
  baseUrl = DEFAULT_API_URL
) {
  const normalizedBaseUrl = String(baseUrl).replace(
    /\/$/,
    ''
  );

  const url = `${normalizedBaseUrl}/dados`;

  console.log(
    'Consultando API:',
    url
  );

  try {
    const payload =
      await fetchJsonWithTimeout(url);

    console.log(
      'Dados recebidos:',
      payload
    );

    return normalizeEsp32Payload(payload);
  } catch (error) {
    console.error(
      'Erro ao consultar API:',
      error
    );

    throw error;
  }
}