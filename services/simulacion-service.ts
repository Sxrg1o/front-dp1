import { SimulacionSnapshotDTO, SimulationStatusDTO, SimulationRequest } from '../types/types';
import api from '../lib/api-client';
import { AveriaDTO } from '../types/types'


export async function iniciarNuevaSimulacion(request: SimulationRequest): Promise<SimulationStatusDTO> {
    try {
        const response = await api.post('/simulacion/start', request);
        return response.data;
    } catch (error) {
        throw new Error("Error al iniciar la simulación");
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


export async function addAveriaSimulacion(simulationId: string,averia: AveriaDTO): Promise<AveriaDTO> {
    try {
        const response = await api.post(`/simulacion/${simulationId}/averia`);
        return response.data;
    } catch (error) {
        throw new Error("Error al agregar averia a la simulación")
    }
}
