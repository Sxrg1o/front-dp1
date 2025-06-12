"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SimulationConfig {
  escenario: 'semanal' | 'colapso'
  fechaInicio: string
  fechaFinal?: string
}

interface SimulationConfigFormProps {
  onStartSimulation: (config: SimulationConfig) => void
}

export function SimulationConfigForm({ onStartSimulation }: SimulationConfigFormProps) {
  const [escenario, setEscenario] = useState<'semanal' | 'colapso' | "">("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFinal, setFechaFinal] = useState("")
  const [archivoPedidos, setArchivoPedidos] = useState<File | null>(null)

  const handleStartClick = () => {
    if (escenario && fechaInicio && archivoPedidos) {
      const config: SimulationConfig = {
        escenario: escenario as 'semanal' | 'colapso',
        fechaInicio,
        ...(escenario === 'semanal' && fechaFinal && { fechaFinal })
      }
      onStartSimulation(config)
    }
  }

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
    const escenarioValue = value as 'semanal' | 'colapso'
    setEscenario(escenarioValue)
    if (escenarioValue === "semanal" && fechaInicio) {
      const startDate = new Date(fechaInicio)
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 7)
      setFechaFinal(endDate.toISOString().split('T')[0])
    } else {
      setFechaFinal("")
    }
  }

  const handleArchivoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setArchivoPedidos(file)
  }

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
            <p className="text-sm text-gray-600">Los campos marcados con * son obligatorios</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pedidos" className="py-1">Pedidos *</Label>
                <Input 
                  id="pedidos" 
                  type="file" 
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleArchivoChange}
                  className={!archivoPedidos ? "border-red-300" : ""}
                />
                {archivoPedidos && (
                  <p className="text-xs text-green-600 mt-1">✓ {archivoPedidos.name}</p>
                )}
                {!archivoPedidos && (
                  <p className="text-xs text-red-500 mt-1">Este archivo es obligatorio</p>
                )}
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

          <Button 
            onClick={handleStartClick} 
            className="w-full" 
            disabled={!escenario || !fechaInicio || !archivoPedidos}
          >
            Iniciar Simulación
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
