# Configuración del Trigger de Formulario

## 📋 Descripción

El sistema ahora mueve automáticamente todos los archivos que el instrumentador quirúrgico suba al formulario a la carpeta correspondiente del paciente/proyecto en Google Drive.

## ⚙️ Configuración del Trigger (IMPORTANTE)

Para que esta funcionalidad funcione, debes configurar un trigger (activador) en Google Apps Script:

### Pasos para configurar:

1. **Abrir el Editor de Apps Script**
   - Desde Google Sheets: Extensiones > Apps Script

2. **Ir a Activadores (Triggers)**
   - En el menú lateral izquierdo, haz clic en el icono del reloj ⏰
   - O ve a: Activadores / Triggers

3. **Agregar Nuevo Activador**
   - Haz clic en "+ Agregar activador" (esquina inferior derecha)

4. **Configurar el Activador**
   - **Función a ejecutar:** `onFormSubmit`
   - **Evento de implementación:** `Head`
   - **Origen del evento:** `Del formulario` / `From form`
   - **Tipo de evento:** `Al enviar formulario` / `On form submit`
   - **Seleccionar formulario:** Elige el formulario de "Informe Técnico de la Cirugía"

5. **Guardar**
   - Haz clic en "Guardar"
   - Es posible que te pida autorizar permisos la primera vez

## 🔍 Verificar que Funciona

Para verificar que el trigger está funcionando correctamente:

1. **Enviar un formulario de prueba**
   - Completa el formulario prellenado desde el link generado
   - Sube uno o varios archivos

2. **Verificar los logs**
   - En el editor de Apps Script, ve a: Ejecuciones (icono de lista)
   - Busca la ejecución de `onFormSubmit`
   - Haz clic para ver los logs

3. **Verificar en Drive**
   - Abre la carpeta del proyecto en Drive
   - Los archivos deberían aparecer ahí automáticamente

## 📝 Logs Esperados

Si todo funciona bien, deberías ver en los logs:

```
=== Inicio procesamiento formulario ===
Respuestas extraídas: {...}
Archivos encontrados: 2
Carpeta destino: PRY-001 - Juan Pérez
Procesando archivo: foto_cx_1.jpg
✓ Archivo movido: foto_cx_1.jpg
Procesando archivo: informe.pdf
✓ Archivo movido: informe.pdf
Total archivos movidos: 2 de 2
=== Procesamiento completado exitosamente ===
```

## 🔧 Funcionamiento Técnico

### ¿Qué hace el sistema?

1. **Detecta el envío del formulario**
   - El trigger `onFormSubmit` se ejecuta automáticamente

2. **Extrae información**
   - Lee el ID de la carpeta que viene oculto en el formulario prellenado
   - Identifica todos los archivos adjuntos

3. **Mueve los archivos**
   - Toma cada archivo subido
   - Lo mueve de la carpeta temporal de Forms a la carpeta del proyecto
   - Elimina el archivo de su ubicación original

### Archivos Involucrados

- **`FormTriggerService.js`** - Servicio principal que procesa los envíos
- **`onFormSubmit()`** - Función trigger (en FormTriggerService.js)

## ⚠️ Importante

- El trigger **debe estar configurado** para que funcione
- Si no se configura, los archivos quedarán en la carpeta temporal de Forms
- El formulario debe tener el campo oculto `FOLDER_ID` prellenado correctamente
- Solo funciona con formularios enviados a través del link prellenado generado por el sistema

## 🐛 Troubleshooting

### Los archivos no se mueven

1. Verificar que el trigger esté configurado correctamente
2. Revisar los logs de ejecución para ver errores
3. Verificar que el formulario tenga el campo FOLDER_ID
4. Asegurarse de que el script tenga permisos de Drive

### Error de permisos

- Ve a Apps Script > Ejecuciones
- Si hay error de permisos, vuelve a autorizar:
  - Ejecuta manualmente `onFormSubmit` con datos de prueba
  - Acepta los permisos solicitados

### No aparecen logs

- Asegúrate de estar viendo las ejecuciones del trigger, no las manuales
- El trigger puede tardar unos segundos en ejecutarse

## 📚 Referencias

- [Google Apps Script Triggers](https://developers.google.com/apps-script/guides/triggers)
- [Form Submit Events](https://developers.google.com/apps-script/guides/triggers/events#form-submit)
