"use client"

import { useState, useEffect } from "react"
import { SimulationConfigForm } from "./views/SimulationConfigForm"
import { SimulationView } from "./views/SimulationView"
import { 
  iniciarNuevaSimulacion, 
  haySimulacionActiva
} from "../../../services/simulacion-service"
import { SimulationRequest, SimulationConfig, SimulationStatusDTO } from "../../../types/types";
import { useAppStore } from "@/store/appStore"

export function SimulacionSection() {
  const [activeSimulationId, setActiveSimulationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true); 

  const { initializeSimulation, setPlaybackStatus } = useAppStore();

  useEffect(() => {
    const checkForActiveSimulation = async () => {
      const activeId = await haySimulacionActiva();
      
      if (activeId && activeId !== "false") {
        console.log(`Recargando simulación activa: ${activeId}`);
        
        await initializeSimulation(activeId);
        
        setPlaybackStatus('running');

        setActiveSimulationId(activeId);
      }
      
      setIsLoading(false);
    };

    checkForActiveSimulation();
  }, [initializeSimulation, setPlaybackStatus]); 

  const handleStartSimulation = async (config: SimulationConfig, requestData: SimulationRequest) => {
    try {
      const status: SimulationStatusDTO = await iniciarNuevaSimulacion(requestData);
      if (status && status.simulationId) {
        await initializeSimulation(status.simulationId);
        setActiveSimulationId(status.simulationId);
      } else {
        console.error("No se recibió un ID de simulación del backend.");
      }
    } catch (error) {
      console.error("Error al iniciar la simulación:", error);
    }
  };
  
  if (isLoading) {
    return <p>Verificando estado de la simulación...</p>;
  }

  return (
    <>
      {!activeSimulationId ? (
        <SimulationConfigForm onStartSimulation={handleStartSimulation} />
      ) : (
        <SimulationView simulationId={activeSimulationId} />
      )}
    </>
  )
}