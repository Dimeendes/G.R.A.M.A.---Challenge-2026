export const CRITICAL_HEIGHT = 25;
export const WARNING_HEIGHT = 18;

export const initialSensors = [
  { id: 1, highway: 'BR-101', km: 12.5, grassHeight: 8 },
  { id: 2, highway: 'BR-101', km: 28.0, grassHeight: 14 },
  { id: 3, highway: 'BR-101', km: 45.3, grassHeight: 27 },
  { id: 4, highway: 'BR-116', km: 5.2, grassHeight: 27 },
  { id: 5, highway: 'BR-116', km: 18.7, grassHeight: 31 },
  { id: 6, highway: 'BR-116', km: 32.1, grassHeight: 9 },
  { id: 7, highway: 'BR-116', km: 50.0, grassHeight: 22 },
  { id: 8, highway: 'SP-348', km: 10.0, grassHeight: 6 },
  { id: 9, highway: 'SP-348', km: 25.4, grassHeight: 29 },
  { id: 10, highway: 'SP-348', km: 40.8, grassHeight: 15 },
  { id: 11, highway: 'BR-381', km: 8.3, grassHeight: 19 },
  { id: 12, highway: 'BR-381', km: 22.6, grassHeight: 33 },
];

export function getHighwaysSummary(sensorList) {
  const highways = {};

  sensorList.forEach((sensor) => {
    if (!highways[sensor.highway]) {
      highways[sensor.highway] = {
        name: sensor.highway,
        sensors: [],
        kmMin: sensor.km,
        kmMax: sensor.km,
      };
    }

    const highway = highways[sensor.highway];
    highway.sensors.push(sensor);
    highway.kmMin = Math.min(highway.kmMin, sensor.km);
    highway.kmMax = Math.max(highway.kmMax, sensor.km);
  });

  return Object.values(highways).map((highway) => {
    const heights = highway.sensors.map((s) => s.grassHeight);
    const alerts = highway.sensors.filter((s) => s.grassHeight >= CRITICAL_HEIGHT).length;

    return {
      name: highway.name,
      totalSensors: highway.sensors.length,
      kmMin: highway.kmMin,
      kmMax: highway.kmMax,
      lengthKm: highway.kmMax - highway.kmMin,
      averageHeight: Math.round(heights.reduce((a, b) => a + b, 0) / heights.length),
      alerts,
    };
  });
}

export function getAlerts(sensorList) {
  return sensorList
    .filter((sensor) => sensor.grassHeight >= CRITICAL_HEIGHT)
    .map((sensor) => ({
      id: sensor.id,
      sensorId: sensor.id,
      highway: sensor.highway,
      km: sensor.km,
      grassHeight: sensor.grassHeight,
      message: `Grama muito alta detectada no sensor #${sensor.id}`,
    }));
}

export function getGrassHeightStatus(height) {
  if (height >= CRITICAL_HEIGHT) return { label: 'Crítico', color: '#EF4444' };
  if (height >= WARNING_HEIGHT) return { label: 'Atenção', color: '#F59E0B' };
  return { label: 'Normal', color: '#22C55E' };
}
