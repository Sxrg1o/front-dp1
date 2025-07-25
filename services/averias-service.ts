import api from '../lib/api-client'
import { AveriaDTO } from '../types/types'

export const averiasService = {
  createBr: async (averia: AveriaDTO): Promise<AveriaDTO> => {
    const response = await api.post(`/averias`,averia)
    return response.data
  }
}


