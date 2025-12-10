/**
 * FormTriggerService.js
 * Servicio para manejar eventos de envío del formulario
 * 
 * Este módulo gestiona los archivos subidos a través de Google Forms
 * y los organiza en las carpetas correspondientes del proyecto.
 */

/**
 * Función trigger que se ejecuta cuando se envía el formulario
 * IMPORTANTE: Esta función debe ser configurada como trigger en el proyecto
 * 
 * Para configurar el trigger:
 * 1. En el editor de Apps Script, ir a "Activadores" (icono del reloj)
 * 2. Agregar activador:
 *    - Función: onFormSubmit
 *    - Evento: Del formulario > Al enviar formulario
 *    - Seleccionar el formulario correspondiente
 * 
 * @param {Object} e - Evento de envío del formulario
 */
function onFormSubmit(e) {
  try {
    FormTriggerService.procesarEnvioFormulario(e);
  } catch (error) {
    Logger.log('Error en onFormSubmit: ' + error.message);
    Logger.log('Stack: ' + error.stack);
  }
}

const FormTriggerService = {

  /**
   * Procesa el envío del formulario y mueve los archivos a la carpeta correcta
   * @param {Object} e - Evento de envío del formulario
   */
  procesarEnvioFormulario: function(e) {
    try {
      Logger.log('=== Inicio procesamiento formulario ===');
      Logger.log('Evento recibido: ' + (e ? 'SI' : 'NO'));
      Logger.log('namedValues existe: ' + (e && e.namedValues ? 'SI' : 'NO'));
      Logger.log('response existe: ' + (e && e.response ? 'SI' : 'NO'));
      
      // El trigger puede venir de dos formas:
      // 1. Desde el proyecto del Form: e.namedValues
      // 2. Desde el proyecto del Sheet: e.response
      
      let values = null;
      
      if (e && e.namedValues) {
        // Método 1: Trigger desde el Form
        Logger.log('Usando e.namedValues (trigger desde Form)');
        values = e.namedValues;
      } else if (e && e.response) {
        // Método 2: Trigger desde el Sheet - necesitamos extraer de forma diferente
        Logger.log('Usando e.response (trigger desde Sheet)');
        
        // Obtener las respuestas del objeto FormResponse
        const formResponse = e.response;
        const itemResponses = formResponse.getItemResponses();
        
        // Convertir a formato namedValues
        values = {};
        for (var i = 0; i < itemResponses.length; i++) {
          const item = itemResponses[i];
          const pregunta = item.getItem().getTitle();
          const respuesta = item.getResponse();
          
          // Si la respuesta es un array, dejarlo como array, si no, convertirlo a array
          if (Array.isArray(respuesta)) {
            values[pregunta] = respuesta;
          } else {
            values[pregunta] = [respuesta];
          }
          
          Logger.log('Campo extraído: "' + pregunta + '" = ' + JSON.stringify(values[pregunta]));
        }
      } else {
        Logger.log('ERROR: No se encontró e.namedValues ni e.response');
        Logger.log('Objeto e completo: ' + JSON.stringify(e));
        return;
      }
      
      // DEBUG: Mostrar TODOS los valores
      Logger.log('');
      Logger.log('TODOS LOS VALORES RECIBIDOS:');
      for (var key in values) {
        Logger.log('  "' + key + '": ' + JSON.stringify(values[key]));
      }
      Logger.log('');
      
      // Crear objeto e simulado con namedValues
      const eSimulado = {
        namedValues: values
      };
      
      // Obtener respuestas del formulario
      const respuestas = this._extraerRespuestas(eSimulado);
      Logger.log('Respuestas extraídas: ' + JSON.stringify(respuestas));
      
      // Validar que tengamos el ID de la carpeta
      if (!respuestas.folderId) {
        Logger.log('ADVERTENCIA: No se encontró ID de carpeta en el formulario');
        return;
      }
      
      // Obtener archivos adjuntos
      const archivosAdjuntos = this._extraerArchivos(eSimulado);
      Logger.log('Archivos encontrados: ' + archivosAdjuntos.length);
      
      if (archivosAdjuntos.length === 0) {
        Logger.log('No hay archivos adjuntos para mover');
        return;
      }
      
      // Mover archivos a la carpeta del proyecto
      this._moverArchivosACarpeta(archivosAdjuntos, respuestas.folderId, respuestas.folderName);
      
      Logger.log('=== Procesamiento completado exitosamente ===');
      
    } catch (error) {
      Logger.log('ERROR en procesarEnvioFormulario: ' + error.message);
      Logger.log('Stack: ' + error.stack);
      throw error;
    }
  },

  /**
   * Extrae las respuestas del formulario
   * @private
   * @param {Object} e - Evento del formulario
   * @returns {Object} Objeto con las respuestas
   */
  _extraerRespuestas: function(e) {
    const respuestas = {
      paciente: null,
      fechaCx: null,
      horaCx: null,
      institucion: null,
      medico: null,
      material: null,
      folderName: null,
      folderId: null
    };
    
    // Si viene del trigger, usar e.namedValues
    if (e && e.namedValues) {
      const values = e.namedValues;
      
      // Buscar por los nombres de las preguntas del formulario
      for (var key in values) {
        if (values.hasOwnProperty(key)) {
          const keyUpper = key.toUpperCase();
          const keyLower = key.toLowerCase();
          
          Logger.log('Analizando campo: "' + key + '"');
          
          // Buscar "ID CARPETA" - tu formulario lo tiene así
          if (keyUpper === 'ID CARPETA' || keyUpper === 'ID DE CARPETA' || 
              (keyLower.indexOf('id') !== -1 && keyLower.indexOf('carpeta') !== -1)) {
            respuestas.folderName = values[key][0];
            respuestas.folderId = values[key][0]; // Usar el mismo valor
            Logger.log('✓ ID CARPETA encontrado: "' + respuestas.folderName + '"');
          }
          
          // Paciente
          if (keyLower.indexOf('paciente') !== -1) {
            respuestas.paciente = values[key][0];
            Logger.log('✓ Paciente: "' + respuestas.paciente + '"');
          }
          
          // Fecha
          if (keyLower.indexOf('fecha') !== -1 && keyLower.indexOf('cirug') !== -1) {
            respuestas.fechaCx = values[key][0];
            Logger.log('✓ Fecha: "' + respuestas.fechaCx + '"');
          }
          
          // Hora
          if (keyLower.indexOf('hora') !== -1) {
            respuestas.horaCx = values[key][0];
          }
          
          // Institución
          if (keyLower.indexOf('instituci') !== -1) {
            respuestas.institucion = values[key][0];
            Logger.log('✓ Institución: "' + respuestas.institucion + '"');
          }
          
          // Médico
          if (keyLower.indexOf('m') !== -1 && keyLower.indexOf('dico') !== -1) {
            respuestas.medico = values[key][0];
            Logger.log('✓ Médico: "' + respuestas.medico + '"');
          }
          
          // Material
          if (keyLower.indexOf('material') !== -1) {
            respuestas.material = values[key][0];
            Logger.log('✓ Material: "' + respuestas.material + '"');
          }
        }
      }
      
      // DEBUG final
      Logger.log('RESUMEN:');
      Logger.log('  folderName: "' + respuestas.folderName + '"');
      Logger.log('  folderId: "' + respuestas.folderId + '"');
    }
    
    return respuestas;
  },

  /**
   * Obtiene un valor del objeto de respuestas
   * @private
   * @param {Object} values - Objeto namedValues
   * @param {string} key - Clave a buscar
   * @returns {string|null} Valor encontrado o null
   */
  _obtenerValor: function(values, key) {
    if (values[key] && values[key][0]) {
      return values[key][0];
    }
    return null;
  },

  /**
   * Extrae los archivos adjuntos del evento del formulario
   * @private
   * @param {Object} e - Evento del formulario
   * @returns {Array} Array de IDs de archivos adjuntos
   */
  _extraerArchivos: function(e) {
    const archivos = [];
    
    if (!e || !e.namedValues) {
      Logger.log('No hay e.namedValues para extraer archivos');
      return archivos;
    }
    
    const values = e.namedValues;
    
    // Buscar campos que contengan archivos
    for (var key in values) {
      if (values.hasOwnProperty(key)) {
        const respuestas = values[key];
        
        Logger.log('Revisando campo "' + key + '" para archivos');
        
        // Iterar sobre todas las respuestas (puede haber múltiples archivos)
        for (var i = 0; i < respuestas.length; i++) {
          const valor = respuestas[i];
          
          // Caso 1: Es un ID directo de Drive (sin URL)
          // Formato: string de ~30-40 caracteres alfanuméricos
          if (valor && typeof valor === 'string' && 
              valor.length > 20 && valor.length < 100 &&
              valor.indexOf('http') === -1 && 
              valor.indexOf('/') === -1 &&
              valor.indexOf(' ') === -1) {
            // Parece un ID de archivo de Drive
            archivos.push(valor);
            Logger.log('✓ Archivo detectado (ID directo) - "' + key + '": ' + valor);
          }
          // Caso 2: Es una URL de Drive
          else if (valor && typeof valor === 'string' && valor.indexOf('drive.google.com') !== -1) {
            const fileId = this._extraerFileIdDeUrl(valor);
            if (fileId) {
              archivos.push(fileId);
              Logger.log('✓ Archivo detectado (URL) - ID: ' + fileId);
            }
          }
        }
      }
    }
    
    Logger.log('Total de archivos detectados: ' + archivos.length);
    return archivos;
  },

  /**
   * Extrae el ID de archivo de una URL de Google Drive
   * @private
   * @param {string} url - URL de Google Drive
   * @returns {string|null} ID del archivo o null
   */
  _extraerFileIdDeUrl: function(url) {
    try {
      // Formatos comunes de URLs de Drive:
      // https://drive.google.com/open?id=FILE_ID
      // https://drive.google.com/file/d/FILE_ID/view
      
      if (url.indexOf('id=') !== -1) {
        const match = url.match(/id=([^&]+)/);
        return match ? match[1] : null;
      }
      
      if (url.indexOf('/d/') !== -1) {
        const match = url.match(/\/d\/([^\/]+)/);
        return match ? match[1] : null;
      }
      
      return null;
    } catch (error) {
      Logger.log('Error al extraer file ID de URL: ' + error.message);
      return null;
    }
  },

  /**
   * Mueve los archivos a la carpeta del proyecto y los renombra
   * @private
   * @param {Array} fileIds - Array de IDs de archivos
   * @param {string} targetFolderId - ID de la carpeta destino (puede ser el mismo que folderName)
   * @param {string} folderName - ID completo del proyecto (ej: "2025/12/17-0001 - SELEME HILDA ")
   */
  _moverArchivosACarpeta: function(fileIds, targetFolderId, folderName) {
    try {
      // El folderId puede venir con el formato completo "2025/12/17-0001 - PACIENTE"
      // Necesitamos obtener la carpeta por nombre, no por ID
      
      Logger.log('Buscando carpeta con nombre: ' + folderName);
      
      // Obtener la carpeta padre
      const parentFolder = DriveApp.getFolderById(CONFIG.DRIVE.PARENT_FOLDER_ID);
      
      // Buscar la carpeta por nombre
      const folders = parentFolder.getFoldersByName(folderName);
      let targetFolder = null;
      
      if (folders.hasNext()) {
        targetFolder = folders.next();
        Logger.log('✓ Carpeta encontrada: ' + targetFolder.getName());
      } else {
        Logger.log('ERROR: No se encontró carpeta con nombre "' + folderName + '"');
        throw new Error('Carpeta no encontrada: ' + folderName);
      }
      
      // Extraer solo el ID del proyecto (la parte antes del " - ")
      let idProyecto = folderName;
      if (folderName.indexOf(' - ') !== -1) {
        idProyecto = folderName.split(' - ')[0];
      }
      Logger.log('ID Proyecto para renombrar: ' + idProyecto);
      
      let movidosExitosamente = 0;
      
      for (var i = 0; i < fileIds.length; i++) {
        try {
          const fileId = fileIds[i];
          const file = DriveApp.getFileById(fileId);
          const nombreOriginal = file.getName();
          
          Logger.log('Procesando archivo: ' + nombreOriginal);
          
          // Renombrar archivo con formato: ID_PROYECTO - nombre_original
          const nuevoNombre = idProyecto + ' - ' + nombreOriginal;
          file.setName(nuevoNombre);
          Logger.log('Renombrado a: ' + nuevoNombre);
          
          // Obtener carpetas actuales del archivo
          const parents = file.getParents();
          
          // Agregar a la carpeta destino
          targetFolder.addFile(file);
          
          // Remover de carpetas anteriores
          while (parents.hasNext()) {
            const parent = parents.next();
            parent.removeFile(file);
          }
          
          Logger.log('✓ Archivo movido y renombrado: ' + nuevoNombre);
          movidosExitosamente++;
          
        } catch (fileError) {
          Logger.log('Error al mover archivo ID ' + fileIds[i] + ': ' + fileError.message);
        }
      }
      
      Logger.log('Total archivos movidos: ' + movidosExitosamente + ' de ' + fileIds.length);
      
    } catch (error) {
      throw new Error('Error al mover archivos: ' + error.message);
    }
  },

  /**
   * Función auxiliar para instalar el trigger programáticamente
   * NOTA: Normalmente se configura desde la UI, pero esta función
   * puede usarse para instalarlo automáticamente
   */
  instalarTrigger: function() {
    try {
      // Verificar si ya existe un trigger para onFormSubmit
      const triggers = ScriptApp.getProjectTriggers();
      
      for (var i = 0; i < triggers.length; i++) {
        if (triggers[i].getHandlerFunction() === 'onFormSubmit') {
          Logger.log('El trigger onFormSubmit ya existe');
          return 'El trigger ya está instalado';
        }
      }
      
      // Obtener el formulario
      const form = FormApp.openById(CONFIG.FORM.ID);
      
      // Crear el trigger
      ScriptApp.newTrigger('onFormSubmit')
        .forForm(form)
        .onFormSubmit()
        .create();
      
      Logger.log('Trigger instalado exitosamente');
      return 'Trigger instalado exitosamente';
      
    } catch (error) {
      Logger.log('Error al instalar trigger: ' + error.message);
      throw new Error('Error al instalar trigger: ' + error.message);
    }
  },

  /**
   * Función auxiliar para eliminar el trigger
   */
  eliminarTrigger: function() {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      let eliminados = 0;
      
      for (var i = 0; i < triggers.length; i++) {
        if (triggers[i].getHandlerFunction() === 'onFormSubmit') {
          ScriptApp.deleteTrigger(triggers[i]);
          eliminados++;
        }
      }
      
      Logger.log('Triggers eliminados: ' + eliminados);
      return 'Triggers eliminados: ' + eliminados;
      
    } catch (error) {
      Logger.log('Error al eliminar trigger: ' + error.message);
      throw new Error('Error al eliminar trigger: ' + error.message);
    }
  }
};

