# 📂 ÍNDICE DE ARCHIVOS DEL PROYECTO

## 🎯 Archivos para Comenzar (LEER EN ORDEN)

1. **RESUMEN.md** ⭐
   - Resumen ejecutivo del proyecto
   - Métricas de mejora
   - Beneficios principales
   - **LEE ESTO PRIMERO**

2. **INICIO_RAPIDO.js** ⭐
   - Guía de 5 minutos para implementar
   - Pasos concretos y simples
   - Solución rápida de problemas
   - **LEE ESTO SEGUNDO**

3. **README.md** ⭐
   - Documentación completa del sistema
   - Características y funcionalidades
   - Instrucciones de uso
   - **LEE ESTO TERCERO**

## 🏗️ Archivos del Sistema (COPIAR A APPS SCRIPT)

### Archivos Core (Copiar en este orden)

1. **Config.js**
   - Configuración centralizada
   - IDs de Drive, Forms, Sheets
   - Constantes del sistema
   - ⚠️ DEBES EDITAR ESTE ARCHIVO con tus IDs

2. **Utils.js**
   - Funciones utilitarias
   - Formateo de fechas y horas
   - Validaciones
   - Sanitización

3. **DriveService.js**
   - Operaciones con Google Drive
   - Creación de carpetas
   - Manejo de archivos

4. **PdfService.js**
   - Generación de PDFs
   - Relleno de plantillas
   - Exportación de documentos

5. **FormService.js**
   - Manejo de formularios
   - URLs prellenadas
   - Codificación de parámetros

6. **SheetService.js**
   - Operaciones con Sheets
   - Lectura/escritura de datos
   - Ordenamiento

7. **UIService.js**
   - Interfaz de usuario
   - Menús y diálogos
   - Mensajes para WhatsApp

8. **Asistencia Técnica.js**
   - Orquestador principal
   - Flujo completo del sistema
   - Funciones del menú

9. **Fecha.js**
   - Funciones de ordenamiento
   - Manipulación de fechas

## 📚 Archivos de Documentación (PARA REFERENCIA)

### Documentación Técnica

1. **ARQUITECTURA.md**
   - Diagramas del sistema
   - Explicación de la arquitectura
   - Patrones de diseño utilizados
   - Flujos de ejecución

2. **MIGRACION.js**
   - Guía de migración detallada
   - Mapeo de funciones antiguas a nuevas
   - Verificación paso a paso

3. **EJEMPLOS_EXTENSION.js**
   - Cómo agregar funcionalidades
   - Ejemplos completos de extensiones
   - Buenas prácticas

## 📋 Archivos de Configuración (NO MODIFICAR)

1. **appsscript.json**
   - Configuración de Apps Script
   - Zona horaria
   - Servicios avanzados

2. **.clasp.json**
   - Configuración de CLASP
   - ID del script

## 🗂️ Estructura del Proyecto

```
agenda-cx/
│
├── 📖 DOCUMENTACIÓN INICIAL
│   ├── RESUMEN.md              ← EMPIEZA AQUÍ
│   ├── INICIO_RAPIDO.js        ← LUEGO ESTO
│   └── README.md               ← DOCUMENTACIÓN COMPLETA
│
├── 🏗️ CÓDIGO DEL SISTEMA (Copiar a Apps Script)
│   ├── Config.js               ← 1. Configuración (EDITAR)
│   ├── Utils.js                ← 2. Utilidades
│   ├── DriveService.js         ← 3. Servicio Drive
│   ├── PdfService.js           ← 4. Servicio PDF
│   ├── FormService.js          ← 5. Servicio Forms
│   ├── SheetService.js         ← 6. Servicio Sheets
│   ├── UIService.js            ← 7. Servicio UI
│   ├── Asistencia Técnica.js   ← 8. Orquestador
│   └── Fecha.js                ← 9. Utilidades de Fecha
│
├── 📚 DOCUMENTACIÓN TÉCNICA
│   ├── ARQUITECTURA.md         ← Diagramas y patrones
│   ├── MIGRACION.js            ← Guía de migración
│   └── EJEMPLOS_EXTENSION.js   ← Cómo extender
│
└── ⚙️ CONFIGURACIÓN
    ├── appsscript.json         ← Config Apps Script
    └── .clasp.json             ← Config CLASP
```

