# Arquitectura del Sistema - Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        GOOGLE SHEETS UI                         │
│                       (Interfaz de Usuario)                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Asistencia Técnica.js                         │
│                      (Orquestador)                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • onOpen()                                              │  │
│  │  • generarResumenCxDesdeFila()                           │  │
│  │  • flujoCxDesdeFila()                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─┬───┬───┬───┬───┬───┬───┬─────────────────────────────────────┘
  │   │   │   │   │   │   │
  │   │   │   │   │   │   └──────────────┐
  │   │   │   │   │   │                  │
  ▼   ▼   ▼   ▼   ▼   ▼                  ▼
┌────────────────────┐  ┌────────────────────────────────────────┐
│    Config.js       │  │         Capa de Servicios              │
│  (Configuración)   │  └────────────────────────────────────────┘
│                    │            │
│ • DRIVE            │  ┌─────────┴─────────┐
│ • FORM             │  │                   │
│ • SHEETS           │  ▼                   ▼
│ • TIMEZONE         │  ┌──────────────┐  ┌──────────────┐
│ • FORMATS          │  │ UIService.js │  │ Utils.js     │
│ • MESSAGES         │  │              │  │              │
└────────────────────┘  │ • Menús      │  │ • Formateo   │
                        │ • Alertas    │  │ • Validación │
                        │ • Diálogos   │  │ • Sanitizar  │
                        │ • WhatsApp   │  └──────────────┘
                        └──────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│SheetService  │      │ PdfService   │      │ FormService  │
│              │      │              │      │              │
│ • Lectura    │      │ • Copiar     │      │ • URLs       │
│ • Escritura  │      │ • Rellenar   │      │ • Parámetros │
│ • Ordenar    │      │ • Exportar   │      │ • Codificar  │
│ • Registros  │      └──────┬───────┘      └──────────────┘
└──────────────┘             │
                             ▼
                     ┌──────────────┐
                     │DriveService  │
                     │              │
                     │ • Carpetas   │
                     │ • Archivos   │
                     │ • URLs       │
                     │ • Plantillas │
                     └──────┬───────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │         APIs de Google                │
        │                                       │
        │  • Google Drive API                   │
        │  • Google Docs API                    │
        │  • Google Forms API                   │
        │  • Google Sheets API                  │
        └───────────────────────────────────────┘
```

## Flujo de Ejecución

### 1. Ver Resumen
```
Usuario → Menú CX → generarResumenCxDesdeFila()
  ↓
SheetService.obtenerDatosFila()
  ↓
UIService.mostrarResumenCx()
```

### 2. Flujo Completo
```
Usuario → Menú CX → flujoCxDesdeFila()
  ↓
SheetService.obtenerDatosFila()
  ↓
Utils.validarDatosObligatorios()
  ↓
DriveService.crearCarpetaCx()
  ↓
PdfService.generarPdfCx()
  ├─ DriveService.copiarPlantilla()
  ├─ [Rellenar documento]
  └─ DriveService.crearArchivoPdf()
  ↓
FormService.crearLinkFormPrellenado()
  ↓
SheetService.guardarLinkEnOtraHoja()
  ↓
UIService.mostrarDialogoWhatsApp()
```

## Principios de Diseño

### Separación de Responsabilidades
Cada módulo tiene una única responsabilidad:
- **Config**: Solo configuración
- **Utils**: Solo utilidades
- **Services**: Solo operaciones específicas

### Bajo Acoplamiento
Los servicios son independientes entre sí:
- Pueden usarse por separado
- No hay dependencias circulares
- Fácil de testear

### Alta Cohesión
Las funciones relacionadas están agrupadas:
- Todo lo de Drive en DriveService
- Todo lo de UI en UIService
- Todo lo de Sheets en SheetService

### DRY (Don't Repeat Yourself)
No hay duplicación de código:
- Funciones reutilizables en Utils
- Configuración centralizada en Config
- Servicios compartidos

## Patrones Utilizados

### Service Pattern
Cada servicio encapsula operaciones relacionadas:
```javascript
const DriveService = {
  crearCarpetaCx: function() { ... },
  copiarPlantilla: function() { ... },
  // ...
}
```

### Facade Pattern
El orquestador oculta la complejidad:
```javascript
function flujoCxDesdeFila() {
  // Coordina múltiples servicios
  // El usuario no ve la complejidad interna
}
```

### Configuration Pattern
Configuración externalizada:
```javascript
const CONFIG = {
  DRIVE: { ... },
  FORM: { ... },
  // ...
}
```
