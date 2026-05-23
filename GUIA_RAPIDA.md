# Guía Rápida de Modificaciones

## 🎯 Tareas Comunes

### 1. Cambiar Textos del Hero

**Archivo**: `diagnostico-refactored.html`

**Ubicación**: Buscar `<div class="diagnostico-hero">`

```html
<h1 class="diagnostico-title">
    TU NUEVO TÍTULO AQUÍ
</h1>

<p class="diagnostico-subtitle">
    Tu nuevo subtítulo aquí
</p>
```

---

### 2. Agregar/Modificar Preguntas

**Archivo**: `scripts/questions-data.js`

**Template de pregunta**:
```javascript
{
    section: "Nombre de Sección",
    question: "¿Tu pregunta aquí?",
    options: [
        { text: "Peor respuesta", score: 0 },
        { text: "Respuesta media-baja", score: 1 },
        { text: "Respuesta media-alta", score: 2 },
        { text: "Mejor respuesta", score: 3 }
    ]
}
```

**Importante**: 
- Mantener 4 opciones por pregunta
- Scores siempre de 0 a 3
- Agregar al final del array `QUESTIONS`

---

### 3. Modificar Colores del Tema

**Archivo**: `styles/diagnostic.css`

**Gradiente principal** (línea ~67):
```css
background: linear-gradient(135deg, #TU_COLOR_1 0%, #TU_COLOR_2 100%);
```

**Color del badge de sección** (línea ~208):
```css
.section-badge {
    background: #TU_COLOR;
}
```

**Color de botones** (línea ~667):
```css
.btn-nav {
    border-color: #TU_COLOR;
    color: #TU_COLOR;
}
```

---

### 4. Actualizar Google Analytics

**Archivo 1**: `diagnostico-refactored.html` (línea ~34)
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TU_NUEVO_ID"></script>
<script>
    gtag('config', 'G-TU_NUEVO_ID');
</script>
```

**Archivo 2**: `scripts/config.js` (línea ~11)
```javascript
ANALYTICS: {
    GA_ID: 'G-TU_NUEVO_ID',
}
```

---

### 5. Cambiar Facebook Pixel

**Archivo 1**: `diagnostico-refactored.html` (línea ~52)
```javascript
fbq('init', 'TU_NUEVO_PIXEL_ID');
```

**Archivo 2**: `scripts/config.js` (línea ~12)
```javascript
ANALYTICS: {
    FB_PIXEL_ID: 'TU_NUEVO_PIXEL_ID'
}
```

---

### 6. Actualizar Endpoint de Google Sheets

**Archivo**: `scripts/config.js` (línea ~7)

```javascript
API: {
    GOOGLE_APPS_SCRIPT: 'https://script.google.com/macros/s/TU_NUEVO_ID/exec'
}
```

---

### 7. Modificar Niveles de Madurez

**Archivo**: `scripts/config.js` (línea ~20)

**Cambiar rangos**:
```javascript
DESCRIPTIVE: {
    min: 0,      // ← Cambiar aquí
    max: 40,     // ← Cambiar aquí
    name: 'Descriptiva',
    // ...
}
```

**Cambiar recomendaciones**:
```javascript
recommendations: [
    'Tu nueva recomendación 1',
    'Tu nueva recomendación 2',
    'Tu nueva recomendación 3'
]
```

---

### 8. Agregar Nueva Opción al Select de Sector

**Archivo**: `scripts/diagnostic-logic.js` (línea ~337)

```html
<select name="sector" class="form-select" required>
    <option value="">Selecciona...</option>
    <option value="retail">Retail / Comercio</option>
    <!-- AGREGAR AQUÍ -->
    <option value="tu_sector">Tu Nuevo Sector</option>
