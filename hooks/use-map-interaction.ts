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
  zoomStep = 25,
  gridCols,
  gridRows,
  baseGridSize
}: MapInteractionOptions): MapInteractionResult {
  const [zoomLevel, setZoomLevel] = useState(initialZoom)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const throttleRef = useRef<number | null>(null)
  const wheelThrottleRef = useRef<number | null>(null)
  const wheelDebounceRef = useRef<number | null>(null)

  const GRID_SIZE = Math.round(baseGridSize * (zoomLevel / 100))
  const mapWidth = gridCols * GRID_SIZE
  const mapHeight = gridRows * GRID_SIZE

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
    e.preventDefault()
    e.stopPropagation()

    if (wheelThrottleRef.current) return

    wheelThrottleRef.current = requestAnimationFrame(() => {
      const delta = e.deltaY > 0 ? -zoomStep : zoomStep
      setZoomLevel((prev) => {
        const newZoom = Math.max(minZoom, Math.min(maxZoom, prev + delta))
        return newZoom
      })
      wheelThrottleRef.current = null
    })

    if (wheelDebounceRef.current) {
      clearTimeout(wheelDebounceRef.current)
    }

    wheelDebounceRef.current = setTimeout(() => {
      setPanOffset(prev => constrainPanOffset(prev))
    }, 150) as unknown as number
  }, [constrainPanOffset, zoomStep, minZoom, maxZoom])

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
