"use client"

import { useEffect } from "react"
import { useAppStore } from "@/store/appStore"
import { OperationsView } from "./views/OperationsView"

export function OperacionesSection() {
  // Inicializar configuración para modo operacional
  const { setSimulationConfig, setSimulationId } = useAppStore();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Configurar el store para modo operacional en tiempo real
    setSimulationConfig({
      escenario: 'semanal',
      fechaInicio: today,
    });
    
    // Usar un ID especial para modo operacional
    setSimulationId('operations-live');
  }, [setSimulationConfig, setSimulationId]);

  // Renderizar la vista de operaciones
  return <OperationsView />
}