/**
 * FUNCIÓN DE PRUEBA Y DEBUGGING
 * Ejecuta esta función manualmente desde el editor de Apps Script
 * después de enviar un formulario para ver qué datos llegaron
 */
function debugUltimaRespuestaFormulario() {
  try {
    // Obtener el formulario
    const form = FormApp.openById(CONFIG.FORM.ID);
    
    // Obtener las respuestas
    const respuestas = form.getResponses();
    
    if (respuestas.length === 0) {
      Logger.log('No hay respuestas en el formulario');
      return 'No hay respuestas en el formulario';
    }
    
    // Obtener la última respuesta
    const ultimaRespuesta = respuestas[respuestas.length - 1];
    const itemResponses = ultimaRespuesta.getItemResponses();
    
    Logger.log('=== ÚLTIMA RESPUESTA DEL FORMULARIO ===');
    Logger.log('Fecha: ' + ultimaRespuesta.getTimestamp());
    Logger.log('Total de campos: ' + itemResponses.length);
    Logger.log('');
    
    // Mostrar cada campo y su valor
    for (var i = 0; i < itemResponses.length; i++) {
      const itemResponse = itemResponses[i];
      const pregunta = itemResponse.getItem().getTitle();
      const respuesta = itemResponse.getResponse();
      
      Logger.log('Campo #' + (i + 1) + ':');
      Logger.log('  Pregunta: "' + pregunta + '"');
      Logger.log('  Respuesta: ' + JSON.stringify(respuesta));
      Logger.log('');
    }
    
    Logger.log('=== FIN DEBUG ===');
    
    return 'Revisa los logs para ver los detalles';
    
  } catch (error) {
    Logger.log('Error en debugging: ' + error.message);
    return 'Error: ' + error.message;
  }
}

