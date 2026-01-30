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
   * Obtiene los datos completos de una fila específica de una hoja específica
   * @param {string} nombreHoja - Nombre de la hoja
   * @param {number} fila - Número de fila
   * @returns {Object} Datos extraídos de la fila
   */
  obtenerDatosCompletos: function(nombreHoja, fila) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const hoja = ss.getSheetByName(nombreHoja);
      
      if (!hoja) {
        throw new Error('Hoja "' + nombreHoja + '" no encontrada');
      }
      
      const values = hoja.getRange(fila, 1, 1, hoja.getLastColumn()).getValues()[0];
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
    // Validar que no exista duplicado antes de insertar
    const idProyectoLimpio = info.folderName ? info.folderName.split(' - ')[0].replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() : '';
    const pacienteLimpio = info.paciente ? info.paciente.toString().trim() : '';
    
    const existe = this.buscarEnLinksAsistencia(idProyectoLimpio, pacienteLimpio);
    
    if (existe) {
      Logger.log('ADVERTENCIA: Ya existe un registro para ' + info.folderName + '. Se omite inserción duplicada.');
      return; // No insertar duplicado
    }
    
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
    
    Logger.log('✓ Registro insertado en Links_AsistenciaTecnica: ' + info.folderName);
  },

  /**
   * Busca una cirugía en la hoja Links_AsistenciaTecnica
   * @param {string} idProyecto - ID del proyecto (sin emoji)
   * @param {string} paciente - Nombre del paciente
   * @returns {Object|null} Información encontrada o null
   */
  buscarEnLinksAsistencia: function(idProyecto, paciente) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(CONFIG.SHEETS.LINKS_SHEET_NAME);
      
      if (!sheet) {
        Logger.log('Hoja Links_AsistenciaTecnica no existe');
        return null;
      }
      
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        Logger.log('Hoja Links_AsistenciaTecnica está vacía');
        return null;
      }
      
      // Obtener todos los datos de la hoja (desde fila 2)
      const data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
      const formulas = sheet.getRange(2, 1, lastRow - 1, 12).getFormulas();
      
      // Limpiar emojis del ID de proyecto y aplicar trim a ambos campos
      const idProyectoLimpio = idProyecto.toString().replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
      const pacienteLimpio = paciente.toString().trim();
      
      // Buscar por nombre de carpeta que contenga idProyecto y paciente
      const nombreCarpetaBuscado = idProyectoLimpio + ' - ' + pacienteLimpio;
      
      Logger.log('Buscando carpeta: "' + nombreCarpetaBuscado + '"');
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const formulaRow = formulas[i];
        const nombreCarpeta = row[8]; // Columna I (Nombre carpeta)
        
        // Limpiar emojis de la carpeta almacenada y comparar
        const nombreCarpetaLimpio = nombreCarpeta ? nombreCarpeta.toString().replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() : '';
        
        if (nombreCarpetaLimpio === nombreCarpetaBuscado) {
          Logger.log('Encontrado en Links_AsistenciaTecnica: ' + nombreCarpeta);
          
          // Extraer URLs de las fórmulas HYPERLINK (columnas G y H, índices 6 y 7)
          let pdfUrl = row[6];
          let linkForm = row[7];
          
          // Si son fórmulas HYPERLINK, extraer la URL
          if (formulaRow[6] && formulaRow[6].indexOf('HYPERLINK') !== -1) {
            const pdfMatch = formulaRow[6].match(/=HYPERLINK\("([^"]+)"/);
            pdfUrl = pdfMatch ? pdfMatch[1] : pdfUrl;
            Logger.log('PDF URL extraída: ' + pdfUrl);
          }
          
          if (formulaRow[7] && formulaRow[7].indexOf('HYPERLINK') !== -1) {
            const formMatch = formulaRow[7].match(/=HYPERLINK\("([^"]+)"/);
            linkForm = formMatch ? formMatch[1] : linkForm;
            Logger.log('Form URL extraída: ' + linkForm);
          }
          
          return {
            fechaCx: row[0],
            horaCx: row[1],
            paciente: row[2],
            institucion: row[3],
            medico: row[4],
            material: row[5],
            pdfUrl: pdfUrl,
            linkForm: linkForm,
            folderName: row[8],
            folderId: row[9],
            hojaOrigen: row[10],
            filaOrigen: row[11]
          };
        }
      }
      
      Logger.log('No se encontró en Links_AsistenciaTecnica: ' + nombreCarpetaBuscado);
      return null;
      
    } catch (error) {
      Logger.log('Error al buscar en Links_AsistenciaTecnica: ' + error.message);
      return null;
    }
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
