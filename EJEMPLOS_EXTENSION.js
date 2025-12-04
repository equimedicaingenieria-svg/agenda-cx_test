/**
 * EJEMPLOS DE EXTENSIÓN
 * 
 * Este archivo muestra cómo extender el sistema con nuevas funcionalidades
 * siguiendo la arquitectura modular establecida.
 */

/**
 * ============================================================================
 * EJEMPLO 1: Agregar Notificaciones por Email
 * ============================================================================
 */

// 1. Agregar configuración en Config.js
/*
  EMAIL: {
    DESTINATARIOS: ['tecnico1@example.com', 'tecnico2@example.com'],
    ASUNTO_TEMPLATE: 'Nueva CX - {paciente} - {fecha}',
    REMITENTE: 'sistema@equimedica.com'
  }
*/

// 2. Crear nuevo servicio: EmailService.js
/*
const EmailService = {
  
  enviarNotificacionCx: function(datos, linkForm) {
    try {
      const asunto = this._construirAsunto(datos);
      const cuerpo = this._construirCuerpo(datos, linkForm);
      
      CONFIG.EMAIL.DESTINATARIOS.forEach(function(destinatario) {
        GmailApp.sendEmail(destinatario, asunto, cuerpo);
      });
      
      return true;
    } catch (error) {
      throw new Error('Error al enviar email: ' + error.message);
    }
  },
  
  _construirAsunto: function(datos) {
    return CONFIG.EMAIL.ASUNTO_TEMPLATE
      .replace('{paciente}', datos.paciente)
      .replace('{fecha}', Utils.formatearFechaArg(datos.fechaCx));
  },
  
  _construirCuerpo: function(datos, linkForm) {
    return 'Nueva cirugía programada:\n\n' +
           'Fecha: ' + Utils.formatearFechaArg(datos.fechaCx) + '\n' +
           'Hora: ' + Utils.formatearHoraArg(datos.horaCx) + '\n' +
           'Paciente: ' + datos.paciente + '\n\n' +
           'Formulario: ' + linkForm;
  }
};
*/

// 3. Integrar en el flujo (Asistencia Técnica.js)
/*
function flujoCxDesdeFila() {
  // ... código existente ...
  
  // Agregar después de crear el link del formulario:
  EmailService.enviarNotificacionCx(datosRaw, linkForm);
  
  // ... resto del código ...
}
*/


/**
 * ============================================================================
 * EJEMPLO 2: Agregar Validación de Duplicados
 * ============================================================================
 */

// 1. Agregar al SheetService.js
/*
  verificarDuplicado: function(fechaCx, paciente) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(CONFIG.SHEETS.LINKS_SHEET_NAME);
      
      if (!sheet) return false;
      
      const datos = sheet.getDataRange().getValues();
      
      for (var i = 1; i < datos.length; i++) {
        const filaFecha = datos[i][0];
        const filaPaciente = datos[i][2];
        
        if (filaFecha === fechaCx && filaPaciente === paciente) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      throw new Error('Error al verificar duplicado: ' + error.message);
    }
  }
*/

// 2. Usar en el flujo
/*
function flujoCxDesdeFila() {
  // Después de obtener datos...
  const datosRaw = SheetService.obtenerDatosFila(row);
  
  // Verificar duplicado
  if (SheetService.verificarDuplicado(datosRaw.fechaCx, datosRaw.paciente)) {
    const continuar = UIService.confirmarDuplicado(datosRaw);
    if (!continuar) return;
  }
  
  // ... continuar con el flujo ...
}
*/


/**
 * ============================================================================
 * EJEMPLO 3: Agregar Exportación a Calendar
 * ============================================================================
 */

// 1. Agregar configuración
/*
  CALENDAR: {
    ID: 'tu_calendar_id@group.calendar.google.com',
    DURACION_DEFAULT: 120 // minutos
  }
*/

// 2. Crear CalendarService.js
/*
const CalendarService = {
  
  crearEventoCx: function(datos) {
    try {
      const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR.ID);
      const fechaHora = this._combinarFechaHora(datos.fechaCx, datos.horaCx);
      const titulo = 'CX - ' + datos.paciente + ' - ' + datos.institucion;
      const descripcion = this._construirDescripcion(datos);
      
      const evento = calendar.createEvent(
        titulo,
        fechaHora,
        new Date(fechaHora.getTime() + CONFIG.CALENDAR.DURACION_DEFAULT * 60000),
        { description: descripcion }
      );
      
      return evento;
    } catch (error) {
      throw new Error('Error al crear evento: ' + error.message);
    }
  },
  
  _combinarFechaHora: function(fecha, hora) {
    // Lógica para combinar fecha y hora
    const fechaBase = new Date(fecha);
    const horaDate = new Date(hora);
    
    fechaBase.setHours(horaDate.getHours());
    fechaBase.setMinutes(horaDate.getMinutes());
    
    return fechaBase;
  },
  
  _construirDescripcion: function(datos) {
    return 'Médico: ' + datos.medico + '\n' +
           'Material: ' + datos.material + '\n' +
           'Institución: ' + datos.institucion;
  }
};
*/


