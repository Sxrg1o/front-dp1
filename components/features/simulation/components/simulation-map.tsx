"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, Truck, Fuel, MapPin } from "lucide-react"
import { useWebSocket } from "@/hooks/use-websocket"
import { useMapInteraction } from "@/hooks/use-map-interaction"
import { 
  SimulacionSnapshotDTO, 
  PedidoDTO, 
  CamionDTO, 
  TanqueDTO, 
  BloqueoDTO 
} from "@/types/types"

const BACKEND = 'http://localhost:8080'
const BASE_GRID_SIZE = 15 
const GRID_COLS = 70 
const GRID_ROWS = 50

export function SimulationMap() {
  const { isConnected } = useWebSocket()
  
  const {
    zoomLevel, panOffset, isDragging, GRID_SIZE, mapWidth, mapHeight, mapContainerRef,
    handleZoomIn, handleZoomOut, handleResetZoom, handleMouseDown, handleMouseMove, handleMouseUp, setupWheelEventListener,
  } = useMapInteraction({
    gridCols: GRID_COLS, gridRows: GRID_ROWS, baseGridSize: BASE_GRID_SIZE,
    initialZoom: 100, minZoom: 25, maxZoom: 300, zoomStep: 25
  })

  // Estados específicos de la simulación
  const [pedidos, setPedidos] = useState<PedidoDTO[]>([])
  const [camiones, setCamiones] = useState<CamionDTO[]>([])
  const [tanques, setTanques] = useState<TanqueDTO[]>([])
  const [showTruckModal, setShowTruckModal] = useState(false)
  const [showTankStatus, setShowTankStatus] = useState(false)
  const [selectedTruck, setSelectedTruck] = useState<any>(null)
  const [selectedStation, setSelectedStation] = useState<any>(null)
  const [showBreakdownModal, setShowBreakdownModal] = useState(false)
  const [selectedBreakdown, setSelectedBreakdown] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [tiempoActual, setTiempoActual] = useState(0)
  const [bloqueos, setBloqueos] = useState<BloqueoDTO[]>([])

  const activeBlockages = bloqueos.filter(
    (b) => tiempoActual >= b.tiempoInicio && tiempoActual < b.tiempoFin
  )

  // Transformar camiones a currentVehicles
  const currentVehicles = Array.isArray(camiones)
    ? camiones
        .filter((c) => c && typeof c.id === "string")
        .map((c: CamionDTO) => {
          const id = c.id
          const x = c.x
          const y = c.y
          const fuelLevel = c.volumenDisponible
          const status = c.estado
          const type =
            typeof id === "string" && id.startsWith("TA") ? "TA" :
            typeof id === "string" && id.startsWith("TB") ? "TB" :
            typeof id === "string" && id.startsWith("TC") ? "TC" :
            typeof id === "string" && id.startsWith("TD") ? "TD" :
            "??"
          const color =
            status === "AVAILABLE" ? "green" :
            status === "RETURNING" ? "yellow" :
            status === "DELIVERING" ? "blue" :
            "purple"
          return { id, x, y, fuelLevel, status, type, color }
        })
    : []

  const breakdownTypes = {
    t1: "Se baja la llanta y se puede reparar en el mismo lugar por el conductor. Este incidente inmoviliza la unidad en el lugar por 2 horas.",
    t2: "Se ahoga (obstruye) el motor. Este incidente inmoviliza la unidad en el lugar por 2 horas. Este incidente deja inoperativo a la unidad por un turno completo en el taller.",
    t3: "Este incidente inmoviliza la unidad en el lugar por 4 horas. Este incidente deja inoperativo a la unidad por un día completo en el taller."
  }

  // Configurar el event listener para el wheel
  useEffect(() => {
    return setupWheelEventListener()
  }, [setupWheelEventListener])

  // Lógica de simulación
  useEffect(() => {
    if (!isRunning) return

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
          ? snapshot.tanques.map((t: any, idx: number) => ({
              id: t.id ?? `tanque-${idx}`,
              nombre: t.name ?? `Tanque ${idx + 1}`,
              posX: t.x,
              posY: t.y,
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
  }, [isRunning])

  // Handlers de eventos
  const handleTruckClick = (truck: any) => {
    setSelectedTruck(truck)
    setShowTruckModal(true)
  }

  const handleStationClick = (station: any) => {
    setSelectedStation(station)
    setShowTankStatus(true)
  }

  const handleBreakdown = () => {
    setShowTruckModal(false)
    setShowBreakdownModal(true)
  }

  const handlePedidoClick = (p: PedidoDTO) => {
    alert(`Pedido ${p.idCliente}:\\nVolumen=${p.volumen}m³\\nLímite t+${p.tiempoLimite}`)
  }

  // Funciones de utilidad para tanques
  const getTankColor = (level: number) => {
    if (level > 50) return "green"
    if (level > 10) return "yellow"
    return "red"
  }

  const getTankBadgeVariant = (level: number) => {
    if (level > 50) return "secondary"
    if (level > 10) return "default"
    return "destructive"
  }

  const getTankBackgroundColor = (level: number) => {
    if (level > 50) return "bg-green-50 border-green-200"
    if (level > 10) return "bg-yellow-50 border-yellow-200"
    return "bg-red-50 border-red-200"
  }

  const getTruckColorClass = (color: string) => {
    const colorMap = {
      green: "text-green-600",
      yellow: "text-yellow-600", 
      blue: "text-blue-600",
      purple: "text-purple-600"
    }
    return colorMap[color as keyof typeof colorMap] || "text-blue-600"
  }

  return (
    <>
      <Card className="h-lv py-4">
        <CardContent className="px-4">
          {/* Zoom Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">{zoomLevel}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetZoom}>
                Reset
              </Button>
              
              {/* WebSocket Connection Status */}
              <div className="flex items-center gap-2 ml-4">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Arrastrar para mover • Rueda para zoom
            </div>
            
            {/* Controles de simulación */}
            <div className="flex items-center gap-4">
              <Button
                onClick={async () => {
                  if (isRunning) {
                    setIsRunning(false)
                    return
                  }

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
                    const snapshot: SimulacionSnapshotDTO = await rFinal.json()

                    // Actualizar estado
                    setTiempoActual(snapshot.tiempoActual)
                    setCamiones(snapshot.camiones)
                    setPedidos(snapshot.pedidos)
                    setBloqueos(snapshot.bloqueos)
                    setTanques(snapshot.tanques)

                    setIsRunning(true)
                  } catch (err) {
                    console.error("❌ Error al saltar a t=1440:", err)
                  }
                }}
              >
                {isRunning ? "Detener Simulación" : "Iniciar Simulación"}
              </Button>
              
              <div className="text-sm text-gray-600">
                Tiempo simulado: {tiempoActual} min
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div
            ref={mapContainerRef}
            className="relative overflow-hidden border border-gray-300 rounded-lg cursor-grab active:cursor-grabbing select-none touch-none"
            style={{ height: "600px" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div
              className="relative will-change-transform"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                transformOrigin: "center center",
                width: `${mapWidth}px`,
                height: `${mapHeight}px`,
              }}
            >
              {/* Grid background */}
              <div
                className="absolute inset-0 border border-gray-300 pointer-events-none"
                style={{
                  width: `${mapWidth}px`,
                  height: `${mapHeight}px`,
                  backgroundImage: `
                    linear-gradient(to right, rgba(156, 163, 175, 0.3) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(156, 163, 175, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
                }}
              />

              {/* Bloqueos dinámicos */}
              {activeBlockages.map((b) =>
                b.nodes.map((pt, idx) => (
                  <div
                    key={`${b.id}-${idx}`}
                    className="absolute bg-red-500 pointer-events-none"
                    style={{
                      left: `${pt.x * GRID_SIZE + 1}px`,
                      top: `${pt.y * GRID_SIZE + 1}px`,
                      width: `${GRID_SIZE}px`,
                      height: `${GRID_SIZE}px`,
                    }}
                    title={`${b.description} [t=${b.tiempoInicio}-${b.tiempoFin})`}
                  />
                ))
              )}

              {/* SVG overlay para líneas de bloqueo */}
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ width: `${GRID_SIZE * GRID_COLS}px`, height: `${GRID_SIZE * GRID_ROWS}px` }}
              >
                {activeBlockages.map((b) =>
                  b.nodes.slice(0, -1).map((pt, i) => {
                    const next = b.nodes[i + 1]
                    const x1 = pt.x * GRID_SIZE + GRID_SIZE / 2
                    const y1 = pt.y * GRID_SIZE + GRID_SIZE / 2
                    const x2 = next.x * GRID_SIZE + GRID_SIZE / 2
                    const y2 = next.y * GRID_SIZE + GRID_SIZE / 2
                    return (
                      <line
                        key={`${b.id}-${i}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="red"
                        strokeWidth={2}
                      />
                    )
                  })
                )}
              </svg>

              {/* Camiones */}
              {currentVehicles?.map((truck) => (
                <div
                  key={`truck-${truck.id}`}
                  className="absolute cursor-pointer hover:scale-110 transition-transform z-30 flex items-center justify-center pointer-events-auto"
                  style={{
                    top: `${truck.y * GRID_SIZE + 1}px`,
                    left: `${truck.x * GRID_SIZE + 1}px`,
                    width: `${GRID_SIZE}px`,
                    height: `${GRID_SIZE}px`,
                    imageRendering: "crisp-edges",
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTruckClick(truck)
                  }}
                  title={`Camión ${truck.id} (${truck.type})`}
                >
                  <Truck
                    className={getTruckColorClass(truck.color)}
                    size={Math.max(12, Math.min(32, GRID_SIZE - 2))}
                  />
                </div>
              ))}

              {/* Tanques */}
              {tanques.map((station: TanqueDTO) => (
                <div
                  key={station.id}
                  className="absolute cursor-pointer hover:scale-110 transition-transform z-20 flex items-center justify-center pointer-events-auto"
                  style={{
                    top: `${station.posY * GRID_SIZE + 1}px`,
                    left: `${station.posX * GRID_SIZE + 1}px`,
                    width: `${GRID_SIZE}px`,
                    height: `${GRID_SIZE}px`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStationClick(station)
                  }}
                  title={station.nombre}
                >
                  <Fuel
                    className="text-green-600"
                    size={Math.max(12, Math.min(32, GRID_SIZE - 2))}
                  />
                </div>
              ))}

              {/* Pedidos */}
              {pedidos.map((p) => (
                <div
                  key={`pedido-${p.id}`}
                  className="absolute z-10 flex items-center justify-center pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    top: `${p.y * GRID_SIZE + 1}px`,
                    left: `${p.x * GRID_SIZE + 1}px`,
                    width: `${GRID_SIZE}px`,
                    height: `${GRID_SIZE}px`,
                  }}
                  onClick={() => handlePedidoClick(p)}
                  title={`Pedido ${p.idCliente}`}
                >
                  <MapPin 
                    className="text-red-600"
                    size={Math.max(12, Math.min(32, GRID_SIZE - 2))} 
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      <Dialog open={showTruckModal} onOpenChange={setShowTruckModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Información del Camión {selectedTruck?.id}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck
                className={selectedTruck ? getTruckColorClass(selectedTruck.color) : "text-blue-600"}
                size={32}
              />
              <div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Tipo: {selectedTruck?.type}</div>
                  <div>Nivel de combustible: {selectedTruck?.fuelLevel}</div>
                  <div>Estado: {selectedTruck?.status}</div>
                </div>
              </div>
            </div>
            <Button onClick={handleBreakdown} variant="outline">
              Averiar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBreakdownModal} onOpenChange={setShowBreakdownModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Averiar Camión {selectedTruck?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="breakdown-type" className="py-2">Tipo de avería</Label>
              <Select value={selectedBreakdown} onValueChange={setSelectedBreakdown}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de avería" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="t1">Tipo 1</SelectItem>
                  <SelectItem value="t2">Tipo 2</SelectItem>
                  <SelectItem value="t3">Tipo 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedBreakdown && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  {breakdownTypes[selectedBreakdown as keyof typeof breakdownTypes]}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setShowBreakdownModal(false)}>
                Confirmar Avería
              </Button>
              <Button variant="outline" onClick={() => setShowBreakdownModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTankStatus} onOpenChange={setShowTankStatus}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Estado del Tanque - {selectedStation?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedStation && (
              <Card className={getTankBackgroundColor(selectedStation.capacidadDisponible)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fuel
                        className={`text-${getTankColor(selectedStation.capacidadDisponible)}-600`}
                        size={24}
                      />
                      <span className="font-medium">
                        {selectedStation.capacidadDisponible > 50 ? 'Operativo' :
                         selectedStation.capacidadDisponible > 10 ? 'Alerta' : 'Emergencia'}
                      </span>
                    </div>
                    <Badge variant={getTankBadgeVariant(selectedStation.capacidadDisponible)}>
                      {selectedStation.capacidadDisponible}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Nivel de GLP: {selectedStation.capacidadDisponible}% - {selectedStation.nombre}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`bg-${getTankColor(selectedStation.capacidadDisponible)}-500 h-2 rounded-full`}
                      style={{ width: `${selectedStation.capacidadDisponible}%` }}
                    ></div>
                  </div>

                  {selectedStation.capacidadDisponible <= 10 && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
                      ⚠️ Nivel crítico de GLP. Reabastecimiento urgente requerido.
                    </div>
                  )}

                  {selectedStation.capacidadDisponible > 10 && selectedStation.capacidadDisponible <= 50 && (
                    <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-700">
                      ⚠️ Nivel bajo de GLP. Programar reabastecimiento.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
