"use client"

import { useState, useRef, useCallback } from "react"
import { ZoomIn, ZoomOut, Truck, Fuel, Home, MapPin, Slash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const GRID_SIZE = 15 
const GRID_COLS = 70 
const GRID_ROWS = 50 

const mockTrucks = [
  { id: "#040", x: 15, y: 10, pendingOrders: "2/5", fuelLevel: "Alto", status: "Operativo", type: "T1", color: "green" },
  { id: "#041", x: 12, y: 7, pendingOrders: "3/5", fuelLevel: "Medio", status: "Operativo", type: "T2", color: "yellow" },
  { id: "#042", x: 20, y: 12, pendingOrders: "1/5", fuelLevel: "Bajo", status: "En ruta", type: "T3", color: "blue" },
]

const mockGasStations = [
  { id: "GS001", x: 10, y: 5, name: "Planta Central", glpLevel: 75 },
  { id: "GS002", x: 20, y: 15, name: "Estación Norte", glpLevel: 25 },
  { id: "GS003", x: 25, y: 12, name: "Estación Sur", glpLevel: 8 },
]

const mockDeliveryPoints = [
  { id: "DP001", x: 17, y: 6, name: "Punto de entrega 1" },
  { id: "DP002", x: 9, y: 14, name: "Punto de entrega 2" },
  { id: "DP003", x: 22, y: 19, name: "Punto de entrega 3" },
]


const mockRoutes = [
  {
    id: "R001",
    truckId: "#040",
    color: "green",
    path: [
      { x: 15, y: 10 }, { x: 16, y: 10 }, { x: 17, y: 10 }, { x: 17, y: 9 }, { x: 17, y: 8 },
      { x: 17, y: 7 }, { x: 17, y: 6 }
    ]
  },
  {
    id: "R002", 
    truckId: "#041",
    color: "yellow",
    path: [
      { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }, { x: 9, y: 8 },
      { x: 9, y: 9 }, { x: 9, y: 10 }, { x: 9, y: 11 }, { x: 9, y: 12 }, { x: 9, y: 13 }, { x: 9, y: 14 }
    ]
  }
]

const mockBlockages = [
  {
    id: "BL001",
    description: "Bloqueo de carretera",
    path: [
      { x: 13, y: 9 }, { x: 14, y: 9 }, { x: 15, y: 9 }, { x: 16, y: 9 }
    ]
  },
  {
    id: "BL002", 
    description: "Manifestación",
    path: [
      { x: 14, y: 11 }, { x: 14, y: 12 }, { x: 15, y: 12 }
    ]
  }
]

export function SimulationMap() {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showTruckModal, setShowTruckModal] = useState(false)
  const [showTankStatus, setShowTankStatus] = useState(false)
  const [selectedTruck, setSelectedTruck] = useState<any>(null)
  const [selectedStation, setSelectedStation] = useState<any>(null)
  const [showBreakdownModal, setShowBreakdownModal] = useState(false)
  const [selectedBreakdown, setSelectedBreakdown] = useState("")
  
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const breakdownTypes = {
    t1: "Se baja la llanta y se puede reparar en el mismo lugar por el conductor. Este incidente inmoviliza la unidad en el lugar por 2 horas.",
    t2: "Se ahoga (obstruye) el motor. Este incidente inmoviliza la unidad en el lugar por 2 horas. Este incidente deja inoperativo a la unidad por un turno completo en el taller.",
    t3: "Este incidente inmoviliza la unidad en el lugar por 4 horas. Este incidente deja inoperativo a la unidad por un día completo en el taller."
  }

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

  const throttleRef = useRef<number | null>(null)
  
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
        const containerRect = mapContainerRef.current!.getBoundingClientRect()
        const mapWidth = GRID_COLS * GRID_SIZE * (zoomLevel / 100)
        const mapHeight = GRID_ROWS * GRID_SIZE * (zoomLevel / 100)
        
        let newOffsetX = e.clientX - dragStart.x
        let newOffsetY = e.clientY - dragStart.y
        
        const maxOffsetX = Math.max(0, (mapWidth - containerRect.width) / 2)
        const maxOffsetY = Math.max(0, (mapHeight - containerRect.height) / 2)
        
        newOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, newOffsetX))
        newOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, newOffsetY))
        
        setPanOffset({ x: newOffsetX, y: newOffsetY })
        throttleRef.current = null
      })
      e.preventDefault()
      e.stopPropagation()
    }
  }, [isDragging, dragStart, zoomLevel])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    setIsDragging(false)
    if (throttleRef.current) {
      cancelAnimationFrame(throttleRef.current)
      throttleRef.current = null
    }
    e.preventDefault()
  }, [])

  const wheelThrottleRef = useRef<number | null>(null)
  
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
  }, [])

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

  const getRouteColorClass = (color: string) => {
    const colorMap = {
      green: "bg-green-500/40",   
      yellow: "bg-yellow-500/40",
      blue: "bg-blue-500/40", 
      purple: "bg-purple-500/40"
    }
    return colorMap[color as keyof typeof colorMap] || "bg-blue-500/40"
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
            </div>
            <div className="text-sm text-gray-600">
              Arrastrar para mover • Rueda para zoom
            </div>
          </div>

          {/* Map Container with optimized event handling */}
          <div 
            ref={mapContainerRef}
            className="relative overflow-hidden border border-gray-300 rounded-lg cursor-grab active:cursor-grabbing select-none touch-none"
            style={{ height: "600px" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div
              className="relative will-change-transform"
              style={{
                transform: `scale(${zoomLevel / 100}) translate(${panOffset.x / (zoomLevel / 100)}px, ${panOffset.y / (zoomLevel / 100)}px)`,
                transformOrigin: "center center", 
                width: `${GRID_COLS * GRID_SIZE}px`,
                height: `${GRID_ROWS * GRID_SIZE}px`,
              }}
            >
              {/* Optimized grid background with minimal re-renders */}
              <div
                className="absolute inset-0 border border-gray-300 pointer-events-none"
                style={{ 
                  width: `${GRID_COLS * GRID_SIZE}px`, 
                  height: `${GRID_ROWS * GRID_SIZE}px`,
                  backgroundImage: `
                    linear-gradient(to right, rgba(156, 163, 175, 0.3) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(156, 163, 175, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
                }}
              />

              {/* Render only route and blockage cells for better performance */}
              {mockRoutes.map((route) => 
                route.path.map((point, index) => (
                  <div
                    key={`route-${route.id}-${index}`}
                    className={`absolute ${getRouteColorClass(route.color)} pointer-events-none`}
                    style={{
                      left: `${point.x * GRID_SIZE}px`,
                      top: `${point.y * GRID_SIZE}px`,
                      width: `${GRID_SIZE}px`,
                      height: `${GRID_SIZE}px`,
                    }}
                    title={`Ruta ${route.id} - Camión ${route.truckId}`}
                  />
                ))
              )}

              {/* Render blockage cells */}
              {mockBlockages.map((blockage) => 
                blockage.path.map((point, index) => (
                  <div
                    key={`blockage-${blockage.id}-${index}`}
                    className="absolute bg-red-500 pointer-events-none"
                    style={{
                      left: `${point.x * GRID_SIZE}px`,
                      top: `${point.y * GRID_SIZE}px`,
                      width: `${GRID_SIZE}px`,
                      height: `${GRID_SIZE}px`,
                    }}
                    title={`Bloqueo: ${blockage.description}`}
                  />
                ))
              )}

              {/* Trucks with improved performance and click handling */}
              {mockTrucks.map((truck) => (
                <div
                  key={`truck-${truck.id}`} 
                  className="absolute cursor-pointer hover:scale-110 transition-transform z-20 flex items-center justify-center pointer-events-auto"
                  style={{ 
                    top: `${truck.y * GRID_SIZE}px`, 
                    left: `${truck.x * GRID_SIZE}px`,
                    width: `${GRID_SIZE}px`,
                    height: `${GRID_SIZE}px`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTruckClick(truck)
                  }}
                  title={`Camión ${truck.id} (${truck.type})`}
                >
                  <Truck 
                    className={getTruckColorClass(truck.color)}
                    size={Math.max(16, GRID_SIZE - 4)}
                  />
                </div>
              ))}

              {/* Gas stations with improved performance and click handling */}
              {mockGasStations.map((station) => (
                <div
                  key={`station-${station.id}`} 
                  className="absolute cursor-pointer hover:scale-110 transition-transform z-20 flex items-center justify-center pointer-events-auto"
                  style={{ 
                    top: `${station.y * GRID_SIZE}px`, 
                    left: `${station.x * GRID_SIZE}px`,
                    width: `${GRID_SIZE}px`,
                    height: `${GRID_SIZE}px`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStationClick(station)
                  }}
                  title={station.name}
                >
                  <Fuel 
                    className="text-green-600"
                    size={Math.max(16, GRID_SIZE - 4)} 
                  />
                </div>
              ))}

              {/* Delivery points with improved performance using MapPin icon */}
              {mockDeliveryPoints.map((point) => (
                <div 
                  key={`delivery-${point.id}`} 
                  className="absolute z-10 flex items-center justify-center pointer-events-none" 
                  style={{ 
                    top: `${point.y * GRID_SIZE}px`, 
                    left: `${point.x * GRID_SIZE}px`,
                    width: `${GRID_SIZE}px`,
                    height: `${GRID_SIZE}px`,
                  }}
                  title={point.name}
                >
                  <MapPin 
                    className="text-red-600"
                    size={Math.max(14, GRID_SIZE - 2)} 
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Truck Modal with color matching */}
      <Dialog open={showTruckModal} onOpenChange={setShowTruckModal}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck 
                className={selectedTruck ? getTruckColorClass(selectedTruck.color) : "text-blue-600"} 
                size={32} 
              />
              <div>
                <h3 className="font-semibold">Camión {selectedTruck?.id}</h3>
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
