import api from '../lib/api-client'
import { TruckDTO } from '../types/types'

export const camionesService = {
  // Obtener todos los camiones
  getAll: async (): Promise<TruckDTO[]> => {
    const response = await api.get('/camiones')
    return response.data
  },

  // Obtener un camión por código
  getById: async (codigo: string): Promise<TruckDTO> => {
    const response = await api.get(`/camiones/${codigo}`)
    return response.data
  },

  // Crear nuevo camión
  create: async (camion: Omit<TruckDTO, 'codigo'>): Promise<TruckDTO> => {
    const response = await api.post('/camiones', camion)
    return response.data
  },

  // Actualizar camión
  update: async (codigo: string, camion: Partial<TruckDTO>): Promise<TruckDTO> => {
    const response = await api.put(`/camiones/${codigo}`, camion)
    return response.data
  },

  // Eliminar camión
  delete: async (codigo: string): Promise<void> => {
    await api.delete(`/camiones/${codigo}`)
  }
}
