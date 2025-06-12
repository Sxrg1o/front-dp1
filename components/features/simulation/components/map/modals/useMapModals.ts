import { useState } from "react"
import { PedidoDTO, TanqueDTO } from "@/types/types"

export function useMapModals() {
  // Estados de los modales
  const [showTruckModal, setShowTruckModal] = useState(false)
  const [showTankModal, setShowTankModal] = useState(false)
  const [showBreakdownModal, setShowBreakdownModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  
  // Estados de elementos seleccionados
  const [selectedTruck, setSelectedTruck] = useState<any>(null)
  const [selectedTank, setSelectedTank] = useState<TanqueDTO | null>(null)
  const [selectedBreakdown, setSelectedBreakdown] = useState<string>("")
  const [selectedOrder, setSelectedOrder] = useState<PedidoDTO | null>(null)

  // Breakdown types
  const breakdownTypes = {
    t1: "Se baja la llanta y se puede reparar en el mismo lugar por el conductor. Este incidente inmoviliza la unidad en el lugar por 2 horas.",
    t2: "Se ahoga (obstruye) el motor. Este incidente inmoviliza la unidad en el lugar por 2 horas. Este incidente deja inoperativo a la unidad por un turno completo en el taller.",
    t3: "Este incidente inmoviliza la unidad en el lugar por 4 horas. Este incidente deja inoperativo a la unidad por un día completo en el taller."
  }

  // Handlers
  const handleTruckClick = (truck: any) => {
    setSelectedTruck(truck)
    setShowTruckModal(true)
  }

  const handleTankClick = (tank: TanqueDTO) => {
    setSelectedTank(tank)
    setShowTankModal(true)
  }

  const handleBreakdown = () => {
    setShowTruckModal(false)
    setShowBreakdownModal(true)
  }

  const handleOrderClick = (order: PedidoDTO) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  const closeTruckModal = () => {
    setShowTruckModal(false)
    setSelectedTruck(null)
  }

  const closeTankModal = () => {
    setShowTankModal(false)
    setSelectedTank(null)
  }

  const closeBreakdownModal = () => {
    setShowBreakdownModal(false)
    setSelectedBreakdown("")
  }

  const closeOrderModal = () => {
    setShowOrderModal(false)
    setSelectedOrder(null)
  }

  // Utility functions para tanques
  const getTankColor = (level: number) => {
    if (level > 50) return "green"
    if (level > 10) return "yellow"
    return "red"
  }

  // Función para obtener la clase del icono del tanque (clases estáticas)
  const getTankIconClass = (level: number) => {
    if (level > 50) return "text-green-600"
    if (level > 10) return "text-yellow-600"
    return "text-red-600"
  }

  const getTankBadgeVariant = (level: number): "secondary" | "default" | "destructive" => {
    if (level > 50) return "secondary"
    if (level > 10) return "default"
    return "destructive"
  }

  const getTankBackgroundColor = (level: number) => {
    if (level > 50) return "bg-green-50 border-green-200"
    if (level > 10) return "bg-yellow-50 border-yellow-200"
    return "bg-red-50 border-red-200"
  }

  // Utility function para camiones
  const getTruckColorClass = (color: string) => {
    const colorMap = {
      green: "text-green-600",
      yellow: "text-yellow-600", 
      blue: "text-blue-600",
      purple: "text-purple-600",
      gray: "text-gray-600"
    }
    return colorMap[color as keyof typeof colorMap] || "text-gray-600"
  }

  return {
    // Estados
    showTruckModal,
    showTankModal,
    showBreakdownModal,
    showOrderModal,
    selectedTruck,
    selectedTank,
    selectedBreakdown,
    selectedOrder,
    breakdownTypes,
    
    // Handlers
    handleTruckClick,
    handleTankClick,
    handleBreakdown,
    handleOrderClick,
    closeTruckModal,
    closeTankModal,
    closeBreakdownModal,
    closeOrderModal,
    setSelectedBreakdown,
    
    // Utility functions
    getTankColor,
    getTankIconClass,
    getTankBadgeVariant,
    getTankBackgroundColor,
    getTruckColorClass
  }
}
