import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Truck } from "lucide-react"
import { TruckDTO } from "@/types/types"

interface TruckModalProps {
  isOpen: boolean
  onClose: () => void
  truck: TruckDTO | null
  onBreakdown: () => void
  getTruckColorClass: (color: string) => string
}

export function TruckModal({ 
  isOpen, 
  onClose, 
  truck, 
  onBreakdown, 
  getTruckColorClass 
}: TruckModalProps) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Información del Camión {truck?.id}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck
              className={truck ? getTruckColorClass(getTruckColor(truck.id)) : "text-blue-600"}
              size={32}
            />
            <div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Tipo: {truck ? getTruckType(truck.id) : "N/A"}</div>
                <div>Nivel de combustible: {truck?.combustibleDisponible.toFixed(2)}</div>
                <div>Estado: {truck?.status}</div>
              </div>
            </div>
          </div>
          <Button onClick={onBreakdown} variant="outline">
            Averiar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
