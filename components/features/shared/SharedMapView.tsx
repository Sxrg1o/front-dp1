"use client"

import { useState, useEffect, useRef } from "react"
import { SimulationMap } from "@/components/features/simulation/components/simulation-map"
import { SimulationControls } from "@/components/features/simulation/components/simulation-controls"
import { formatSimulationTime } from "@/utils/timeUtils"
import { useAppStore } from "@/store/appStore"
import { EndSimulationModal } from "@/components/features/simulation/components/EndSimulationModal"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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

      <div className="relative w-full">
        {/* Mapa a ancho completo */}
        <SimulationMap isPanelMinimized={isPanelMinimized} togglePanelMinimized={togglePanelMinimized} />
      </div>

      <EndSimulationModal />
    </div>
  )
}
