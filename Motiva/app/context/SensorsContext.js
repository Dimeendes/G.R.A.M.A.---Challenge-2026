import { createContext, useContext, useEffect, useState } from 'react';
import { fetchEsp32Sensors } from '../../services/esp32Service';

const SensorsContext = createContext();

export function SensorsProvider({ children }) {
  const [sensors, setSensors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState('api');

  useEffect(() => {
    let active = true;

    async function loadSensors() {
      try {
        setIsLoading(true);

        const data = await fetchEsp32Sensors();

        console.log('Sensores recebidos da API:', data);

        if (active && Array.isArray(data)) {
          setSensors(data);
          setSource('api');
        }

      } catch (error) {
        console.error('Erro ao carregar sensores:', error);

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

  return (
    <SensorsContext.Provider
      value={{
        sensors,
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