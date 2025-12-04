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
 * Muestra un resumen de la cirugía seleccionada
 * Se ejecuta desde el menú personalizado
 */
function generarResumenCxDesdeFila() {
  try {
    const { row } = SheetService.obtenerSeleccionActual();
    const datos = SheetService.obtenerDatosFila(row);
    
    UIService.mostrarResumenCx(datos);
  } catch (error) {
    UIService.mostrarAlerta('Error: ' + error.message);
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
    const fechaParaNombre = Utils.formatearFechaParaNombre(datosRaw.fechaCx);
    const folder = DriveService.crearCarpetaCx(fechaParaNombre, datosRaw.paciente);

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