/**
 * FUNCIÓN DE DIAGNÓSTICO DE TRIGGERS
 * Verifica el estado de los triggers instalados
 */
function diagnosticarTriggers() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    
    Logger.log('=== DIAGNÓSTICO DE TRIGGERS ===');
    Logger.log('Total de triggers: ' + triggers.length);
    Logger.log('');
    
    for (var i = 0; i < triggers.length; i++) {
      const trigger = triggers[i];
      
      Logger.log('Trigger #' + (i + 1) + ':');
      Logger.log('  Función: ' + trigger.getHandlerFunction());
      Logger.log('  Tipo de evento: ' + trigger.getEventType());
      Logger.log('  Trigger ID: ' + trigger.getUniqueId());
      
      // Si es un trigger de formulario
      if (trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT) {
        Logger.log('  ✓ ES UN TRIGGER DE FORMULARIO');
        try {
          const triggerSource = trigger.getTriggerSource();
          Logger.log('  Fuente: ' + triggerSource);
        } catch (e) {
          Logger.log('  No se pudo obtener la fuente');
        }
      }
      
      Logger.log('');
    }
    
    Logger.log('=== FIN DIAGNÓSTICO ===');
    
    return 'Revisa los logs';
    
  } catch (error) {
    Logger.log('Error en diagnóstico: ' + error.message);
    return 'Error: ' + error.message;
  }
}
