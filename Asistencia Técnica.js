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
    
    // Autorizar la cirugía (actualiza estado y formato)
    SheetService.autorizarCirugia(nombreHoja, fila);
    
    Logger.log('Cirugía autorizada exitosamente - Fila: ' + fila);
    
    return {
      success: true,
      mensaje: 'Cirugía autorizada correctamente'
    };
  } catch (error) {
    Logger.log('Error al procesar autorización: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    throw new Error('Error al procesar autorización: ' + error.message);
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
 * Flujo completo de generación de carpeta, PDF y formulario
 * Se ejecuta desde el menú personalizado
 */
function flujoCxDesdeFila() {
  try {
    // 1. Obtener datos de la fila seleccionada
    const { sheet, row } = SheetService.obtenerSeleccionActual();
    const datosRaw = SheetService.obtenerDatosFila(row);

    // 2. Validar datos obligatorios
    if (!Utils.validarDatosObligatorios(datosRaw)) {
      UIService.mostrarAlerta(CONFIG.MESSAGES.ERROR_MISSING_DATA);
      return;
    }

    // 3. Crear carpeta
    const folder = DriveService.crearCarpetaCx(datosRaw.idProyecto, datosRaw.paciente);
    const folderUrl = folder.getUrl();

    // 3.1. Insertar hipervínculo de la carpeta en columna C
    SheetService.insertarHipervincultoCarpeta(sheet.getName(), row, folderUrl, datosRaw.idProyecto);

    // 4. Generar PDF
    const datosPdf = PdfService.prepararDatosParaPdf(datosRaw);
    const pdfFile = PdfService.generarPdfCx(folder, datosPdf);
    const pdfUrl = DriveService.obtenerUrlArchivo(pdfFile);

    // 5. Crear link del formulario prellenado
    const datosForm = FormService.prepararDatosParaForm(datosRaw);
    const linkForm = FormService.crearLinkFormPrellenado(
      folder.getName(),
      folder.getId(),
      datosForm
    );

    // 6. Registrar en hoja de links
    SheetService.guardarLinkEnOtraHoja({
      fechaCx: Utils.formatearFechaArg(datosRaw.fechaCx),
      horaCx: Utils.formatearHoraArg(datosRaw.horaCx),
      paciente: datosRaw.paciente,
      institucion: datosRaw.institucion,
      medico: datosRaw.medico,
      material: datosRaw.material,
      pdfUrl: pdfUrl,
      linkForm: linkForm,
      folderName: folder.getName(),
      folderId: folder.getId(),
      hojaOrigen: sheet.getName(),
      filaOrigen: row
    });

    // 7. Mostrar diálogo con mensaje para WhatsApp
    const mensajeWhatsApp = UIService.construirMensajeWhatsApp(datosRaw, linkForm);
    UIService.mostrarDialogoWhatsApp(mensajeWhatsApp);

  } catch (error) {
    UIService.mostrarAlerta('Error en el flujo: ' + error.message);
    Logger.log('Error detallado: ' + error.stack);
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