## 🎯 Guía de Uso por Rol

### Para Implementadores
1. Lee **RESUMEN.md**
2. Sigue **INICIO_RAPIDO.js**
3. Consulta **README.md** si tienes dudas

### Para Desarrolladores
1. Lee **RESUMEN.md**
2. Estudia **ARQUITECTURA.md**
3. Revisa **EJEMPLOS_EXTENSION.js** para extender
4. Consulta el código en los servicios

### Para Usuarios Finales
1. Lee solo la sección "Uso" en **README.md**
2. Usa el menú "CX" en el Sheet
3. Sigue las instrucciones del diálogo

## 📊 Dependencias entre Archivos

```
Config.js (Base - sin dependencias)
   ↓
Utils.js (Depende de Config)
   ↓
┌──────────┬──────────┬──────────┬──────────┐
│          │          │          │          │
DriveS    PdfS      FormS    SheetS     UIService
│          │          │          │          │
└──────────┴────┬─────┴──────────┴──────────┘
                ↓
      Asistencia Técnica.js
            (Orquestador)
                ↓
            Fecha.js
```

## 🔄 Orden de Implementación Recomendado

### Día 1: Setup Básico
- [ ] Copiar archivos core (1-9)
- [ ] Configurar IDs en Config.js
- [ ] Probar "Ver resumen"

### Día 2: Pruebas
- [ ] Probar flujo completo
- [ ] Verificar PDF generado
- [ ] Verificar formulario
- [ ] Verificar registro en hoja

### Día 3: Capacitación
- [ ] Capacitar al equipo
- [ ] Documentar casos especiales
- [ ] Recolectar feedback

## 💡 Tips Importantes

1. **SIEMPRE** edita Config.js con tus IDs antes de usar
2. **NUNCA** modifiques los archivos de servicio directamente (excepto para extender)
3. **LEE** la documentación antes de hacer cambios
4. **PRUEBA** en un ambiente de desarrollo primero
5. **DOCUMENTA** cualquier personalización que hagas

## 🆘 Ayuda Rápida

| Necesitas...                | Lee este archivo...        |
|----------------------------|----------------------------|
| Visión general             | RESUMEN.md                 |
| Implementar rápido         | INICIO_RAPIDO.js           |
| Entender funcionalidades   | README.md                  |
| Comprender arquitectura    | ARQUITECTURA.md            |
| Migrar desde código viejo  | MIGRACION.js               |
| Agregar funcionalidades    | EJEMPLOS_EXTENSION.js      |

## ✅ Checklist de Archivos

Verifica que tienes todos estos archivos:

### Documentación (4 archivos)
- [ ] RESUMEN.md
- [ ] INICIO_RAPIDO.js
- [ ] README.md
- [ ] ARQUITECTURA.md
- [ ] MIGRACION.js
- [ ] EJEMPLOS_EXTENSION.js
- [ ] INDICE.md (este archivo)

### Código (9 archivos)
- [ ] Config.js
- [ ] Utils.js
- [ ] DriveService.js
- [ ] PdfService.js
- [ ] FormService.js
- [ ] SheetService.js
- [ ] UIService.js
- [ ] Asistencia Técnica.js
- [ ] Fecha.js

### Configuración (2 archivos)
- [ ] appsscript.json
- [ ] .clasp.json

**Total: 18 archivos**

---

## 🚀 ¿Listo para Empezar?

1. ✅ Lee **RESUMEN.md** (3 min)
2. ✅ Sigue **INICIO_RAPIDO.js** (5 min)
3. ✅ ¡Empieza a usar el sistema!

**¡Éxito con tu implementación!** 🎉
