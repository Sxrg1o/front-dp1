import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Fuel } from "lucide-react"

interface TankModalProps {
  isOpen: boolean
  onClose: () => void
  tank: any
  getTankColor: (level: number) => string
  getTankIconClass: (level: number) => string
  getTankBadgeVariant: (level: number) => "secondary" | "default" | "destructive"
  getTankBackgroundColor: (level: number) => string
}

export function TankModal({ 
  isOpen, 
  onClose, 
  tank, 
  getTankColor, 
  getTankIconClass,
  getTankBadgeVariant, 
  getTankBackgroundColor 
}: TankModalProps) {
  if (!tank) return null

  const tankLevel = Math.round((tank.capacidadDisponible / tank.capacidadTotal) * 100)
  
  // Función para obtener la clase de color de la barra de progreso
  const getProgressBarColor = (level: number) => {
    if (level > 50) return "bg-green-500"
    if (level > 10) return "bg-yellow-500"
    return "bg-red-500"
  } 
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Estado del Tanque - {tank.nombre}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card className={getTankBackgroundColor(tankLevel)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fuel
                    className={getTankIconClass(tankLevel)}
                    size={24}
                  />
                  <span className="font-medium">
                    {tankLevel > 50 ? 'Operativo' :
                     tankLevel > 10 ? 'Alerta' : 'Emergencia'}
                  </span>
                </div>
                <Badge variant={getTankBadgeVariant(tankLevel)}>
                  {tankLevel}%
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Nivel de GLP: {tankLevel}% - {tank.nombre}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`${getProgressBarColor(tankLevel)} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${tankLevel}%` }}
                ></div>
              </div>

              {tankLevel <= 10 && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
                  ⚠️ Nivel crítico de GLP. Reabastecimiento urgente requerido.
                </div>
              )}

              {tankLevel > 10 && tankLevel <= 50 && (
                <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-700">
                  ⚠️ Nivel bajo de GLP. Programar reabastecimiento.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
