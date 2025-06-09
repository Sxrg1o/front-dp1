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


export interface CamionDTO {
  id: string
  x: number
  y: number
  estado: string
  volumenDisponible: number
  combustible: number
  ruta: number[]
  pedidosPendientes: string[]
}

export interface PedidoDTO {
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

export interface TanqueDTO {
  id: string
  nombre: string
  capacidadTotal: number
  capacidadActual: number
  posX: number
  posY: number
}

export interface BloqueoDTO {
  id: string
  descripcion: string
  inicio: number
  fin: number
  nodes: { x: number; y: number }[]
}

export interface SimulacionSnapshotDTO {
  tiempoActual: number
  camiones: CamionDTO[]
  pedidos: PedidoDTO[]
  tanques: TanqueDTO[]
  bloqueos: BloqueoDTO[]
}