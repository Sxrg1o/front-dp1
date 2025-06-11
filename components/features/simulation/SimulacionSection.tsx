"use client"

import { useState } from "react"
import { SimulationConfigForm } from "./views/SimulationConfigForm"
import { SimulationView } from "./views/SimulationView"
import { SimulacionSnapshotDTO } from "@/types/types"

export function SimulacionSection() {
  const [hasActiveSolution, setHasActiveSolution] = useState(false)
  const [snapshot, setSnapshot] = useState<SimulacionSnapshotDTO | null>(null)

  const handleStartSimulation = () => {
    setHasActiveSolution(true)
  }

  return (
    <>
      {!hasActiveSolution ? (
        <SimulationConfigForm onStartSimulation={handleStartSimulation} />
      ) : (
        <SimulationView snapshot={snapshot} />
      )}
    </>
  )
}
