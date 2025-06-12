"use client"

import { useState, useEffect } from "react"
import { SimulationMap } from "@/components/features/simulation/components/simulation-map"
import { SimulationControls } from "@/components/features/simulation/components/simulation-controls"
import { formatSimulationTime } from "@/utils/timeUtils"
import { 
  SimulacionSnapshotDTO, 
  PedidoDTO, 
  TruckDTO, 
  TanqueDTO, 
  BloqueoDTO 
} from "@/types/types"

const BACKEND = 'http://localhost:8080'

interface SimulationConfig {
  escenario: 'semanal' | 'colapso'
  fechaInicio: string
  fechaFinal?: string
}

interface SimulationViewProps {
  config: SimulationConfig
}

export function SimulationView({ config }: SimulationViewProps) {
  // Estados de la simulación
  const [pedidos, setPedidos] = useState<PedidoDTO[]>([])
  const [camiones, setCamiones] = useState<TruckDTO[]>([])
  const [tanques, setTanques] = useState<TanqueDTO[]>([])
  const [bloqueos, setBloqueos] = useState<BloqueoDTO[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [tiempoActual, setTiempoActual] = useState(0)

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
    return config.escenario === 'semanal' ? 'Simulación Semanal' : 'Simulación al Colapso'
  }

  const getDateInfo = () => {
    if (config.escenario === 'semanal' && config.fechaFinal) {
      return `Fecha inicio: ${formatDate(config.fechaInicio)} - Fecha fin: ${formatDate(config.fechaFinal)}`
    } else {
      return `Fecha inicio: ${formatDate(config.fechaInicio)}`
    }
  }

  // Lógica de simulación
  useEffect(() => {
    if (!isRunning || isPaused) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND}/api/simulacion/step`, { method: "POST" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const snapshot: SimulacionSnapshotDTO = await res.json()

        setTiempoActual(snapshot.tiempoActual)
        setCamiones(snapshot.camiones)
        setPedidos(snapshot.pedidos)
        setBloqueos(snapshot.bloqueos)

        const tanquesDTO: TanqueDTO[] = Array.isArray(snapshot.tanques)
          ? snapshot.tanques.map((t: TanqueDTO, idx: number) => ({
              id: t.id ?? `tanque-${idx}`,
              nombre: t.nombre ?? `Tanque ${idx + 1}`,
              posX: t.posX,
              posY: t.posY,
              capacidadTotal: t.capacidadTotal,
              capacidadDisponible: t.capacidadDisponible,
            }))
          : []
        setTanques(tanquesDTO)

        // Detección de eventos
        snapshot.pedidos.forEach((p) => {
          if (p.tiempoCreacion === snapshot.tiempoActual) {
            console.log(
              `🆕 Pedido ${p.id} recibido en (${p.x}, ${p.y}), ` +
              `volumen=${p.volumen} m³, límite t+${p.tiempoLimite}`
            )
          }
        })

        snapshot.bloqueos.forEach((b) => {
          if (b.tiempoInicio === snapshot.tiempoActual) {
            console.log(`⛔ Bloqueo ${b.id} comienza en t+${b.tiempoInicio}`)
          }
        })
      } catch (err) {
        console.error("❌ Falló step en frontend:", err)
        clearInterval(interval)
        setIsRunning(false)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [isRunning, isPaused])

  // Handlers para controles de simulación
  const handlePlay = async () => {
    if (!isRunning) {
      // Primera vez o después de stop - inicializar simulación
      try {
        // Resetear en t = 0
        const r0 = await fetch(`${BACKEND}/api/simulacion/reset`, { method: "POST" })
        if (!r0.ok) throw new Error(`HTTP ${r0.status}`)

        // Avanzar a t = 1440
        for (let i = 0; i < 1440; i++) {
          const rStep = await fetch(`${BACKEND}/api/simulacion/step`, { method: "POST" })
          if (!rStep.ok) throw new Error(`Step falló en iteración ${i}, HTTP ${rStep.status}`)
        }

        // Obtener snapshot final
        const rFinal = await fetch(`${BACKEND}/api/simulacion/step`, { method: "POST" })
        if (!rFinal.ok) throw new Error(`HTTP ${rFinal.status}`)
        const finalSnapshot: SimulacionSnapshotDTO = await rFinal.json()

        // Actualizar estado
        setTiempoActual(finalSnapshot.tiempoActual)
        setCamiones(finalSnapshot.camiones)
        setPedidos(finalSnapshot.pedidos)
        setBloqueos(finalSnapshot.bloqueos)
        setTanques(finalSnapshot.tanques)

        setIsRunning(true)
        setIsPaused(false)
      } catch (err) {
        console.error("❌ Error al inicializar simulación:", err)
      }
    } else {
      // Reanudar desde pausa
      setIsPaused(false)
    }
  }

  const handlePause = () => {
    if (isRunning && !isPaused) {
      setIsPaused(true)
    }
  }

  const handleStop = () => {
    setIsRunning(false)
    setIsPaused(false)
    setTiempoActual(0)
    setPedidos([])
    setCamiones([])
    setTanques([])
    setBloqueos([])
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{getTitle()}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            <span>{getDateInfo()}</span>
            <span>Tiempo transcurrido: {formatSimulationTime(tiempoActual)}</span>
            <span>Flota: {camiones.length} 🚛</span>
            <span>Pedidos pendientes: {pedidos.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SimulationMap 
            pedidos={pedidos}
            camiones={camiones}
            tanques={tanques}
            bloqueos={bloqueos}
            tiempoActual={tiempoActual}
            isRunning={isRunning}
            isPaused={isPaused}
          />
        </div>
        
        <div className="xl:col-span-1">
          <SimulationControls 
            pedidos={pedidos}
            camiones={camiones}
            isRunning={isRunning}
            isPaused={isPaused}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
          />
        </div>
      </div>
    </div>
  )
}
