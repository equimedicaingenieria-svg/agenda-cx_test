/**
 * DriveService.js
 * Servicio para operaciones con Google Drive
 * 
 * Este módulo encapsula todas las operaciones relacionadas con
 * Google Drive: creación de carpetas, manejo de archivos, etc.
 */

const DriveService = {

  /**
   * Crea una carpeta para una cirugía
   * @param {string} idProyecto - ID del proyecto
   * @param {string} paciente - Nombre del paciente
   * @returns {Folder} Carpeta creada
   */
  crearCarpetaCx: function(idProyecto, paciente) {
    try {
      const parent = DriveApp.getFolderById(CONFIG.DRIVE.PARENT_FOLDER_ID);
      const nombreCarpeta = Utils.generarNombreArchivo(idProyecto, paciente);
      return parent.createFolder(nombreCarpeta);
    } catch (error) {
      throw new Error('Error al crear carpeta: ' + error.message);
    }
  },

  /**
   * Obtiene la carpeta padre configurada
   * @returns {Folder} Carpeta padre
   */
  obtenerCarpetaPadre: function() {
    try {
      return DriveApp.getFolderById(CONFIG.DRIVE.PARENT_FOLDER_ID);
    } catch (error) {
      throw new Error('Error al obtener carpeta padre: ' + error.message);
    }
  },

  /**
   * Crea un archivo PDF en una carpeta específica
   * @param {Folder} folder - Carpeta destino
   * @param {Blob} pdfBlob - Blob del PDF
   * @param {string} nombre - Nombre del archivo
   * @returns {File} Archivo PDF creado
   */
  crearArchivoPdf: function(folder, pdfBlob, nombre) {
    try {
      return folder
        .createFile(pdfBlob)
        .setName(nombre);
    } catch (error) {
      throw new Error('Error al crear archivo PDF: ' + error.message);
    }
  },

  /**
   * Copia un archivo de plantilla a una carpeta destino
   * @param {string} templateId - ID del archivo plantilla
   * @param {Folder} destFolder - Carpeta destino
   * @param {string} nombre - Nombre del archivo copiado
   * @returns {File} Archivo copiado
   */
  copiarPlantilla: function(templateId, destFolder, nombre) {
    try {
      const templateFile = DriveApp.getFileById(templateId);
      return templateFile.makeCopy(nombre, destFolder);
    } catch (error) {
      throw new Error('Error al copiar plantilla: ' + error.message);
    }
  },

  /**
   * Mueve un archivo a la papelera
   * @param {File} file - Archivo a eliminar
   * @returns {File} Archivo eliminado
   */
  moverAPapelera: function(file) {
    try {
      return file.setTrashed(true);
    } catch (error) {
      throw new Error('Error al mover archivo a papelera: ' + error.message);
    }
  },

  /**
   * Obtiene la URL de un archivo
   * @param {File} file - Archivo
   * @returns {string} URL del archivo
   */
  obtenerUrlArchivo: function(file) {
    try {
      return file.getUrl();
    } catch (error) {
      throw new Error('Error al obtener URL del archivo: ' + error.message);
    }
  }
};
