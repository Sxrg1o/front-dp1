"use client"

import { SimulationMap } from "@/components/features/simulation/components/simulation-map"
import { SimulationControls } from "@/components/features/simulation/components/simulation-controls"
import { SimulacionSnapshotDTO } from "@/types/types"

interface SimulationViewProps {
  snapshot: SimulacionSnapshotDTO | null
}

export function SimulationView({ snapshot }: SimulationViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Simulación Semanal</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            <span>Fecha inicio: 01/04/2025</span>
            <span>Duración de la simulación: 00d 10h 11m</span>
            <span>Tiempo transcurrido: 00h 07m 57s</span>
            <span>Flota: 2/2 🚛</span>
            <span>Total de pedidos entregados: 12/30</span>
          </div>
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
    </div>
  )
}
