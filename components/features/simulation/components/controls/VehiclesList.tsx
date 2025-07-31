"use client"

import { useState } from "react"
import { TruckDTO } from "@/types/types"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { TabsContent } from "@/components/ui/tabs"
import { useAppStore } from "@/store/appStore" // Importar el store global
import { cn } from "@/lib/utils" // Utilidad para clases condicionales

export function VehiclesList() {
  const [searchVehicle, setSearchVehicle] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  // Obtener el modo actual
  const mode = useAppStore((state) => state.mode);
  
  // Obtener los camiones según el modo
  const camiones = useAppStore((state) => 
    mode === 'simulation' 
      ? state.simulationData.camiones 
      : state.operationalData.camiones
  )

  // Obtener el estado y la acción del store
  const selectedTruckId = useAppStore((state) => state.selectedTruckId)
  const setSelectedTruckId = useAppStore((state) => state.setSelectedTruckId)

  // También obtenemos el action para limpiar los pedidos seleccionados
  const setSelectedOrderId = useAppStore((state) => state.setSelectedOrderId)

  const handleRowClick = (truckId: string) => {
    // Si el camión clickeado ya está seleccionado, lo deseleccionamos (poniendo null)
    // Si no, lo seleccionamos y limpiamos cualquier pedido seleccionado.
    setSelectedTruckId(selectedTruckId === truckId ? null : truckId)
    // Desseleccionar cualquier pedido que estuviera seleccionado
    setSelectedOrderId(null)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      AVAILABLE: "default",
      DELIVERING: "secondary",
      RETURNING: "destructive",
      BREAKDOWN: "warning", // Nuevo estado con variante warning
      UNAVAILABLE: "outline",  // Nuevo estado con variante outline
      MAINTENANCE: "warning", // Nuevo estado con variante info
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>
  }

  const filteredVehicles = camiones.filter((vehicle) => 
    vehicle.id.toLowerCase().includes(searchVehicle.toLowerCase())
  )

  return (
    <TabsContent value="vehiculos" className="p-4">
      <div className="space-y-4">
        <div>
          <Input
            placeholder="Buscar vehículo..."
            value={searchVehicle}
            onChange={(e) => setSearchVehicle(e.target.value)}
            className="w-full"
          />
          
        </div>

        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Cod. Vehic.</TableHead>
                <TableHead className="text-xs text-center">Posición</TableHead>
                <TableHead className="text-xs text-center">GLP</TableHead>
                <TableHead className="text-xs text-center">Combustible</TableHead>
                <TableHead className="text-xs text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow 
                  key={vehicle.id}
                  onClick={() => handleRowClick(vehicle.id)}
                  className={cn(
                    "cursor-pointer hover:bg-muted/50 transition-colors",
                    selectedTruckId === vehicle.id && "bg-muted/80" // Resaltar si está seleccionado
                  )}
                >
                  <TableCell className="text-xs font-medium">{vehicle.id}</TableCell>
                  <TableCell className="text-xs text-center">{vehicle.x}, {vehicle.y}</TableCell>
                  <TableCell className="text-xs text-center">{vehicle.disponible.toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-center">{vehicle.combustibleDisponible.toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-center">{getStatusBadge(vehicle.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="text-xs text-gray-500 text-center">
          {filteredVehicles.length} de {camiones.length} vehículos
        </div>
      </div>
    </TabsContent>
  )
}
