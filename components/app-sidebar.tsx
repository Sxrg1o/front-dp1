"use client"

import { ClipboardList, Truck, Play, Clock, Building2 } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

const menuItems = [
  {
    id: "pedidos",
    title: "Pedidos",
    icon: ClipboardList,
  },
  {
    id: "camiones",
    title: "Camiones",
    icon: Truck,
  },
  {
    id: "simulacion",
    title: "Simulación",
    icon: Play,
  },
  {
    id: "operaciones",
    title: "Operaciones",
    icon: Clock,
  },
]

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          <span className="text-xl font-bold">PLG LOGO</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => setActiveSection(item.id)}
                isActive={activeSection === item.id}
                className="w-full justify-start"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
