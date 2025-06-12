"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { avanzarUnMinuto } from "@/services/simulacion-service"
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
}

export function SimulationControls({ 
  pedidos, 
  camiones, 
  isRunning, 
  isPaused,
  onPlay,
  onPause,
  onStop
}: SimulationControlsProps) {

  const handleStep = async () => {
    try {
      const nuevoEstado = await avanzarUnMinuto()
      console.log("⏩ Nuevo estado:", nuevoEstado)
    } catch (error) {
      console.error("Error al avanzar un minuto:", error)
    }
  }

  return (
    <Card className="h-lv py-0 gap-0">
      <ControlsHeader
        isRunning={isRunning}
        isPaused={isPaused}
        onPlay={onPlay}
        onPause={onPause}
        onStop={onStop}
        onStep={handleStep}
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
