/**
 * Converts minutes to a human-readable time format
 * @param totalMinutes - Total time in minutes
 * @returns Formatted string in the format "XXd XXh XXm" or "XXh XXm" if no days
 */
export function formatSimulationTime(totalMinutes: number | string): string {
  
  // Asegurarse de que totalMinutes sea un número
  let minutes: number;
  if (typeof totalMinutes === 'string') {
    // Intentar parsear como fecha ISO si es un string con formato de fecha
    if (totalMinutes.includes('T') || totalMinutes.includes('-')) {
      const date = new Date(totalMinutes);
      if (!isNaN(date.getTime())) {
        // Convertir la fecha a minutos desde medianoche
        minutes = date.getHours() * 60 + date.getMinutes();
      } else {
        minutes = parseInt(totalMinutes, 10);
      }
    } else {
      minutes = parseInt(totalMinutes, 10);
    }
  } else {
    minutes = totalMinutes;
  }
  
  // Comprobar si es un número válido
  if (isNaN(minutes) || minutes < 0) return "00h 00m";
  
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = Math.floor(minutes % 60);
  
  return `${days}d ${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
}

/**
 * Converts minutes to days, hours, and minutes object
 * @param totalMinutes - Total time in minutes
 * @returns Object with days, hours, and minutes
 */
export function parseSimulationTime(totalMinutes: number | string): { days: number; hours: number; minutes: number } {
  
  // Asegurarse de que totalMinutes sea un número
  let minutes: number;
  if (typeof totalMinutes === 'string') {
    // Intentar parsear como fecha ISO si es un string con formato de fecha
    if (totalMinutes.includes('T') || totalMinutes.includes('-')) {
      const date = new Date(totalMinutes);
      if (!isNaN(date.getTime())) {
        // Convertir la fecha a minutos desde medianoche
        minutes = date.getHours() * 60 + date.getMinutes();
      } else {
        minutes = parseInt(totalMinutes, 10);
      }
    } else {
      minutes = parseInt(totalMinutes, 10);
    }
  } else {
    minutes = totalMinutes;
  }
  
  // Comprobar si es un número válido
  if (isNaN(minutes) || minutes < 0) return { days: 0, hours: 0, minutes: 0 };
  
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = Math.floor(minutes % 60);
  
  return { days, hours, minutes };
}
