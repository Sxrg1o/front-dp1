import { SimulacionSnapshotDTO } from '../types/types'
import api from '../lib/api-client'

export async function avanzarUnMinuto(): Promise<SimulacionSnapshotDTO> {
    try {
        const response = await api.post('/simulacion/step')
        return response.data
    } catch (error) {
        throw new Error("Error al avanzar un minuto de simulación")
    }
}

export async function resetSimulacion(): Promise<void> {
    try {
        await api.post('/simulacion/reset')
    } catch (error) {
        throw new Error("Error al resetear la simulación")
    }
}

export async function obtenerSnapshot(): Promise<SimulacionSnapshotDTO> {
    try {
        const response = await api.get('/simulacion/snapshot')
        return response.data
    } catch (error) {
        throw new Error("Error al obtener el snapshot de simulación")
    }
}

// Función para avanzar múltiples minutos de una vez
export async function avanzarMultiplesMinutos(minutos: number): Promise<SimulacionSnapshotDTO> {
    let ultimoSnapshot: SimulacionSnapshotDTO | null = null;
    
    for (let i = 0; i < minutos; i++) {
        ultimoSnapshot = await avanzarUnMinuto();
    }
    
    return ultimoSnapshot as SimulacionSnapshotDTO;
}
