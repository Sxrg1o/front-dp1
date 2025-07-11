"use client"

import { useState } from "react"
import { SimulationRequest, SimulationConfig } from "../../../../types/types" 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/appStore" // Import the store


interface SimulationConfigFormProps {
  onStartSimulation: (config: SimulationConfig, requestData: SimulationRequest) => void
}

export function SimulationConfigForm({ onStartSimulation }: SimulationConfigFormProps) {
  const [escenario, setEscenario] = useState<'semanal' | 'colapso' | "">("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFinal, setFechaFinal] = useState("")
  const [duracion, setDuracion] = useState(7)
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the setSimulationConfig action from the store
  const setSimulationConfig = useAppStore((state) => state.setSimulationConfig);

  const handleEscenarioChange = (value: string) => {
    const escenarioValue = value as 'semanal' | 'colapso'
    setEscenario(escenarioValue)
    
    if (escenarioValue === "semanal") {
      // Para simulación semanal, establecer duración a 7 días
      setDuracion(7)
      if (fechaInicio) {
        const startDate = new Date(fechaInicio)
        const endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 7)
        setFechaFinal(endDate.toISOString().split('T')[0])
      }
    } else {
      // Para simulación al colapso, duración "infinita" y sin fecha final
      setDuracion(Number.MAX_SAFE_INTEGER)
      setFechaFinal("")
    }
  }

  const handleFechaInicioChange = (fecha: string) => {
    setFechaInicio(fecha)
    if (escenario === "semanal" && fecha) {
      const startDate = new Date(fecha)
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + duracion)
      setFechaFinal(endDate.toISOString().split('T')[0])
    }
  }

  const handleSubmit = async () => {
    if (!escenario || !fechaInicio) { // Ensure mandatory fields are filled
        console.error("Por favor, complete todos los campos obligatorios.");
        // Optionally, set an error state to show a message to the user
        return;
    }
    setIsLoading(true);
    try {
      // Create the simulation configuration
      const config: SimulationConfig = {
        escenario: escenario as 'semanal' | 'colapso',
        fechaInicio,
        ...(escenario === 'semanal' && fechaFinal && { fechaFinal })
      }

      // Build the request data object
      const requestData: SimulationRequest = {
        nombreSimulacion: `Simulación ${config.escenario} ${new Date(config.fechaInicio).toLocaleDateString()}`,
        fechaInicio,
        duracionDias: escenario === 'semanal' ? duracion : -1 // Use -1 to indicate "infinite" duration for collapse simulation
      };
      
      // Save the config to the global store
      setSimulationConfig(config);

      // Call the parent component's function with the config and request data
      onStartSimulation(config, requestData);

    } catch (error) {
      console.error("Error al preparar la simulación:", error);
      // Optionally, set an error state to show a message to the user
    } finally {
      setIsLoading(false);
    }
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

          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            disabled={isLoading || !escenario || !fechaInicio}
          >
            {isLoading ? "Procesando..." : "Iniciar Simulación"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
