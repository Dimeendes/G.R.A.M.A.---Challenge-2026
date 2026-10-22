import { createContext, useContext, useEffect, useState } from 'react';
import mockSensors from '../data/sensorsMock';
import { fetchEsp32Sensors } from '../services/esp32Service';
 
const SensorsContext = createContext();
const CRITICAL_HEIGHT = 30;
const SIMULATION_INTERVAL_MS = 5000;
const MIN_WEEKLY_GROWTH = 2;
const MAX_WEEKLY_GROWTH = 5;

function addForecast(sensor, weeklyGrowth) {
  if (sensor.grassHeight >= CRITICAL_HEIGHT) {
    return {
      ...sensor,
      weeklyGrowth,
      weeksToCritical: 0,
      criticalDate: 'Já está crítico',
    };
  }

  const weeksToCritical =
    (CRITICAL_HEIGHT - sensor.grassHeight) / weeklyGrowth;
  const criticalDate = new Date(
    Date.now() + weeksToCritical * 7 * 24 * 60 * 60 * 1000,
  ).toLocaleDateString('pt-BR');

  return {
    ...sensor,
    weeklyGrowth,
    weeksToCritical,
    criticalDate,
  };
}

function withSensorForecast(sensor) {
  if (sensor.grassHeight >= CRITICAL_HEIGHT) {
    return addForecast(sensor, sensor.weeklyGrowth || 3.5);
  }

  if (
    sensor.weeklyGrowth > 0 &&
    sensor.weeksToCritical > 0 &&
    sensor.criticalDate !== 'Não disponível'
  ) {
    return sensor;
  }

  return addForecast(sensor, sensor.weeklyGrowth || 3.5);
}

function simulateMockSensors(currentSensors, weeklyGrowth) {
  return currentSensors.map((sensor) => {
    const grassHeight =
      sensor.grassHeight >= CRITICAL_HEIGHT
        ? 9
        : sensor.grassHeight + weeklyGrowth;

    return addForecast({ ...sensor, grassHeight }, weeklyGrowth);
  });
}
 
export function SensorsProvider({ children }) {
  const [sensors, setSensors] = useState(() =>
    mockSensors.map((sensor) => addForecast(sensor, 3.5)),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState('mock');

  useEffect(() => {
    let active = true;

    async function loadSensors() {
      try {
        const apiSensors = await fetchEsp32Sensors();
        const realSensor = apiSensors.find(
          (sensor) => Number(sensor.id) === 1,
        );

        if (realSensor) {
          if (active) {
            setSensors([withSensorForecast(realSensor)]);
            setSource('api');
            setIsLoading(false);
          }
          return;
        }

        console.warn(
          'Sensor real #1 não encontrado na API. Exibindo os 11 sensores mockados localmente.',
        );
      } catch (error) {
        console.error(
          'Não foi possível carregar o sensor real pela API. Usando sensores mockados localmente:',
          error,
        );
      }

      if (active) {
        setSensors((currentSensors) => {
          if (source === 'mock' && currentSensors.length === mockSensors.length) {
            const weeklyGrowth =
              Math.floor(
                Math.random() *
                  (MAX_WEEKLY_GROWTH - MIN_WEEKLY_GROWTH + 1),
              ) + MIN_WEEKLY_GROWTH;
            return simulateMockSensors(currentSensors, weeklyGrowth);
          }

          return mockSensors.map((sensor) => addForecast(sensor, 3.5));
        });
        setSource('mock');
        setIsLoading(false);
      }
    }

    loadSensors();
    const intervalId = setInterval(loadSensors, SIMULATION_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [source]);

  function atualizarSensor(id, grassHeight) {
    setSensors((sensoresAtuais) =>
      sensoresAtuais.map((sensor) =>
        String(sensor.id) === String(id)
          ? withSensorForecast({ ...sensor, grassHeight })
          : sensor,
      ),
    );
  }
 
  return (
<SensorsContext.Provider
      value={{
        sensors,
        isLoading,
        source,
        atualizarSensor,
      }}
>
      {children}
</SensorsContext.Provider>
  );
}
 
export function useSensors() {
  return useContext(SensorsContext);
}
 
export default SensorsProvider;