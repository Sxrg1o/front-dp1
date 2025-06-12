import { Truck } from "lucide-react"
import type { TruckDTO } from "@/types/types"

interface Vehicle {
  id: string
  x: number
  y: number
  fuelLevel: number
  status: string
  type: string
  color: string
}

interface TruckLayerProps {
  camiones: TruckDTO[]
  GRID_SIZE: number
  onTruckClick: (truck: Vehicle) => void
}

export function TruckLayer({ camiones, GRID_SIZE, onTruckClick }: TruckLayerProps) {
  // Transformar camiones a currentVehicles
  const currentVehicles: Vehicle[] = Array.isArray(camiones)
    ? camiones
        .filter((c) => c && typeof c.id === "string")
        .map((c: TruckDTO) => {
          const id = c.id
          const x = c.x
          const y = c.y
          const fuelLevel = c.combustibleDisponible
          const status = c.status
          const type =
            typeof id === "string" && id.startsWith("TA") ? "TA" :
            typeof id === "string" && id.startsWith("TB") ? "TB" :
            typeof id === "string" && id.startsWith("TC") ? "TC" :
            typeof id === "string" && id.startsWith("TD") ? "TD" :
            "??"
          const color =
            typeof id === "string" && id.startsWith("TA") ? "green" :
            typeof id === "string" && id.startsWith("TB") ? "yellow" :
            typeof id === "string" && id.startsWith("TC") ? "blue" :
            typeof id === "string" && id.startsWith("TD") ? "purple" :
            "gray"
          return { id, x, y, fuelLevel, status, type, color }
        })
    : []

  const getTruckColorClass = (color: string) => {
    const colorMap = {
      green: "text-green-600",
      yellow: "text-yellow-600", 
      blue: "text-blue-600",
      purple: "text-purple-600",
      gray: "text-gray-600"
    }
    return colorMap[color as keyof typeof colorMap] || "text-gray-600"
  }

  return (
    <>
      {currentVehicles?.map((truck) => (
        <div
          key={`truck-${truck.id}`}
          className="absolute cursor-pointer hover:scale-110 transition-transform z-30 flex items-center justify-center pointer-events-auto"
          style={{
            top: `${truck.y * GRID_SIZE + 1}px`,
            left: `${truck.x * GRID_SIZE + 1}px`,
            width: `${GRID_SIZE}px`,
            height: `${GRID_SIZE}px`,
            imageRendering: "crisp-edges",
          }}
          onClick={(e) => {
            e.stopPropagation()
            onTruckClick(truck)
          }}
          title={`Camión ${truck.id} (${truck.type})`}
        >
          <Truck
            className={getTruckColorClass(truck.color)}
            size={Math.max(12, Math.min(32, GRID_SIZE - 2))}
          />
        </div>
      ))}
    </>
  )
}
