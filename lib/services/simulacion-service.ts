import { SimulacionSnapshotDTO } from '../types'

export async function avanzarUnMinuto(): Promise<SimulacionSnapshotDTO> {
    const res = await fetch("/api/simulacion/step", {
        method: "POST",
    })
    if (!res.ok) throw new Error("Error al avanzar un minuto de simulación")
    return await res.json()
}
