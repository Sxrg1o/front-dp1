"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Route, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react"
import { useMapInteraction } from "@/hooks/use-map-interaction"
import { TruckLayer, TankLayer, OrderLayer, BlockageLayer, RouteLayer } from "./map/layers"
import { TruckModal, TankModal, BreakdownModal, OrderModal, useMapModals } from "./map/modals"
import { useAppStore } from "@/store/appStore"
import { SimulationControls } from "./simulation-controls"

const BASE_GRID_SIZE = 15 
const GRID_COLS = 71 
const GRID_ROWS = 51

interface SimulationMapProps {
  isPanelMinimized: boolean;
  togglePanelMinimized: () => void;
}

export function SimulationMap({ isPanelMinimized, togglePanelMinimized }: SimulationMapProps) {
  const mode = useAppStore((state) => state.mode);
  // Obtener el tiempo actual directamente del store global para pasarlo a los modales
  const tiempoActual = useAppStore((state) => 
  mode === 'simulation' 
    ? state.simulation.tiempoActual 
    : state.operational.tiempoActual
);

  
  const {
    zoomLevel, panOffset, GRID_SIZE, mapWidth, mapHeight, mapContainerRef,
    handleZoomIn, handleZoomOut, handleResetZoom, handleMouseDown, handleMouseMove, handleMouseUp, setupWheelEventListener,
  } = useMapInteraction({
    gridCols: GRID_COLS, gridRows: GRID_ROWS, baseGridSize: BASE_GRID_SIZE,
    initialZoom: 100, minZoom: 80, maxZoom: 200, zoomStep: 5
  })

  // Hook para manejar modales
  const {
    showTruckModal, showTankModal, showBreakdownModal, showOrderModal, 
    selectedTruck, selectedTank, selectedBreakdown, selectedOrder, breakdownTypes,
    handleTruckClick, handleTankClick, handleBreakdown, handleOrderClick, 
    closeTruckModal, closeTankModal, closeBreakdownModal, closeOrderModal,
    setSelectedBreakdown, getTankColor, getTankBadgeVariant, getTankBackgroundColor, getTruckColorClass
  } = useMapModals()

  const [zoomControlsMinimized, setZoomControlsMinimized] = useState(false)

  // Configurar el event listener para el wheel
  useEffect(() => {
    return setupWheelEventListener()
  }, [setupWheelEventListener])

  return (
    <>
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="relative overflow-hidden border border-gray-300 rounded-lg cursor-grab active:cursor-grabbing select-none touch-none bg-white h-[80vh]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Zoom Controls - Con botón de minimizar/expandir horizontalmente */}
        <div className="absolute left-3 top-3 z-10 flex items-center bg-white bg-opacity-80 backdrop-blur-sm rounded-md shadow-md transition-all duration-300 ease-in-out">
          {/* Contenedor para los botones de zoom */}
          <div className={`flex flex-col items-center gap-2 p-2 overflow-hidden transition-all duration-300 ${zoomControlsMinimized ? 'max-w-0 opacity-0 px-0' : 'max-w-[80px] opacity-100'}`}>

            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-center">{zoomLevel}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetZoom} className="mt-1">
              Reset
            </Button>
          </div>
          
          <Button variant="ghost" size="sm" onClick={() => setZoomControlsMinimized(!zoomControlsMinimized)} 
            className="h-8 w-8 p-1 flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600">
            {zoomControlsMinimized ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="absolute right-3 top-3 z-10 flex h-auto bg-white bg-opacity-80 backdrop-blur-sm rounded-md shadow-md transition-all duration-300 ease-in-out">
          {/* Botón para minimizar/expandir siempre visible */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={togglePanelMinimized}
            className="self-start h-8 w-8 p-1 mt-2 flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600"
          >
            {isPanelMinimized ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          
          {/* Contenedor del panel que se contrae */}
          <div 
            className={`transition-all duration-300 ease-in-out ${isPanelMinimized ? 'max-w-0 w-0 opacity-0 invisible' : 'max-w-[500px] w-full md:w-[33vw] opacity-100 visible'}`}
            style={{ minWidth: isPanelMinimized ? 0 : '280px' }}
          >
            <div className="max-h-[calc(80vh-24px)] overflow-auto">
              <SimulationControls />
            </div>
          </div>
        </div>

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

          <RouteLayer 
            GRID_SIZE={GRID_SIZE}
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
