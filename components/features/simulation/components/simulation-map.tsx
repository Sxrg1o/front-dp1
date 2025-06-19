"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut } from "lucide-react"
import { useMapInteraction } from "@/hooks/use-map-interaction"
import { TruckLayer, TankLayer, OrderLayer, BlockageLayer } from "./map/layers"
import { TruckModal, TankModal, BreakdownModal, OrderModal, useMapModals } from "./map/modals"
import { useAppStore } from "@/store/appStore" // Importar el store global

const BASE_GRID_SIZE = 15 
const GRID_COLS = 70 
const GRID_ROWS = 50

export function SimulationMap() {
  // Obtener el tiempo actual directamente del store global para pasarlo a los modales
  const tiempoActual = useAppStore((state) => state.simulation.tiempoActual)
  
  const {
    zoomLevel, panOffset, GRID_SIZE, mapWidth, mapHeight, mapContainerRef,
    handleZoomIn, handleZoomOut, handleResetZoom, handleMouseDown, handleMouseMove, handleMouseUp, setupWheelEventListener,
  } = useMapInteraction({
    gridCols: GRID_COLS, gridRows: GRID_ROWS, baseGridSize: BASE_GRID_SIZE,
    initialZoom: 100, minZoom: 25, maxZoom: 300, zoomStep: 25
  })

  // Hook para manejar modales
  const {
    showTruckModal, showTankModal, showBreakdownModal, showOrderModal, 
    selectedTruck, selectedTank, selectedBreakdown, selectedOrder, breakdownTypes,
    handleTruckClick, handleTankClick, handleBreakdown, handleOrderClick, 
    closeTruckModal, closeTankModal, closeBreakdownModal, closeOrderModal,
    setSelectedBreakdown, getTankColor, getTankBadgeVariant, getTankBackgroundColor, getTruckColorClass
  } = useMapModals()

  // Configurar el event listener para el wheel
  useEffect(() => {
    return setupWheelEventListener()
  }, [setupWheelEventListener])

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

              {/* Map Layers */}
              <BlockageLayer 
                GRID_SIZE={GRID_SIZE}
                GRID_COLS={GRID_COLS}
                GRID_ROWS={GRID_ROWS}
              />
              
              <OrderLayer 
                GRID_SIZE={GRID_SIZE}
                onOrderClick={handleOrderClick}
              />
              
              <TankLayer 
                GRID_SIZE={GRID_SIZE}
                onTankClick={handleTankClick}
              />
              
              <TruckLayer 
                GRID_SIZE={GRID_SIZE}
                onTruckClick={handleTruckClick}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      <TruckModal
        isOpen={showTruckModal}
        onClose={closeTruckModal}
        truck={selectedTruck}
        onBreakdown={handleBreakdown}
        getTruckColorClass={getTruckColorClass}
      />

      <BreakdownModal
        isOpen={showBreakdownModal}
        onClose={closeBreakdownModal}
        truck={selectedTruck}
        selectedBreakdown={selectedBreakdown}
        onBreakdownChange={setSelectedBreakdown}
        breakdownTypes={breakdownTypes}
      />

      <TankModal
        isOpen={showTankModal}
        onClose={closeTankModal}
        tank={selectedTank}
        getTankIconClass={getTankColor}
        getTankBadgeVariant={getTankBadgeVariant}
        getTankBackgroundColor={getTankBackgroundColor}
      />

      <OrderModal
        isOpen={showOrderModal}
        onClose={closeOrderModal}
        order={selectedOrder}
        tiempoActual={tiempoActual}
      />
    </>
  )
}
