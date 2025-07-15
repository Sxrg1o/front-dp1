import api from '../lib/api-client'
import { Pedido, FileUploadResponse } from '../types/types'

export const pedidosService = {
  // Obtener todos los pedidos
  getAll: async (): Promise<Pedido[]> => {
    const response = await api.get('/pedidos')
    return response.data
  },

  // Crear nuevo pedido operacional
  create: async (pedido: {
    idCliente: string;
    x: number;
    y: number;
    volumen: number;
    tiempoLimite: string; // ISO string format for LocalDateTime
  }): Promise<Pedido> => {
    const response = await api.post('/pedidos', pedido)
    return response.data
  },

  // Actualizar pedido
  update: async (idCliente: string, pedido: Partial<Pedido>): Promise<Pedido> => {
    const response = await api.put(`/pedidos/${idCliente}`, pedido)
    return response.data
  },

  // Subir archivo de pedidos usando el nuevo endpoint
  uploadFile: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData()
    formData.append('archivo', file)
    formData.append('tipo', 'PEDIDOS')
    
    const response = await api.post('/archivos/subir', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}
