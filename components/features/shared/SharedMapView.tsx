"use client"

import { SimulationMap } from "@/components/features/simulation/components/simulation-map"
import { SimulationControls } from "@/components/features/simulation/components/simulation-controls"
import { formatSimulationTime } from "@/utils/timeUtils"
import { useAppStore } from "@/store/appStore"
import { EndSimulationModal } from "@/components/features/simulation/components/EndSimulationModal"

export function SharedMapView() {
  const mode = useAppStore((state) => state.mode);
  
  const simulationState = useAppStore((state) => state.simulation);
  const operationalState = useAppStore((state) => state.operational);
  const simulationData = useAppStore((state) => state.simulationData);
  const operationalData = useAppStore((state) => state.operationalData);
  
  const currentState = mode === 'simulation' ? simulationState : operationalState;
  const currentData = mode === 'simulation' ? simulationData : operationalData;
  
  const { tiempoActual, config } = currentState;
  const { pedidos, camiones } = currentData;

  const tiempoFecha = new Date(tiempoActual);
  const tiempoInicio = new Date(config?.fechaInicio || tiempoFecha);

  const diffMs = tiempoFecha.getTime() - tiempoInicio.getTime();
  const tiempoSimulacion = Math.floor(diffMs / (1000 * 60) - 5 * 60);

  // Funciones auxiliares para formateo
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getTitle = () => {
    // Si estamos en modo operaciones, mostrar título específico
    if (mode === 'operational') return "Operaciones Día a Día"
    if (mode === 'simulation' && !config) return "Simulación"
    
    // Si estamos en modo simulación, mostrar título basado en configuración
    if (!config) return "Vista de Simulación"
    return config.escenario === 'semanal' ? 'Simulación Semanal' : 'Simulación al Colapso'
  }

  const getDateInfo = () => {
    if (!config) return ""
    
    const fechaInicioMasUnMinuto = new Date(config.fechaInicio);
    fechaInicioMasUnMinuto.setMinutes(fechaInicioMasUnMinuto.getMinutes() + 60*5);
    
    if (config.escenario === 'semanal' && config.fechaFinal) {
      return `Fecha inicio: ${formatDate(fechaInicioMasUnMinuto.toISOString())} - Fecha fin: ${formatDate(config.fechaFinal)}`
    } else {
      return `Fecha inicio: ${formatDate(fechaInicioMasUnMinuto.toISOString())}`
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{getTitle()}</h1>
          {mode === 'simulation' && (
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
              <span>{getDateInfo()}</span>
              <span>Tiempo transcurrido: {formatSimulationTime(tiempoSimulacion)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SimulationMap />
        </div>
        
        <div className="xl:col-span-1">
          <SimulationControls />
        </div>
      </div>

      <EndSimulationModal />
    </div>
  )
}
