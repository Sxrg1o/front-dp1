// hooks/useSimulationRunner.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { 
  obtenerSnapshot, 
  ejecutarSimulacion, 
  pausarSimulacion, 
  reanudarSimulacion,
  connectWebSocket,
  disconnectWebSocket,
  SimulationEventType,
  SimulationEventCallback
} from '@/services/simulacion-service';
import { TanqueDTO, TruckDTO, PedidoDTO, RutaDTO, BloqueoDTO } from '@/types/types';

/**
 * Hook para gestionar el ciclo de vida de la simulación
 * 
 * Este hook es responsable de:
 * 1. Cargar el estado inicial de la simulación
 * 2. Conectar a WebSockets para recibir actualizaciones en tiempo real
 * 3. Gestionar las acciones de control de la simulación (play, pause, stop)
 * 4. Procesar los diferentes tipos de eventos recibidos por WebSocket
 */
export function useSimulationRunner(simulationId: string) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Velocidad de la simulación (ya no se utiliza directamente en el front)
  // Se mantiene por compatibilidad con la interfaz anterior
  const [simulationSpeed, setSimulationSpeed] = useState(500);
  
  // Obtener estado y acciones del store global
  const {
    simulation,
    simulationData,
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

  // Callback para procesar eventos de WebSocket
  const handleSimulationEvent: SimulationEventCallback = useCallback((data, eventType) => {
    console.log(`Evento recibido: ${eventType}`, data);
    
    switch (eventType) {
      case SimulationEventType.SIMULATION_STARTED:
        setPlaybackStatus('running');
        break;
      
      case SimulationEventType.SNAPSHOT:
        if(data) {
          updateSimulationFromSnapshot(data);
        }
        break;
      
      case SimulationEventType.SIMULATION_COLLAPSED:
        // Manejar colapso de simulación
        setPlaybackStatus('idle');
        setError("La simulación ha colapsado. Hay pedidos que no se han atendido a tiempo.");
 
        default:
        console.warn(`Tipo de evento no manejado: ${eventType}`);
    }
  }, [setPlaybackStatus, setError, updateSimulationFromSnapshot]);

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
      // Desconectar WebSockets si estamos conectados
      if (isConnected) {
        disconnectWebSocket();
        setIsConnected(false);
      }
    };
  }, [simulationId, isInitialized, isConnected, loadInitialSnapshot]);

  // Efecto para gestionar la conexión de WebSockets según el playbackStatus
  useEffect(() => {
    // Si no hay simulación activa, no hacer nada
    if (!simulationId || !isInitialized) {
      return;
    }

    if (simulation.playbackStatus === 'running' && !isConnected) {
      // Conectar WebSockets cuando la simulación está en ejecución
      connectWebSocket(simulationId, handleSimulationEvent);
      setIsConnected(true);
    } else if (simulation.playbackStatus !== 'running' && simulation.playbackStatus !== 'paused' && isConnected) {
      // Desconectar WebSockets cuando la simulación no está en ejecución ni pausada
      disconnectWebSocket();
      setIsConnected(false);
    }
    
    // Limpieza al cambiar estado o desmontar
    return () => {
      if (simulation.playbackStatus === 'idle' && isConnected) {
        disconnectWebSocket();
        setIsConnected(false);
      }
    };
  }, [
    simulationId,
    isInitialized,
    isConnected,
    simulation.playbackStatus,
    handleSimulationEvent
  ]);

  // Función para cambiar la velocidad de la simulación
  // Se mantiene por compatibilidad con la interfaz anterior
  const changeSimulationSpeed = useCallback((speed: number) => {
    setSimulationSpeed(speed);
  }, []);

  // Devolver funciones y estado relevante
  return {
    isInitialized,
    isConnected,
    simulationSpeed,
    changeSimulationSpeed,
    loadInitialSnapshot
  };
}