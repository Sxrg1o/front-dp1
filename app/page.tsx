"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { MainContent } from "@/components/layout/main-content"

export default function Page() {
  const [activeSection, setActiveSection] = useState("pedidos")

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <MainContent activeSection={activeSection} />
      </div>
    </SidebarProvider>
  )
}
