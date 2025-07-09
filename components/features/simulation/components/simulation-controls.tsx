"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppStore } from "@/store/appStore" // Importar el store global
import { ControlsHeader, VehiclesList, OrdersList, LegendView } from "./controls"
import { modifySpeed } from "@/services/simulacion-service" // Importar función de cambio de velocidad

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
  const { startSimulation, pauseSimulation, stopSimulation, stepForward } = useAppStore()
  
  // Determinar si la simulación está en ejecución o pausada
  const isRunning = playbackStatus === 'running'
  const isPaused = playbackStatus === 'paused'

  // Manejar el cambio de velocidad
  const handleSpeedChange = async (speed: number) => {
    try {
      await modifySpeed({ delayMs: speed });
      console.log(`Velocidad cambiada a ${speed}ms`);
    } catch (error) {
      console.error("Error al cambiar la velocidad:", error);
    }
  };

  return (
    <Card className="h-lv py-0 gap-0">
      <ControlsHeader
        isRunning={isRunning}
        isPaused={isPaused}
        onPlay={startSimulation}
        onPause={pauseSimulation}
        onStop={stopSimulation}
        onStepForward={stepForward}
        onSpeedChange={handleSpeedChange}
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
