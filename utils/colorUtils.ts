/**
 * Determina el nombre del color basado en el prefijo del ID del camión.
 */
export const getTruckColorName = (id: string): string => {
  if (id.startsWith("TA")) return "green";
  if (id.startsWith("TB")) return "yellow";
  if (id.startsWith("TC")) return "blue";
  if (id.startsWith("TD")) return "purple";
  return "gray";
};

/**
 * Devuelve la clase de Tailwind CSS para el color del ÍCONO del camión.
 */
export const getTruckIconColorClass = (colorName: string): string => {
  const colorMap = {
    green: "text-green-600",
    yellow: "text-yellow-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    gray: "text-gray-600"
  };
  return colorMap[colorName as keyof typeof colorMap] || "text-gray-600";
};

/**
 * Devuelve el código de color HEX para el 'stroke' de la RUTA en SVG.
 */
export const getRouteStrokeColor = (colorName: string): string => {
  const colorMap = {
    green: "#16a34a",  // green-600
    yellow: "#ca8a04", // yellow-600
    blue: "#2563eb",   // blue-600
    purple: "#9333ea", // purple-600
    gray: "#4b5563"    // gray-600
  };
  return colorMap[colorName as keyof typeof colorMap] || "#4b5563";
};