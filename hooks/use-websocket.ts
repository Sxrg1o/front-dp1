import { useState, useEffect, useCallback } from 'react'
import { webSocketService, VehiclePosition, TankStatus } from '@/lib/websocket'

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [vehicles, setVehicles] = useState<VehiclePosition[]>([])
  const [tanks, setTanks] = useState<TankStatus[]>([])
  const [simulationStatus, setSimulationStatus] = useState<'stopped' | 'running' | 'paused'>('stopped')

  useEffect(() => {
    const connect = async () => {
      try {
        await webSocketService.connect()
        setIsConnected(true)
      } catch (error) {
        console.error('Error conectando WebSocket:', error)
        setIsConnected(false)
      }
    }

    connect()

    return () => {
      webSocketService.disconnect()
      setIsConnected(false)
    }
  }, [])

  useEffect(() => {
    if (!isConnected) return

    const handleVehiclePositionUpdate = (vehicle: VehiclePosition) => {
      setVehicles(prev => {
        const index = prev.findIndex(v => v.codigo === vehicle.codigo)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = vehicle
          return updated
        }
        return [...prev, vehicle]
      })
    }

    const handleTankStatusUpdate = (tank: TankStatus) => {
      setTanks(prev => {
        const index = prev.findIndex(t => t.id === tank.id)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = tank
          return updated
        }
        return [...prev, tank]
      })
    }

    const handleVehicleStatusChange = (vehicle: VehiclePosition) => {
      setVehicles(prev => 
        prev.map(v => v.codigo === vehicle.codigo ? { ...v, ...vehicle } : v)
      )
    }

    webSocketService.onVehiclePositionUpdate(handleVehiclePositionUpdate)
    webSocketService.onVehicleStatusChange(handleVehicleStatusChange)
    webSocketService.onTankStatusUpdate(handleTankStatusUpdate)

    return () => {
      webSocketService.removeListener('vehicle_position_update', handleVehiclePositionUpdate)
      webSocketService.removeListener('vehicle_status_change', handleVehicleStatusChange)
      webSocketService.removeListener('tank_status_update', handleTankStatusUpdate)
    }
  }, [isConnected])

  const startSimulation = useCallback(() => {
    webSocketService.startSimulation()
    setSimulationStatus('running')
  }, [])

  const stopSimulation = useCallback(() => {
    webSocketService.stopSimulation()
    setSimulationStatus('stopped')
  }, [])

  const pauseSimulation = useCallback(() => {
    webSocketService.pauseSimulation()
    setSimulationStatus('paused')
  }, [])

  const resetSimulation = useCallback(() => {
    webSocketService.resetSimulation()
    setSimulationStatus('stopped')
    setVehicles([])
    setTanks([])
  }, [])

  const setSimulationSpeed = useCallback((speed: number) => {
    webSocketService.setSimulationSpeed(speed)
  }, [])

  const causeBreakdown = useCallback((vehicleCode: string, breakdownType: string) => {
    webSocketService.causeBreakdown(vehicleCode, breakdownType)
  }, [])

  return {
    isConnected,
    vehicles,
    tanks,
    simulationStatus,
    startSimulation,
    stopSimulation,
    pauseSimulation,
    resetSimulation,
    setSimulationSpeed,
    causeBreakdown,
  }
}
