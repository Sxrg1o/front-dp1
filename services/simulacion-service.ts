import { SimulacionSnapshotDTO, SimulationStatusDTO, SimulationRequest, TanqueDTO, TruckDTO, PedidoDTO } from '../types/types';
import api from '../lib/api-client';
import { Client } from '@stomp/stompjs';

let stompClient: Client | null = null;
let activeSubscriptions: any[] = [];

// Interfaz para el callback de eventos de simulación
export type SimulationEventCallback = (data: any, eventType: SimulationEventType) => void;

// Tipos de eventos WebSocket
export enum SimulationEventType {
    SIMULATION_STARTED = 'SIMULATION_STARTED',
    TANK_LEVEL_UPDATED = 'TANK_LEVEL_UPDATED',
    TRUCK_STATE_UPDATED = 'TRUCK_STATE_UPDATED',
    ORDER_STATE_UPDATED = 'ORDER_STATE_UPDATED',
    SIMULATION_COLLAPSED = 'SIMULATION_COLLAPSED',
    ROUTE_ASSIGNED = 'ROUTE_ASSIGNED',
    ORDER_CREATED = 'ORDER_CREATED',
    TRUCK_POSITION_UPDATED = 'TRUCK_POSITION_UPDATED',
    BLOCKAGE_STARTED = 'BLOCKAGE_STARTED',
    BLOCKAGE_ENDED = 'BLOCKAGE_ENDED',
}

export async function iniciarNuevaSimulacion(request: SimulationRequest): Promise<SimulationStatusDTO> {
    try {
        const response = await api.post('/simulacion/start', request);
        return response.data;
    } catch (error) {
        throw new Error("Error al iniciar la simulación");
    }
}

export async function ejecutarSimulacion(simulationId: string): Promise<void> {
    try {
        // Primero obtenemos el snapshot inicial
        await obtenerSnapshot(simulationId);
        
        // Luego llamamos al endpoint run para iniciar la ejecución en el backend
        await api.post(`/simulacion/${simulationId}/run`);
    } catch (error) {
        throw new Error("Error al ejecutar la simulación");
    }
}

export async function avanzarUnMinuto(simulationId: string): Promise<SimulacionSnapshotDTO> {
    try {
        const response = await api.post(`/simulacion/${simulationId}/step`);
        return response.data;
    } catch (error) {
        throw new Error("Error al avanzar un minuto de simulación")
    }
}

export async function resetSimulacion(simulationId: string): Promise<void> {
    try {
        await api.post(`/simulacion/${simulationId}/reset`)
    } catch (error) {
        throw new Error("Error al resetear la simulación")
    }
}

export async function obtenerSnapshot(simulationId: string): Promise<SimulacionSnapshotDTO> {
    try {
        const response = await api.get(`/simulacion/${simulationId}/snapshot`)
        return response.data
    } catch (error) {
        throw new Error("Error al obtener el snapshot de simulación")
    }
}

export async function avanzarMultiplesMinutos(simulationId: string, pasos: number): Promise<SimulacionSnapshotDTO> {
    let ultimoSnapshot: SimulacionSnapshotDTO | null = null;
    for (let i = 0; i < pasos; i++) {
        ultimoSnapshot = await avanzarUnMinuto(simulationId);
    }
    return ultimoSnapshot as SimulacionSnapshotDTO;
}

// Función para conectar al WebSocket
export function connectWebSocket(simulationId: string, callback: SimulationEventCallback): void {
    if (stompClient) {
        disconnectWebSocket();
    }

    stompClient = new Client({
        brokerURL: `http://localhost:8080/ws-connect`,
        debug: function (str) {
            console.log('STOMP: ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
    });

    stompClient.onConnect = () => {
        console.log('Conectado a WebSocket');
        
        // Suscribirse a los diferentes eventos de la simulación
        const subscription = stompClient!.subscribe(`/topic/simulation/${simulationId}`, (message) => {
            try {
                const eventDTO = JSON.parse(message.body);
                const eventType = eventDTO.type as SimulationEventType;
                const payload = eventDTO.payload;
                
                // Llamar al callback con los datos y tipo de evento
                callback(payload, eventType);
            } catch (error) {
                console.error('Error al procesar mensaje WebSocket:', error);
            }
        });
        
        activeSubscriptions.push(subscription);
    };

    stompClient.onStompError = (frame) => {
        console.error('Error de conexión STOMP:', frame.headers['message']);
        console.error('Detalles adicionales:', frame.body);
    };

    stompClient.activate();
}

// Función para desconectar del WebSocket
export function disconnectWebSocket(): void {
    if (stompClient && stompClient.connected) {
        // Desuscribir de todos los tópicos
        activeSubscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
        activeSubscriptions = [];

        // Desconectar cliente
        stompClient.deactivate();
        console.log('Desconectado de WebSocket');
    }
    
    stompClient = null;
}

// Función para pausar la simulación
export async function pausarSimulacion(simulationId: string): Promise<void> {
    try {
        await api.post(`/simulacion/${simulationId}/pause`);
    } catch (error) {
        throw new Error("Error al pausar la simulación");
    }
}

// Función para reanudar una simulación pausada
export async function reanudarSimulacion(simulationId: string): Promise<void> {
    try {
        await api.post(`/simulacion/${simulationId}/resume`);
    } catch (error) {
        throw new Error("Error al reanudar la simulación");
    }
}
