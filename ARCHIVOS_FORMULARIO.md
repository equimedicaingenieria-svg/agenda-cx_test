# 📁 Gestión Automática de Archivos del Formulario

## ✅ Implementación Completada

El sistema ahora **mueve automáticamente** todos los archivos que el instrumentador quirúrgico suba al formulario a la carpeta correspondiente del paciente/ID proyecto en Google Drive.

---

## 🚀 Inicio Rápido

### Opción 1: Instalación desde el Menú (RECOMENDADO)

1. Abre tu Google Sheet
2. Ve al menú: **CX > ⚙️ Configuración > Instalar Trigger de Formulario**
3. Autoriza los permisos si te los pide
4. ¡Listo! Verás un mensaje de confirmación

### Opción 2: Instalación Manual

Si prefieres configurarlo manualmente:

1. Abre el editor de Apps Script (Extensiones > Apps Script)
2. Haz clic en el icono del reloj ⏰ (Activadores)
3. Clic en "+ Agregar activador"
4. Configura:
   - **Función:** `onFormSubmit`
   - **Origen del evento:** Del formulario
   - **Tipo de evento:** Al enviar formulario
   - **Seleccionar formulario:** Tu formulario de "Informe Técnico"
5. Guardar y autorizar permisos

---

## 🔍 Verificar Instalación

Ve al menú: **CX > ⚙️ Configuración > Verificar Trigger de Formulario**

Verás un mensaje indicando si está instalado o no.

---

## 🎯 Cómo Funciona

### Flujo Completo:

1. **Usuario genera carpeta + PDF + Form** desde el menú
   - Se crea la carpeta en Drive
   - Se genera el PDF
   - Se crea el link del formulario **con el ID de carpeta oculto**

2. **Instrumentador completa el formulario**
   - Llena los datos de la cirugía
   - **Sube archivos** (fotos, documentos, etc.)
   - Envía el formulario

3. **Sistema procesa automáticamente** (trigger `onFormSubmit`)
   - Detecta el ID de carpeta del formulario
   - Identifica todos los archivos subidos
   - **Renombra los archivos** con formato: `ID_PROYECTO - nombre_original`
   - **Mueve los archivos** de la carpeta temporal a la carpeta del proyecto
   - Elimina los archivos de su ubicación original

### Resultado:

✅ Todos los archivos quedan organizados en la carpeta correcta del proyecto  
✅ No hay archivos dispersos en Drive  
✅ Todo está centralizado y fácil de encontrar

---

## 📂 Estructura de Archivos

```
Google Drive/
└── Carpeta Principal (configurada en Config.js)/
    └── PRY-001 - Juan Pérez/
        ├── Resumen CX - Juan Pérez.pdf           ← Generado automáticamente
        ├── PRY-001 - foto_cx_1.jpg               ← Subido por instrumentador (renombrado)
        ├── PRY-001 - foto_cx_2.jpg               ← Subido por instrumentador (renombrado)
        ├── PRY-001 - informe_tecnico.pdf         ← Subido por instrumentador (renombrado)
        └── ... (más archivos subidos)
```

**Formato de archivos subidos:** `ID_PROYECTO - nombre_archivo_original.ext`

Ejemplo:
- Archivo original: `IMG_20241209_143025.jpg`
- Renombrado a: `PRY-001 - IMG_20241209_143025.jpg`

---

## 🐛 Solución de Problemas

### Los archivos no se mueven automáticamente

**Causa 1:** El trigger no está instalado
- **Solución:** Usa el menú CX > Configuración > Instalar Trigger

**Causa 2:** Falta autorización de permisos
- **Solución:** Ve a Apps Script > Ejecuciones, busca errores de permisos y autoriza

**Causa 3:** El formulario no tiene el ID de carpeta
- **Solución:** Asegúrate de usar el link prellenado generado por el sistema, no el link directo del formulario

### Cómo ver los logs de ejecución

1. Apps Script > Ejecuciones (icono de lista)
2. Busca las ejecuciones de `onFormSubmit`
3. Haz clic para ver detalles y logs

### Logs esperados (exitosos):

```
=== Inicio procesamiento formulario ===
Respuestas extraídas: {...}
Archivos encontrados: 3
Archivo detectado - ID: 1abc...
Archivo detectado - ID: 2def...
Archivo detectado - ID: 3ghi...
Carpeta destino: PRY-001 - Juan Pérez
ID Proyecto: PRY-001
Procesando archivo: foto_cx_1.jpg
Renombrado a: PRY-001 - foto_cx_1.jpg
✓ Archivo movido y renombrado: PRY-001 - foto_cx_1.jpg
Procesando archivo: foto_cx_2.jpg
Renombrado a: PRY-001 - foto_cx_2.jpg
✓ Archivo movido y renombrado: PRY-001 - foto_cx_2.jpg
Procesando archivo: informe.pdf
Renombrado a: PRY-001 - informe.pdf
✓ Archivo movido y renombrado: PRY-001 - informe.pdf
Total archivos movidos: 3 de 3
=== Procesamiento completado exitosamente ===
```

---

## 📝 Archivos del Sistema

- **`FormTriggerService.js`** - Servicio que procesa los envíos del formulario
- **`onFormSubmit()`** - Función trigger que se ejecuta automáticamente
- **`CONFIGURACION_TRIGGER.md`** - Documentación detallada

---

## ⚠️ Notas Importantes

- ✅ El trigger se ejecuta **automáticamente** cuando se envía el formulario
- ✅ Funciona **solo** con formularios prellenados generados por el sistema
- ✅ Los archivos se mueven, no se copian (se eliminan de la ubicación original)
- ✅ Si el trigger falla, los archivos quedan en la carpeta temporal de Forms
- ✅ Puedes revisar los logs en cualquier momento desde Apps Script

---

## 🎉 ¡Todo Listo!

El sistema está completamente funcional. Ahora los archivos subidos por el instrumentador se organizarán automáticamente en la carpeta correcta del proyecto.

**¿Necesitas ayuda?** Revisa los logs de ejecución o consulta `CONFIGURACION_TRIGGER.md` para más detalles.
