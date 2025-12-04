/**
 * ⚡ INICIO RÁPIDO
 * 
 * Guía rápida de 5 minutos para poner en marcha el sistema
 */

/**
 * PASO 1: COPIAR ARCHIVOS (2 minutos)
 * ====================================
 * 
 * En el editor de Apps Script, crear estos archivos EN ESTE ORDEN:
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
 * (Copiar el contenido de cada archivo desde este proyecto)
 */

/**
 * PASO 2: CONFIGURAR IDs (1 minuto)
 * ==================================
 * 
 * Abrir Config.js y actualizar SOLO estas líneas:
 */

// BUSCAR ESTA SECCIÓN EN Config.js:
/*
  DRIVE: {
    PARENT_FOLDER_ID: '18_VzySYKclQSprTiYrY3WPm7nzFkz4ol',  // ← CAMBIAR ESTE
    TEMPLATE_DOC_ID: '1xAhYoynaUhtA8DDx0MMt5VVYlpbOiRf8tUx9Pg7DE-Y'  // ← CAMBIAR ESTE
  },

  FORM: {
    ID: '1xOkS21hHbzLuTCHvMkCGWACjkpekpK7Rovt1lxQmv3s',  // ← CAMBIAR ESTE
    // ...
  }
*/

/**
 * CÓMO OBTENER LOS IDs:
 * 
 * 1. PARENT_FOLDER_ID:
 *    - Abre Google Drive
 *    - Ve a la carpeta donde quieres guardar las cirugías
 *    - Mira la URL: https://drive.google.com/drive/folders/ESTE_ES_EL_ID
 * 
 * 2. TEMPLATE_DOC_ID:
 *    - Abre tu documento plantilla en Google Docs
 *    - Mira la URL: https://docs.google.com/document/d/ESTE_ES_EL_ID/edit
 * 
 * 3. FORM_ID:
 *    - Abre tu formulario en Google Forms
 *    - Mira la URL: https://docs.google.com/forms/d/ESTE_ES_EL_ID/edit
 */

/**
 * PASO 3: VERIFICAR (1 minuto)
 * =============================
 * 
 * 1. Guarda todos los archivos en Apps Script
 * 2. Cierra tu Google Sheet
 * 3. Vuelve a abrirlo
 * 4. Deberías ver el menú "CX" en la barra superior
 * 
 * Si NO ves el menú:
 *    - Espera 30 segundos y recarga
 *    - Verifica que todos los archivos estén guardados
 *    - Revisa la consola de Apps Script (Ver > Registros)
 */

/**
 * PASO 4: PROBAR (1 minuto)
 * ==========================
 * 
 * 1. Selecciona una fila con datos de cirugía
 * 2. Ve al menú CX > 📋 Ver resumen
 * 3. Deberías ver un popup con los datos
 * 
 * Si funciona:
 *    ✅ El sistema está correctamente instalado
 * 
 * Si NO funciona:
 *    - Verifica que la fila tenga fecha y paciente
 *    - Revisa que las columnas coincidan con Config.js
 */

/**
 * PASO 5: USAR (¡Ya está listo!)
 * ===============================
 * 
 * Para generar carpeta + PDF + formulario:
 * 
 * 1. Selecciona una fila con datos completos
 * 2. Ve al menú CX > 🗂️ Generar Carpeta + PDF + Form
 * 3. Espera unos segundos
 * 4. Se abrirá un popup con el mensaje para WhatsApp
 * 5. Clic en "Copiar" y pega en WhatsApp
 * 
 * ¡Listo! El sistema ha:
 *    ✅ Creado la carpeta en Drive
 *    ✅ Generado el PDF con los datos
 *    ✅ Creado el link del formulario prellenado
 *    ✅ Registrado todo en la hoja "Links_AsistenciaTecnica"
 */

/**
 * ⚠️ IMPORTANTE - PLANTILLA DEL DOCUMENTO
 * =========================================
 * 
 * Tu documento plantilla DEBE tener estos marcadores:
 * 
 * <<FECHA_CX>>
 * <<HORA_CX>>
 * <<PACIENTE>>
 * <<INSTITUCION>>
 * <<MEDICO>>
 * <<MATERIAL>>
 * 
 * El sistema reemplazará estos marcadores con los datos reales.
 */

/**
 * 🆘 SOLUCIÓN RÁPIDA DE PROBLEMAS
 * ================================
 * 
 * Problema: "Falta fecha o paciente"
 * Solución: Asegúrate de que la fila tenga datos en las columnas A y D
 * 
 * Problema: "Error al crear carpeta"
 * Solución: Verifica el PARENT_FOLDER_ID en Config.js
 * 
 * Problema: "Error al generar PDF"
 * Solución: Verifica el TEMPLATE_DOC_ID en Config.js
 * 
 * Problema: El menú no aparece
 * Solución: Recarga el Sheet y espera 30 segundos
 * 
 * Problema: Los datos no coinciden
 * Solución: Verifica CONFIG.SHEETS.COLUMNS en Config.js
 */

/**
 * 📞 SIGUIENTES PASOS
 * ===================
 * 
 * Una vez que el sistema funcione:
 * 
 * 1. Lee README.md para entender todas las funcionalidades
 * 2. Revisa ARQUITECTURA.md para entender cómo está construido
 * 3. Mira EJEMPLOS_EXTENSION.js para ver cómo agregar funcionalidades
 * 
 * ¿Quieres personalizar?
 * - Cambia los emojis en CONFIG.UI.MENU_ITEMS
 * - Modifica los mensajes en CONFIG.MESSAGES
 * - Ajusta los formatos de fecha en CONFIG.FORMATS
 */

/**
 * ✅ CHECKLIST FINAL
 * ==================
 * 
 * □ Archivos copiados en Apps Script
 * □ Config.js actualizado con mis IDs
 * □ Plantilla tiene los marcadores <<...>>
 * □ Sheet recargado
 * □ Menú "CX" visible
 * □ "Ver resumen" funciona
 * □ "Generar Carpeta + PDF + Form" funciona
 * □ Carpeta creada en Drive
 * □ PDF generado correctamente
 * □ Link del formulario funciona
 * 
 * Si todos están marcados: ¡FELICITACIONES! 🎉
 * Tu sistema está funcionando correctamente.
 */
