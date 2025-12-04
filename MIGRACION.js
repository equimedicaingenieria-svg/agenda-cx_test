/**
 * GUÍA DE MIGRACIÓN
 * 
 * Este archivo contiene instrucciones para migrar desde el código antiguo
 * a la nueva arquitectura modular.
 */

/**
 * PASO 1: Configuración
 * ======================
 * 
 * Abre Config.js y actualiza los siguientes valores con tu configuración:
 * 
 * - CONFIG.DRIVE.PARENT_FOLDER_ID
 * - CONFIG.DRIVE.TEMPLATE_DOC_ID
 * - CONFIG.FORM.ID
 * - CONFIG.FORM.ENTRIES (todos los entry IDs)
 * - CONFIG.SHEETS.COLUMNS (si tus columnas son diferentes)
 */

/**
 * PASO 2: Orden de Importación en Apps Script
 * ============================================
 * 
 * Asegúrate de crear los archivos en este orden en el editor de Apps Script:
 * 
 * 1. Config.js
 * 2. Utils.js
 * 3. DriveService.js
 * 4. PdfService.js
 * 5. FormService.js
 * 6. SheetService.js
 * 7. UIService.js
 * 8. Asistencia Técnica.js
 * 9. Fecha.js
 * 
 * Nota: Apps Script carga todos los archivos .gs en el ámbito global,
 * pero es buena práctica mantener este orden para claridad.
 */

/**
 * PASO 3: Verificación
 * ====================
 * 
 * Después de copiar todos los archivos:
 * 
 * 1. Cierra y vuelve a abrir tu Google Sheet
 * 2. Verifica que aparezca el menú "CX"
 * 3. Prueba la función "Ver resumen" con una fila de datos
 * 4. Si funciona, prueba "Generar Carpeta + PDF + Form"
 */

/**
 * PASO 4: Resolución de Problemas
 * ================================
 * 
 * Si encuentras errores:
 * 
 * 1. Verifica que todos los archivos estén creados
 * 2. Revisa la consola de Apps Script (Ver > Registros)
 * 3. Confirma que Config.js tiene todos los IDs correctos
 * 4. Verifica permisos de Drive y Forms
 */

/**
 * MAPEO DE FUNCIONES ANTIGUAS A NUEVAS
 * =====================================
 * 
 * Función antigua              -> Función nueva
 * -----------------------------------------------
 * formatearFechaArg()          -> Utils.formatearFechaArg()
 * formatearFechaParaForm()     -> Utils.formatearFechaParaForm()
 * formatearHoraArg()           -> Utils.formatearHoraArg()
 * crearCarpetaCx()             -> DriveService.crearCarpetaCx()
 * generarPdfCx()               -> PdfService.generarPdfCx()
 * crearLinkFormPrellenado()    -> FormService.crearLinkFormPrellenado()
 * guardarLinkEnOtraHoja()      -> SheetService.guardarLinkEnOtraHoja()
 * mostrarDialogoWhatsApp()     -> UIService.mostrarDialogoWhatsApp()
 * ordenarPorFecha()            -> No cambia (pero usa SheetService internamente)
 */

/**
 * VENTAJAS DE LA NUEVA ARQUITECTURA
 * ==================================
 * 
 * 1. MODULARIDAD
 *    - Cada servicio tiene una responsabilidad clara
 *    - Fácil encontrar y modificar funcionalidades
 * 
 * 2. MANTENIBILIDAD
 *    - Código más legible y documentado
 *    - Menos duplicación de código
 * 
 * 3. ESCALABILIDAD
 *    - Fácil agregar nuevas funcionalidades
 *    - Servicios reutilizables
 * 
 * 4. TESTING
 *    - Funciones independientes más fáciles de probar
 *    - Menor acoplamiento entre componentes
 * 
 * 5. CONFIGURACIÓN
 *    - Todo centralizado en Config.js
 *    - No necesitas buscar constantes por todo el código
 */

/**
 * PRÓXIMOS PASOS RECOMENDADOS
 * ============================
 * 
 * 1. Considera agregar validación de errores más robusta
 * 2. Implementa logging estructurado
 * 3. Agrega triggers automáticos para ordenamiento
 * 4. Crea funciones de respaldo/exportación de datos
 * 5. Implementa notificaciones por email
 */
