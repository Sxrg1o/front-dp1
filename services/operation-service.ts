import { SimulacionSnapshotDTO } from "@/types/types";
import api from '../lib/api-client';

export async function getSnapshotOperational(): Promise<SimulacionSnapshotDTO> {
    try {
        const response = await api.get('/operaciones/snapshot'); 
        return response.data;
    } catch (error) {
        console.error("Error al obtener el snapshot operacional:", error);
        throw error; 
    }
}