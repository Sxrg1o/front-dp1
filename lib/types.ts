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
  id: number
  idCliente: string
  x: number
  y: number
  volumen: number
  tiempoCreacion: number
  tiempoLimite: number
  atendido: boolean
  descartado: boolean
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
