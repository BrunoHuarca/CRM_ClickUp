import * as XLSX from 'xlsx';

export const exportarAExcel = (data: any[], filename: string) => {
  if (data.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  // Define column mappings and format data
  const processedData = data.map((item) => {
    // We can do standard translation for any fields or just pass-through
    const cleanedItem: any = {};
    for (const key in item) {
      if (typeof item[key] === 'object' && item[key] !== null) {
        // Handle child objects like Actividades or Costos by showing length
        if (Array.isArray(item[key])) {
          cleanedItem[key] = `${item[key].length} registros`;
        } else {
          cleanedItem[key] = JSON.stringify(item[key]);
        }
      } else {
        cleanedItem[key] = item[key];
      }
    }
    return cleanedItem;
  });

  const worksheet = XLSX.utils.json_to_sheet(processedData);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

  // Forze browser to download the file
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
