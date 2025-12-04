/**
 * Config.js
 * Configuración centralizada del sistema de Asistencia Técnica
 * 
 * Este archivo contiene todas las constantes de configuración utilizadas
 * en el sistema, facilitando el mantenimiento y la escalabilidad.
 */

/**
 * Configuración de Google Drive
 */
const CONFIG = {
  DRIVE: {
    PARENT_FOLDER_ID: '18_VzySYKclQSprTiYrY3WPm7nzFkz4ol',
    TEMPLATE_DOC_ID: '1xAhYoynaUhtA8DDx0MMt5VVYlpbOiRf8tUx9Pg7DE-Y'
  },

  /**
   * Configuración del Formulario de Google
   */
  FORM: {
    ID: '1xOkS21hHbzLuTCHvMkCGWACjkpekpK7Rovt1lxQmv3s',
    
    // Entry IDs de los campos del formulario
    ENTRIES: {
      PACIENTE: 'entry.12800784',
      FECHA_CX: 'entry.890765022',
      HORA_CX: 'entry.1997407525',
      INSTITUCION: 'entry.1716314446',
      MEDICO: 'entry.457663501',
      MATERIAL: 'entry.1052872094',
      FOLDER_NAME: 'entry.702791237',  // Campo visible
      FOLDER_ID: 'entry.2111057105'     // Campo oculto
    }
  },

  /**
   * Configuración de las hojas de cálculo
   */
  SHEETS: {
    LINKS_SHEET_NAME: 'Links_AsistenciaTecnica',
    
    // Columnas de la hoja principal
    COLUMNS: {
      FECHA_CX: 1,      // A
      PACIENTE: 4,      // D
      INSTITUCION: 5,   // E
      HORA_CX: 6,       // F
      MEDICO: 7,        // G
      MATERIAL: 18      // R
    }
  },

  /**
   * Configuración de zona horaria y formatos
   */
  TIMEZONE: 'America/Argentina/Buenos_Aires',
  
  /**
   * Formatos de fecha y hora
   */
  FORMATS: {
    FECHA_ARG: 'dd/MM/yyyy',
    FECHA_FORM: 'yyyy-MM-dd',
    FECHA_FILENAME: 'yyyy-MM-dd',
    HORA: 'HH:mm'
  },

  /**
   * Mensajes del sistema
   */
  MESSAGES: {
    ERROR_MISSING_DATA: 'Falta fecha o paciente.',
    TITLE_WHATSAPP_DIALOG: 'Resumen de la Cirugía',
    WHATSAPP_TEMPLATE: '🟦 *ASISTENCIA TÉCNICA*\n\n'
  },

  /**
   * Configuración de UI
   */
  UI: {
    MENU_NAME: 'CX',
    MENU_ITEMS: {
      RESUMEN: '📋 Ver resumen',
      FLUJO_COMPLETO: '🗂️ Generar Carpeta + PDF + Form'
    },
    DIALOG: {
      WIDTH: 420,
      HEIGHT: 360
    }
  }
};
