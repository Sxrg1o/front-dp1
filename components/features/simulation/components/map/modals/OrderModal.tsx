import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Clock, Package } from "lucide-react"
import { PedidoDTO } from "@/types/types"
import { formatSimulationTime } from "@/utils/timeUtils"

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: PedidoDTO | null
  tiempoActual: number
}

export function OrderModal({ 
  isOpen, 
  onClose, 
  order,
  tiempoActual
}: OrderModalProps) {
  if (!order) return null

  // Calcular tiempo restante
  const tiempoRestante = order.tiempoLimite - tiempoActual
  const estaVencido = tiempoRestante <= 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Información del Pedido #{order.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="bg-white shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package size={20} className="text-blue-600" />
                  <span className="font-medium">Estado del Pedido</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-600">Cliente:</span>
                    <span className="ml-2 font-medium">{order.idCliente}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-600">Volumen:</span>
                    <span className="ml-2 font-medium">{order.volumen} m³</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock size={16} className={estaVencido ? "text-red-500" : "text-gray-500"} />
                  <div>
                    <span className="text-sm text-gray-600">
                      {estaVencido ? "Tiempo vencido:" : "Tiempo restante:"}
                    </span>
                    <span className={`ml-2 font-medium ${estaVencido ? "text-red-600" : ""}`}>
                      {estaVencido ? 
                        `Vencido hace ${formatSimulationTime(Math.abs(tiempoRestante))}` : 
                        formatSimulationTime(tiempoRestante)
                      }
                    </span>
                  </div>
                </div>

                {order.x !== undefined && order.y !== undefined && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-600">Ubicación:</span>
                      <span className="ml-2 font-medium">({order.x}, {order.y})</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
