"use client"

import { useState } from "react"
import { SimulationConfigForm } from "./views/SimulationConfigForm"
import { SimulationView } from "./views/SimulationView"

interface SimulationConfig {
  escenario: 'semanal' | 'colapso'
  fechaInicio: string
  fechaFinal?: string
}

export function SimulacionSection() {
  const [hasActiveSolution, setHasActiveSolution] = useState(false)
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig | null>(null)

  const handleStartSimulation = (config: SimulationConfig) => {
    setSimulationConfig(config)
    setHasActiveSolution(true)
  }

  return (
    <>
      {!hasActiveSolution ? (
        <SimulationConfigForm onStartSimulation={handleStartSimulation} />
      ) : (
        simulationConfig && <SimulationView config={simulationConfig} />
      )}
    </>
  )
}
