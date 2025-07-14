"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TabsContent } from "@/components/ui/tabs"
import { useAppStore } from "@/store/appStore"
import { AveriaDTO, TruckDTO } from "@/types/types"

export function BreakdownsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const mode = useAppStore((state) => state.mode)


  const camiones: TruckDTO[] = useAppStore((state) =>
    mode === "simulation" ? state.simulationData.camiones : state.operationalData.camiones
  )

  const averias: AveriaDTO[] = useAppStore((state) =>
    mode === "simulation" ? state.simulationData.averias : state.operationalData.averias
  )

  const averiasMap = useMemo(() => {
    const map = new Map<string, string>()
    averias.forEach((a) => {
      map.set(a.codigoVehiculo, a.tipoIncidente)
    })
    return map
  }, [averias])

  const breakdownTrucks = camiones.filter((truck) => truck.status === "BREAKDOWN")

  const filtered = breakdownTrucks.filter((t) =>
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getBadgeClass = (tipo: string) => {
    const classes: Record<string, string> = {
      T1: "bg-green-600 hover:bg-green-700 text-white",
      T2: "bg-orange-500 hover:bg-orange-600 text-white",
      T3: "bg-red-600 hover:bg-red-700 text-white",
    }
    return classes[tipo] || "bg-gray-500 text-white"
  }

  return (
    <TabsContent value="averias" className="p-4">
      <div className="space-y-4">
        <Input
          placeholder="Buscar camión averiado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />

        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Cod. Vehic.</TableHead>
                <TableHead className="text-xs text-center">Tipo Avería</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-xs">
                    No hay camiones averiados
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((truck) => {
                const tipo = averiasMap.get(truck.id) || "-"
                return (
                  <TableRow key={truck.id}>
                    <TableCell className="text-xs font-medium">{truck.id}</TableCell>
                    <TableCell className="text-xs text-center">
                      {tipo !== "-" ? <Badge className={getBadgeClass(tipo)}>{tipo}</Badge> : "-"}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        <div className="text-xs text-gray-500 text-center">
          {filtered.length} de {breakdownTrucks.length} camiones averiados
        </div>
      </div>
    </TabsContent>
  )
}
