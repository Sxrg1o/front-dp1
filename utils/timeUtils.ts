/**
 * Converts minutes to a human-readable time format
 * @param totalMinutes - Total time in minutes
 * @returns Formatted string in the format "XXd XXh XXm" or "XXh XXm" if no days
 */
export function formatSimulationTime(totalMinutes: number): string {
  if (totalMinutes < 0) return "00h 00m";
  
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = Math.floor(totalMinutes % 60);
  
  if (days > 0) {
    return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  } else {
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  }
}

/**
 * Converts minutes to days, hours, and minutes object
 * @param totalMinutes - Total time in minutes
 * @returns Object with days, hours, and minutes
 */
export function parseSimulationTime(totalMinutes: number): { days: number; hours: number; minutes: number } {
  if (totalMinutes < 0) return { days: 0, hours: 0, minutes: 0 };
  
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = Math.floor(totalMinutes % 60);
  
  return { days, hours, minutes };
}
