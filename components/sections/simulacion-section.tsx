"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SimulationControls } from "@/components/simulation/simulation-controls"
import { SimulationMap } from "@/components/simulation/simulation-map"
import {SimulacionSnapshotDTO} from "@/lib/types";

export function SimulacionSection() {
  const [hasActiveSolution, setHasActiveSolution] = useState(false)
  const [escenario, setEscenario] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFinal, setFechaFinal] = useState("")
  const [snapshot, setSnapshot] = useState<SimulacionSnapshotDTO | null>(null)

  const handleFechaInicioChange = (fecha: string) => {
    setFechaInicio(fecha)
    if (escenario === "semanal" && fecha) {
      const startDate = new Date(fecha)
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 7)
      setFechaFinal(endDate.toISOString().split('T')[0])
    }
  }

  const handleEscenarioChange = (value: string) => {
    setEscenario(value)
    if (value === "semanal" && fechaInicio) {
      const startDate = new Date(fechaInicio)
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 7)
      setFechaFinal(endDate.toISOString().split('T')[0])
    } else {
      setFechaFinal("")
    }
  }

  if (!hasActiveSolution) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Configuración de Simulación</h1>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Nueva Simulación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="escenario" className="py-1">Escenario</Label>
              <Select value={escenario} onValueChange={handleEscenarioChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar escenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Simulación Semanal</SelectItem>
                  <SelectItem value="colapso">Simulación Al Colapso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={escenario === "colapso" ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-4"}>
              <div>
                <Label htmlFor="fecha-inicio" className="py-1">Fecha de Inicio</Label>
                <Input 
                  id="fecha-inicio" 
                  type="date" 
                  value={fechaInicio}
                  onChange={(e) => handleFechaInicioChange(e.target.value)}
                />
              </div>
              {escenario !== "colapso" && (
                <div>
                  <Label htmlFor="fecha-final" className="py-1">Fecha Final</Label>
                  <Input 
                    id="fecha-final" 
                    type="date" 
                    value={fechaFinal}
                    onChange={(e) => setFechaFinal(e.target.value)}
                    disabled={escenario === "semanal"}
                    className={escenario === "semanal" ? "bg-gray-100 text-gray-500" : ""}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="py-2 font-bold">Archivos de Configuración</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pedidos" className="py-1">Pedidos</Label>
                  <Input id="pedidos" type="file" />
                </div>
                <div>
                  <Label htmlFor="mantenimientos" className="py-1">Mantenimientos</Label>
                  <Input id="mantenimientos" type="file" />
                </div>
                <div>
                  <Label htmlFor="averias" className="py-1">Averías</Label>
                  <Input id="averias" type="file" />
                </div>
                <div>
                  <Label htmlFor="bloqueos" className="py-1">Bloqueos</Label>
                  <Input id="bloqueos" type="file" />
                </div>
              </div>
            </div>

            <Button onClick={() => setHasActiveSolution(true)} className="w-full">
              Iniciar Simulación
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Simulación Semanal</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            <span>Fecha inicio: 01/04/2025</span>
            <span>Duración de la simulación: 00d 10h 11m</span>
            <span>Tiempo transcurrido: 00h 07m 57s</span>
            <span>Flota: 2/2 🚛</span>
            <span>Total de pedidos entregados: 12/30</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Simulation Map - Takes 2 columns */}
        <div className="xl:col-span-2">
          <SimulationMap  />
        </div>

        {/* Control Panel - Takes 1 column */}
        <div className="xl:col-span-1">
          <SimulationControls />
        </div>
      </div>
    </div>
  )
}
