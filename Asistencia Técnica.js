/**
 * Asistencia Técnica.js
 * Sistema de gestión de asistencia técnica para cirugías
 * 
 * Este archivo orquesta las funcionalidades principales del sistema,
 * utilizando los servicios modulares para cada operación.
 * 
 * Dependencias:
 * - Config.js: Configuración centralizada
 * - Utils.js: Funciones utilitarias
 * - SheetService.js: Operaciones con hojas
 * - DriveService.js: Operaciones con Drive
 * - PdfService.js: Generación de PDFs
 * - FormService.js: Manejo de formularios
 * - FormTriggerService.js: Procesamiento de envíos del formulario
 * - UrlShortenerService.js: Acortamiento de URLs
 * - UIService.js: Interfaz de usuario
 */

/**
 * Hook que se ejecuta al abrir el documento
 * Crea el menú personalizado en la UI
 */
function onOpen() {
  UIService.crearMenu();
}

/**
 * Muestra el diálogo de autorización de cirugía
 * Se ejecuta desde el menú personalizado
 */
function autorizarCxDesdeFila() {
  try {
    const { sheet, row } = SheetService.obtenerSeleccionActual();
    const datos = SheetService.obtenerDatosFila(row);
    const nombreHoja = sheet.getName();
    
    // Validar datos obligatorios
    if (!Utils.validarDatosObligatorios(datos)) {
      UIService.mostrarAlerta(CONFIG.MESSAGES.ERROR_MISSING_DATA);
      return;
    }
    
    // Validar que la columna MATERIAL tenga datos
    if (!datos.material || datos.material.toString().trim() === '') {
      UIService.mostrarAlerta(
        '⚠️ Productos No Especificados\n\n' +
        'No se puede autorizar la cirugía porque la columna "PRODUCTOS AUTORIZADOS Y A ENVIAR" (columna R) está vacía.\n\n' +
        '📋 Por favor:\n' +
        '1. Completa los productos en la columna R\n' +
        '2. Vuelve a intentar autorizar la cirugía'
      );
      return;
    }
    
    // Verificar si ya está autorizada
    if (SheetService.estaAutorizada(nombreHoja, row)) {
      UIService.mostrarAlerta('⚠️ Esta cirugía ya está autorizada.\n\nEstado: ' + CONFIG.SHEETS.ESTADOS.AUTORIZADA);
      return;
    }
    
    // Verificar permisos antes de mostrar el diálogo
    if (!SheetService.verificarPermisosEdicion(nombreHoja, row)) {
      UIService.mostrarAlerta(
        '🔒 Sin Permisos de Edición\n\n' +
        'No tienes permisos para autorizar cirugías porque las columnas A-R están protegidas.\n\n' +
        '📋 Solución:\n' +
        'Pide al propietario de la hoja que te agregue como "Editor" en las protecciones de la hoja "' + nombreHoja + '".\n\n' +
        'Instrucciones para el propietario:\n' +
        '1. Click derecho en la pestaña "' + nombreHoja + '"\n' +
        '2. Ir a "Proteger hoja"\n' +
        '3. Agregar tu email como editor autorizado'
      );
      return;
    }
    
    // Mostrar diálogo de autorización
    UIService.mostrarDialogoAutorizacion(datos, row, nombreHoja);
  } catch (error) {
    UIService.mostrarAlerta('Error: ' + error.message);
    Logger.log('Error en autorizarCxDesdeFila: ' + error.stack);
  }
}

/**
 * Procesa la autorización de una cirugía
 * Esta función es llamada desde el diálogo de autorización
 * @param {number} fila - Número de fila
 * @param {string} nombreHoja - Nombre de la hoja
 */
