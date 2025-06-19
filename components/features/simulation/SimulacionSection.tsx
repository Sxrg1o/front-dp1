"use client"

import { useState } from "react"
import { SimulationConfigForm } from "./views/SimulationConfigForm"
import { SimulationView } from "./views/SimulationView"
import { iniciarNuevaSimulacion } from "../../../services/simulacion-service"
import { SimulationRequest, SimulationConfig, SimulationStatusDTO } from "../../../types/types";
import { useAppStore } from "@/store/appStore" // Import the store

export function SimulacionSection() {
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig | null>(null)
  const [activeSimulationId, setActiveSimulationId] = useState<string | null>(null)
  
  // Get the setSimulationId action from the store
  const setSimulationId = useAppStore((state) => state.setSimulationId);

  const handleStartSimulation = async (config: SimulationConfig, requestData: SimulationRequest) => {
    try {
      const status: SimulationStatusDTO = await iniciarNuevaSimulacion(requestData);

      if (status && status.simulationId) {
        setSimulationConfig(config);
        setActiveSimulationId(status.simulationId);
        
        // Save the simulation ID to the global store
        setSimulationId(status.simulationId);
      } else {
        console.error("No se recibió un ID de simulación del backend.");
      }
    } catch (error) {
      console.error("Error al iniciar la simulación:", error);
    }
  }

  const hasActiveSolution = !!(simulationConfig && activeSimulationId);

  return (
    <>
      {!hasActiveSolution ? (
        <SimulationConfigForm onStartSimulation={handleStartSimulation} />
      ) : (
        // El nuevo componente SimulationView solo necesita el simulationId
        activeSimulationId && <SimulationView simulationId={activeSimulationId} />
      )}
    </>
  )
}
