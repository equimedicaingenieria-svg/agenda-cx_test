# 🔍 Guía de Debugging - Formulario y Archivos

## ❌ Problema Reportado

Los archivos subidos al formulario:
1. NO se están guardando en la carpeta del proyecto
2. NO se están renombrando con el formato `ID_PROYECTO - nombre_archivo`

## 🔎 Pasos para Diagnosticar

### PASO 1: Verificar que el Trigger esté instalado

1. Ve a Apps Script > Activadores (icono del reloj ⏰)
2. Verifica que exista un trigger:
   - Función: `onFormSubmit`
   - Tipo de evento: Al enviar formulario
   - Del formulario: [Tu formulario]

**Si NO existe:** Instálalo desde CX > Configuración > Instalar Trigger

---

### PASO 2: Enviar un formulario de prueba

1. Desde tu Google Sheet, genera el link del formulario:
   - Selecciona una fila
   - CX > Generar Carpeta + PDF + Form
   
2. Copia el link del formulario del diálogo

3. Abre el link en una ventana incógnito

4. **IMPORTANTE:** Completa el formulario Y **sube al menos 1 archivo**

5. Envía el formulario

---

### PASO 3: Ejecutar función de debugging

1. Ve a Apps Script (Extensiones > Apps Script)

2. Busca el archivo `FormTriggerService.js`

3. En la parte superior, selecciona la función: `debugUltimaRespuestaFormulario`

4. Haz clic en "Ejecutar" (▶)

5. Ve a "Ejecuciones" (icono de lista) para ver los logs

---

### PASO 4: Analizar los logs

Los logs te mostrarán algo como esto:

```
=== ÚLTIMA RESPUESTA DEL FORMULARIO ===
Fecha: Mon Dec 09 2024 14:30:00 GMT-0300 (ART)
Total de campos: 8

Campo #1:
  Pregunta: "Paciente"
  Respuesta: "Juan Pérez"

Campo #2:
  Pregunta: "Fecha de Cirugía"
  Respuesta: "2024-12-09"

...

Campo #7:
  Pregunta: "Nombre de Carpeta"    ← IMPORTANTE
  Respuesta: "PRY-001"

Campo #8:
  Pregunta: "ID de Carpeta"        ← IMPORTANTE
  Respuesta: "1zWFGYBLXirVW..."

=== FIN DEBUG ===
```

**COSAS CLAVE A VERIFICAR:**

✅ ¿Aparecen los campos "Nombre de Carpeta" e "ID de Carpeta"?
✅ ¿Tienen valores (no están vacíos)?
✅ ¿Los nombres de las preguntas coinciden exactamente?

---

### PASO 5: Revisar logs del trigger

1. Ve a Apps Script > Ejecuciones

2. Busca ejecuciones de `onFormSubmit` (no `debugUltimaRespuesta...`)

3. Haz clic en la ejecución más reciente

4. Revisa los logs

**Logs esperados (ÉXITO):**

```
=== Inicio procesamiento formulario ===
TODOS LOS VALORES RECIBIDOS:
  "Paciente": ["Juan Pérez"]
  "Fecha de Cirugía": ["2024-12-09"]
  "Nombre de Carpeta": ["PRY-001"]
  "ID de Carpeta": ["1zWFGYBLXirVW..."]
  ...

folderName encontrado por nombre de pregunta: "Nombre de Carpeta" = "PRY-001"
folderId encontrado por nombre de pregunta: "ID de Carpeta" = "1zWFGYBLXirVW..."
Archivos encontrados: 2
Carpeta destino: PRY-001 - Juan Pérez
ID Proyecto: PRY-001
Procesando archivo: foto.jpg
Renombrado a: PRY-001 - foto.jpg
✓ Archivo movido y renombrado: PRY-001 - foto.jpg
...
=== Procesamiento completado exitosamente ===
```

**Logs de ERROR (problema):**

