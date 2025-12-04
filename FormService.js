/**
 * FormService.js
 * Servicio para manejo de formularios de Google
 * 
 * Este módulo encapsula la lógica de generación de enlaces
 * prellenados para formularios de Google Forms.
 */

const FormService = {

  /**
   * Crea un enlace prellenado del formulario
   * @param {string} folderName - Nombre de la carpeta
   * @param {string} folderId - ID de la carpeta
   * @param {Object} data - Datos para prellenar
   * @returns {string} URL del formulario prellenado
   */
  crearLinkFormPrellenado: function(folderName, folderId, data) {
    try {
      const baseUrl = this._construirUrlBase();
      const parametros = this._construirParametros(folderName, folderId, data);
      return baseUrl + parametros;
    } catch (error) {
      throw new Error('Error al crear link del formulario: ' + error.message);
    }
  },

  /**
   * Construye la URL base del formulario
   * @private
   * @returns {string} URL base
   */
  _construirUrlBase: function() {
    return 'https://docs.google.com/forms/d/' + CONFIG.FORM.ID + '/viewform?';
  },

  /**
   * Construye los parámetros del formulario
   * @private
   * @param {string} folderName - Nombre de la carpeta
   * @param {string} folderId - ID de la carpeta
   * @param {Object} data - Datos del formulario
   * @returns {string} Query string con parámetros
   */
  _construirParametros: function(folderName, folderId, data) {
    const params = {};
    
    params[CONFIG.FORM.ENTRIES.PACIENTE] = data.paciente || '';
    params[CONFIG.FORM.ENTRIES.FECHA_CX] = data.fechaCxForm || '';
    params[CONFIG.FORM.ENTRIES.HORA_CX] = data.horaCx || '';
    params[CONFIG.FORM.ENTRIES.INSTITUCION] = data.institucion || '';
    params[CONFIG.FORM.ENTRIES.MEDICO] = data.medico || '';
    params[CONFIG.FORM.ENTRIES.MATERIAL] = data.material || '';
    params[CONFIG.FORM.ENTRIES.FOLDER_NAME] = folderName;
    params[CONFIG.FORM.ENTRIES.FOLDER_ID] = folderId;

    return this._codificarParametros(params);
  },

  /**
   * Codifica los parámetros para URL
   * @private
   * @param {Object} params - Objeto con parámetros
   * @returns {string} Query string codificado
   */
  _codificarParametros: function(params) {
    return Object.keys(params)
      .map(function(key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      })
      .join('&');
  },

  /**
   * Prepara los datos para el formulario
   * @param {Object} datosRaw - Datos sin formatear
   * @returns {Object} Datos formateados para el formulario
   */
  prepararDatosParaForm: function(datosRaw) {
    return {
      paciente: datosRaw.paciente,
      fechaCxForm: Utils.formatearFechaParaForm(datosRaw.fechaCx),
      horaCx: Utils.formatearHoraArg(datosRaw.horaCx),
      institucion: datosRaw.institucion,
      medico: datosRaw.medico,
      material: datosRaw.material
    };
  }
};
