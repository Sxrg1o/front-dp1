"use client"

import { useState } from "react"
import { SimulationRequest, SimulationConfig } from "../../../../types/types" 
import { guardarArchivoTemporal } from "../../../../services/archivo-service"
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
  
  // C-FIX 2: Añadir estados para cada archivo
  const [pedidosFile, setPedidosFile] = useState<File | null>(null);
  const [bloqueosFile, setBloqueosFile] = useState<File | null>(null);
  const [averiasFile, setAveriasFile] = useState<File | null>(null);
  const [mantenimientosFile, setMantenimientosFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  
  // Get the setSimulationConfig action from the store
  const setSimulationConfig = useAppStore((state) => state.setSimulationConfig);

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

  const handleFechaInicioChange = (fecha: string) => {
    setFechaInicio(fecha)
    if (escenario === "semanal" && fecha) {
      const startDate = new Date(fecha)
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 7)
      setFechaFinal(endDate.toISOString().split('T')[0])
    }
  }

  const handleSubmit = async () => {
    if (!escenario || !fechaInicio || !pedidosFile) { // Ensure mandatory fields are filled
        console.error("Por favor, complete todos los campos obligatorios.");
        // Optionally, set an error state to show a message to the user
        return;
    }
    setIsLoading(true);
    try {
      // C-FIX 3: Subir cada archivo y obtener su ID
      const fileIdPedidos = pedidosFile ? await guardarArchivoTemporal(pedidosFile) : "";
      const fileIdBloqueos = bloqueosFile ? await guardarArchivoTemporal(bloqueosFile) : undefined; // Use undefined if optional and not provided
      const fileIdAverias = averiasFile ? await guardarArchivoTemporal(averiasFile) : undefined;
      const fileIdMantenimientos = mantenimientosFile ? await guardarArchivoTemporal(mantenimientosFile) : undefined;

      const config: SimulationConfig = {
        escenario: escenario as 'semanal' | 'colapso',
        fechaInicio,
        ...(escenario === 'semanal' && fechaFinal && { fechaFinal })
      }

      // Construir el objeto SimulationRequest
      const requestData: SimulationRequest = {
        nombreSimulacion: `Simulación ${config.escenario} ${new Date(config.fechaInicio).toLocaleDateString()}`, // More descriptive name
        fileIdPedidos,
        // Solo incluir los IDs de archivo si existen
        ...(fileIdBloqueos && { fileIdBloqueos }),
        ...(fileIdAverias && { fileIdAverias }),
        ...(fileIdMantenimientos && { fileIdMantenimientos }),
      };
      
      // Save the config to the global store
      setSimulationConfig(config);

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
                  onChange={(e) => setPedidosFile(e.target.files ? e.target.files[0] : null)}
                  className={!pedidosFile && isLoading === false ? "border-red-300" : ""} // Adjusted condition
                />
                {pedidosFile && (
                  <p className="text-xs text-green-600 mt-1">✓ {pedidosFile.name}</p>
                )}
                {!pedidosFile && (
                  <p className="text-xs text-red-500 mt-1">Este archivo es obligatorio</p>
                )}
              </div>
              <div>
                <Label htmlFor="mantenimientos" className="py-1">Mantenimientos</Label>
                <Input 
                  id="mantenimientos" 
                  type="file" 
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={(e) => setMantenimientosFile(e.target.files ? e.target.files[0] : null)} 
                />
                 {mantenimientosFile && (
                  <p className="text-xs text-green-600 mt-1">✓ {mantenimientosFile.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="averias" className="py-1">Averías</Label>
                <Input 
                  id="averias" 
                  type="file" 
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={(e) => setAveriasFile(e.target.files ? e.target.files[0] : null)}
                />
                {averiasFile && (
                  <p className="text-xs text-green-600 mt-1">✓ {averiasFile.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="bloqueos" className="py-1">Bloqueos</Label>
                <Input 
                  id="bloqueos" 
                  type="file" 
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={(e) => setBloqueosFile(e.target.files ? e.target.files[0] : null)}
                />
                {bloqueosFile && (
                  <p className="text-xs text-green-600 mt-1">✓ {bloqueosFile.name}</p>
                )}
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            disabled={isLoading || !escenario || !fechaInicio || !pedidosFile}
          >
            {isLoading ? "Procesando..." : "Iniciar Simulación"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
