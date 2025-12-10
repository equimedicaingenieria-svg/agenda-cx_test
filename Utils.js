/**
 * Utils.js
 * Funciones utilitarias para formateo y validación
 * 
 * Este módulo contiene funciones helper para formatear fechas, horas,
 * validar datos y otras operaciones comunes.
 */

/**
 * Clase principal de utilidades
 */
const Utils = {

  /**
   * Formatea una fecha al formato argentino (dd/MM/yyyy)
   * @param {Date|string} valor - Fecha a formatear
   * @returns {string} Fecha formateada o cadena vacía
   */
  formatearFechaArg: function(valor) {
    if (valor instanceof Date) {
      return Utilities.formatDate(
        valor,
        CONFIG.TIMEZONE,
        CONFIG.FORMATS.FECHA_ARG
      );
    }
    return valor || '';
  },

  /**
   * Formatea una fecha para el formulario (yyyy-MM-dd)
   * @param {Date|string} valor - Fecha a formatear
   * @returns {string} Fecha formateada o cadena vacía
   */
  formatearFechaParaForm: function(valor) {
    if (valor instanceof Date) {
      return Utilities.formatDate(
        valor,
        CONFIG.TIMEZONE,
        CONFIG.FORMATS.FECHA_FORM
      );
    }
    return valor || '';
  },

  /**
   * Formatea una fecha para nombre de archivo (yyyy-MM-dd)
   * @param {Date|string} valor - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  formatearFechaParaNombre: function(valor) {
    if (valor instanceof Date) {
      return Utilities.formatDate(
        valor,
        CONFIG.TIMEZONE,
        CONFIG.FORMATS.FECHA_FILENAME
      );
    }
    return this.formatearFechaParaForm(valor);
  },

  /**
   * Formatea una hora al formato HH:mm
   * @param {Date|string} valor - Hora a formatear
   * @returns {string} Hora formateada o cadena vacía
   */
  formatearHoraArg: function(valor) {
    if (valor instanceof Date) {
      return Utilities.formatDate(
        valor,
        CONFIG.TIMEZONE,
        CONFIG.FORMATS.HORA
      );
    }
    return valor || '';
  },

  /**
   * Valida que los datos obligatorios estén presentes
   * @param {Object} datos - Objeto con los datos a validar
   * @returns {boolean} true si los datos son válidos
   */
  validarDatosObligatorios: function(datos) {
    return !!(datos.fechaCx && datos.idProyecto && datos.paciente);
  },

  /**
   * Sanitiza texto para HTML
   * @param {string} texto - Texto a sanitizar
   * @returns {string} Texto sanitizado
   */
  sanitizarHtml: function(texto) {
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /**
   * Genera un nombre de archivo basado en ID proyecto y paciente
   * @param {string} idProyecto - ID del proyecto
   * @param {string} paciente - Nombre del paciente
   * @param {string} sufijo - Sufijo opcional
   * @returns {string} Nombre del archivo
   */
  generarNombreArchivo: function(idProyecto, paciente, sufijo = '') {
    const nombre = idProyecto + ' - ' + paciente;
    return sufijo ? nombre + ' - ' + sufijo : nombre;
  },

  /**
   * Verifica si un valor es nulo o vacío
   * @param {*} valor - Valor a verificar
   * @returns {boolean} true si está vacío
   */
  estaVacio: function(valor) {
    return valor === null || valor === undefined || valor === '';
  },

  /**
   * Obtiene un valor o retorna un valor por defecto
   * @param {*} valor - Valor a verificar
   * @param {*} valorPorDefecto - Valor por defecto
   * @returns {*} Valor o valor por defecto
   */
  obtenerValorODefault: function(valor, valorPorDefecto = '') {
    return this.estaVacio(valor) ? valorPorDefecto : valor;
  }
};
