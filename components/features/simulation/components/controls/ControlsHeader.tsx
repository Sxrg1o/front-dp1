"use client"

import { Play, Pause, Square, SkipForward, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  onSpeedChange: (speed: number) => void
  currentSpeed?: number
}

export function ControlsHeader({
  isRunning,
  isPaused,
  onPlay,
  onPause,
  onStop, 
  onStepForward,  
  onAddBreakdown,
  onSpeedChange,
  currentSpeed = 300    
  onSpeedChange,
  currentSpeed = 300
}: ControlsHeaderProps) {

  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [selectedIncident, setSelectedIncident] = useState('')

  const [camiones, setCamiones] = useState<TruckDTO[]>([])
  
  const [speed, setSpeed] = useState<string>(currentSpeed.toString());

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


  const handleSpeedChange = (value: string) => {
    setSpeed(value);
    onSpeedChange(Number(value));
  };  

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
      
      <div className="flex items-center gap-2 mt-2">
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
        
        <div className="flex items-center gap-2">
          
          <Select 
            value={speed} 
            onValueChange={handleSpeedChange}
            disabled={!isRunning}
          >
            
            <SelectTrigger className="w-30 h-8 bg-white">
              <Gauge className="h-4 w-4 text-black" />
              <SelectValue placeholder="Velocidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="200">Rápido</SelectItem>
              <SelectItem value="300">Normal</SelectItem>
              <SelectItem value="500">Lento</SelectItem>
              <SelectItem value="700">Muy lento</SelectItem>
            </SelectContent>
          </Select>
        </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onAddBreakdown(selectedVehicle, selectedIncident)}
          //disabled={isRunning && !isPaused || !selectedVehicle || !selectedIncident}
          disabled={!selectedVehicle || !selectedIncident}
        >
          Agregar avería
        </Button>


        <Select
          value={selectedVehicle}
          onValueChange={setSelectedVehicle}
          //disabled={isRunning && !isPaused}
          disabled={false}
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
          //disabled={isRunning && !isPaused}
          disabled={false}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Incidente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="T1">T1</SelectItem>
            <SelectItem value="T2">T2</SelectItem>
            <SelectItem value="T3">T3</SelectItem>
          </SelectContent>
        </Select>

      </div>
    </CardHeader>
  );
}
