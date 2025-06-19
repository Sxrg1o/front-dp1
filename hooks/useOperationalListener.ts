// hooks/useOperationalListener.ts
import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';

/**
 * Tipos para los eventos de operaciones (simulados por ahora)
 */
interface OperationEvent {
  type: 'truck_moved' | 'order_delivered' | 'breakdown' | 'blockage' | 'tank_refilled';
  entityId: string;
  data: any;
  timestamp: number;
}

/**
 * Hook para escuchar eventos de operaciones en tiempo real
 * 
 * Este hook es responsable de:
 * 1. Suscribirse al topic de operaciones (preparado para WebSockets)
 * 2. Procesar eventos recibidos y actualizar el estado de la UI
 * 3. Gestionar el ciclo de vida de la conexión
 */
export function useOperationalListener() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<OperationEvent | null>(null);
  
  // Obtener acciones del store
  const { 
    setSelectedEntity,
    updateOperationalFromSnapshot,
    setOperationalCamiones,
    setOperationalPedidos,
    setOperationalTanques,
    setOperationalBloqueos
  } = useAppStore();

  // Simulación de conexión al WebSocket
  useEffect(() => {
    // En el futuro, esto será una conexión WebSocket real
    console.log('Conectando al servidor de operaciones...');
    
    // Simular una conexión exitosa después de un momento
    const timer = setTimeout(() => {
      setIsConnected(true);
      console.log('Conectado al servidor de operaciones.');
    }, 1000);
    
    // Limpieza al desmontar
    return () => {
      clearTimeout(timer);
      // En el futuro, aquí cerraríamos la conexión WebSocket
      console.log('Desconectando del servidor de operaciones...');
    };
  }, []);

  // Procesamiento de eventos recibidos
  const processEvent = useCallback((event: OperationEvent) => {
    setLastEvent(event);
    
    // Según el tipo de evento, actualizar diferentes partes del estado
    switch (event.type) {
      case 'truck_moved':
        // Actualizar la posición de un camión específico
        // En el futuro, esto actualizará sólo el camión afectado sin recargar todo
        console.log(`Camión ${event.entityId} movido a nueva posición`);
        // Aquí llamaríamos a una API REST para obtener el estado actualizado
        // o actualizaríamos directamente desde el payload del evento
        break;
        
      case 'order_delivered':
        // Marcar un pedido como entregado
        console.log(`Pedido ${event.entityId} entregado`);
        // Actualizar estado de pedidos
        break;
        
      case 'breakdown':
        // Registrar una avería
        console.log(`Avería registrada en camión ${event.entityId}`);
        // Posiblemente mostrar una notificación o actualizar estado
        break;
        
      case 'blockage':
        // Registrar un bloqueo
        console.log(`Bloqueo registrado en ruta, ID: ${event.entityId}`);
        // Actualizar la visualización del mapa
        break;
        
      case 'tank_refilled':
        // Actualizar nivel de tanque
        console.log(`Tanque ${event.entityId} rellenado`);
        // Actualizar estado de tanques
        break;
        
      default:
        console.warn('Tipo de evento desconocido:', event);
    }
    
    // Opcionalmente, seleccionar la entidad afectada en la UI
    setSelectedEntity(event.entityId, getEntityTypeFromEventType(event.type));
  }, [setSelectedEntity]);

  /**
   * Función auxiliar para determinar el tipo de entidad basado en el tipo de evento
   */
  function getEntityTypeFromEventType(eventType: string): 'camion' | 'pedido' | 'tanque' | 'bloqueo' | null {
    switch (eventType) {
      case 'truck_moved':
      case 'breakdown':
        return 'camion';
      case 'order_delivered':
        return 'pedido';
      case 'blockage':
        return 'bloqueo';
      case 'tank_refilled':
        return 'tanque';
      default:
        return null;
    }
  }

  /**
   * Simular la recepción de un evento (para pruebas)
   * Esta función se eliminará cuando implementemos WebSockets reales
   */
  const simulateEvent = useCallback((type: OperationEvent['type'], entityId: string, data: any) => {
    if (!isConnected) return;
    
    const event: OperationEvent = {
      type,
      entityId,
      data,
      timestamp: Date.now()
    };
    
    processEvent(event);
  }, [isConnected, processEvent]);

  return {
    isConnected,
    lastEvent,
    simulateEvent
  };
}
