export interface Camion {
  codigo: string
  tipo: string
  capacidadM3: number
  pesoTotalTon: number
  estado?: 'Operativo' | 'Mantenimiento' | 'Averiado' | 'En ruta'
  fuelLevel?: 'Alto' | 'Medio' | 'Bajo'
  pendingOrders?: string
}

export interface Pedido {
  fechaHoraCreacion: string
  idCliente: string
  posX: number
  posY: number
  volumenM3: number
  horasLimite: number
}

export interface FileUploadRequest {
  archivo: File
  tipo: 'PEDIDOS' | 'CAMIONES'
}

export interface FileUploadResponse {
  success: boolean
  message: string
  data?: any
}
