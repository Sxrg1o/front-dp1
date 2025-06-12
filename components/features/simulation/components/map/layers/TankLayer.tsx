import { Fuel } from "lucide-react"
import type { TanqueDTO } from "@/types/types"

interface TankLayerProps {
  tanques: TanqueDTO[]
  GRID_SIZE: number
  onTankClick: (tank: TanqueDTO) => void
}

export function TankLayer({ tanques, GRID_SIZE, onTankClick }: TankLayerProps) {
  return (
    <>
      {tanques.map((station: TanqueDTO, index: number) => (
        <div
          key={`tank-${station.nombre || 'unnamed'}-${station.posX}-${station.posY}-${index}`}
          className="absolute cursor-pointer hover:scale-110 transition-transform z-20 flex items-center justify-center pointer-events-auto"
          style={{
            top: `${station.posY * GRID_SIZE + 1}px`,
            left: `${station.posX * GRID_SIZE + 1}px`,
            width: `${GRID_SIZE}px`,
            height: `${GRID_SIZE}px`,
          }}
          onClick={(e) => {
            e.stopPropagation()
            onTankClick(station)
          }}
          title={station.nombre}
        >
          <Fuel
            className="text-green-600"
            size={Math.max(12, Math.min(32, GRID_SIZE - 2))}
          />
        </div>
      ))}
    </>
  )
}