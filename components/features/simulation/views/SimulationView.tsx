"use client"

import { useEffect } from "react"
import { useAppStore } from "@/store/appStore"
import { useSimulationRunner } from "@/hooks/useSimulationRunner"
import { SharedMapView } from "@/components/features/shared/SharedMapView"

interface SimulationViewProps {
  simulationId: string;
}

export function SimulationView({ simulationId }: SimulationViewProps) {
  // Usar el hook de simulación para gestionar el ciclo de vida
  useSimulationRunner(simulationId);
  
  // Configurar el modo de simulación
  useEffect(() => {
    useAppStore.getState().setMode('simulation');
  }, []);
  
  // Extraer el estado de carga
  const loadingState = useAppStore((state) => state.simulation.loadingState);
  const playbackStatus = useAppStore((state) => state.simulation.playbackStatus);
  
  if (loadingState.isLoading && playbackStatus !== 'running') {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl">Cargando datos de la simulación...</p>
      </div>
    );
  }
  
  // Utilizar el componente compartido para la vista
  return <SharedMapView />
}
