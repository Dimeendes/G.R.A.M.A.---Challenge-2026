import { createContext, useContext, useEffect, useState } from 'react';
import { fetchEsp32Sensors } from '../../services/esp32Service';

const SensorsContext = createContext();

const initialSensors = [
    { id: 2, highway: "BR-101", km: 28.0, grassHeight: 14 },
    { id: 3, highway: "BR-101", km: 45.3, grassHeight: 27 },
    { id: 4, highway: "BR-116", km: 5.2, grassHeight: 27 },
    { id: 5, highway: "BR-116", km: 18.7, grassHeight: 31 },
    { id: 6, highway: "BR-116", km: 32.1, grassHeight: 9 },
    { id: 7, highway: "BR-116", km: 50.0, grassHeight: 22 },
    { id: 8, highway: "SP-348", km: 10.0, grassHeight: 6 },
    { id: 9, highway: "SP-348", km: 25.4, grassHeight: 29 },
    { id: 10, highway: "SP-348", km: 40.8, grassHeight: 15 },
    { id: 11, highway: "BR-381", km: 8.3, grassHeight: 19 },
    { id: 12, highway: "BR-381", km: 22.6, grassHeight: 33 },
  ];

export function SensorsProvider({ children }) {
  const [sensors, setSensors] = useState(initialSensors);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState('mock');

  useEffect(() => {
    let active = true;

    async function loadSensors() {
      try {
        setIsLoading(true);

        const esp32Sensors = await fetchEsp32Sensors();

        console.log('Sensores ESP32:', esp32Sensors);
        console.log('Mocks:', initialSensors);

        if (active && Array.isArray(esp32Sensors)) {
          const allSensors = [
            ...esp32Sensors,
            ...initialSensors,
          ];

          console.log('Todos os sensores:', allSensors);
          console.log('Total:', allSensors.length);

          setSensors(allSensors);
          setSource('esp32');
        }
      } catch (error) {
        console.error('Erro ao carregar sensores:', error);

        if (active) {
          setSensors(initialSensors);
          setSource('mock');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadSensors();

    const intervalId = setInterval(loadSensors, 5000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  function simulateCut(sensorId) {
    setSensors((prev) =>
      prev.map((sensor) =>
        sensor.id === sensorId
          ? { ...sensor, grassHeight: 0 }
          : sensor
      )
    );
  }

  return (
    <SensorsContext.Provider
      value={{
        sensors,
        simulateCut,
        isLoading,
        source,
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