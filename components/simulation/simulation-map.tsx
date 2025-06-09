"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { ZoomIn, ZoomOut, Truck, Fuel, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useWebSocket } from "@/hooks/use-websocket"
import type { BloqueoDTO, CamionDTO, PedidoDTO, TanqueDTO } from "@/lib/types"
import type { SimulacionSnapshotDTO } from "@/lib/types";
const BACKEND = process.env.NEXT_PUBLIC_SIM_BACKEND_URL!;

const BASE_GRID_SIZE = 15 
const GRID_COLS = 70 
const GRID_ROWS = 50

export function SimulationMap() {
  const {isConnected } = useWebSocket()
  const [pedidos, setPedidos] = useState<PedidoDTO[]>([])
  const [camiones, setCamiones] = useState<CamionDTO[]>([])
  const [tanques, setTanques] = useState<TanqueDTO[]>([])
  const [bloqueos, setBloqueos] = useState<BloqueoDTO[]>([])
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showTruckModal, setShowTruckModal] = useState(false)
  const [showTankStatus, setShowTankStatus] = useState(false)
  const [selectedTruck, setSelectedTruck] = useState<any>(null)
  const [selectedStation, setSelectedStation] = useState<any>(null)
  const [showBreakdownModal, setShowBreakdownModal] = useState(false)
  const [selectedBreakdown, setSelectedBreakdown] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [tiempoActual, setTiempoActual] = useState(0)
  const activeBlockages = bloqueos.filter(
      (b) => tiempoActual >= b.inicio && tiempoActual < b.fin
  );

  // Ahora, para transformar esa lista en “currentVehicles” (lo que se dibujará):
  const currentVehicles = Array.isArray(camiones)
      ? camiones
          .filter((c) => c && typeof c.id === "string")
          .map((c: CamionDTO) => {
            const id = c.id;
            const x = c.x;
            const y = c.y;
            const fuelLevel = c.volumenDisponible; // ✅ real
            const status = c.estado;                   // ✅ real
            const type =
                typeof id === "string" && id.startsWith("TA") ? "TA" :
                    typeof id === "string" && id.startsWith("TB") ? "TB" :
                        typeof id === "string" && id.startsWith("TC") ? "TC" :
                            typeof id === "string" && id.startsWith("TD") ? "TD" :
                                "??";
            const color =
                status === "AVAILABLE"  ? "green"  :
                    status === "RETURNING"  ? "yellow" :
                        status === "DELIVERING" ? "blue"   :
                            "purple";
            return { id, x, y, fuelLevel, status, type, color };
          })
      : [];// Si camiones no es array (todavía), devolvemos array vacío.


  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const GRID_SIZE = Math.round(BASE_GRID_SIZE * (zoomLevel / 100))
  const mapWidth = GRID_COLS * GRID_SIZE
  const mapHeight = GRID_ROWS * GRID_SIZE

  const breakdownTypes = {
    t1: "Se baja la llanta y se puede reparar en el mismo lugar por el conductor. Este incidente inmoviliza la unidad en el lugar por 2 horas.",
    t2: "Se ahoga (obstruye) el motor. Este incidente inmoviliza la unidad en el lugar por 2 horas. Este incidente deja inoperativo a la unidad por un turno completo en el taller.",
    t3: "Este incidente inmoviliza la unidad en el lugar por 4 horas. Este incidente deja inoperativo a la unidad por un día completo en el taller."
  }

  const throttleRef = useRef<number | null>(null)
  const wheelThrottleRef = useRef<number | null>(null)
  const wheelDebounceRef = useRef<number | null>(null)

  const constrainPanOffset = useCallback((offset: { x: number, y: number }) => {
    if (!mapContainerRef.current) return offset
    
    const containerRect = mapContainerRef.current.getBoundingClientRect()
    let newOffsetX = offset.x
    let newOffsetY = offset.y
  
    if (mapWidth > containerRect.width) {
      const maxOffsetX = (mapWidth - containerRect.width) / 2
      newOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, offset.x))
    } else {
      newOffsetX = (containerRect.width - mapWidth) / 2
    }
    
    if (mapHeight > containerRect.height) {
      const maxOffsetY = (mapHeight - containerRect.height) / 2
      newOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, offset.y))
    } else {
      newOffsetY = (containerRect.height - mapHeight) / 2
    }
    
    return { x: newOffsetX, y: newOffsetY }
  }, [mapWidth, mapHeight])

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND}/api/simulacion/step`, { method: "POST" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const snapshot: SimulacionSnapshotDTO = await res.json();

        // 1) Actualiza el estado normal:
        setTiempoActual(snapshot.tiempoActual);
        setCamiones(snapshot.camiones);
        setPedidos(snapshot.pedidos);
        setBloqueos(snapshot.bloqueos);
        const tanquesDTO: TanqueDTO[] = Array.isArray(snapshot.tanques)
            ? snapshot.tanques.map((t: any, idx: number) => ({
              id:                t.id ?? `tanque-${idx}`,       // <— obligatorio
              nombre:            t.name ?? `Tanque ${idx + 1}`,   // o t.nombre si el back lo manda
              posX:              t.x,
              posY:              t.y,
              capacidadTotal:    t.capacidadTotal,
              capacidadActual:   t.capacidadDisponible,
            }))
            : [];
        setTanques(tanquesDTO);

        // 2) AÑADE AQUÍ la detección de “llegada de nuevo pedido”:
        snapshot.pedidos.forEach((p) => {
          // Suponiendo que PedidoDTO tiene un campo 'tiempoCreacion'
          if (p.tiempoCreacion === snapshot.tiempoActual) {
            console.log(
                `🆕 Pedido ${p.id} recibido en (${p.x}, ${p.y}), ` +
                `volumen=${p.volumen} m³, límite t+${p.tiempoLimite}`
            );
          }
        });

        // 3) (Opcional) más logs, por ejemplo, si quieres mostrar cuando se dispara
        //    un evento de bloqueo, avería, etc., igual buscarías el campo correspondiente:
        snapshot.bloqueos.forEach((b) => {
          if (b.inicio === snapshot.tiempoActual) {
            console.log(
                `⛔ Bloqueo ${b.id} comienza en () a t+${b.inicio}`
            );
          }
        });

        // Por último, cualquier otro log que te interese...
      } catch (err) {
        console.error("❌ Falló step en frontend:", err);
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning]);
  useEffect(() => {
    return () => {
      if (throttleRef.current) {
        cancelAnimationFrame(throttleRef.current)
      }
      if (wheelThrottleRef.current) {
        cancelAnimationFrame(wheelThrottleRef.current)
      }
      if (wheelDebounceRef.current) {
        clearTimeout(wheelDebounceRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const correctedOffset = constrainPanOffset(panOffset)
    if (correctedOffset.x !== panOffset.x || correctedOffset.y !== panOffset.y) {
      setPanOffset(correctedOffset)
    }
  }, [zoomLevel, constrainPanOffset, panOffset])

  useEffect(() => {
    const handleResize = () => {
      setPanOffset(prev => constrainPanOffset(prev))
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [constrainPanOffset])

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 300))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 25))
  }

  const handleResetZoom = () => {
    setZoomLevel(100)
    setPanOffset({ x: 0, y: 0 })
  }
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { 
      setIsDragging(true)
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
      e.preventDefault()
      e.stopPropagation()
    }
  }, [panOffset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && mapContainerRef.current) {
      if (throttleRef.current) return
      
      throttleRef.current = requestAnimationFrame(() => {
        const newOffset = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        }
        
        const constrainedOffset = constrainPanOffset(newOffset)
        setPanOffset(constrainedOffset)
        throttleRef.current = null
      })
      e.preventDefault()
      e.stopPropagation()
    }
  }, [isDragging, dragStart, constrainPanOffset])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    setIsDragging(false)
    if (throttleRef.current) {
      cancelAnimationFrame(throttleRef.current)
      throttleRef.current = null
    }
    e.preventDefault()
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (wheelThrottleRef.current) return

    wheelThrottleRef.current = requestAnimationFrame(() => {
      const delta = e.deltaY > 0 ? -25 : 25
      setZoomLevel((prev) => {
        const newZoom = Math.max(25, Math.min(300, prev + delta))
        return newZoom
      })
      wheelThrottleRef.current = null
    })

    if (wheelDebounceRef.current) {
      clearTimeout(wheelDebounceRef.current)
    }

    wheelDebounceRef.current = setTimeout(() => {
      setPanOffset(prev => constrainPanOffset(prev))
    }, 150) as any
  }, [constrainPanOffset])
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    // Creamos un handler nativo validado
    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      // Convertimos al tipo React.WheelEvent para reutilizar tu lógica
      handleWheel((e as unknown) as React.WheelEvent<HTMLDivElement>);
    };
    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheelNative);
    };
  }, [handleWheel]);

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
  const handlePedidoClick = (p: PedidoDTO) => {
    // Aquí p.es tu PedidoDTO con id, idCliente, volumen, etc.
    alert(`Pedido ${p.idCliente}:\nVolumen=${p.volumen}m³\nLímite t+${p.tiempoLimite}`);
  };
  useEffect(() => {
    if (mapContainerRef.current) {
      const initialOffset = constrainPanOffset({ x: 0, y: 0 })
      setPanOffset(initialOffset)
    }
  }, [constrainPanOffset])
  useEffect(() => {
    return () => {
      setZoomLevel(100)
      setPanOffset({ x: 0, y: 0 })
      setShowTruckModal(false)
      setShowTankStatus(false)
      setShowBreakdownModal(false)
      setSelectedTruck(null)
      setSelectedStation(null)
      setSelectedBreakdown("")
    }
  }, [])

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
            {/* … dentro de tu return( … ) */}
            <div className="mt-4 flex justify-center">
              <Button
                  onClick={async () => {
                    try {
                      // 1) Resetear en t = 0
                      const r0 = await fetch(`${BACKEND}/api/simulacion/reset`, { method: "POST" });
                      if (!r0.ok) throw new Error(`HTTP ${r0.status}`);

                      // 2) Avanzar 1440 veces (un paso por minuto) para llegar a t = 1440
                      for (let i = 0; i < 1440; i++) {
                        const rStep = await fetch(`${BACKEND}/api/simulacion/step`, { method: "POST" });
                        if (!rStep.ok) throw new Error(`Step falló en iteración ${i}, HTTP ${rStep.status}`);
                      }

                      // 3) Obtener el snapshot en t = 1440
                      const rFinal = await fetch(`${BACKEND}/api/simulacion/step`, { method: "POST" });
                      if (!rFinal.ok) throw new Error(`HTTP ${rFinal.status}`);
                      const snapshot: SimulacionSnapshotDTO = await rFinal.json();

                      // 4) Rellenar el estado de React con ese snapshot
                      setTiempoActual(snapshot.tiempoActual);
                      setCamiones(snapshot.camiones);
                      setPedidos(snapshot.pedidos);
                      setBloqueos(snapshot.bloqueos);
                      setTanques(snapshot.tanques);

                      // 5) Ahora sí activamos el loop normal que hace un step cada 500 ms
                      setIsRunning(true);
                    } catch (err) {
                      console.error("❌ Error al saltar a t=1440:", err);
                    }
                  }}
              >
                {isRunning ? "Detener Simulación" : "Iniciar Simulación"}
              </Button>
            </div>
            <div className="text-sm text-gray-600 ml-4">
              Tiempo simulado: {tiempoActual} min
            </div>
          </div>

          {/* Map Container with crisp zoom rendering */}
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
              {/* Crisp grid background that scales with zoom */}
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
              {/* Bloqueos dinámicos desde snapshot.bloqueos */}
              {activeBlockages.map((b, bi) =>
                  b.nodes.map((pt, idx) => (
                      <div
                          key={`${b.id}-${idx}`}
                          className="absolute bg-red-500 pointer-events-none"
                          style={{
                            left:  `${pt.x * GRID_SIZE + 1}px`,
                            top:   `${pt.y * GRID_SIZE + 1}px`,
                            width: `${GRID_SIZE}px`,
                            height:`${GRID_SIZE}px`,
                          }}
                          title={`${b.descripcion} [t=${b.inicio}–${b.fin})`}
                      />
                  ))
              )}


              {/* Crisp trucks with zoom-aware sizing */}
              {currentVehicles?.map((truck) => (
                  <div
                      key={`truck-${truck.id}`}
                      className="absolute …"
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


              {/* Crisp gas stations with zoom-aware sizing */}
              {tanques.map(station => (
                  <div
                      key={station.id}
                      className="absolute cursor-pointer z-20 transform hover:scale-110"
                      style={{
                        left:  `${station.posX * GRID_SIZE + 1}px`,
                        top:   `${station.posY * GRID_SIZE + 1}px`,
                        width:  `${GRID_SIZE}px`,
                        height: `${GRID_SIZE}px`,
                      }}
                      onClick={() => handleStationClick(station)}
                      title={`${station.nombre}: ${station.capacidadActual}%`}
                  >
                    <Fuel
                        size={Math.max(12, Math.min(32, GRID_SIZE - 2))}
                    />
                  </div>
              ))}

              {/* Tanques reales */}
              {tanques?.map((station: any) => (
                  <div
                      key={`station-${station.posX}-${station.posY}`}
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
                    <Fuel className="text-green-600" size={Math.max(12, Math.min(32, GRID_SIZE - 2))} />
                  </div>
              ))}

              {/* Puntos de entrega reales */}
              {/* Pedidos activos */}
              {pedidos.map((p) => (
                  <div
                      key={`pedido-${p.id}`}
                      className="absolute z-10 flex items-center justify-center pointer-events-auto"
                      style={{
                        top:    `${p.y * GRID_SIZE + 1}px`,
                        left:   `${p.x * GRID_SIZE + 1}px`,
                        width:  `${GRID_SIZE}px`,
                        height: `${GRID_SIZE}px`,
                      }}
                      onClick={() => handlePedidoClick(p)}
                      title={`Pedido ${p.idCliente}`}
                  >
                    <MapPin size={Math.max(12, Math.min(32, GRID_SIZE - 2))} />
                  </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Truck Modal with color matching */}
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
                  <div>Pedidos pendientes: {selectedTruck?.pendingOrders}</div>
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

      {/* Breakdown Modal */}
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

      {/* Smart Tank Status Modal - Shows single tank with smart coloring */}
      <Dialog open={showTankStatus} onOpenChange={setShowTankStatus}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Estado del Tanque - {selectedStation?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedStation && (
              <Card className={getTankBackgroundColor(selectedStation.glpLevel)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fuel
                        className={`text-${getTankColor(selectedStation.glpLevel)}-600`}
                        size={24}
                      />
                      <span className="font-medium">
                        {selectedStation.glpLevel > 50 ? 'Operativo' :
                         selectedStation.glpLevel > 10 ? 'Alerta' : 'Emergencia'}
                      </span>
                    </div>
                    <Badge variant={getTankBadgeVariant(selectedStation.glpLevel)}>
                      {selectedStation.glpLevel}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Nivel de GLP: {selectedStation.glpLevel}% - {selectedStation.name}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`bg-${getTankColor(selectedStation.glpLevel)}-500 h-2 rounded-full`}
                      style={{ width: `${selectedStation.glpLevel}%` }}
                    ></div>
                  </div>

                  {selectedStation.glpLevel <= 10 && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
                      ⚠️ Nivel crítico de GLP. Reabastecimiento urgente requerido.
                    </div>
                  )}

                  {selectedStation.glpLevel > 10 && selectedStation.glpLevel <= 50 && (
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
