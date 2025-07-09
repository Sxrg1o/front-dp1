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

  const setSimulationId = useAppStore((state) => state.setSimulationId);
  const setPlaybackStatus = useAppStore((state) => state.setPlaybackStatus);

  useEffect(() => {
    const checkForActiveSimulation = async () => {
      const activeId = await haySimulacionActiva();
      
      if (activeId && activeId !== "false") {
        setActiveSimulationId(activeId);
        
        setSimulationId(activeId);
        setPlaybackStatus('running');
      }
      setIsLoading(false);
    };

    checkForActiveSimulation();
  }, [setSimulationId, setPlaybackStatus]); 

  const handleStartSimulation = async (config: SimulationConfig, requestData: SimulationRequest) => {
    try {
      const status: SimulationStatusDTO = await iniciarNuevaSimulacion(requestData);
      if (status && status.simulationId) {
        setActiveSimulationId(status.simulationId);
        setSimulationId(status.simulationId);
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