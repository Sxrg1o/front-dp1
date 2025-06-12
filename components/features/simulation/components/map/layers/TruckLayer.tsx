import { TruckDTO } from "@/types/types"
import { Truck } from "lucide-react"

interface TruckLayerProps {
  camiones: TruckDTO[]
  GRID_SIZE: number
  onTruckClick: (truck: TruckDTO) => void
}

export function TruckLayer({ camiones, GRID_SIZE, onTruckClick }: TruckLayerProps) {
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

  const getTruckColor = (id: string) => {
    if (id.startsWith("TA")) return "green"
    if (id.startsWith("TB")) return "yellow"
    if (id.startsWith("TC")) return "blue"
    if (id.startsWith("TD")) return "purple"
    return "gray"
  }

  const getTruckType = (id: string) => {
    if (id.startsWith("TA")) return "TA"
    if (id.startsWith("TB")) return "TB"
    if (id.startsWith("TC")) return "TC"
    if (id.startsWith("TD")) return "TD"
    return "??"
  }

  return (
    <>
      {camiones?.map((truck) => (
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
          title={`Camión ${truck.id} (${getTruckType(truck.id)})`}
        >
          <Truck
            className={getTruckColorClass(getTruckColor(truck.id))}
            size={Math.max(12, Math.min(32, GRID_SIZE - 2))}
          />
        </div>
      ))}
    </>
  )
}
