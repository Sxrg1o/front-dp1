"use client"

import { Truck, Fuel, Home, MapPin, SquareIcon } from "lucide-react"
import { TabsContent } from "@/components/ui/tabs"

export function LegendView() {
  return (
    <TabsContent value="leyenda" className="p-4 space-y-6">
      <div>
        <h4 className="font-semibold mb-3 text-base">Vehículos</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Truck className="text-green-600 mx-auto mb-1" size={28} />
            <div className="text-sm font-medium">Vehículo: TA</div>
            <div className="text-xs text-gray-600">Capacidad: 25</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Truck className="text-yellow-600 mx-auto mb-1" size={28} />
            <div className="text-sm font-medium">Vehículo: TB</div>
            <div className="text-xs text-gray-600">Capacidad: 15</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Truck className="text-blue-600 mx-auto mb-1" size={28} />
            <div className="text-sm font-medium">Vehículo: TC</div>
            <div className="text-xs text-gray-600">Capacidad: 10</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Truck className="text-purple-600 mx-auto mb-1" size={28} />
            <div className="text-sm font-medium">Vehículo: TD</div>
            <div className="text-xs text-gray-600">Capacidad: 5</div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3 text-base">Ubicaciones</h4>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <Home className="text-blue-700 mx-auto mb-1" size={28} />
            <div className="text-sm">Planta Principal</div>
          </div>
          <div className="text-center">
            <Fuel className="text-green-600 mx-auto mb-1" size={28} />
            <div className="text-sm">Estaciones GLP</div>
          </div>
          <div className="text-center">
            <MapPin className="text-red-600 mx-auto mb-1" size={28} />
            <div className="text-sm">Puntos de Entrega</div>
          </div>
          <div className="text-center">
            <SquareIcon className="text-red-600 mx-auto mb-1" size={28} />
            <div className="text-sm">Bloqueos</div>
          </div>
        </div>
      </div>
    </TabsContent>
  )
}
