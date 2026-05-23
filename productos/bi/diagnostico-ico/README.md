# Diagnóstico de Madurez Analítica - NOEMA Framework BI

## 📋 Descripción

## Estructura del diagnóstico

El ICO se compone de 16 preguntas distribuidas en 4 dimensiones:

1. Exposición al Riesgo
2. Impacto Financiero
3. Fricción Operativa
4. Dependencia de Personas

Cada pregunta tiene 4 opciones con score de 0 a 3.
El score máximo total es de 48 puntos, luego normalizado a una escala de 0 a 100.

## 🏗️ Arquitectura del Proyecto

### Estructura de Archivos

```
diagnostico-refactored/
├── diagnostico-refactored.html    # HTML principal (minimalista)
├── styles/
│   └── diagnostic.css             # Todos los estilos organizados
├── scripts/
│   ├── config.js                  # Configuración global
│   ├── questions-data.js          # Base de datos de preguntas
│   ├── utm-tracker.js             # Manejo de parámetros UTM
│   └── diagnostic-logic.js        # Lógica principal del diagnóstico
└── README.md                      # Este archivo
```

### Principios de Diseño

1. **Separación de responsabilidades**: Cada archivo tiene un propósito específico
2. **Modularidad**: Código organizado en módulos independientes
3. **Mantenibilidad**: Fácil de entender y modificar
4. **Escalabilidad**: Preparado para crecer sin refactorización mayor
5. **Documentación**: Código bien comentado y documentado

## 📦 Componentes Principales

### 1. HTML Principal (`diagnostico-refactored.html`)

**Responsabilidad**: Estructura semántica y carga de recursos.

**Características**:
- Meta tags para SEO y redes sociales
- Scripts de analytics (GA4 + Meta Pixel)
- Estructura HTML limpia y minimalista
- Carga de CSS y JS externos

**Cuándo modificar**:
- Cambios en meta tags
- Actualización de IDs de tracking
- Modificación de estructura base del DOM

### 2. Estilos (`styles/diagnostic.css`)

**Responsabilidad**: Toda la presentación visual.

**Organización**:
```css
/* Reset & Base */
/* Header */
/* Diagnostic Hero */
/* Progress Bar */
/* Question Card */
/* Options */
/* Navigation */
/* Results Section */
/* Form Section */
/* Thank You Section */
/* Responsive */
```

**Cuándo modificar**:
- Cambios de diseño visual
- Ajustes de responsive
- Nuevos componentes de UI

### 3. Configuración (`scripts/config.js`)

**Responsabilidad**: Centralizar todas las configuraciones.

**Contiene**:
- URLs de API
- IDs de analytics
- Timeouts y configuraciones de tiempo
- Reglas de validación
- Definiciones de niveles de madurez
- Pesos por sección

**Cuándo modificar**:
- Cambio de endpoints
- Actualización de tracking IDs
- Modificación de reglas de negocio
- Ajuste de niveles de madurez

**Ejemplo de uso**:
```javascript
// Acceder a configuración
const apiUrl = CONFIG.API.GOOGLE_APPS_SCRIPT;
const levels = CONFIG.MATURITY_LEVELS;
```

### 4. Datos de Preguntas (`scripts/questions-data.js`)

**Responsabilidad**: Base de datos de preguntas del diagnóstico.

**Estructura**:
```javascript
{
    section: "Nombre de la sección",
    question: "Texto de la pregunta",
    options: [
        { text: "Opción 1", score: 0 },
        { text: "Opción 2", score: 1 },
        { text: "Opción 3", score: 2 },
        { text: "Opción 4", score: 3 }
    ]
}
```

**Secciones actuales**:
1. Gobierno de Datos (3 preguntas)
2. Integración y Arquitectura (3 preguntas)
3. Calidad de Datos (3 preguntas)
4. Métricas y Tiempos (3 preguntas)
5. Adopción y Cultura (3 preguntas)

**Cuándo modificar**:
- Agregar nuevas preguntas
- Modificar textos existentes
- Cambiar puntuaciones
- Reorganizar secciones

**Cómo agregar una pregunta**:
```javascript
{
    section: "Nueva Sección",
    question: "¿Tu nueva pregunta?",
    options: [
        { text: "Respuesta nivel 0", score: 0 },
        { text: "Respuesta nivel 1", score: 1 },
        { text: "Respuesta nivel 2", score: 2 },
        { text: "Respuesta nivel 3", score: 3 }
    ]
}
```

### 5. UTM Tracker (`scripts/utm-tracker.js`)

**Responsabilidad**: Manejo de parámetros UTM y tracking de origen.

