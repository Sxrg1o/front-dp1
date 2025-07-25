"use client"

import { useState, useEffect, useRef } from "react"
import { SimulationMap } from "@/components/features/simulation/components/simulation-map"
import { SimulationControls } from "@/components/features/simulation/components/simulation-controls"
import { formatSimulationTime } from "@/utils/timeUtils"
import { useAppStore } from "@/store/appStore"
import { EndSimulationModal } from "@/components/features/simulation/components/EndSimulationModal"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2 } from "lucide-react"

export function SharedMapView() {
  // Estado para la ventana movible
  const [position, setPosition] = useState({ x: window.innerWidth - 350, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleDragging = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleDragging);
      window.addEventListener('mouseup', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDragging);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging]);

  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  
  const togglePanelMinimized = () => {
    setIsPanelMinimized(!isPanelMinimized);
  };
  const mode = useAppStore((state) => state.mode);
  
  const simulationState = useAppStore((state) => state.simulation);
  const operationalState = useAppStore((state) => state.operational);
  const simulationData = useAppStore((state) => state.simulationData);
  const operationalData = useAppStore((state) => state.operationalData);
  
  const currentState = mode === 'simulation' ? simulationState : operationalState;
  const currentData = mode === 'simulation' ? simulationData : operationalData;
  
  const { tiempoActual, config } = currentState;
  const { pedidos, camiones } = currentData;

  const tiempoFecha = new Date(tiempoActual);
  const tiempoInicio = new Date(config?.fechaInicio || tiempoFecha);

  const diffMs = tiempoFecha.getTime() - tiempoInicio.getTime();
  const tiempoSimulacion = Math.floor(diffMs / (1000 * 60) - 5 * 60);

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
    // Si estamos en modo operaciones, mostrar título específico
    if (mode === 'operational') return "Operaciones Día a Día"
    if (mode === 'simulation' && !config) return "Simulación"
    
    // Si estamos en modo simulación, mostrar título basado en configuración
    if (!config) return "Vista de Simulación"
    return config.escenario === 'semanal' ? 'Simulación Semanal' : 'Simulación al Colapso'
  }

  const getDateInfo = () => {
    if (!config) return ""
    
    const fechaInicioMasUnMinuto = new Date(config.fechaInicio);
    fechaInicioMasUnMinuto.setMinutes(fechaInicioMasUnMinuto.getMinutes() + 60*5);
    
    if (config.escenario === 'semanal' && config.fechaFinal) {
      return `Fecha inicio: ${formatDate(fechaInicioMasUnMinuto.toISOString())} - Fecha fin: ${formatDate(config.fechaFinal)}`
    } else {
      return `Fecha inicio: ${formatDate(fechaInicioMasUnMinuto.toISOString())}`
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-6"> 
          <h1 className="text-2xl font-bold">{getTitle()}</h1>
          {mode === 'simulation' && (
            <div className="flex items-center gap-4 text-sm text-gray-600 border-l pl-6">
              <span>{getDateInfo()}</span>
              <span>Tiempo transcurrido: {formatSimulationTime(tiempoSimulacion)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 relative">
        {/* Map Container - expande a todo el ancho cuando el panel está minimizado */}
        <div className={`transition-all duration-300 ${isPanelMinimized ? 'w-full' : 'w-2/3'}`}>
          <SimulationMap />
        </div>
        
        {/* Panel de Controles */}
        {isPanelMinimized ? (
          <div 
            className="fixed z-50"
            style={{ top: position.y, left: position.x }}
          >
            {/* Panel minimizado estilo ventana de Windows */}
            <Card className="shadow-lg border-2 border-blue-500 w-[300px]">
              <CardHeader 
                className="p-2 bg-blue-500 flex flex-row items-center justify-between cursor-move"
                onMouseDown={handleDragStart}
              >
                <CardTitle className="text-sm text-white font-medium">Panel de Control</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-white hover:bg-blue-600"
                  onClick={togglePanelMinimized}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <div className="p-2 text-xs">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={togglePanelMinimized}
                >
                  Abrir Panel Completo
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="w-1/3 relative">
            {/* Botón para minimizar */}
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-2 z-10"
              onClick={togglePanelMinimized}
              title="Minimizar panel"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <SimulationControls />
          </div>
        )}
      </div>

      <EndSimulationModal />
    </div>
  )
}
