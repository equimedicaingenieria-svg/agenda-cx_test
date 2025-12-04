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
      SpreadsheetApp.getUi()
        .createMenu(CONFIG.UI.MENU_NAME)
        .addItem(CONFIG.UI.MENU_ITEMS.RESUMEN, 'generarResumenCxDesdeFila')
        .addItem(CONFIG.UI.MENU_ITEMS.FLUJO_COMPLETO, 'flujoCxDesdeFila')
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
  }
};
