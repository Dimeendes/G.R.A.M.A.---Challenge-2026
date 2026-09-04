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
 
          // Guarda somente o dado mais recente de cada ID
          const latestSensors = {};
 
          data.forEach((sensor) => {
            const id = sensor.id;
 
            if (
              !latestSensors[id] ||
              new Date(sensor.TimeStamp) >
                new Date(latestSensors[id].TimeStamp)
            ) {
              latestSensors[id] = sensor;
            }
          });
 
          // Converte o objeto novamente para array
          const latestSensorsArray = Object.values(latestSensors);
 
          console.log(
            'Sensores mais recentes:',
            latestSensorsArray
          );
 
          setSensors(latestSensorsArray);
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