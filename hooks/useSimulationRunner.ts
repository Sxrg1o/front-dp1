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
import { TanqueDTO, TruckDTO, PedidoDTO, RutaDTO } from '@/types/types';

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
    setSimulationId,
    // Acciones específicas para actualizaciones parciales
    setSimulationTanques,
    setSimulationCamiones,
    setSimulationPedidos
  } = useAppStore();
  
  // Asegurarnos de que el ID de simulación esté configurado en el store
  useEffect(() => {
    setSimulationId(simulationId);
  }, [simulationId, setSimulationId]);

  // Funciones auxiliares para actualizar entidades específicas
  const updateTanque = useCallback((tanqueDTO: TanqueDTO) => {
    const updatedTanques = simulationData.tanques.map(tanque => 
      tanque.id === tanqueDTO.id ? tanqueDTO : tanque
    );
    setSimulationTanques(updatedTanques);
  }, [simulationData.tanques, setSimulationTanques]);

  const updateCamion = useCallback((camionDTO: TruckDTO) => {
    const updatedCamiones = simulationData.camiones.map(camion => 
      camion.id === camionDTO.id ? camionDTO : camion
    );
    setSimulationCamiones(updatedCamiones);
  }, [simulationData.camiones, setSimulationCamiones]);

  const updatePedido = useCallback((pedidoDTO: PedidoDTO) => {
    const updatedPedidos = simulationData.pedidos.map(pedido => 
      pedido.id === pedidoDTO.id ? pedidoDTO : pedido
    );
    setSimulationPedidos(updatedPedidos);
  }, [simulationData.pedidos, setSimulationPedidos]);

  const updateRuta = useCallback((rutaDTO: RutaDTO) => {
    // Aquí se actualizaría la ruta específica del camión
    // Por ahora, podemos hacer una actualización genérica del camión
    console.log("Ruta actualizada para camión:", rutaDTO.camionId);
    
    // En un futuro, aquí se podría implementar una lógica más compleja
    // para manejar las rutas y su visualización
  }, []);

  // Callback para procesar eventos de WebSocket
  const handleSimulationEvent: SimulationEventCallback = useCallback((data, eventType) => {
    console.log(`Evento recibido: ${eventType}`, data);
    
    switch (eventType) {
      case SimulationEventType.SIMULATION_STARTED:
        setPlaybackStatus('running');
        break;
      
      case SimulationEventType.TANK_LEVEL_UPDATED:
        // Actualizar tanque específico
        if (data) {
          updateTanque(data as TanqueDTO);
        }
        break;
      
      case SimulationEventType.TRUCK_STATE_UPDATED:
        // Actualizar camión específico
        if (data) {
          updateCamion(data as TruckDTO);
        }
        break;
      
      case SimulationEventType.ORDER_STATE_UPDATED:
        // Actualizar pedido específico
        if (data) {
          updatePedido(data as PedidoDTO);
        }
        break;
      
      case SimulationEventType.SIMULATION_COLLAPSED:
        // Manejar colapso de simulación
        setPlaybackStatus('idle');
        setError("La simulación ha colapsado. Hay pedidos que no se han atendido a tiempo.");
        if (data) {
          // Actualizar el pedido que causó el colapso
          updatePedido(data as PedidoDTO);
        }
        break;
      
      case SimulationEventType.ROUTE_ASSIGNED:
        // Actualizar ruta de camión
        if (data) {
          updateRuta(data as RutaDTO);
        }
        break;
      
      default:
        console.warn(`Tipo de evento no manejado: ${eventType}`);
    }
  }, [setPlaybackStatus, setError, updateTanque, updateCamion, updatePedido, updateRuta]);

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
