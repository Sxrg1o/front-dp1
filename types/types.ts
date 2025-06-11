export interface TruckDTO {
  id: string
  x: number
  y: number
  disponible: number
  combustibleDisponible: number
  status: string
  consumoAcumulado: number
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
  capacidadDisponible: number
  posX: number
  posY: number
}

export interface BloqueoDTO {
  id: string
  description: string
  tiempoInicio: number
  tiempoFin: number
  nodes: { x: number; y: number }[]
}

export interface SimulacionSnapshotDTO {
  tiempoActual: number
  camiones: CamionDTO[]
  pedidos: PedidoDTO[]
  tanques: TanqueDTO[]
  bloqueos: BloqueoDTO[]
}