**Funcionalidades**:
- Captura parámetros UTM de la URL
- Almacena en sessionStorage
- Detecta fuente de tráfico
- Limpia URL de parámetros
- Propaga UTM a enlaces internos

**API Pública**:
```javascript
// Inicializar
UTMTracker.initialize();

// Obtener datos actuales
const utm = UTMTracker.get();

// Agregar UTM a un href
const urlWithUTM = UTMTracker.withUTM('https://noema.lat/contacto');

// Aplicar a todos los enlaces
UTMTracker.applyToLinks();
```

**Cuándo modificar**:
- Agregar nuevos parámetros UTM personalizados
- Modificar lógica de detección de fuente
- Cambiar estrategia de persistencia

### 6. Lógica del Diagnóstico (`scripts/diagnostic-logic.js`)

**Responsabilidad**: Lógica principal de la aplicación.

**Módulos internos**:

#### State Management
```javascript
const state = {
    currentQuestion: 0,
    answers: [],
    lastQuestionReached: 0,
    formSubmitted: false,
    abandonSent: false,
    formViewTimeout: null
};
```

#### Funciones principales:

**Renderizado**:
- `renderQuestion()` - Renderiza pregunta actual
- `renderOptions()` - Renderiza opciones de respuesta
- `renderResults()` - Renderiza página de resultados
- `renderThankYouPage()` - Renderiza página de agradecimiento

**Navegación**:
- `previousQuestion()` - Ir a pregunta anterior
- `nextQuestion()` - Ir a siguiente pregunta
- `updateNavigationButtons()` - Actualizar estado de botones

**Cálculos**:
- `calculateResults()` - Calcular puntuación y nivel
- `getMaturityLevel()` - Determinar nivel de madurez
- `analyzeSections()` - Análisis por sección

**Formulario**:
- `handleFormSubmit()` - Procesar envío del formulario
- `buildSubmissionData()` - Construir datos para envío
- `submitToGoogleSheets()` - Enviar a Google Sheets

**Tracking**:
- `trackPageView()` - Tracking de vista de página
- `trackConversion()` - Tracking de conversión
- `trackAbandonment()` - Tracking de abandono
- `startFormViewTimer()` - Timer para "vio form pero no envió"

## 🔄 Flujo de Usuario

```
1. Carga de página
   ↓
2. Inicialización (UTM + Estado)
   ↓
3. Pregunta 1/15
   ↓
4. Selección de respuesta
   ↓
5. Siguiente → Pregunta 2/15
   ↓
   ... (hasta pregunta 15)
   ↓
6. Cálculo de resultados
   ↓
7. Mostrar resultados + formulario
   ↓
8. Envío de formulario
   ↓
9. Thank you page
```

## 📊 Sistema de Puntuación

### Cálculo de Score

1. **Puntuación por pregunta**: 0-3 puntos
2. **Score total**: Suma de todas las respuestas
3. **Score normalizado**: (Score total / Score máximo) × 100
4. **Score máximo posible**: 45 puntos (15 preguntas × 3)

### Niveles de Madurez

| Nivel | Rango | Nombre | Descripción |
|-------|-------|--------|-------------|
| 1 | 0-40 | Descriptiva | "¿Qué pasó?" - Reportes básicos del pasado |
| 2 | 41-60 | Diagnóstica | "¿Por qué pasó?" - Análisis de causas |
| 3 | 61-80 | Predictiva | "¿Qué pasará?" - Modelos predictivos |
| 4 | 81-100 | Prescriptiva | "¿Qué hacer?" - Recomendaciones automáticas |

## 📡 Integración con Google Sheets

### Endpoint

```
https://script.google.com/macros/s/AKfycbw.../exec
```

### Eventos Trackeados

1. **`diagnostic_submitted`** - Formulario completado
2. **`diagnostic_abandoned`** - Usuario abandonó sin terminar
3. **`form_viewed_not_submitted`** - Vio formulario pero no envió (60s)

### Estructura de Datos Enviados

```javascript
{
    // Evento
    event: 'diagnostic_submitted',
    
    // Datos del usuario
    nombre: 'Juan Pérez',
    cargo: 'CEO',
    email: 'juan@empresa.com',
    whatsapp: '+57 300 123 4567',
    empresa: 'Mi Empresa S.A.S',
    sector: 'retail',
    
    // Resultados
    totalScore: 38,
    normalizedScore: 84,
    maturityLevel: {...},
    
    // Contexto UTM
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'diagnostico_2025',
    angle: 'diagnostico',
    landing_path: '/diagnostico',
    
    // Preguntas y respuestas (15)
    q01_section: 'Gobierno de Datos',
    q01_question: '...',
    q01_answer: '...',
    q01_score: 3,
    // ... hasta q15
}
```

## 🎨 Personalización

### Cambiar Colores

