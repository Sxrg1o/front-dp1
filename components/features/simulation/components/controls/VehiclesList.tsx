"use client"

import { useState } from "react"
import { TruckDTO } from "@/types/types"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { TabsContent } from "@/components/ui/tabs"
import { useAppStore } from "@/store/appStore" // Importar el store global

export function VehiclesList() {
  const [searchVehicle, setSearchVehicle] = useState("")
  
  // Obtener el modo actual
  const mode = useAppStore((state) => state.mode);
  
  // Obtener los camiones según el modo
  const camiones = useAppStore((state) => 
    mode === 'simulation' 
      ? state.simulationData.camiones 
      : state.operationalData.camiones
  )

  const getStatusBadge = (status: string) => {
    const variants = {
      AVAILABLE: "default",
      DELIVERING: "secondary",
      RETURNING: "destructive",
      PROCESSING: "outline",  // Nuevo estado con variante outline
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
                <TableRow key={vehicle.id}>
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
