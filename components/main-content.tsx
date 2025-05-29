"use client"

import { Bell, PanelLeftClose } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { PedidosSection } from "@/components/sections/pedidos-section"
import { CamionesSection } from "@/components/sections/camiones-section"
import { SimulacionSection } from "@/components/sections/simulacion-section"
import { OperacionesSection } from "@/components/sections/operaciones-section"

interface MainContentProps {
  activeSection: string
}

export function MainContent({ activeSection }: MainContentProps) {
  const { toggleSidebar } = useSidebar()

  const renderSection = () => {
    switch (activeSection) {
      case "pedidos":
        return <PedidosSection />
      case "camiones":
        return <CamionesSection />
      case "simulacion":
        return <SimulacionSection />
      case "operaciones":
        return <OperacionesSection />
      default:
        return <PedidosSection />
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex items-center justify-between p-4 border-b bg-white">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <PanelLeftClose className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </header>
      <main className="flex-1 p-6 bg-[#f6fbff]">{renderSection()}</main>
    </div>
  )
}