```
=== Inicio procesamiento formulario ===
TODOS LOS VALORES RECIBIDOS:
  "Paciente": ["Juan Pérez"]
  ...
  (NO aparece "Nombre de Carpeta" o "ID de Carpeta")

folderName extraído: "null"
folderId extraído: "null"
ADVERTENCIA: No se encontró ID de carpeta en el formulario
```

---

## 🔧 Soluciones Según el Problema

### ❌ PROBLEMA 1: No aparecen "Nombre de Carpeta" ni "ID de Carpeta" en los logs

**Causa:** El formulario NO tiene estos campos ocultos

**Solución:**

1. Verifica en Google Forms que existan dos campos:
   - Un campo de texto corto llamado "Nombre de Carpeta"
   - Un campo de texto corto llamado "ID de Carpeta" (puede estar oculto)

2. Si NO existen, debes agregarlos al formulario:
   - Abre el formulario en Google Forms
   - Agrega pregunta > Respuesta corta
   - Título: "Nombre de Carpeta"
   - Agrega otra pregunta > Respuesta corta
   - Título: "ID de Carpeta"

3. Copia los IDs de entrada (entry IDs):
   - Ve a "Obtener vínculo prellenado"
   - Llena cualquier valor en estos campos
   - Copia el link
   - Los IDs estarán como `entry.XXXXXXX`

4. Actualiza `Config.js` con los entry IDs correctos:
   ```javascript
   FOLDER_NAME: 'entry.XXXXXXX',  // El que copiaste
   FOLDER_ID: 'entry.YYYYYYY'     // El que copiaste
   ```

---

### ❌ PROBLEMA 2: Los campos existen pero tienen valores vacíos

**Causa:** El link del formulario NO está prellenado correctamente

**Verificación:**

1. Copia el link generado por el sistema
2. Pégalo en un navegador
3. ¿Los campos "Nombre de Carpeta" e "ID de Carpeta" aparecen prellenados?

**Si NO están prellenados:**

- El problema está en `FormService.js` o en los entry IDs de `Config.js`
- Verifica que los entry IDs en Config.js sean correctos

---

### ❌ PROBLEMA 3: Todo se ve bien en los logs pero NO se mueven los archivos

**Causa:** Error al detectar o mover archivos

**Verificación en los logs:**

```
Archivos encontrados: 0
No hay archivos adjuntos para mover
```

**Si dice "0 archivos":**

1. Verifica que el formulario tenga un campo de "Subir archivo"
2. Cuando envíes el formulario, asegúrate de subir al menos 1 archivo
3. Los archivos deben subirse correctamente (no error de permisos)

**Si dice que encontró archivos pero hay error al mover:**

- Revisa los mensajes de error específicos en los logs
- Pueden ser problemas de permisos de Drive

---

### ❌ PROBLEMA 4: Los archivos se mueven pero NO se renombran

**Causa:** El `folderName` está null o vacío

**Verificación:**

Busca en los logs:
```
ID Proyecto: null
```
o
```
ID Proyecto: 
```

**Solución:**

El campo "Nombre de Carpeta" NO está llegando al trigger. Ver PROBLEMA 1.

---

## 📋 Checklist Completo

- [ ] Trigger `onFormSubmit` está instalado
- [ ] Formulario tiene campo "Nombre de Carpeta"
- [ ] Formulario tiene campo "ID de Carpeta"
- [ ] Entry IDs en `Config.js` son correctos
- [ ] Link prellenado incluye valores para ambos campos
- [ ] Formulario tiene campo de "Subir archivo"
- [ ] Se suben archivos al enviar el formulario
- [ ] Los logs muestran que `folderId` se extrae correctamente
- [ ] Los logs muestran que `folderName` se extrae correctamente
- [ ] Los logs muestran archivos detectados

---

## 🆘 Si Nada Funciona

Comparte los logs completos de:

1. La función `debugUltimaRespuestaFormulario`
2. La última ejecución de `onFormSubmit`

Esto permitirá diagnosticar el problema exacto.
