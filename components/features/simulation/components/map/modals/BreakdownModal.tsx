import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TruckDTO } from "@/types/types"

interface BreakdownModalProps {
  isOpen: boolean
  onClose: () => void
  truck: TruckDTO | null
  selectedBreakdown: string
  onBreakdownChange: (value: string) => void
  breakdownTypes: Record<string, string>
}

export function BreakdownModal({ 
  isOpen, 
  onClose, 
  truck, 
  selectedBreakdown, 
  onBreakdownChange, 
  breakdownTypes 
}: BreakdownModalProps) {
  const handleConfirm = () => {
    // Aquí se implementaría la lógica para confirmar la avería
    console.log(`Avería ${selectedBreakdown} confirmada para camión ${truck?.id}`)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Averiar Camión {truck?.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="breakdown-type" className="py-2">Tipo de avería</Label>
            <Select value={selectedBreakdown} onValueChange={onBreakdownChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo de avería" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="t1">Tipo 1</SelectItem>
                <SelectItem value="t2">Tipo 2</SelectItem>
                <SelectItem value="t3">Tipo 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedBreakdown && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                {breakdownTypes[selectedBreakdown as keyof typeof breakdownTypes]}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleConfirm}>
              Confirmar Avería
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
