/**
 * SheetService.js
 * Servicio para operaciones con Google Sheets
 * 
 * Este módulo encapsula todas las operaciones relacionadas con
 * hojas de cálculo: lectura, escritura, formato, etc.
 */

const SheetService = {

  /**
   * Obtiene los datos de una fila de la hoja activa
   * @param {number} row - Número de fila
   * @returns {Object} Datos extraídos de la fila
   */
  obtenerDatosFila: function(row) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getActiveSheet();
      const values = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

      return this._mapearDatosFila(values);
    } catch (error) {
      throw new Error('Error al obtener datos de la fila: ' + error.message);
    }
  },

  /**
   * Mapea los valores de la fila a un objeto estructurado
   * @private
   * @param {Array} values - Valores de la fila
   * @returns {Object} Objeto con datos mapeados
   */
  _mapearDatosFila: function(values) {
    const cols = CONFIG.SHEETS.COLUMNS;
    
    return {
      fechaCx: values[cols.FECHA_CX - 1],
      paciente: values[cols.PACIENTE - 1],
      institucion: values[cols.INSTITUCION - 1],
      horaCx: values[cols.HORA_CX - 1],
      medico: values[cols.MEDICO - 1],
      material: values[cols.MATERIAL - 1]
    };
  },

  /**
   * Guarda información de un link en la hoja de registro
   * @param {Object} info - Información a guardar
   */
  guardarLinkEnOtraHoja: function(info) {
    try {
      const sheet = this._obtenerOCrearHojaLinks();
      this._registrarNuevoLink(sheet, info);
    } catch (error) {
      throw new Error('Error al guardar link en hoja: ' + error.message);
    }
  },

  /**
   * Obtiene o crea la hoja de links
   * @private
   * @returns {Sheet} Hoja de links
   */
  _obtenerOCrearHojaLinks: function() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEETS.LINKS_SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEETS.LINKS_SHEET_NAME);
      this._crearEncabezadosHojaLinks(sheet);
    }

    return sheet;
  },

  /**
   * Crea los encabezados de la hoja de links
   * @private
   * @param {Sheet} sheet - Hoja donde crear encabezados
   */
  _crearEncabezadosHojaLinks: function(sheet) {
    sheet.appendRow([
      'Fecha cx',
      'Hora cx',
      'Paciente',
      'Institución',
      'Médico',
      'Material',
      'Resumen PDF',
      'Form Técnica',
      'Nombre carpeta',
      'ID carpeta',
      'Hoja',
      'Fila'
    ]);
  },

  /**
   * Registra un nuevo link en la hoja
   * @private
   * @param {Sheet} sheet - Hoja donde registrar
   * @param {Object} info - Información del link
   */
  _registrarNuevoLink: function(sheet, info) {
    sheet.appendRow([
      info.fechaCx,
      info.horaCx,
      info.paciente,
      info.institucion,
      info.medico,
      info.material,
      '=HYPERLINK("' + info.pdfUrl + '";"PDF")',
      '=HYPERLINK("' + info.linkForm + '";"Formulario")',
      info.folderName,
      info.folderId,
      info.hojaOrigen,
      info.filaOrigen
    ]);
  },

  /**
   * Ordena una hoja por fecha
   * @param {string} sheetName - Nombre de la hoja
   * @param {number} startRow - Fila inicial (por defecto 3)
   * @param {number} sortColumn - Columna para ordenar (por defecto 1)
   */
  ordenarPorFecha: function(sheetName, startRow = 3, sortColumn = 1) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const hoja = ss.getSheetByName(sheetName);
      
      if (!hoja) {
        throw new Error('Hoja "' + sheetName + '" no encontrada');
      }

      const ultimaFila = hoja.getLastRow();
      const ultimaColumna = hoja.getLastColumn();
      
      if (ultimaFila >= startRow) {
        const rango = hoja.getRange(
          startRow,
          1,
          ultimaFila - startRow + 1,
          ultimaColumna
        );
        rango.sort({ column: sortColumn, ascending: true });
      }
    } catch (error) {
      throw new Error('Error al ordenar hoja: ' + error.message);
    }
  },

  /**
   * Obtiene la hoja activa y la fila seleccionada
   * @returns {Object} Objeto con sheet y row
   */
  obtenerSeleccionActual: function() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    const row = sheet.getActiveCell().getRow();
    
    return { sheet, row };
  }
};
