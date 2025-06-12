import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Truck } from "lucide-react"

interface TruckModalProps {
  isOpen: boolean
  onClose: () => void
  truck: any
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Información del Camión {truck?.id}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck
              className={truck ? getTruckColorClass(truck.color) : "text-blue-600"}
              size={32}
            />
            <div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Tipo: {truck?.type}</div>
                <div>Nivel de combustible: {truck?.fuelLevel.toFixed(2)}</div>
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
