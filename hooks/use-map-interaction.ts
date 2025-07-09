import { useState, useRef, useCallback, useEffect } from "react"

interface MapInteractionOptions {
  initialZoom?: number
  minZoom?: number
  maxZoom?: number
  zoomStep?: number
  gridCols: number
  gridRows: number
  baseGridSize: number
}

interface MapInteractionResult {
  zoomLevel: number
  panOffset: { x: number; y: number }
  isDragging: boolean
  GRID_SIZE: number
  mapWidth: number
  mapHeight: number
  mapContainerRef: React.RefObject<HTMLDivElement | null>
  handleZoomIn: () => void
  handleZoomOut: () => void
  handleResetZoom: () => void
  handleMouseDown: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: (e: React.MouseEvent) => void
  handleWheel: (e: React.WheelEvent) => void
  setupWheelEventListener: () => void
}

export function useMapInteraction({
  initialZoom = 100,
  minZoom = 25,
  maxZoom = 300,
  zoomStep = 10,//25
  gridCols,
  gridRows,
  baseGridSize
}: MapInteractionOptions): MapInteractionResult {
  const [zoomLevel, setZoomLevel] = useState(initialZoom)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const throttleRef = useRef<number | null>(null)
  const wheelThrottleRef = useRef<boolean>(false) 

  const GRID_SIZE = Math.round(baseGridSize * (zoomLevel / 100))
  const mapWidth = gridCols * GRID_SIZE
  const mapHeight = gridRows * GRID_SIZE

  const constrainPanOffset = useCallback((offset: { x: number, y: number }) => {
    if (!mapContainerRef.current) return offset;

    const containerRect = mapContainerRef.current.getBoundingClientRect();
    let newOffsetX = offset.x;
    let newOffsetY = offset.y;

    // Lógica para el eje X (horizontal)
    if (mapWidth > containerRect.width) {
      // Si el mapa es más ancho que el contenedor, se puede mover.
      // El límite izquierdo es 0, el derecho es la diferencia de anchos.
      const minPanX = containerRect.width - mapWidth;
      const maxPanX = 0;
      newOffsetX = Math.max(minPanX, Math.min(maxPanX, offset.x));
    } else {
      // Si el mapa es menos ancho, se centra.
      newOffsetX = (containerRect.width - mapWidth) / 2;
    }

    // Lógica para el eje Y (vertical)
    if (mapHeight > containerRect.height) {
      // Si el mapa es más alto que el contenedor, se puede mover.
      const minPanY = containerRect.height - mapHeight;
      const maxPanY = 0;
      newOffsetY = Math.max(minPanY, Math.min(maxPanY, offset.y));
    } else {
      // Si el mapa es menos alto, se centra.
      newOffsetY = (containerRect.height - mapHeight) / 2;
    }

    return { x: newOffsetX, y: newOffsetY };
  }, [mapWidth, mapHeight]);

  useEffect(() => {
    return () => {
      if (throttleRef.current) {
        cancelAnimationFrame(throttleRef.current)
      }
    }
  }, [])
  useEffect(() => {
    const handleResize = () => {
      setPanOffset(prev => constrainPanOffset(prev))
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [constrainPanOffset])

  useEffect(() => {
    if (mapContainerRef.current) {
      const initialOffset = constrainPanOffset({ x: 0, y: 0 })
      setPanOffset(initialOffset)
    }
  }, [constrainPanOffset])

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + zoomStep, maxZoom))
  }, [zoomStep, maxZoom])

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - zoomStep, minZoom))
  }, [zoomStep, minZoom])

  const handleResetZoom = useCallback(() => {
    setZoomLevel(initialZoom)
    setPanOffset({ x: 0, y: 0 })
  }, [initialZoom])
  
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
    e.preventDefault();
    e.stopPropagation();

    // Si ya hay una actualización en curso, ignorar este evento.
    if (wheelThrottleRef.current) {
      return;
    }

    // Marcar que una actualización está en proceso.
    wheelThrottleRef.current = true;

    requestAnimationFrame(() => {
      // 1. Obtener la posición del mouse relativa al contenedor del mapa
      const rect = mapContainerRef.current?.getBoundingClientRect();
      if (!rect) {
        wheelThrottleRef.current = false;
        return;
      }
      
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // 2. Calcular el nuevo nivel de zoom
      const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
      const newZoomLevel = Math.max(minZoom, Math.min(maxZoom, zoomLevel + delta));

      if (newZoomLevel !== zoomLevel) {
        // 3. Calcular el factor de zoom y el nuevo desplazamiento (pan)
        const zoomFactor = newZoomLevel / zoomLevel;
        const newPanOffset = {
          x: mouseX - (mouseX - panOffset.x) * zoomFactor,
          y: mouseY - (mouseY - panOffset.y) * zoomFactor
        };

        // 4. Aplicar el nuevo zoom y el pan corregido
        setZoomLevel(newZoomLevel);
        setPanOffset(constrainPanOffset(newPanOffset));
      }

      // Liberar el bloqueo para permitir la siguiente actualización.
      wheelThrottleRef.current = false;
    });

  }, [zoomLevel, panOffset, zoomStep, minZoom, maxZoom, constrainPanOffset, mapContainerRef]);

  // Function to set up the wheel event listener with passive: false
  const setupWheelEventListener = useCallback(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    
    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      handleWheel((e as unknown) as React.WheelEvent<HTMLDivElement>);
    };
    
    el.addEventListener("wheel", onWheelNative, { passive: false });
    
    return () => {
      el.removeEventListener("wheel", onWheelNative);
    };
  }, [handleWheel]);

  return {
    zoomLevel,
    panOffset,
    isDragging,
    GRID_SIZE,
    mapWidth,
    mapHeight,
    mapContainerRef,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    setupWheelEventListener
  }
}
