/**
 * UIService.js
 * Servicio para manejo de interfaz de usuario
 * 
 * Este módulo encapsula todas las operaciones relacionadas con
 * la interfaz de usuario: menús, diálogos, alertas, etc.
 */

const UIService = {

  /**
   * Crea el menú personalizado en la UI
   */
  crearMenu: function() {
    try {
      const ui = SpreadsheetApp.getUi();
      
      // Crear submenú de Resumen
      const submenuResumen = ui.createMenu('📄 Resumen')
        .addItem(CONFIG.UI.MENU_ITEMS.GENERAR_RESUMEN, 'generarMensajeResumen');
      
      // Crear submenú de Configuración
      const submenuConfig = ui.createMenu('⚙️ Configuración')
        .addItem('Instalar Trigger de Formulario', 'instalarTriggerFormulario')
        .addItem('Verificar Trigger de Formulario', 'verificarTriggerFormulario');
      
      // Menú principal
      ui.createMenu(CONFIG.UI.MENU_NAME)
        .addItem(CONFIG.UI.MENU_ITEMS.AUTORIZAR, 'autorizarCxDesdeFila')
        .addSubMenu(submenuResumen)
        .addSeparator()
        .addItem(CONFIG.UI.MENU_ITEMS.FLUJO_COMPLETO, 'flujoCxDesdeFila')
        .addSeparator()
        .addSubMenu(submenuConfig)
        .addToUi();
    } catch (error) {
      throw new Error('Error al crear menú: ' + error.message);
    }
  },

  /**
   * Muestra una alerta simple
   * @param {string} mensaje - Mensaje a mostrar
   */
  mostrarAlerta: function(mensaje) {
    SpreadsheetApp.getUi().alert(mensaje);
  },

  /**
   * Muestra el resumen de una cirugía en un diálogo
   * @param {Object} datos - Datos de la cirugía
   */
  mostrarResumenCx: function(datos) {
    const mensaje = this._construirMensajeResumen(datos);
    this.mostrarAlerta(mensaje);
  },

  /**
   * Construye el mensaje de resumen
   * @private
   * @param {Object} datos - Datos de la cirugía
   * @returns {string} Mensaje formateado
   */
  _construirMensajeResumen: function(datos) {
    return '📋 RESUMEN DE CIRUGÍA\n\n' +
           '📅 Fecha: ' + Utils.formatearFechaArg(datos.fechaCx) + '\n' +
           '⏰ Hora: ' + Utils.formatearHoraArg(datos.horaCx) + ' hs\n\n' +
           '👤 Paciente: ' + Utils.obtenerValorODefault(datos.paciente) + '\n' +
           '🏥 Institución: ' + Utils.obtenerValorODefault(datos.institucion) + '\n' +
           '🩺 Médico: ' + Utils.obtenerValorODefault(datos.medico) + '\n' +
           '📦 Material: ' + Utils.obtenerValorODefault(datos.material);
  },

  /**
   * Muestra el diálogo con el mensaje para WhatsApp
   * @param {string} mensaje - Mensaje prellenado
   */
  mostrarDialogoWhatsApp: function(mensaje) {
    const html = this._generarHtmlWhatsApp(mensaje);
    
    SpreadsheetApp.getUi().showModalDialog(
      HtmlService.createHtmlOutput(html)
        .setWidth(CONFIG.UI.DIALOG.WIDTH)
        .setHeight(CONFIG.UI.DIALOG.HEIGHT),
      CONFIG.MESSAGES.TITLE_WHATSAPP_DIALOG
    );
  },

  /**
   * Genera el HTML para el diálogo de WhatsApp
   * @private
   * @param {string} mensaje - Mensaje a mostrar
   * @returns {string} HTML generado
   */
  _generarHtmlWhatsApp: function(mensaje) {
    const mensajeSafe = Utils.sanitizarHtml(mensaje);
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Segoe UI', Roboto, Arial, sans-serif;
          padding: 18px;
          background: #fafafa;
          color: #333;
          margin: 0;
        }
        textarea {
          width: 100%;
          height: 240px;
          font-size: 14px;
          padding: 10px;
          box-sizing: border-box;
          border-radius: 6px;
          border: 1px solid #ccc;
          font-family: 'Segoe UI', Roboto, Arial, sans-serif;
          resize: vertical;
          background: #fff;
        }
        .button-container {
          margin-top: 16px;
        }
        button {
          padding: 8px 18px;
          font-size: 14px;
          border: none;
          border-radius: 6px;
          background: #25D366;
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: 0.2s;
        }
        button:hover {
          background: #1ebe5d;
        }
        #status {
          margin-left: 12px;
          color: #0a7c00;
          font-size: 13px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <textarea id="msg">${mensajeSafe}</textarea>
      <div class="button-container">
        <button onclick="copyText()">Copiar</button>
        <span id="status"></span>
      </div>

      <script>
        function copyText() {
          var textarea = document.getElementById("msg");
          textarea.focus();
          textarea.select();
          
          try {
            document.execCommand("copy");
            document.getElementById("status").textContent = "✓ Copiado";
          } catch (err) {
            document.getElementById("status").textContent = "✗ Error al copiar";
          }
        }
      </script>
    </body>
    </html>`;
  },

  /**
   * Construye el mensaje para WhatsApp
   * @param {Object} datos - Datos de la cirugía
   * @param {string} linkForm - Enlace del formulario
   * @returns {string} Mensaje formateado para WhatsApp
   */
  construirMensajeWhatsApp: function(datos, linkForm) {
    return CONFIG.MESSAGES.WHATSAPP_TEMPLATE +
           '📅 *' + Utils.formatearFechaArg(datos.fechaCx) + ' – ' + 
           Utils.formatearHoraArg(datos.horaCx) + ' hs*\n' +
           '👤 *Paciente:* ' + Utils.obtenerValorODefault(datos.paciente) + '\n' +
           '🏥 *Institución:* ' + Utils.obtenerValorODefault(datos.institucion) + '\n' +
           '🩺 *Médico:* ' + Utils.obtenerValorODefault(datos.medico) + '\n' +
           '📦 *Material:* ' + Utils.obtenerValorODefault(datos.material) + '\n\n' +
           '📄 *Informe Técnico de la Cirugía:*\n' +
           linkForm;
  },

  /**
   * Construye el mensaje de resumen para autorización
   * @private
   * @param {Object} datos - Datos de la cirugía
   * @returns {string} Mensaje formateado
   */
  _construirMensajeResumen: function(datos) {
    // Construir la línea de fecha con o sin hora
    var lineaFecha = '📅 Fecha: ' + Utils.formatearFechaArg(datos.fechaCx);
    
    // Agregar hora solo si existe
    if (datos.horaCx && datos.horaCx.toString().trim() !== '') {
      lineaFecha += ' – ' + Utils.formatearHoraArg(datos.horaCx) + ' hs';
    }
    
    return '✅ CX Autorizada' + '\n' +
           lineaFecha + '\n' +
           '\n' +
           '👤 Paciente: ' + Utils.obtenerValorODefault(datos.paciente) + '\n' +
           '🏥 Institución: ' + Utils.obtenerValorODefault(datos.institucion) + '\n' +
           '🩺 Médico: ' + Utils.obtenerValorODefault(datos.medico) + '\n' +
           '👥 Cliente: ' + Utils.obtenerValorODefault(datos.cliente) + '\n' +
           '\n' +
           '📦 Material: ' + Utils.obtenerValorODefault(datos.material);
  },

  /**
   * Muestra el diálogo de resumen de cirugía (solo lectura con botón copiar)
   * @param {Object} datos - Datos de la cirugía
   */
  mostrarDialogoResumen: function(datos) {
    try {
      const mensaje = this._construirMensajeResumen(datos);
      const html = this._generarHtmlResumen(mensaje);
      
      const htmlOutput = HtmlService.createHtmlOutput(html)
        .setWidth(CONFIG.UI.DIALOG.WIDTH)
        .setHeight(380);
      
      SpreadsheetApp.getUi().showModalDialog(
        htmlOutput,
        '📋 Mensaje de Resumen - Cirugía Autorizada'
      );
    } catch (error) {
      Logger.log('Error al mostrar diálogo de resumen: ' + error.message);
      throw new Error('Error al mostrar diálogo: ' + error.message);
    }
  },

  /**
   * Genera el HTML para el diálogo de resumen (solo lectura)
   * @private
   * @param {string} mensaje - Mensaje a mostrar
   * @returns {string} HTML generado
   */
  _generarHtmlResumen: function(mensaje) {
    const mensajeSafe = Utils.sanitizarHtml(mensaje);
    
    const template = HtmlService.createTemplateFromFile('DialogoResumen');
    template.resumen = mensajeSafe;
    
    return template.evaluate().getContent();
  },

  /**
   * Muestra el diálogo de autorización de cirugía
   * @param {Object} datos - Datos de la cirugía
   * @param {number} fila - Número de fila
   * @param {string} nombreHoja - Nombre de la hoja
   */
  mostrarDialogoAutorizacion: function(datos, fila, nombreHoja) {
    try {
      const mensaje = this._construirMensajeResumen(datos);
      const html = this._generarHtmlAutorizacion(mensaje, fila, nombreHoja);
      
      const htmlOutput = HtmlService.createHtmlOutput(html)
        .setWidth(CONFIG.UI.DIALOG.WIDTH)
        .setHeight(CONFIG.UI.DIALOG.AUTORIZACION_HEIGHT);
      
      SpreadsheetApp.getUi().showModalDialog(
        htmlOutput,
        CONFIG.MESSAGES.TITLE_AUTORIZACION_DIALOG
      );
    } catch (error) {
      Logger.log('Error al mostrar diálogo: ' + error.message);
      throw new Error('Error al mostrar diálogo: ' + error.message);
    }
  },

  /**
   * Genera el HTML para el diálogo de autorización usando template
   * @private
   * @param {string} mensaje - Mensaje a mostrar
   * @param {number} fila - Número de fila
   * @param {string} nombreHoja - Nombre de la hoja
   * @returns {HtmlOutput} HTML generado
   */
  _generarHtmlAutorizacion: function(mensaje, fila, nombreHoja) {
    const mensajeSafe = Utils.sanitizarHtml(mensaje);
    const mensajeExito = Utils.sanitizarHtml(CONFIG.MESSAGES.AUTORIZACION_EXITOSA);
    const nombreHojaSafe = nombreHoja.replace(/'/g, "\\'");
    
    // Usar el archivo HTML como template
    const template = HtmlService.createTemplateFromFile('DialogoAutorizacion');
    template.resumen = mensajeSafe;
    template.fila = fila;
    template.nombreHoja = nombreHojaSafe;
    template.mensajeExito = mensajeExito;
    
    return template.evaluate().getContent();
  }
};

