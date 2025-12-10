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
      idProyecto: values[cols.ID_PROYECTO - 1],
      estado: values[cols.ESTADO - 1],
      paciente: values[cols.PACIENTE - 1],
      institucion: values[cols.INSTITUCION - 1],
      horaCx: values[cols.HORA_CX - 1],
      medico: values[cols.MEDICO - 1],
      cliente: values[cols.CLIENTE - 1],
      material: values[cols.MATERIAL - 1]
    };
  },

  /**
   * Verifica si una cirugía ya está autorizada
   * @param {string} nombreHoja - Nombre de la hoja
   * @param {number} fila - Número de fila
   * @returns {boolean} true si ya está autorizada
   */
  estaAutorizada: function(nombreHoja, fila) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const hoja = ss.getSheetByName(nombreHoja);
      
      if (!hoja) {
        throw new Error('Hoja "' + nombreHoja + '" no encontrada');
      }
      
      const columnaEstado = CONFIG.SHEETS.COLUMNS.ESTADO;
      const estadoActual = hoja.getRange(fila, columnaEstado).getValue();
      
      return estadoActual === CONFIG.SHEETS.ESTADOS.AUTORIZADA;
    } catch (error) {
      throw new Error('Error al verificar estado: ' + error.message);
    }
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
   * Verifica si el usuario actual tiene permisos para editar celdas protegidas
   * @param {string} nombreHoja - Nombre de la hoja
   * @param {number} fila - Número de fila
   * @returns {boolean} true si puede editar, false si no
   */
  verificarPermisosEdicion: function(nombreHoja, fila) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const hoja = ss.getSheetByName(nombreHoja);
      
      if (!hoja) {
        return false;
      }
      
      const columnaEstado = CONFIG.SHEETS.COLUMNS.ESTADO;
      const celda = hoja.getRange(fila, columnaEstado);
      
      // Intentar obtener protecciones
      const protecciones = hoja.getProtections(SpreadsheetApp.ProtectionType.RANGE);
      
      // Verificar si la celda está protegida
      for (var i = 0; i < protecciones.length; i++) {
        var rango = protecciones[i].getRange();
        if (rango.getRow() <= fila && 
            fila <= rango.getLastRow() &&
            rango.getColumn() <= columnaEstado && 
            columnaEstado <= rango.getLastColumn()) {
          
          // La celda está protegida, verificar si puede editar
          if (!protecciones[i].canEdit()) {
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      Logger.log('Error al verificar permisos: ' + error.message);
      return false;
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
  },

  /**
   * Actualiza el estado de una cirugía en la columna ESTADO
   * @param {string} nombreHoja - Nombre de la hoja
   * @param {number} fila - Número de fila
   * @param {string} estado - Estado a establecer
   */
  actualizarEstadoCx: function(nombreHoja, fila, estado) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const hoja = ss.getSheetByName(nombreHoja);
      
      if (!hoja) {
        throw new Error('Hoja "' + nombreHoja + '" no encontrada');
      }
      
      const columnaEstado = CONFIG.SHEETS.COLUMNS.ESTADO;
      const celda = hoja.getRange(fila, columnaEstado);
      
      // Intentar actualizar directamente
      celda.setValue(estado);
      
    } catch (error) {
      // Si falla por protección, dar mensaje claro
      if (error.message.indexOf('protegid') !== -1 || error.message.indexOf('protected') !== -1) {
        throw new Error('La columna ESTADO está protegida. Por favor, pide al propietario de la hoja que te agregue como editor autorizado en las protecciones de las columnas A-R.');
      }
      throw new Error('Error al actualizar estado: ' + error.message);
    }
  },

  /**
   * Aplica formato a una fila completa
   * @param {string} nombreHoja - Nombre de la hoja
   * @param {number} fila - Número de fila
   * @param {string} colorFondo - Color de fondo en formato hexadecimal
   */
  formatearFilaCx: function(nombreHoja, fila, colorFondo) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const hoja = ss.getSheetByName(nombreHoja);
      
      if (!hoja) {
        throw new Error('Hoja "' + nombreHoja + '" no encontrada');
      }
      
      const ultimaColumna = hoja.getLastColumn();
      const rangoFila = hoja.getRange(fila, 1, 1, ultimaColumna);
      
      // Intentar aplicar formato directamente
      rangoFila.setBackground(colorFondo);
      
    } catch (error) {
      if (error.message.indexOf('protegid') !== -1 || error.message.indexOf('protected') !== -1) {
        throw new Error('La fila está protegida. Por favor, pide al propietario de la hoja que te agregue como editor autorizado.');
      }
      throw new Error('Error al formatear fila: ' + error.message);
    }
  },

  /**
   * Autoriza una cirugía: actualiza estado y aplica formato
   * @param {string} nombreHoja - Nombre de la hoja
   * @param {number} fila - Número de fila
   */
  autorizarCirugia: function(nombreHoja, fila) {
    try {
      // Actualizar estado
      this.actualizarEstadoCx(
        nombreHoja,
        fila,
        CONFIG.SHEETS.ESTADOS.AUTORIZADA
      );
      
      // Aplicar formato
      this.formatearFilaCx(
        nombreHoja,
        fila,
        CONFIG.SHEETS.COLORES.AUTORIZADA
      );
      
    } catch (error) {
      throw new Error('Error al autorizar cirugía: ' + error.message);
    }
  },

  /**
   * Inserta un hipervínculo a la carpeta en la columna ID_PROYECTO
   * @param {string} nombreHoja - Nombre de la hoja
   * @param {number} fila - Número de fila
   * @param {string} folderUrl - URL de la carpeta
   * @param {string} folderName - Nombre de la carpeta
   */
  insertarHipervincultoCarpeta: function(nombreHoja, fila, folderUrl, folderName) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const hoja = ss.getSheetByName(nombreHoja);
      
      if (!hoja) {
        throw new Error('Hoja "' + nombreHoja + '" no encontrada');
      }
      
      const columnaIdProyecto = CONFIG.SHEETS.COLUMNS.ID_PROYECTO;
      const celda = hoja.getRange(fila, columnaIdProyecto);
      
      // Crear fórmula de hipervínculo
      const formula = '=HYPERLINK("' + folderUrl + '";"📁 ' + folderName + '")';
      celda.setFormula(formula);
      
    } catch (error) {
      if (error.message.indexOf('protegid') !== -1 || error.message.indexOf('protected') !== -1) {
        throw new Error('La columna ID_PROYECTO está protegida. Por favor, pide al propietario de la hoja que te agregue como editor autorizado.');
      }
      throw new Error('Error al insertar hipervínculo: ' + error.message);
    }
  }
};
