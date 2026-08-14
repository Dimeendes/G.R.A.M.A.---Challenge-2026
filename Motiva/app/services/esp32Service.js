const DEFAULT_ESP32_URL = process.env.EXPO_PUBLIC_ESP32_URL || 'http://192.168.4.1';
const DEFAULT_TIMEOUT_MS = 4000;

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

  const distanceCm = normalizeNumber(
    rawSensor.distanceCm ?? rawSensor.distance_cm ?? rawSensor.distance ?? rawSensor.distanceMm / 10 ?? rawSensor.value,
    0
  );
  const rawHeight = rawSensor.grassHeight ?? rawSensor.heightCm ?? rawSensor.height ?? rawSensor.value;

  const grassHeight = rawHeight !== undefined
    ? normalizeNumber(rawHeight, 0)
    : Math.max(0, 60 - distanceCm);

  return {
    id: rawSensor.id ?? rawSensor.sensorId ?? fallbackId,
    highway: rawSensor.highway ?? rawSensor.road ?? 'ESP32',
    km: normalizeNumber(rawSensor.km ?? rawSensor.positionKm ?? rawSensor.kmMarker, 0),
    grassHeight,
  };
}

export function normalizeEsp32Payload(payload) {
  if (Array.isArray(payload)) {
    return payload.map((sensor, index) => normalizeSensorRecord(sensor, index + 1));
  }

  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.sensors)) {
      return payload.sensors.map((sensor, index) => normalizeSensorRecord(sensor, index + 1));
    }

    if (payload.sensor) {
      return [normalizeSensorRecord(payload.sensor, 1)];
    }

    if (payload.id || payload.highway || payload.km !== undefined || payload.grassHeight !== undefined || payload.distanceCm !== undefined) {
      return [normalizeSensorRecord(payload, 1)];
    }
  }

  throw new Error('Formato de dados do ESP32 inválido');
}

async function fetchJsonWithTimeout(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Falha na requisição: ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchEsp32Sensors(baseUrl = DEFAULT_ESP32_URL) {
  const normalizedBaseUrl = String(baseUrl).replace(/\/$/, '');
  const candidateUrls = [
    `${normalizedBaseUrl}/sensor`,
    `${normalizedBaseUrl}/api/sensors`,
    `${normalizedBaseUrl}/sensors`,
    `${normalizedBaseUrl}/status`,
  ];

  let lastError = null;

  for (const url of candidateUrls) {
    try {
      const payload = await fetchJsonWithTimeout(url);
      return normalizeEsp32Payload(payload);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error(`Não foi possível conectar ao ESP32 em ${normalizedBaseUrl}`);
}
