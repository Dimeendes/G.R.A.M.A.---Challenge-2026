export const CRITICAL_HEIGHT = 30;
export const WARNING_HEIGHT = 10;

export function getHighwaysSummary(sensorList = []) {
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
    const heights = highway.sensors.map(
      (sensor) => sensor.grassHeight
    );

    const alerts = highway.sensors.filter(
      (sensor) => sensor.grassHeight >= CRITICAL_HEIGHT
    ).length;

    return {
      name: highway.name,
      totalSensors: highway.sensors.length,
      kmMin: highway.kmMin,
      kmMax: highway.kmMax,
      lengthKm: highway.kmMax - highway.kmMin,
      averageHeight: Math.round(
        heights.reduce((a, b) => a + b, 0) / heights.length
      ),
      alerts,
    };
  });
}

export function getAlerts(sensorList) {
  return sensorList
    .filter(
      (sensor) => sensor.grassHeight >= CRITICAL_HEIGHT
    )
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
  if (height >= CRITICAL_HEIGHT) {
    return {
      label: "Crítico",
      color: "#EF4444",
    };
  }

  if (height >= WARNING_HEIGHT) {
    return {
      label: "Atenção",
      color: "#F59E0B",
    };
  }

  return {
    label: "Normal",
    color: "#22C55E",
  };
}