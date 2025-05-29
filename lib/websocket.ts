import { io, Socket } from 'socket.io-client'

export interface VehiclePosition {
  codigo: string
  x: number
  y: number
  estado: 'Operativo' | 'En ruta' | 'Cargando' | 'Mantenimiento'
  fuelLevel: number
  pendingOrders: number
}

export interface SimulationEvent {
  type: 'vehicle_move' | 'vehicle_status_change' | 'new_order' | 'order_completed' | 'breakdown'
  data: any
  timestamp: number
}

export interface TankStatus {
  id: string
  name: string
  glpLevel: number
  status: 'Operativo' | 'Alerta' | 'Emergencia'
}

class WebSocketService {
  private socket: Socket | null = null
  private isConnected = false

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io('ws://localhost:8080', {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })

        this.socket.on('connect', () => {
          console.log('WebSocket conectado')
          this.isConnected = true
          resolve()
        })

        this.socket.on('disconnect', () => {
          console.log('WebSocket desconectado')
          this.isConnected = false
        })

        this.socket.on('connect_error', (error) => {
          console.error('Error de conexión WebSocket:', error)
          reject(error)
        })

        this.socket.on('simulation_event', (event: SimulationEvent) => {
          console.log('Evento de simulación recibido:', event)
          this.handleSimulationEvent(event)
        })

      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true
  }

  onVehiclePositionUpdate(callback: (vehicle: VehiclePosition) => void): void {
    this.socket?.on('vehicle_position_update', callback)
  }

  onVehicleStatusChange(callback: (vehicle: VehiclePosition) => void): void {
    this.socket?.on('vehicle_status_change', callback)
  }

  onTankStatusUpdate(callback: (tank: TankStatus) => void): void {
    this.socket?.on('tank_status_update', callback)
  }

  onOrderUpdate(callback: (order: any) => void): void {
    this.socket?.on('order_update', callback)
  }

  onBreakdownEvent(callback: (breakdown: any) => void): void {
    this.socket?.on('breakdown_event', callback)
  }

  startSimulation(): void {
    this.socket?.emit('start_simulation')
  }

  stopSimulation(): void {
    this.socket?.emit('stop_simulation')
  }

  pauseSimulation(): void {
    this.socket?.emit('pause_simulation')
  }

  resetSimulation(): void {
    this.socket?.emit('reset_simulation')
  }

  setSimulationSpeed(speed: number): void {
    this.socket?.emit('set_simulation_speed', { speed })
  }

  causeBreakdown(vehicleCode: string, breakdownType: string): void {
    this.socket?.emit('cause_breakdown', { vehicleCode, breakdownType })
  }

  addOrder(order: any): void {
    this.socket?.emit('add_order', order)
  }

  addVehicle(vehicle: any): void {
    this.socket?.emit('add_vehicle', vehicle)
  }

  private handleSimulationEvent(event: SimulationEvent): void {
    switch (event.type) {
      case 'vehicle_move':
        break
      case 'vehicle_status_change':
        break
      case 'new_order':
        break
      case 'order_completed':
        break
      case 'breakdown':
        break
      default:
        console.log('Evento de simulación no reconocido:', event.type)
    }
  }

  removeListener(event: string, callback?: (...args: any[]) => void): void {
    if (callback) {
      this.socket?.off(event, callback)
    } else {
      this.socket?.off(event)
    }
  }
}

export const webSocketService = new WebSocketService()

export default webSocketService
