import { TruckDTO } from "@/types/types"
import { Truck } from "lucide-react"
import { useAppStore } from "@/store/appStore" 
import { getTruckColorName, getTruckIconColorClass } from "@/utils/colorUtils"

interface TruckLayerProps {
  GRID_SIZE: number
  onTruckClick: (truck: TruckDTO) => void
}

export function TruckLayer({ GRID_SIZE, onTruckClick }: TruckLayerProps) {
  // Obtener el modo actual
  const mode = useAppStore((state) => state.mode);
  
  // Obtener los camiones según el modo
  const camiones = useAppStore((state) => 
    mode === 'simulation' 
      ? state.simulationData.camiones 
      : state.operationalData.camiones
  )

  const getTruckType = (id: string) => {
    if (id.startsWith("TA")) return "TA"
    if (id.startsWith("TB")) return "TB"
    if (id.startsWith("TC")) return "TC"
    if (id.startsWith("TD")) return "TD"
    return "??"
  }

  return (
    <>
      {camiones?.map((truck) => {
        const colorName = getTruckColorName(truck.id);
        const iconClass = getTruckIconColorClass(colorName);
        
        return (
          <div
            key={`truck-${truck.id}`}
            className="absolute cursor-pointer hover:scale-110 transition-transform z-30 flex items-center justify-center pointer-events-auto"
            style={{
              top: `${(truck.y) * GRID_SIZE + 1}px`,
              left: `${(truck.x) * GRID_SIZE + 1}px`,
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
                className={iconClass}
                size={Math.max(12, Math.min(32, GRID_SIZE - 2))}
              />
          </div>
        );
      })}
    </>
  )
}
