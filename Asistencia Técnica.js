/***** CONFIGURACIÓN GENERAL *****/

const PARENT_FOLDER_ID = '18_VzySYKclQSprTiYrY3WPm7nzFkz4ol';
const TEMPLATE_DOC_ID  = '1xAhYoynaUhtA8DDx0MMt5VVYlpbOiRf8tUx9Pg7DE-Y';
const FORM_ID          = '1xOkS21hHbzLuTCHvMkCGWACjkpekpK7Rovt1lxQmv3s';

const LINKS_SHEET_NAME = 'Links_AsistenciaTecnica';

/***** COLUMNAS EN LA HOJA PRINCIPAL *****/
const COL_A = 1;   // Fecha CX
const COL_D = 4;   // Paciente
const COL_E = 5;   // Institución
const COL_F = 6;   // Hora CX
const COL_G = 7;   // Médico
const COL_R = 18;  // Material enviado

/***** ENTRY IDs DEL FORMULARIO *****/
const FORM_ENTRY_PACIENTE      = 'entry.12800784';
const FORM_ENTRY_FECHA_CX      = 'entry.890765022';
const FORM_ENTRY_HORA_CX       = 'entry.1997407525';
const FORM_ENTRY_INSTITUCION   = 'entry.1716314446';
const FORM_ENTRY_MEDICO        = 'entry.457663501';
const FORM_ENTRY_MATERIAL      = 'entry.1052872094';

// Campo visible donde la técnica ve el nombre de la carpeta
const FORM_ENTRY_FOLDER_NAME   = 'entry.702791237';

// Campo de la 2da sección (oculta) donde guardamos el ID real de la carpeta
const FORM_ENTRY_FOLDER_ID     = 'entry.2111057105';

/***** MENÚ *****/
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('CX')
    .addItem('📋 Ver resumen', 'generarResumenCxDesdeFila')
    .addItem('🗂️ Generar Carpeta + PDF + Form', 'flujoCxDesdeFila')
    .addToUi();
}

/***** FORMATEADORES *****/
function formatearFechaArg(valor) {
  return valor instanceof Date
    ? Utilities.formatDate(valor, Session.getScriptTimeZone(), 'dd/MM/yyyy')
    : (valor || '');
}

function formatearFechaParaForm(valor) {
  return valor instanceof Date
    ? Utilities.formatDate(valor, Session.getScriptTimeZone(), 'yyyy-MM-dd')
    : (valor || '');
}

function formatearHoraArg(valor) {
  return valor instanceof Date
    ? Utilities.formatDate(valor, Session.getScriptTimeZone(), 'HH:mm')
    : (valor || '');
}

/***** VISTA PREVIA *****/
function generarResumenCxDesdeFila() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const row = sheet.getActiveCell().getRow();
  const values = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

  const fechaCx     = values[COL_A - 1];
  const paciente    = values[COL_D - 1];
  const institucion = values[COL_E - 1];
  const horaCx      = values[COL_F - 1];
  const medico      = values[COL_G - 1];
  const material    = values[COL_R - 1];

  const txt =
    '📋 RESUMEN DE CIRUGÍA\n\n' +
    '📅 Fecha: ' + formatearFechaArg(fechaCx) + '\n' +
    '⏰ Hora: '  + formatearHoraArg(horaCx)   + ' hs\n\n' +
    '👤 Paciente: ' + (paciente || '') + '\n' +
    '🏥 Institución: ' + (institucion || '') + '\n' +
    '🩺 Médico: ' + (medico || '') + '\n' +
    '📦 Material: ' + (material || '');

  SpreadsheetApp.getUi().alert(txt);
}

/***** FLUJO COMPLETO *****/
function flujoCxDesdeFila() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const row = sheet.getActiveCell().getRow();
  const values = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

  const fechaCx     = values[COL_A - 1];
  const paciente    = values[COL_D - 1];
  const institucion = values[COL_E - 1];
  const horaCx      = values[COL_F - 1];
  const medico      = values[COL_G - 1];
  const material    = values[COL_R - 1];

  if (!fechaCx || !paciente) {
    SpreadsheetApp.getUi().alert('Falta fecha o paciente.');
    return;
  }

  const fechaCxStr   = formatearFechaArg(fechaCx);
  const fechaCxForm  = formatearFechaParaForm(fechaCx);
  const horaCxStr    = formatearHoraArg(horaCx);

  const fechaForName = fechaCx instanceof Date
    ? Utilities.formatDate(fechaCx, Session.getScriptTimeZone(), 'yyyy-MM-dd')
    : fechaCxForm;

  /***** 1) Crear carpeta *****/
  const folder = crearCarpetaCx(fechaForName, paciente);
  const folderName = folder.getName();
  const folderId   = folder.getId();

  /***** 2) Generar PDF *****/
  const pdfFile = generarPdfCx(folder, {
    fechaCx: fechaCxStr,
    horaCx: horaCxStr,
    paciente,
    institucion,
    medico,
    material
  });
  const pdfUrl = pdfFile.getUrl();

  /***** 3) Link prellenado del form (directo, sin acortador) *****/
  const linkForm = crearLinkFormPrellenado(
    folderName,
    folderId,
    {
      fechaCxForm: fechaCxForm,
      horaCx: horaCxStr,
      paciente,
      institucion,
      medico,
      material
    }
  );

  /***** 4) Registrar en hoja *****/
  guardarLinkEnOtraHoja({
    fechaCx: fechaCxStr,
    horaCx: horaCxStr,
    paciente,
    institucion,
    medico,
    material,
    pdfUrl,
    linkForm,
    folderName,
    folderId,
    hojaOrigen: sheet.getName(),
    filaOrigen: row
  });

  /***** 5) Mensaje para WhatsApp *****/
  const mensajeWhatsApp =
    '🟦 *ASISTENCIA TÉCNICA*\n\n' +
    '📅 *' + fechaCxStr + ' – ' + horaCxStr + ' hs*\n' +
    '👤 *Paciente:* ' + (paciente || '') + '\n' +
    '🏥 *Institución:* ' + (institucion || '') + '\n' +
    '🩺 *Médico:* ' + (medico || '') + '\n' +
    '📦 *Material:* ' + (material || '') + '\n\n' +
    '📄 *Informe Técnico de la Cirugía:*\n' +
    linkForm;

  mostrarDialogoWhatsApp(mensajeWhatsApp);

}

