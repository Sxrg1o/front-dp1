// hooks/useSimulationRunner.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { avanzarUnMinuto, obtenerSnapshot } from '@/services/simulacion-service';

/**
 * Hook para gestionar el ciclo de vida de la simulación
 * 
 * Este hook es responsable de:
 * 1. Cargar el estado inicial de la simulación
 * 2. Mantener un intervalo para avanzar la simulación según el playbackStatus
 * 3. Gestionar las acciones de control de la simulación (play, pause, stop, step)
 * 4. Preparar para la futura integración con WebSockets
 */
export function useSimulationRunner(simulationId: string) {
  const [isInitialized, setIsInitialized] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Velocidad de la simulación en ms entre pasos
  const [simulationSpeed, setSimulationSpeed] = useState(1000); // 1 segundo por defecto
  
  // Obtener estado y acciones del store global
  const {
    simulation,
    updateSimulationFromSnapshot,
    setLoading,
    setError,
    setPlaybackStatus,
    initializeSimulation,
    setSimulationId
  } = useAppStore();
  
  // Asegurarnos de que el ID de simulación esté configurado en el store
  useEffect(() => {
    setSimulationId(simulationId);
  }, [simulationId, setSimulationId]);

  // Función para cargar el snapshot inicial
  const loadInitialSnapshot = useCallback(async () => {
    if (!simulationId) return;
    
    try {
      setLoading(true);
      await initializeSimulation(simulationId);
      setIsInitialized(true);
    } catch (error) {
      console.error("Error al cargar el snapshot inicial:", error);
      setError("No se pudo cargar el estado inicial de la simulación");
    } finally {
      setLoading(false);
    }
  }, [simulationId, initializeSimulation, setLoading, setError]);

  // Efecto para cargar el snapshot inicial al montar el componente
  useEffect(() => {
    if (simulationId && !isInitialized) {
      loadInitialSnapshot();
    }
    
    // Limpieza al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [simulationId, isInitialized, loadInitialSnapshot]);

  // Efecto para gestionar el intervalo según el playbackStatus
  useEffect(() => {
    // Limpiar intervalo existente si hay uno
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Si no está en ejecución o no hay ID de simulación, no hacer nada más
    if (simulation.playbackStatus !== 'running' || !simulationId) {
      return;
    }

    // Crear nuevo intervalo
    intervalRef.current = setInterval(async () => {
      try {
        // Actualmente usando REST API, en el futuro aquí consumiremos eventos WebSocket
        const snapshot = await avanzarUnMinuto(simulationId);
        updateSimulationFromSnapshot(snapshot);
      } catch (error) {
        console.error("Error en paso de simulación:", error);
        
        // Detener la simulación en caso de error
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        setPlaybackStatus('idle');
        setError("Error durante la ejecución de la simulación");
      }
    }, simulationSpeed);

    // Limpieza cuando cambie el estado de ejecución
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    simulationId,
    simulation.playbackStatus,
    simulationSpeed,
    setPlaybackStatus,
    setError,
    updateSimulationFromSnapshot
  ]);

  // Función para cambiar la velocidad de la simulación
  const changeSimulationSpeed = useCallback((speed: number) => {
    setSimulationSpeed(speed);
  }, []);

  // Devolver funciones y estado relevante
  return {
    isInitialized,
    simulationSpeed,
    changeSimulationSpeed,
    loadInitialSnapshot
  };
}
