export interface PointDTO {
  x: number
  y: number
}

export interface TruckDTO {
  id: string
  x: number
  y: number
  disponible: number
  combustibleDisponible: number
  status: string
  consumoAcumulado: number
  ruta: PointDTO[]
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

// Interfaz para los datos de rutas asignadas a camiones
export interface RutaDTO {
  camionId: string
  nodosRuta: { x: number; y: number }[]
  pedidosIds: number[]
  tiempoEstimado: number
}

export interface SimulacionSnapshotDTO {
  tiempoActual: number
  camiones: TruckDTO[]
  pedidos: PedidoDTO[]
  tanques: TanqueDTO[]
  bloqueos: BloqueoDTO[]
}

export interface SimulationRequest {
  nombreSimulacion: string;
  fechaInicio: string;
  duracionDias: number;
  esColapso: boolean;
}

export interface SimulationStatusDTO {
  simulationId: string;
  nombreSimulacion: string;
  estado: 'INITIALIZED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'; 
  avance: number;
}

// Added from user prompt
export interface SimulationConfig {
  escenario: 'semanal' | 'colapso' | 'operational';
  fechaInicio: string;
  fechaFinal?: string;
}

export interface SpeedRequest {
  delayMs: number;
}