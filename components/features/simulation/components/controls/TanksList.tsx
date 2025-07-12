"use client"

import { useState } from "react"
import { TanqueDTO } from "@/types/types"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { TabsContent } from "@/components/ui/tabs"
import { useAppStore } from "@/store/appStore"

export function TanksList() {
  const [searchTank, setSearchTank] = useState("")
  
  // Obtener el modo actual
  const mode = useAppStore((state) => state.mode);
  
  // Obtener los tanques según el modo
  const tanques = useAppStore((state) => 
    mode === 'simulation' 
      ? state.simulationData.tanques 
      : state.operationalData.tanques
  )

  // Función para obtener el color del badge según el nivel del tanque
  const getLevelBadge = (capacidadDisponible: number, capacidadTotal: number) => {
    const nivel = (capacidadDisponible / capacidadTotal) * 100
    
    if (nivel > 50) {
      return <Badge variant="default">Normal</Badge>
    } else if (nivel > 10) {
      return <Badge variant="secondary">Alerta</Badge>
    } else {
      return <Badge variant="destructive">Crítico</Badge>
    }
  }

  // Filtrar tanques por búsqueda
  const filteredTanks = tanques.filter((tank) => 
    tank.nombre.toLowerCase().includes(searchTank.toLowerCase())
  )

  return (
    <TabsContent value="tanques" className="p-4">
      <div className="space-y-4">
        <div>
          <Input
            placeholder="Buscar tanque..."
            value={searchTank}
            onChange={(e) => setSearchTank(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Nombre</TableHead>
                <TableHead className="text-xs text-center">Posición</TableHead>
                <TableHead className="text-xs text-center">Disponible</TableHead>
                <TableHead className="text-xs text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTanks.map((tank) => (
                <TableRow key={tank.id}>
                  <TableCell className="text-xs font-medium">{tank.nombre}</TableCell>
                  <TableCell className="text-xs text-center">{tank.posX}, {tank.posY}</TableCell>
                  <TableCell className="text-xs text-center">
                    {tank.capacidadDisponible.toFixed(2)} m³ 
                    <span className="text-gray-500 ml-1">
                      ({((tank.capacidadDisponible / tank.capacidadTotal) * 100).toFixed(0)}%)
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-center">
                    {getLevelBadge(tank.capacidadDisponible, tank.capacidadTotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="text-xs text-gray-500 text-center">
          {filteredTanks.length} de {tanques.length} tanques
        </div>
      </div>
    </TabsContent>
  )
}
