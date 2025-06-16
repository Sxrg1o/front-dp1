"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  PedidoDTO, 
  TruckDTO
} from "@/types/types"
import { ControlsHeader, VehiclesList, OrdersList, LegendView } from "./controls"

interface SimulationControlsProps {
  pedidos: PedidoDTO[]
  camiones: TruckDTO[]
  isRunning: boolean
  isPaused: boolean
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onStepForward: () => void;
}

export function SimulationControls({ 
  pedidos, 
  camiones, 
  isRunning, 
  isPaused,
  onPlay,
  onPause,
  onStop,
  onStepForward
}: SimulationControlsProps) {

  return (
    <Card className="h-lv py-0 gap-0">
      <ControlsHeader
        isRunning={isRunning}
        isPaused={isPaused}
        onPlay={onPlay}
        onPause={onPause}
        onStop={onStop}
        onStepForward={onStepForward}
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
          <VehiclesList camiones={camiones} />
          <OrdersList pedidos={pedidos} />
        </Tabs>
      </CardContent>
    </Card>
  )
}