/**
 * ============================================================================
 * EJEMPLO 4: Agregar Estadísticas
 * ============================================================================
 */

// Crear StatsService.js
/*
const StatsService = {
  
  obtenerEstadisticasMes: function(mes, año) {
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet()
        .getSheetByName(CONFIG.SHEETS.LINKS_SHEET_NAME);
      
      const datos = sheet.getDataRange().getValues();
      let count = 0;
      const medicos = {};
      const instituciones = {};
      
      for (var i = 1; i < datos.length; i++) {
        const fecha = new Date(datos[i][0]);
        
        if (fecha.getMonth() + 1 === mes && fecha.getFullYear() === año) {
          count++;
          
          const medico = datos[i][4];
          medicos[medico] = (medicos[medico] || 0) + 1;
          
          const institucion = datos[i][3];
          instituciones[institucion] = (instituciones[institucion] || 0) + 1;
        }
      }
      
      return {
        total: count,
        medicos: medicos,
        instituciones: instituciones
      };
    } catch (error) {
      throw new Error('Error al obtener estadísticas: ' + error.message);
    }
  },
  
  generarReporteMensual: function(mes, año) {
    const stats = this.obtenerEstadisticasMes(mes, año);
    
    let reporte = 'REPORTE MENSUAL - ' + mes + '/' + año + '\n\n';
    reporte += 'Total de cirugías: ' + stats.total + '\n\n';
    reporte += 'Por médico:\n';
    
    for (var medico in stats.medicos) {
      reporte += '  ' + medico + ': ' + stats.medicos[medico] + '\n';
    }
    
    return reporte;
  }
};
*/

// Agregar función al menú
/*
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(CONFIG.UI.MENU_NAME)
    .addItem(CONFIG.UI.MENU_ITEMS.RESUMEN, 'generarResumenCxDesdeFila')
    .addItem(CONFIG.UI.MENU_ITEMS.FLUJO_COMPLETO, 'flujoCxDesdeFila')
    .addSeparator()
    .addItem('📊 Estadísticas', 'mostrarEstadisticas')
    .addToUi();
}

function mostrarEstadisticas() {
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const año = hoy.getFullYear();
  
  const reporte = StatsService.generarReporteMensual(mes, año);
  UIService.mostrarAlerta(reporte);
}
*/


/**
 * ============================================================================
 * EJEMPLO 5: Agregar Backup Automático
 * ============================================================================
 */

// Crear BackupService.js
/*
const BackupService = {
  
  crearBackup: function() {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const timestamp = Utilities.formatDate(
        new Date(),
        CONFIG.TIMEZONE,
        'yyyyMMdd_HHmmss'
      );
      
      const backup = ss.copy('BACKUP_' + timestamp);
      const carpetaBackup = this._obtenerCarpetaBackup();
      
      DriveApp.getFileById(backup.getId()).moveTo(carpetaBackup);
      
      return backup;
    } catch (error) {
      throw new Error('Error al crear backup: ' + error.message);
    }
  },
  
  _obtenerCarpetaBackup: function() {
    const nombreCarpeta = 'Backups_AgendaCX';
    const carpetas = DriveApp.getFoldersByName(nombreCarpeta);
    
    if (carpetas.hasNext()) {
      return carpetas.next();
    } else {
      return DriveApp.createFolder(nombreCarpeta);
    }
  },
  
  limpiarBackupsAntiguos: function(diasRetener = 30) {
    const carpeta = this._obtenerCarpetaBackup();
    const archivos = carpeta.getFiles();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasRetener);
    
    while (archivos.hasNext()) {
      const archivo = archivos.next();
      if (archivo.getDateCreated() < fechaLimite) {
        archivo.setTrashed(true);
      }
    }
  }
};
*/

// Crear trigger automático
/*
function crearTriggerBackupDiario() {
  ScriptApp.newTrigger('realizarBackupDiario')
    .timeBased()
    .atHour(2)
    .everyDays(1)
    .create();
}

function realizarBackupDiario() {
  BackupService.crearBackup();
  BackupService.limpiarBackupsAntiguos(30);
}
*/


/**
 * ============================================================================
 * BUENAS PRÁCTICAS PARA EXTENDER
 * ============================================================================
 */

/**
 * 1. SIEMPRE crear un nuevo archivo de servicio para funcionalidad nueva
 * 2. NO modificar servicios existentes si no es necesario
 * 3. Agregar configuración en Config.js primero
 * 4. Documentar todas las funciones públicas
 * 5. Usar try-catch para manejo de errores
 * 6. Seguir la convención de nombres:
 *    - Servicios: NombreService.js
 *    - Funciones públicas: verboCamelCase
 *    - Funciones privadas: _verboCamelCase
 * 7. Testear exhaustivamente antes de implementar
 * 8. Actualizar README.md con nuevas funcionalidades
 */