function procesarAutorizacionCx(fila, nombreHoja) {
  try {
    Logger.log('Iniciando autorización - Fila: ' + fila + ', Hoja: ' + nombreHoja);
    
    // Verificar nuevamente si ya está autorizada (por si acaso)
    if (SheetService.estaAutorizada(nombreHoja, fila)) {
      throw new Error('La cirugía ya está autorizada');
    }
    
    // Obtener datos de la fila
    const datos = SheetService.obtenerDatosFila(fila);
    
    // Crear carpeta vacía para el proyecto
    const folder = DriveService.crearCarpetaCx(datos.idProyecto, datos.paciente);
    const folderUrl = folder.getUrl();
    
    Logger.log('Carpeta creada: ' + folder.getName() + ' (ID: ' + folder.getId() + ')');
    
    // Insertar hipervínculo de la carpeta en columna C
    SheetService.insertarHipervincultoCarpeta(nombreHoja, fila, folderUrl, datos.idProyecto);
    
    // Autorizar la cirugía (actualiza estado y formato)
    SheetService.autorizarCirugia(nombreHoja, fila);
    
    Logger.log('Cirugía autorizada exitosamente - Fila: ' + fila);
    
    return {
      success: true,
      mensaje: 'Cirugía autorizada correctamente y carpeta creada'
    };
  } catch (error) {
    Logger.log('Error al procesar autorización: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    throw new Error('Error al procesar autorización: ' + error.message);
  }
}

/**
 * Muestra el resumen de CX con opciones de actualizar PDF y copiar
 * Se ejecuta desde el menú personalizado
 */
function mostrarResumenCx() {
  try {
    const { sheet, row } = SheetService.obtenerSeleccionActual();
    const datos = SheetService.obtenerDatosFila(row);
    const nombreHoja = sheet.getName();
    
    // Validar datos obligatorios
    if (!Utils.validarDatosObligatorios(datos)) {
      UIService.mostrarAlerta(CONFIG.MESSAGES.ERROR_MISSING_DATA);
      return;
    }
    
    // Validar que esté autorizada
    if (!SheetService.estaAutorizada(nombreHoja, row)) {
      UIService.mostrarAlerta(
        '⚠️ Cirugía No Autorizada\n\n' +
        'Esta cirugía no está autorizada aún.\n\n' +
        '📋 Estado actual: ' + (datos.estado || 'Sin estado') + '\n\n' +
        'Por favor, autoriza la cirugía primero usando:\n' +
        'CX → ✅ Autorizar Cirugía'
      );
      return;
    }
    
    // Mostrar diálogo con el resumen y botones
    UIService.mostrarDialogoResumenCx(datos, row, nombreHoja);
    
  } catch (error) {
    UIService.mostrarAlerta('Error: ' + error.message);
    Logger.log('Error en mostrarResumenCx: ' + error.stack);
  }
}

/**
 * Genera el PDF de resumen y lo guarda en la carpeta del proyecto
 * Se ejecuta desde el diálogo de resumen
 * @param {number} fila - Número de fila
 * @param {string} nombreHoja - Nombre de la hoja
 * @returns {Object} Resultado de la operación
 */
function generarPdfResumenCx(fila, nombreHoja) {
  try {
    Logger.log('Generando PDF de resumen - Fila: ' + fila + ', Hoja: ' + nombreHoja);
    
    // Obtener la hoja y activarla temporalmente para obtener los datos
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = ss.getSheetByName(nombreHoja);
    
    if (!hoja) {
      throw new Error('Hoja "' + nombreHoja + '" no encontrada');
    }
    
    // Obtener datos directamente de la hoja especificada
    const values = hoja.getRange(fila, 1, 1, hoja.getLastColumn()).getValues()[0];
    const cols = CONFIG.SHEETS.COLUMNS;
    
    const datos = {
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
    
    Logger.log('Datos obtenidos - Paciente: ' + datos.paciente + ', ID: ' + datos.idProyecto);
    
    // Limpiar el ID del proyecto usando la función helper
    const idProyectoLimpio = Utils.limpiarIdProyecto(datos.idProyecto);
    
    Logger.log('ID Proyecto limpio: ' + idProyectoLimpio);
    
    // Validar que esté autorizada
    if (!SheetService.estaAutorizada(nombreHoja, fila)) {
      throw new Error('La cirugía debe estar autorizada para generar el PDF');
    }
    
    // Buscar la carpeta del proyecto
    const nombreCarpeta = idProyectoLimpio + ' - ' + datos.paciente;
    Logger.log('Buscando carpeta: ' + nombreCarpeta);
    
    const parentFolder = DriveApp.getFolderById(CONFIG.DRIVE.PARENT_FOLDER_ID);
    const folders = parentFolder.getFoldersByName(nombreCarpeta);
    
    if (!folders.hasNext()) {
      throw new Error('No se encontró la carpeta del proyecto: ' + nombreCarpeta);
    }
    
    const folder = folders.next();
    Logger.log('Carpeta encontrada: ' + folder.getName() + ' (ID: ' + folder.getId() + ')');
    
    // Generar PDF
    const datosPdf = PdfService.prepararDatosParaPdf(datos);
    const pdfFile = PdfService.generarPdfCx(folder, datosPdf);
    
    Logger.log('PDF generado exitosamente: ' + pdfFile.getName());
    
    return {
      success: true,
      mensaje: 'PDF generado y guardado en la carpeta del proyecto'
    };
    
  } catch (error) {
    Logger.log('Error al generar PDF de resumen: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    return {
      success: false,
      mensaje: error.message
    };
  }
}

/**
 * Genera el mensaje de resumen de la cirugía y lo copia al portapapeles
 * Se ejecuta desde el menú personalizado
 */
function generarMensajeResumen() {
  try {
    const { sheet, row } = SheetService.obtenerSeleccionActual();
    const datos = SheetService.obtenerDatosFila(row);
    const nombreHoja = sheet.getName();
    
    // Validar datos obligatorios
    if (!Utils.validarDatosObligatorios(datos)) {
      UIService.mostrarAlerta(CONFIG.MESSAGES.ERROR_MISSING_DATA);
      return;
    }
    
    // Validar que esté autorizada
    if (!SheetService.estaAutorizada(nombreHoja, row)) {
      UIService.mostrarAlerta(
        '⚠️ Cirugía No Autorizada\n\n' +
        'Esta cirugía no está autorizada aún.\n\n' +
        '📋 Estado actual: ' + (datos.estado || 'Sin estado') + '\n\n' +
        'Por favor, autoriza la cirugía primero usando:\n' +
        'CX → ✅ Autorizar Cirugía'
      );
      return;
    }
    
    // Mostrar diálogo con el resumen para copiar
    UIService.mostrarDialogoResumen(datos);
    
  } catch (error) {
    UIService.mostrarAlerta('Error: ' + error.message);
    Logger.log('Error en generarMensajeResumen: ' + error.stack);
  }
}

/**
 * Muestra el diálogo de Formulario Asistencia Técnica
 * Se ejecuta desde el menú personalizado
 */
function mostrarFormularioAsistenciaTecnica() {
  try {
    // 1. Obtener datos de la fila seleccionada
    const { sheet, row } = SheetService.obtenerSeleccionActual();
    const datos = SheetService.obtenerDatosFila(row);
    const nombreHoja = sheet.getName();

    // 2. Validar datos obligatorios
    if (!Utils.validarDatosObligatorios(datos)) {
      UIService.mostrarAlerta(CONFIG.MESSAGES.ERROR_MISSING_DATA);
      return;
    }

    // 3. Mostrar diálogo con opciones (las validaciones se harán dentro del diálogo)
    UIService.mostrarDialogoFormularioAsistencia(datos, row, nombreHoja);

  } catch (error) {
    UIService.mostrarAlerta('Error: ' + error.message);
    Logger.log('Error en mostrarFormularioAsistenciaTecnica: ' + error.stack);
  }
}

/**
 * Procesa la generación del formulario y lo registra en Links_AsistenciaTecnica
 * Se ejecuta desde el diálogo
 * @param {number} fila - Número de fila
 * @param {string} nombreHoja - Nombre de la hoja
 * @returns {Object} Resultado de la operación
 */
function procesarGenerarFormulario(fila, nombreHoja) {
  try {
    Logger.log('Generando formulario - Fila: ' + fila + ', Hoja: ' + nombreHoja);
    
    // Obtener datos usando la función helper
    const datos = SheetService.obtenerDatosCompletos(nombreHoja, fila);
    
    Logger.log('Estado de la cirugía: ' + datos.estado);
    
    // VALIDACIÓN 1: Verificar que la cirugía esté autorizada
    if (!SheetService.estaAutorizada(nombreHoja, fila)) {
      Logger.log('ERROR: Cirugía no autorizada');
      return {
        success: false,
        mensaje: 'La cirugía debe estar autorizada antes de generar el formulario. Estado actual: ' + (datos.estado || 'Sin estado')
      };
    }
    
    Logger.log('✓ Cirugía autorizada');
    
    // Limpiar el ID del proyecto usando la función helper
    const idProyectoLimpio = Utils.limpiarIdProyecto(datos.idProyecto);
    
    Logger.log('ID Proyecto limpio: ' + idProyectoLimpio);
    
    // Verificar si ya existe en Links_AsistenciaTecnica
    const infoExistente = SheetService.buscarEnLinksAsistencia(idProyectoLimpio, datos.paciente.trim());
    
    if (infoExistente) {
      Logger.log('ADVERTENCIA: Formulario ya existe');
      return {
        success: false,
        mensaje: 'Este formulario ya fue generado previamente.'
      };
    }
    
    Logger.log('✓ Formulario no existe, continuando...');
    
    // VALIDACIÓN 2: Buscar la carpeta del proyecto
    const nombreCarpeta = idProyectoLimpio + ' - ' + datos.paciente.trim();
    Logger.log('Buscando carpeta: "' + nombreCarpeta + '"');
    
    const parentFolder = DriveApp.getFolderById(CONFIG.DRIVE.PARENT_FOLDER_ID);
    const folders = parentFolder.getFoldersByName(nombreCarpeta);
    
    if (!folders.hasNext()) {
      Logger.log('ERROR: Carpeta no encontrada');
      return {
        success: false,
        mensaje: 'No se encontró la carpeta del proyecto: "' + nombreCarpeta + '". Asegúrese de que la cirugía esté autorizada y la carpeta haya sido creada.'
      };
    }
    
    const folder = folders.next();
    const folderId = folder.getId();
    const folderName = folder.getName();
    
    Logger.log('Carpeta encontrada: ' + folderName);
    
    // Generar PDF si no existe
    const datosPdf = PdfService.prepararDatosParaPdf(datos);
    const pdfFile = PdfService.generarPdfCx(folder, datosPdf);
    const pdfUrl = DriveService.obtenerUrlArchivo(pdfFile);
    
    // Crear formulario prellenado
    const datosForm = FormService.prepararDatosParaForm(datos);
    const linkForm = FormService.crearLinkFormPrellenado(
      folderName,
      folderId,
      datosForm
    );
    
    // Registrar en hoja de links con TODOS los campos
    SheetService.guardarLinkEnOtraHoja({
      fechaCx: Utils.formatearFechaArg(datos.fechaCx),
      horaCx: datos.horaCx ? Utils.formatearHoraArg(datos.horaCx) : '',
      paciente: datos.paciente,
      institucion: datos.institucion || '',
      medico: datos.medico || '',
      material: datos.material || '',
      pdfUrl: pdfUrl,
      linkForm: linkForm,
      folderName: folderName,
      folderId: folderId,
      hojaOrigen: nombreHoja,
      filaOrigen: fila
    });
    
    Logger.log('Formulario generado y registrado exitosamente');
    
    return {
      success: true,
      mensaje: 'Formulario generado y registrado exitosamente',
      linkForm: linkForm
    };
    
  } catch (error) {
    Logger.log('Error al generar formulario: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    return {
      success: false,
      mensaje: error.message
    };
  }
}

/**
 * Consulta la información del formulario en Links_AsistenciaTecnica
 * Se ejecuta desde el diálogo
 * @param {number} fila - Número de fila
 * @param {string} nombreHoja - Nombre de la hoja
 * @returns {Object} Resultado de la operación
 */
function consultarInfoFormulario(fila, nombreHoja) {
  try {
    Logger.log('=== INICIO consultarInfoFormulario ===');
    Logger.log('Fila: ' + fila + ', Hoja: ' + nombreHoja);
    
    // Obtener datos usando la función helper
    const datos = SheetService.obtenerDatosCompletos(nombreHoja, fila);
    
    Logger.log('Datos obtenidos - Paciente: ' + datos.paciente + ', ID: ' + datos.idProyecto);
    
    // Limpiar el ID del proyecto usando la función helper
    const idProyectoLimpio = Utils.limpiarIdProyecto(datos.idProyecto);
    
    Logger.log('ID Proyecto limpio: ' + idProyectoLimpio);
    Logger.log('Buscando en Links_AsistenciaTecnica...');
    
    // Buscar en Links_AsistenciaTecnica
    const info = SheetService.buscarEnLinksAsistencia(idProyectoLimpio, datos.paciente.trim());
    
    Logger.log('Resultado de búsqueda: ' + (info ? 'ENCONTRADO' : 'NO ENCONTRADO'));
    
    if (info) {
      Logger.log('✓ Información encontrada en Links_AsistenciaTecnica');
      Logger.log('  - Paciente: ' + info.paciente);
      Logger.log('  - Link Form: ' + info.linkForm);
      
      const resultado = {
        encontrado: true,
        info: {
          fechaCx: info.fechaCx ? info.fechaCx.toString() : '',  // Convertir Date a String
          paciente: info.paciente,
          pdfUrl: info.pdfUrl,
          linkForm: info.linkForm
        }
      };
      
      Logger.log('Retornando resultado: ' + JSON.stringify(resultado));
      return resultado;
    } else {
      Logger.log('✗ No se encontró información en Links_AsistenciaTecnica');
      return {
        encontrado: false,
        mensaje: 'No se encontró información del formulario.'
      };
    }
    
  } catch (error) {
    Logger.log('ERROR en consultarInfoFormulario: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    return {
      encontrado: false,
      mensaje: 'Error: ' + error.message
    };
  }
}

/**
 * Obtiene el resumen de CX formateado
 * Se ejecuta desde el diálogo
 * @param {number} fila - Número de fila
 * @param {string} nombreHoja - Nombre de la hoja
 * @returns {string} Resumen formateado
 */
function obtenerResumenCx(fila, nombreHoja) {
  try {
    // Obtener datos usando la función helper
    const datos = SheetService.obtenerDatosCompletos(nombreHoja, fila);
    
    // Construir el resumen usando la función de UIService
    // Nota: No podemos llamar directamente a _construirMensajeResumen porque es privada,
    // pero podemos construir manualmente con la misma lógica
    let resumen = '✅ CX Autorizada\n';
    resumen += '📅 Fecha: ' + Utils.formatearFechaArg(datos.fechaCx);
    
    if (datos.horaCx && datos.horaCx.toString().trim() !== '') {
      resumen += ' – ' + Utils.formatearHoraArg(datos.horaCx) + ' hs';
    }
    
    resumen += '\n';
    resumen += '👤 Paciente: ' + Utils.obtenerValorODefault(datos.paciente) + '\n';
    resumen += '🏥 Institución: ' + Utils.obtenerValorODefault(datos.institucion) + '\n';
    resumen += '🩺 Médico: ' + Utils.obtenerValorODefault(datos.medico) + '\n';
    resumen += '👥 Cliente: ' + Utils.obtenerValorODefault(datos.cliente) + '\n';
    resumen += '\n';
    resumen += '📦 Material: ' + Utils.obtenerValorODefault(datos.material);
    
    return resumen;
    
  } catch (error) {
    Logger.log('Error al obtener resumen CX: ' + error.message);
    throw new Error('Error al obtener resumen: ' + error.message);
  }
}

/**
 * Instala el trigger de formulario desde el menú
 */
function instalarTriggerFormulario() {
  try {
    const resultado = FormTriggerService.instalarTrigger();
    UIService.mostrarAlerta(resultado);
  } catch (error) {
    UIService.mostrarAlerta('Error: ' + error.message);
  }
}

/**
 * Verifica el estado del trigger de formulario
 */
function verificarTriggerFormulario() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let encontrado = false;
    
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === 'onFormSubmit') {
        encontrado = true;
        break;
      }
    }
    
    if (encontrado) {
      UIService.mostrarAlerta('✅ El trigger de formulario está instalado correctamente.\n\nLos archivos subidos al formulario se moverán automáticamente a la carpeta del proyecto.');
    } else {
      UIService.mostrarAlerta('⚠️ El trigger de formulario NO está instalado.\n\nUsa la opción "Instalar Trigger de Formulario" del menú Configuración para instalarlo.');
    }
  } catch (error) {
    UIService.mostrarAlerta('Error: ' + error.message);
  }
}
