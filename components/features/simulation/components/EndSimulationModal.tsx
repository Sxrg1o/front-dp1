"use client"

import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function EndSimulationModal() {
  const isOpen = useAppStore((state) => state.ui.modal.isOpen);
  const type = useAppStore((state) => state.ui.modal.type);
  const message = useAppStore((state) => state.ui.modal.message);
  const reporte = useAppStore((state) => state.ui.modal.reporte);
  const closeEndModal = useAppStore((state) => state.closeEndModal);

  // Estado para el colapsible de pedidos
  const [isOpen_pedidos, setIsOpenPedidos] = useState(false);
  
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const pedidosPorPagina = 10;

  if (!isOpen) {
    return null;
  }

  const isCompleted = type === 'completed';
  
  // Cálculos para la paginación
  const pedidosEntregados = reporte?.pedidosEntregados || [];
  const totalPaginas = Math.ceil(pedidosEntregados.length / pedidosPorPagina);
  const indiceFinal = currentPage * pedidosPorPagina;
  const indiceInicial = indiceFinal - pedidosPorPagina;
  const pedidosActuales = pedidosEntregados.slice(indiceInicial, indiceFinal);
  
  // Funciones para la navegación de páginas
  const irAPaginaSiguiente = () => {
    if (currentPage < totalPaginas) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const irAPaginaAnterior = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
                
                <div className="text-gray-600">Combustible consumido:</div>
                <div className="font-medium text-right">{reporte.combustibleConsumido.toFixed(2)} L</div>
                
                <div className="text-gray-600">GLP entregado:</div>
                <div className="font-medium text-right">{reporte.glpEntregado.toFixed(2)} L</div>
                
                {reporte.pedidoColapso && (
                  <>
                    <div className="text-gray-600">Pedido que causó colapso:</div>
                    <div className="font-medium text-right text-red-600">{reporte.pedidoColapso}</div>
                  </>
                )}
              </div>

              {/* Lista desplegable de pedidos entregados */}
              {reporte.pedidosEntregados && reporte.pedidosEntregados.length > 0 && (
                <Collapsible 
                  open={isOpen_pedidos} 
                  onOpenChange={setIsOpenPedidos} 
                  className="mt-4 border border-gray-200 rounded-md overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center justify-between w-full p-2 bg-gray-100 hover:bg-gray-200"
                    >
                      <span className="text-sm font-medium">Listado de pedidos entregados</span>
                      {isOpen_pedidos ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-2">
                    {/* Tabla de pedidos con paginación */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-1 text-left">ID</th>
                            <th className="p-1 text-center">Posición</th>
                            <th className="p-1 text-right">Volumen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pedidosActuales.map(pedido => (
                            <tr key={pedido.id} className="border-b border-gray-100">
                              <td className="p-1">{pedido.id}</td>
                              <td className="p-1 text-center">({pedido.x}, {pedido.y})</td>
                              <td className="p-1 text-right">{pedido.volumen.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Controles de paginación */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-gray-500">
                        Mostrando {indiceInicial + 1}-{Math.min(indiceFinal, pedidosEntregados.length)} de {pedidosEntregados.length} pedidos
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={irAPaginaAnterior}
                          disabled={currentPage === 1}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronLeft size={14} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={irAPaginaSiguiente}
                          disabled={currentPage === totalPaginas || totalPaginas === 0}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronRight size={14} />
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
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