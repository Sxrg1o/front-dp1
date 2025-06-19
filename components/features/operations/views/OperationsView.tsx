"use client"

import { useEffect } from "react"
import { useAppStore } from "@/store/appStore"
import { useOperationalListener } from "@/hooks/useOperationalListener"
import { SharedMapView } from "@/components/features/shared/SharedMapView"

export function OperationsView() {
  // Usar el hook para escuchar eventos operacionales
  useOperationalListener();
  
  // Configurar el modo de operaciones
  useEffect(() => {
    useAppStore.getState().setMode('operational');
  }, []);
  
  // Extraer el estado de carga
  const loadingState = useAppStore((state) => state.simulation.loadingState);
  
  if (loadingState.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl">Cargando datos de operaciones...</p>
      </div>
    );
  }
  
  // Utilizar el componente compartido para la vista
  return <SharedMapView />
}
