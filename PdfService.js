/**
 * PdfService.js
 * Servicio para generación y manejo de documentos PDF
 * 
 * Este módulo encapsula la lógica de creación de PDFs a partir
 * de plantillas de Google Docs.
 */

const PdfService = {

  /**
   * Genera un PDF de resumen de cirugía
   * @param {Folder} folder - Carpeta donde guardar el PDF
   * @param {Object} data - Datos de la cirugía
   * @returns {File} Archivo PDF generado
   */
  generarPdfCx: function(folder, data) {
    try {
      // 1. Copiar plantilla
      const copiaDoc = this._copiarPlantilla(folder, data.paciente);
      
      // 2. Rellenar plantilla con datos
      this._rellenarPlantilla(copiaDoc, data);
      
      // 3. Generar PDF
      const pdfFile = this._exportarAPdf(copiaDoc, folder, data.paciente);
      
      // 4. Limpiar archivo temporal
      DriveService.moverAPapelera(copiaDoc);
      
      return pdfFile;
    } catch (error) {
      throw new Error('Error al generar PDF: ' + error.message);
    }
  },

  /**
   * Copia la plantilla de documento
   * @private
   * @param {Folder} folder - Carpeta destino
   * @param {string} paciente - Nombre del paciente
   * @returns {File} Documento copiado
   */
  _copiarPlantilla: function(folder, paciente) {
    const nombreDoc = 'Resumen CX - ' + paciente;
    return DriveService.copiarPlantilla(
      CONFIG.DRIVE.TEMPLATE_DOC_ID,
      folder,
      nombreDoc
    );
  },

  /**
   * Rellena la plantilla con los datos de la cirugía
   * @private
   * @param {File} docFile - Archivo del documento
   * @param {Object} data - Datos para rellenar
   */
  _rellenarPlantilla: function(docFile, data) {
    const doc = DocumentApp.openById(docFile.getId());
    const body = doc.getBody();

    const reemplazos = {
      '<<FECHA_CX>>':    Utils.obtenerValorODefault(data.fechaCx),
      '<<HORA_CX>>':     Utils.obtenerValorODefault(data.horaCx),
      '<<PACIENTE>>':    Utils.obtenerValorODefault(data.paciente),
      '<<INSTITUCION>>': Utils.obtenerValorODefault(data.institucion),
      '<<MEDICO>>':      Utils.obtenerValorODefault(data.medico),
      '<<MATERIAL>>':    Utils.obtenerValorODefault(data.material)
    };

    for (var marcador in reemplazos) {
      if (reemplazos.hasOwnProperty(marcador)) {
        body.replaceText(marcador, reemplazos[marcador]);
      }
    }

    doc.saveAndClose();
  },

  /**
   * Exporta el documento a PDF
   * @private
   * @param {File} docFile - Archivo del documento
   * @param {Folder} folder - Carpeta destino
   * @param {string} paciente - Nombre del paciente
   * @returns {File} Archivo PDF
   */
  _exportarAPdf: function(docFile, folder, paciente) {
    const pdfBlob = docFile.getAs(MimeType.PDF);
    const nombrePdf = 'Resumen CX - ' + paciente + '.pdf';
    return DriveService.crearArchivoPdf(folder, pdfBlob, nombrePdf);
  },

  /**
   * Obtiene el objeto de datos formateado para PDF
   * @param {Object} datosRaw - Datos sin formatear
   * @returns {Object} Datos formateados
   */
  prepararDatosParaPdf: function(datosRaw) {
    return {
      fechaCx: Utils.formatearFechaArg(datosRaw.fechaCx),
      horaCx: Utils.formatearHoraArg(datosRaw.horaCx),
      paciente: datosRaw.paciente,
      institucion: datosRaw.institucion,
      medico: datosRaw.medico,
      material: datosRaw.material
    };
  }
};
