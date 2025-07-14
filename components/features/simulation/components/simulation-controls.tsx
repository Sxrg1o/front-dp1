"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ControlsHeader, VehiclesList, OrdersList, LegendView, BreakdownsList , TanksList} from "./controls"
import { useAppStore } from "@/store/appStore"
import { modifySpeed } from "@/services/simulacion-service"

export function SimulationControls() {
  const mode = useAppStore((state) => state.mode);
  
  const playbackStatus = useAppStore((state) => 
    mode === 'simulation' 
      ? state.simulation.playbackStatus 
      : state.operational.playbackStatus
  )

  const { startSimulation, pauseSimulation, stopSimulation, stepForward , addBreakdown } = useAppStore()

  const isRunning = playbackStatus === 'running'
  const isPaused = playbackStatus === 'paused'

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
      {mode === 'simulation' && (
        <ControlsHeader
          isRunning={isRunning}
          isPaused={isPaused}
          onPlay={startSimulation}
          onPause={pauseSimulation}
          onStop={stopSimulation}
          onStepForward={stepForward}
          onSpeedChange={handleSpeedChange}
          onAddBreakdown={(codigoVehiculo, tipoIncidente) => 
            addBreakdown({
              codigoVehiculo,
              tipoIncidente
            })          
          }
        />
      )}
      

      <CardContent className="p-0">
        <Tabs defaultValue="leyenda" className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-none">
            <TabsTrigger value="vehiculos" className="text-sm">
              VEHÍCULOS
            </TabsTrigger>
            <TabsTrigger value="tanques" className="text-sm">
              TANQUES
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="text-sm">
              PEDIDOS
            </TabsTrigger>
            
            <TabsTrigger value="leyenda" className="text-sm">
              LEYENDA
            </TabsTrigger>
          </TabsList>

          <LegendView />
          <BreakdownsList />
          <VehiclesList />
          <OrdersList />
          <TanksList />
        </Tabs>
      </CardContent>
    </Card>
  )
}