"use client"

import { useAppStore } from "@/store/appStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export function EndSimulationModal() {
  const isOpen = useAppStore((state) => state.ui.modal.isOpen);
  const type = useAppStore((state) => state.ui.modal.type);
  const message = useAppStore((state) => state.ui.modal.message);
  const reporte = useAppStore((state) => state.ui.modal.reporte);
  const closeEndModal = useAppStore((state) => state.closeEndModal);

  if (!isOpen) {
    return null;
  }

  const isCompleted = type === 'completed';

  return (
    <Dialog open={isOpen} onOpenChange={closeEndModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-red-500" />
            )}
            {isCompleted ? "Simulación Completada" : "Simulación Colapsada"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p>{message}</p>
          
          {reporte && (
            <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Resultados de la simulación:</h3>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Pedidos entregados:</div>
                <div className="font-medium text-right">{reporte.totalPedidosEntregados}</div>
                
                <div className="text-gray-600">Distancia recorrida:</div>
                <div className="font-medium text-right">{reporte.totalDistanciaRecorrida.toFixed(2)} km</div>
                
                {reporte.pedidoColapso && (
                  <>
                    <div className="text-gray-600">Pedido que causó colapso:</div>
                    <div className="font-medium text-right text-red-600">{reporte.pedidoColapso}</div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={closeEndModal}>Aceptar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}