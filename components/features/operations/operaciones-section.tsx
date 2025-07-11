"use client"

import { useEffect } from "react"
import { useAppStore } from "@/store/appStore"
import { OperationsView } from "./views/OperationsView"

export function OperacionesSection() {
  const { setOperationalConfig, setMode } = useAppStore();

  useEffect(() => {
    setMode('operational');
    
    const today = new Date().toISOString().split('T')[0];
    
    setOperationalConfig({
      escenario: 'operational', 
      fechaInicio: today,
    });
    
  }, [setOperationalConfig, setMode]);

  return <OperationsView />
}