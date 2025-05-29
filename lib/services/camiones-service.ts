import api from '../api-client'
import { Camion } from '../types'

export const camionesService = {
  // Obtener todos los camiones
  getAll: async (): Promise<Camion[]> => {
    const response = await api.get('/camiones')
    return response.data
  },

  // Obtener un camión por código
  getById: async (codigo: string): Promise<Camion> => {
    const response = await api.get(`/camiones/${codigo}`)
    return response.data
  },

  // Crear nuevo camión
  create: async (camion: Omit<Camion, 'codigo'>): Promise<Camion> => {
    const response = await api.post('/camiones', camion)
    return response.data
  },

  // Actualizar camión
  update: async (codigo: string, camion: Partial<Camion>): Promise<Camion> => {
    const response = await api.put(`/camiones/${codigo}`, camion)
    return response.data
  },

  // Eliminar camión
  delete: async (codigo: string): Promise<void> => {
    await api.delete(`/camiones/${codigo}`)
  }
}
