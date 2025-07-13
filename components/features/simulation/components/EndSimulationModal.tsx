"use client"

import { useAppStore } from "@/store/appStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export function EndSimulationModal() {
  const isOpen = useAppStore((state) => state.ui.modal.isOpen);
  const type = useAppStore((state) => state.ui.modal.type);
  const message = useAppStore((state) => state.ui.modal.message);
  const closeEndModal = useAppStore((state) => state.closeEndModal);

  if (!isOpen) {
    return null;
  }

  const isCompleted = type === 'completed';

  return (
    <Dialog open={isOpen} onOpenChange={closeEndModal}>
      <DialogContent>
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
        <div className="py-4">
          <p>{message}</p>
        </div>
        <DialogFooter>
          <Button onClick={closeEndModal}>Aceptar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}