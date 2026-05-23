/**
 * CONFIG.JS — NOEMA ICO v2.1
 * Fuente única de verdad. Modificar niveles/scoring desde /admin.html
 *
 * ⚠️  Antes de deploy actualizar:
 *     GA_ID       → tu ID de Google Analytics 4
 *     FB_PIXEL_ID → tu Meta Pixel ID
 */

const CONFIG = {

    // ─── API ─────────────────────────────────────────────────────────────────
    API: {
        GOOGLE_APPS_SCRIPT: 'https://script.google.com/macros/s/AKfycbz0muFrLuZ95dcaSV1lCJuEqa-f_7zu9uyUh0r57L1ITJp4Y_tqnlgt9Xi9b9MqkzqgCg/exec'
    },

    // ─── ANALYTICS ───────────────────────────────────────────────────────────
    ANALYTICS: {
        GA_ID:       'G-XXXXXXXXXX',
        FB_PIXEL_ID: 'TU_PIXEL_ID_AQUI'
    },

    // ─── TIMING ──────────────────────────────────────────────────────────────
    TIMING: {
        FORM_VIEW_TIMEOUT: 60000   // ms → dispara "vio form, no envió"
    },

    // ─── VALIDACIÓN EMAIL ────────────────────────────────────────────────────
    VALIDATION: {
        PUBLIC_EMAIL_DOMAINS: [
            'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com',
            'live.com', 'icloud.com', 'aol.com',
            'hotmail.es', 'yahoo.es', 'gmail.es'
        ]
    },

    // ─── DIAGNÓSTICO ─────────────────────────────────────────────────────────
    DIAGNOSTIC: {
        TOTAL_QUESTIONS:  16,
        MAX_SCORE_PER_Q:   3,
        get MAX_SCORE() { return this.TOTAL_QUESTIONS * this.MAX_SCORE_PER_Q; } // 48
    },

    // ─── ICO LEVELS ──────────────────────────────────────────────────────────
    // Rangos sobre score normalizado 0–100.
    // Editar desde /admin.html — al exportar reemplaza este bloque.
    ICO_LEVELS: [
        {
            min: 0, max: 30,
            name:  'Riesgo Crítico',
            title: 'Tu operación trabaja con información que no puedes confiar',
            desc:  'Las decisiones importantes se toman con datos incompletos o incorrectos. Cada cierre de mes genera caos. El costo oculto de esta situación es mayor de lo que parece.',
            color: '#ef4444',
            bg:    'rgba(239,68,68,0.10)'
        },
        {
            min: 31, max: 55,
            name:  'Control Limitado',
            title: 'Tienes visibilidad parcial — y eso tiene un costo real',
            desc:  'Los números existen pero no siempre cuadran. Los cierres son lentos y la dirección opera con información imperfecta. El negocio podría crecer más rápido.',
            color: '#f97316',
            bg:    'rgba(249,115,22,0.10)'
        },
        {
            min: 56, max: 75,
            name:  'En Transición',
            title: 'Tienes una base, pero hay puntos ciegos importantes',
            desc:  'Algunos procesos funcionan bien, pero la confiabilidad de tus números depende de personas específicas o de procesos frágiles. Un punto de quiebre puede costar caro.',
            color: '#eab308',
            bg:    'rgba(234,179,8,0.10)'
        },
        {
            min: 76, max: 100,
            name:  'Control Operativo',
            title: 'Tu empresa tiene una base sólida de control',
            desc:  'Los números son confiables, los cierres son ágiles y la dirección tiene visibilidad real. El siguiente paso es optimizar y escalar sin perder el control.',
            color: '#10b981',
            bg:    'rgba(16,185,129,0.10)'
        }
    ],

    // ─── SECTION WEIGHTS ─────────────────────────────────────────────────────
    // Reservado para scoring ponderado futuro
    SECTION_WEIGHTS: {
        'Exposición al Riesgo':    0.25,
        'Impacto Financiero':      0.25,
        'Fricción Operativa':      0.25,
        'Dependencia de Personas': 0.25
    },

    // ─── SHEETS MAP ──────────────────────────────────────────────────────────
    // Mapeo dimensiones ICO → columnas legacy Google Sheets
    // ⚠️ NO cambiar sin actualizar también el Apps Script
    SHEETS_MAP: {
        'Exposición al Riesgo':    'gobierno',
        'Impacto Financiero':      'integracion',
        'Fricción Operativa':      'calidad',
        'Dependencia de Personas': 'metricas'
        // 'adopcion' se envía vacío — campo legacy v1
    }
};

if (typeof module !== 'undefined' && module.exports) { module.exports = CONFIG; }
