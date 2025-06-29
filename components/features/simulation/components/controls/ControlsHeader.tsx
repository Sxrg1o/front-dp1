"use client"

import { Play, Pause, Square, SkipForward, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { camionesService } from '@/services/camiones-service'
import { TruckDTO } from "@/types/types"


interface ControlsHeaderProps {
  isRunning: boolean
  isPaused: boolean
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onStepForward: () => void
  onAddBreakdown: (codigoVehiculo: string, tipoIncidente: string) => void
}

export function ControlsHeader({
  isRunning,
  isPaused,
  onPlay,
  onPause,
  onStop,
  onStepForward,  
  onAddBreakdown  
}: ControlsHeaderProps) {

  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [selectedIncident, setSelectedIncident] = useState('')

  const [camiones, setCamiones] = useState<TruckDTO[]>([])
  
  useEffect(() => {
    const loadCamiones = async () => {
      try {
        const camiones = await camionesService.getAll()
        setCamiones(camiones)
      } catch (error) {
        console.error('Error al cargar camiones:', error)
      }
    }
    loadCamiones()
  }, [])

  return (
    <CardHeader className="bg-blue-100 rounded-t-lg py-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">Controles simulación</CardTitle>
        <div className="flex items-center gap-2">
          {!isRunning && (
            <Badge variant="secondary">Detenida</Badge>
          )}
          {isRunning && !isPaused && (
            <Badge variant="default">Ejecutando</Badge>
          )}
          {isRunning && isPaused && (
            <Badge variant="outline">Pausada</Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onStop}
          title="Reiniciar simulación"
          disabled={!isRunning}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={isRunning && !isPaused ? onPause : onPlay}
          title={isRunning && !isPaused ? "Pausar simulación" : "Iniciar/Reanudar simulación"}
        >
          {isRunning && !isPaused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onStop}
          title="Detener simulación"
          disabled={!isRunning}
        >
          <Square className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <Button 
          size="sm" 
          variant="outline" 
          title="Avanzar un paso" 
          onClick={onStepForward}
          disabled={isRunning && !isPaused}
        >
          <SkipForward className="h-4 w-4" />
        </Button>

      </div>



      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onAddBreakdown(selectedVehicle, selectedIncident)}
          disabled={isRunning && !isPaused || !selectedVehicle || !selectedIncident}
        >
          Agregar avería
        </Button>


        <Select
          value={selectedVehicle}
          onValueChange={setSelectedVehicle}
          disabled={isRunning && !isPaused}
        >
          
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Vehículo" />
          </SelectTrigger>
        <SelectContent>
            {camiones.map((camion) => (
              <SelectItem key={camion.id} value={camion.id}>
                {camion.id}
              </SelectItem>
            ))}
        </SelectContent>
        </Select>

        <Select
          value={selectedIncident}
          onValueChange={setSelectedIncident}
          disabled={isRunning && !isPaused}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="TipoIncidente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="T1">T1</SelectItem>
            <SelectItem value="T2">T2</SelectItem>
            <SelectItem value="T3">T3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/*<div className="mt-4 p-3 bg-white rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-sm">Ingresar</span>
            <Select defaultValue="pedido">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pedido">Pedido</SelectItem>
                <SelectItem value="vehiculo">Vehículo</SelectItem>
                <SelectItem value="averia">Avería</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div> */}
    </CardHeader>
  )
}
