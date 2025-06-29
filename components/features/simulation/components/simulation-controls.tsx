"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppStore } from "@/store/appStore" // Importar el store global
import { ControlsHeader, VehiclesList, OrdersList, LegendView } from "./controls"

export function SimulationControls() {
  // Obtener el modo actual
  const mode = useAppStore((state) => state.mode);
  
  // Obtener estado según el modo
  const playbackStatus = useAppStore((state) => 
    mode === 'simulation' 
      ? state.simulation.playbackStatus 
      : state.operational.playbackStatus
  )
  
  // Obtener acciones del store global
  const { startSimulation, pauseSimulation, stopSimulation, stepForward , addBreakdown } = useAppStore()
  
  // Determinar si la simulación está en ejecución o pausada
  const isRunning = playbackStatus === 'running'
  const isPaused = playbackStatus === 'paused'

  return (
    <Card className="h-lv py-0 gap-0">
      <ControlsHeader
        isRunning={isRunning}
        isPaused={isPaused}
        onPlay={startSimulation}
        onPause={pauseSimulation}
        onStop={stopSimulation}
        onStepForward={stepForward}
        onAddBreakdown={(codigoVehiculo, tipoIncidente) => 
          addBreakdown({
            codigoVehiculo,
            tipoIncidente
          })
        }
      />

      <CardContent className="p-0">
        <Tabs defaultValue="leyenda" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none">
            <TabsTrigger value="vehiculos" className="text-sm">
              VEHÍCULOS
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="text-sm">
              PEDIDOS
            </TabsTrigger>
            <TabsTrigger value="leyenda" className="text-sm">
              LEYENDA
            </TabsTrigger>
          </TabsList>

          <LegendView />
          <VehiclesList />
          <OrdersList />
        </Tabs>
      </CardContent>
    </Card>
  )
}