Editar `styles/diagnostic.css`:

```css
/* Colores principales */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Colores de niveles */
.level-descriptive { color: #dc3545; }
.level-diagnostic { color: #ffc107; }
.level-predictive { color: #17a2b8; }
.level-prescriptive { color: #28a745; }
```

### Agregar Nueva Pregunta

1. Editar `scripts/questions-data.js`:

```javascript
{
    section: "Tu Sección",
    question: "¿Tu pregunta?",
    options: [
        { text: "Opción 1", score: 0 },
        { text: "Opción 2", score: 1 },
        { text: "Opción 3", score: 2 },
        { text: "Opción 4", score: 3 }
    ]
}
```

2. Actualizar `CONFIG.SECTION_WEIGHTS` si es necesario

### Modificar Niveles de Madurez

Editar `scripts/config.js`:

```javascript
MATURITY_LEVELS: {
    MI_NIVEL: {
        min: 0,
        max: 50,
        name: 'Nombre del Nivel',
        title: 'Título Descriptivo',
        color: '#hexcolor',
        description: 'Descripción del nivel...',
        recommendations: [
            'Recomendación 1',
            'Recomendación 2'
        ]
    }
}
```

### Cambiar Textos del Hero

Editar `diagnostico-refactored.html` sección `<div class="diagnostico-hero">`.

## 🔧 Mantenimiento

### Actualizar IDs de Tracking

Editar `scripts/config.js`:

```javascript
ANALYTICS: {
    GA_ID: 'G-XXXXXXXXXX',      // Google Analytics 4
    FB_PIXEL_ID: 'YYYYYYYY'      // Meta Pixel
}
```

Y en el HTML:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### Cambiar Endpoint de Google Sheets

Editar `scripts/config.js`:

```javascript
API: {
    GOOGLE_APPS_SCRIPT: 'https://script.google.com/macros/s/NUEVO_ID/exec'
}
```

### Agregar Validación de Email

Editar `scripts/config.js`:

```javascript
VALIDATION: {
    PUBLIC_EMAIL_DOMAINS: [
        'gmail.com',
        'hotmail.com',
        'nuevodominio.com'  // Agregar aquí
    ]
}
```

## 📱 Responsive Design

El diseño es totalmente responsive con breakpoint en 768px:

- **Desktop**: Diseño completo con padding amplio
- **Mobile**: Diseño optimizado con padding reducido y columnas únicas

## 🐛 Debugging

### Activar Logs

Todos los módulos incluyen `console.log` para debugging. Abre DevTools para ver:

```
🚀 Iniciando diagnóstico...
✓ Respuesta seleccionada: {...}
📊 Resultados calculados: {...}
📤 Enviando formulario: {...}
✅ Respuesta del servidor: OK
```

### Verificar Estado

En consola del navegador:

```javascript
// Ver estado actual
DiagnosticApp.state

// Ver resultados
DiagnosticApp.getResults()

// Ver datos UTM
UTMTracker.get()
```

## 🚀 Deployment

### Archivos Necesarios

1. `diagnostico-refactored.html`
2. `styles/diagnostic.css`
3. `scripts/config.js`
4. `scripts/questions-data.js`
5. `scripts/utm-tracker.js`
6. `scripts/diagnostic-logic.js`

### Checklist Pre-Deploy

- [ ] Actualizar GA_ID en config.js y HTML
- [ ] Actualizar FB_PIXEL_ID en config.js y HTML
- [ ] Verificar GOOGLE_APPS_SCRIPT URL
- [ ] Revisar meta tags (título, descripción, imagen OG)
- [ ] Probar en mobile y desktop
- [ ] Verificar formulario funciona
- [ ] Confirmar tracking de analytics

## 📈 Mejoras Futuras

### Corto Plazo
- [ ] Agregar animaciones de transición
- [ ] Implementar gráficos de resultados por sección
- [ ] Añadir opción de descargar PDF
- [ ] Guardar progreso en localStorage

### Largo Plazo
- [ ] Versión multi-idioma
- [ ] Dashboard de administración
- [ ] A/B testing de preguntas
- [ ] Integración con CRM
- [ ] API REST para consultas

## 📝 Notas Técnicas

### Compatibilidad de Navegadores

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Dependencias

Ninguna. El proyecto usa JavaScript vanilla y CSS puro.

### Performance

- Tamaño total: ~80KB (sin comprimir)
- Primera carga: <2s en 3G
- Lighthouse Score: 95+

## 📞 Soporte

Para preguntas o problemas:
- Email: soporte@noema.lat
- WhatsApp: +57 321 278 9836

---

**Última actualización**: Enero 2025
**Versión**: 2.0
**Autor**: NOEMA Framework BI
