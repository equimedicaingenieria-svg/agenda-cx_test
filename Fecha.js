/**
 * Fecha.js
 * Funcionalidades relacionadas con el ordenamiento de fechas
 * 
 * Este módulo contiene funciones para ordenar y manipular
 * fechas en las hojas de cálculo.
 */

/**
 * Ordena la hoja "Agenda Cx" por fecha de forma ascendente
 * Esta función se puede ejecutar manualmente o mediante un trigger
 */
function ordenarPorFecha() {
  try {
    const NOMBRE_HOJA = "Agenda Cx";
    const FILA_INICIO = 3;  // Fila donde comienzan los datos (después de encabezados)
    const COLUMNA_FECHA = 1; // Columna A (fecha)
    
    SheetService.ordenarPorFecha(NOMBRE_HOJA, FILA_INICIO, COLUMNA_FECHA);
    
  } catch (error) {
    Logger.log('Error al ordenar por fecha: ' + error.message);
    throw error;
  }
}

/**
 * Función alternativa para ordenar cualquier hoja por fecha
 * @param {string} nombreHoja - Nombre de la hoja a ordenar
 * @param {number} filaInicio - Fila donde comienzan los datos
 * @param {number} columnaOrden - Columna por la que ordenar
 */
function ordenarHojaPorFecha(nombreHoja, filaInicio, columnaOrden) {
  try {
    SheetService.ordenarPorFecha(nombreHoja, filaInicio, columnaOrden);
  } catch (error) {
    UIService.mostrarAlerta('Error al ordenar: ' + error.message);
  }
}