/***** CREAR CARPETA *****/
function crearCarpetaCx(fechaForName, paciente) {
  const parent = DriveApp.getFolderById(PARENT_FOLDER_ID);
  return parent.createFolder(fechaForName + ' - ' + paciente);
}

/***** PDF SOLO *****/
function generarPdfCx(folder, data) {
  // 1) Tomamos la plantilla y la copiamos en la carpeta de la CX
  const templateFile = DriveApp.getFileById(TEMPLATE_DOC_ID);
  const copiaFile = templateFile.makeCopy('Resumen CX - ' + data.paciente, folder);
  const copiaId = copiaFile.getId();

  // 2) Abrimos el Doc UNA sola vez y obtenemos el body
  const doc = DocumentApp.openById(copiaId);
  const body = doc.getBody();

  // 3) Hacemos los reemplazos en un loop (más claro y un poquito más eficiente)
  const reemplazos = {
    '<<FECHA_CX>>':      data.fechaCx || '',
    '<<HORA_CX>>':       data.horaCx || '',
    '<<PACIENTE>>':      data.paciente || '',
    '<<INSTITUCION>>':   data.institucion || '',
    '<<MEDICO>>':        data.medico || '',
    '<<MATERIAL>>':      data.material || ''
  };

  for (var marcador in reemplazos) {
    if (reemplazos.hasOwnProperty(marcador)) {
      body.replaceText(marcador, reemplazos[marcador]);
    }
  }

  // 4) Guardamos y cerramos el Doc
  doc.saveAndClose();

  // 5) Exportamos a PDF (una sola vez) y lo guardamos en la misma carpeta
  const pdfBlob = copiaFile.getAs(MimeType.PDF);
  const pdfFile = folder
    .createFile(pdfBlob)
    .setName('Resumen CX - ' + data.paciente + '.pdf');

  // 6) OPCIÓN: si querés solo el PDF, borramos la copia editable
  // (esto agrega una llamada más a Drive, pero mantiene la carpeta limpia)
  copiaFile.setTrashed(true);

  return pdfFile;
}

/***** LINK FORM PRELLENADO (LARGO) *****/
function crearLinkFormPrellenado(folderName, folderId, data) {
  const base = 'https://docs.google.com/forms/d/' + FORM_ID + '/viewform?';

  const params = {};
  params[FORM_ENTRY_PACIENTE]      = data.paciente;
  params[FORM_ENTRY_FECHA_CX]      = data.fechaCxForm;
  params[FORM_ENTRY_HORA_CX]       = data.horaCx;
  params[FORM_ENTRY_INSTITUCION]   = data.institucion;
  params[FORM_ENTRY_MEDICO]        = data.medico;
  params[FORM_ENTRY_MATERIAL]      = data.material;
  params[FORM_ENTRY_FOLDER_NAME]   = folderName;
  params[FORM_ENTRY_FOLDER_ID]     = folderId;

  const query = Object.keys(params)
    .map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    })
    .join('&');

  return base + query;
}

/***** REGISTRO EN HOJA *****/
function guardarLinkEnOtraHoja(info) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(LINKS_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(LINKS_SHEET_NAME);
    sheet.appendRow([
      'Fecha cx','Hora cx','Paciente','Institución','Médico','Material',
      'Resumen PDF','Form Técnica','Nombre carpeta','ID carpeta','Hoja','Fila'
    ]);
  }

  sheet.appendRow([
    info.fechaCx,
    info.horaCx,
    info.paciente,
    info.institucion,
    info.medico,
    info.material,
    '=HYPERLINK("' + info.pdfUrl + '";"PDF")',
    '=HYPERLINK("' + info.linkForm + '";"Formulario")',
    info.folderName,
    info.folderId,
    info.hojaOrigen,
    info.filaOrigen
  ]);
}

/***** POPUP WHATSAPP – ESTÉTICO *****/
function mostrarDialogoWhatsApp(mensaje) {

  var safeMsg = mensaje
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  var html = `
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body {
        font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        padding: 18px;
        background: #fafafa;
        color: #333;
      }
      h2 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
        color: #222;
      }
      p.sub {
        margin: 0 0 16px 0;
        font-size: 13px;
        color: #666;
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

    <textarea id="msg">${safeMsg}</textarea>
    <br><br>

    <button onclick="copyText()">Copiar</button>
    <span id="status"></span>

    <script>
      function copyText() {
        var t = document.getElementById("msg");
        t.focus();
        t.select();
        document.execCommand("copy");
        document.getElementById("status").textContent = "Copiado ✓";
      }
    </script>

  </body>
  </html>`;

  SpreadsheetApp.getUi()
    .showModalDialog(HtmlService.createHtmlOutput(html).setWidth(420).setHeight(360),
                     'Resumen de la Cirugía');
}