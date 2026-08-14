import { createContext, useContext, useEffect, useState } from 'react';
import { initialSensors } from '../data/sensorsData';
import { fetchEsp32Sensors } from '../services/esp32Service';

const SensorsContext = createContext();

export function SensorsProvider({ children }) {
  const [sensors, setSensors] = useState(initialSensors);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState('mock');

  useEffect(() => {
    let active = true;

    async function loadSensors() {
      setIsLoading(true);

      try {
        const esp32Sensors = await fetchEsp32Sensors();
        if (active) {
          setSensors(esp32Sensors);
          setSource('esp32');
        }
      } catch (error) {
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

    const intervalId = setInterval(() => {
      loadSensors();
    }, 10000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  function simulateCut(sensorId) {
    setSensors((prev) =>
      prev.map((sensor) =>
        sensor.id === sensorId ? { ...sensor, grassHeight: 0 } : sensor
      )
    );
  }

  return (
    <SensorsContext.Provider value={{ sensors, simulateCut, isLoading, source }}>
      {children}
    </SensorsContext.Provider>
  );
}

export function useSensors() {
  return useContext(SensorsContext);
}

export default SensorsProvider;
