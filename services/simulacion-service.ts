import { SimulacionSnapshotDTO, SimulationStatusDTO, SimulationRequest, SpeedRequest } from '../types/types';
import api from '../lib/api-client';
import { Client } from '@stomp/stompjs';

let stompClient: Client | null = null;
let activeSubscriptions: any[] = [];

// Interfaz para el callback de eventos de simulación
export type SimulationEventCallback = (data: any, eventType: SimulationEventType) => void;

// Tipos de eventos WebSocket
export enum SimulationEventType {
    SIMULATION_STARTED = 'SIMULATION_STARTED',
    SIMULATION_COLLAPSED = 'SIMULATION_COLLAPSED',
    SNAPSHOT = 'SNAPSHOT',
    SIMULATION_COMPLETED = 'SIMULATION_COMPLETED'
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
    console.log('Iniciando desconexión del WebSocket, esperando 5 segundos...');
    
    setTimeout(() => {
        if (stompClient && stompClient.connected) {
            activeSubscriptions.forEach(subscription => {
                subscription.unsubscribe();
            });
            activeSubscriptions = [];

            stompClient.deactivate();
            console.log('Desconectado de WebSocket después de 5 segundos');
        }
        
        stompClient = null;
    }, 2000);
}

// Función para pausar la simulación
export async function pausarSimulacion(): Promise<void> {
    try {
        await api.post(`/simulacion/pause`);
    } catch (error) {
        throw new Error("Error al pausar la simulación");
    }
}

// Función para reanudar una simulación pausada
export async function reanudarSimulacion(): Promise<void> {
    try {
        await api.post(`/simulacion/resume`);
    } catch (error) {
        throw new Error("Error al reanudar la simulación");
    }
}

export async function modifySpeed(speedRequest: SpeedRequest): Promise<void> {
    try {
        await api.post(`/simulacion/speed`, speedRequest);
    } catch (error) {
        throw new Error("Error al modificar la velocidad de la simulación");
    }
}

export async function detenerSimulacion(simulationId: string): Promise<void> {
    try {
        await api.post(`/simulacion/${simulationId}/stop`);
    } catch (error) {
        throw new Error("Error al detener la simulación");
    }
}

export async function haySimulacionActiva(): Promise<string> {
    try {
        const response = await api.get('/simulacion/active');
        return response.data;
    } catch (error) {
        console.error("Error al verificar simulación activa:", error);
        return "false"; 
    }
}