</select>
```

---

### 9. Cambiar Dominios de Email Bloqueados

**Archivo**: `scripts/config.js` (línea ~17)

```javascript
PUBLIC_EMAIL_DOMAINS: [
    'gmail.com',
    'hotmail.com',
    'outlook.com',
    'yahoo.com',
    'tu-dominio-bloqueado.com'  // ← Agregar aquí
]
```

---

### 10. Modificar Timeout del Formulario

**Archivo**: `scripts/config.js` (línea ~14)

```javascript
TIMING: {
    FORM_VIEW_TIMEOUT: 60000,  // ← Cambiar (en milisegundos)
}
```

60000 = 60 segundos
30000 = 30 segundos
120000 = 2 minutos

---

### 11. Cambiar Textos del Formulario

**Archivo**: `scripts/diagnostic-logic.js` (línea ~324)

```javascript
<h2 class="form-title">TU NUEVO TÍTULO</h2>
<p class="form-subtitle">
    Tu nuevo subtítulo aquí
</p>
```

---

### 12. Personalizar Thank You Page

**Archivo**: `scripts/diagnostic-logic.js` (línea ~619)

```javascript
<h2 class="thank-you-title">¡Tu nuevo mensaje!</h2>
<p class="thank-you-message">
    Tu mensaje personalizado aquí
</p>
```

---

## 📋 Checklist de Cambios Típicos

### Al Lanzar una Nueva Campaña

- [ ] Verificar meta tags en HTML (título, descripción)
- [ ] Actualizar imagen Open Graph si es necesario
- [ ] Crear nueva variante de preguntas si aplica
- [ ] Configurar nuevo tracking ID si es campaña separada
- [ ] Actualizar textos del hero
- [ ] Revisar recomendaciones por nivel

### Al Cambiar de Diseño

- [ ] Actualizar colores en CSS
- [ ] Modificar gradientes de fondo
- [ ] Ajustar tamaños de fuente si es necesario
- [ ] Revisar responsive en mobile
- [ ] Actualizar favicon si aplica

### Al Agregar/Modificar Tracking

- [ ] Actualizar GA ID en config.js y HTML
- [ ] Actualizar FB Pixel en config.js y HTML
- [ ] Verificar eventos personalizados
- [ ] Probar con Tag Assistant
- [ ] Confirmar datos en Google Sheets

---

## 🔍 Encontrar Código Rápidamente

### Buscar por Función

| Quiero modificar... | Buscar en archivo... | Buscar término... |
|---------------------|---------------------|-------------------|
| Pregunta específica | questions-data.js | Texto de la pregunta |
| Color de botón | diagnostic.css | `.btn-nav` |
| Mensaje de error email | diagnostic-logic.js | `emailError` |
| Texto del hero | diagnostico-refactored.html | `diagnostico-title` |
| Lógica de scoring | diagnostic-logic.js | `calculateResults` |
| Tracking de abandono | diagnostic-logic.js | `trackAbandonment` |
| Parámetros UTM | utm-tracker.js | `VALID_UTM_KEYS` |

---

## ⚠️ Errores Comunes

### "El formulario no se envía"

**Verificar**:
1. Endpoint correcto en `config.js`
2. Todos los campos required están completos
3. Email no es de dominio público
4. Checkbox de privacidad marcado

**Solución**: Abrir DevTools → Console y buscar error en rojo

---

### "No se calculan bien los resultados"

**Verificar**:
1. Todas las preguntas tienen score 0-3
2. Número correcto de preguntas (debe ser múltiplo de secciones)
3. Rangos de niveles no se superponen

**Solución**: Revisar `questions-data.js` y `config.js`

---

### "Colores no cambian"

**Verificar**:
1. Archivo CSS se está cargando correctamente
2. Cache del navegador (Ctrl+Shift+R para recargar sin cache)
3. Selector CSS es correcto

**Solución**: Inspeccionar elemento con DevTools

---

## 💡 Tips Pro

1. **Usa búsqueda global**: Ctrl+F en tu editor para buscar en todos los archivos
2. **Comenta tus cambios**: Agrega `// MODIFICADO: descripción` cuando hagas cambios
3. **Prueba en incógnito**: Para evitar problemas de cache
4. **Usa DevTools**: Console + Network + Elements son tus amigos
5. **Respalda antes**: Copia el archivo antes de modificar

---

## 📞 ¿Necesitas Ayuda?

1. Revisa el README.md completo
2. Busca en los comentarios del código
3. Usa console.log() para debugging
4. Contacta soporte si persiste el problema

---

**Última actualización**: Enero 2025
