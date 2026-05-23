/**
 * QUESTIONS-DATA.JS — NOEMA ICO v2.3
 * Marco Oficial del ICO — 4 dimensiones × 4 preguntas = 16 preguntas
 *
 * Dimensiones:
 *   1. Exposición al Riesgo     (Q01–Q04)
 *   2. Impacto Financiero       (Q05–Q08)
 *   3. Fricción Operativa       (Q09–Q12)
 *   4. Dependencia de Personas  (Q13–Q16)
 *
 * Score por opción: 0 (peor) → 3 (mejor)
 * Score máximo total: 48 pts (16 × 3)
 */

const QUESTIONS = [

    // ── BLOQUE 1: EXPOSICIÓN AL RIESGO ────────────────────────────────────────
    {
        section: 'Exposición al Riesgo',
        question: 'Cuando presentas una cifra crítica como ventas, margen o inventario, ¿qué tan fácil es rastrearla hasta su fuente original y entender cómo fue construida?',
        options: [
            { text: 'No es claro; depende de alguien o de archivos dispersos', score: 0 },
            { text: 'Se puede rastrear parcialmente, pero con esfuerzo', score: 1 },
            { text: 'Se rastrea con relativa claridad, aunque requiere validaciones', score: 2 },
            { text: 'Se rastrea de forma clara, inmediata y documentada', score: 3 }
        ]
    },
    {
        section: 'Exposición al Riesgo',
        question: '¿Qué tan alineadas están entre áreas las definiciones de tus KPIs críticos, para que una misma cifra signifique lo mismo en gerencia, finanzas, operaciones y comercial?',
        options: [
            { text: 'No están alineadas; cada área las interpreta distinto', score: 0 },
            { text: 'Existen algunas definiciones, pero no son consistentes', score: 1 },
            { text: 'La mayoría están alineadas, con algunas diferencias', score: 2 },
            { text: 'Están alineadas, formalizadas y compartidas', score: 3 }
        ]
    },
    {
        section: 'Exposición al Riesgo',
        question: 'Si hoy un auditor, banco, socio o junta cuestiona una cifra relevante, ¿qué sucede normalmente?',
        options: [
            { text: 'Se genera discusión porque no hay una versión confiable', score: 0 },
            { text: 'Se revisan archivos y fuentes manualmente para defenderla', score: 1 },
            { text: 'Se puede justificar, aunque toma tiempo validarla', score: 2 },
            { text: 'Se valida de inmediato con soporte claro y confiable', score: 3 }
        ]
    },
    {
        section: 'Exposición al Riesgo',
        question: 'En el último año, ¿cuántas veces detectaron errores relevantes en cifras después de haberlas reportado o usado para decidir?',
        options: [
            { text: 'Más de 3 veces', score: 0 },
            { text: 'Entre 2 y 3 veces', score: 1 },
            { text: '1 vez', score: 2 },
            { text: 'Ninguna', score: 3 }
        ]
    },

    // ── BLOQUE 2: IMPACTO FINANCIERO ──────────────────────────────────────────
    {
        section: 'Impacto Financiero',
        question: '¿Qué tan seguro estás de que el margen que reportas refleja realmente el negocio, incluyendo descuentos, devoluciones, ajustes y costos asociados?',
        options: [
            { text: 'Tengo dudas frecuentes sobre ese dato', score: 0 },
            { text: 'Es parcialmente confiable, pero requiere revisión', score: 1 },
            { text: 'Es mayormente confiable, con pocos ajustes posteriores', score: 2 },
            { text: 'Es totalmente confiable y consistente', score: 3 }
        ]
    },
    {
        section: 'Impacto Financiero',
        question: '¿Las diferencias entre ventas, contabilidad, cartera, inventario u otras áreas han afectado decisiones financieras o comerciales relevantes?',
        options: [
            { text: 'Sí, con impacto significativo', score: 0 },
            { text: 'Sí, con impacto moderado', score: 1 },
            { text: 'Han afectado mínimamente', score: 2 },
            { text: 'No han afectado decisiones relevantes', score: 3 }
        ]
    },
    {
        section: 'Impacto Financiero',
        question: '¿Qué tan claro tienes el impacto económico real de devoluciones, descuentos, quiebres operativos, ajustes o reprocesos?',
        options: [
            { text: 'No lo tenemos claro ni medido', score: 0 },
            { text: 'Lo entendemos parcialmente', score: 1 },
            { text: 'Lo medimos en gran parte', score: 2 },
            { text: 'Lo medimos con claridad y de forma consistente', score: 3 }
        ]
    },
    {
        section: 'Impacto Financiero',
        question: 'Si hoy tuvieras que decidir dónde invertir, qué línea potenciar o qué canal corregir, ¿qué tan confiable sería tu rentabilidad por producto, canal o cliente?',
        options: [
            { text: 'No sería confiable para decidir', score: 0 },
            { text: 'Requeriría validaciones importantes', score: 1 },
            { text: 'Es razonablemente confiable', score: 2 },
            { text: 'Es totalmente confiable para decisiones estratégicas', score: 3 }
        ]
    },

    // ── BLOQUE 3: FRICCIÓN OPERATIVA ──────────────────────────────────────────
    {
        section: 'Fricción Operativa',
        question: '¿Cuánto tiempo dedica tu equipo al mes a consolidar, limpiar, cruzar o validar cifras antes de poder usarlas en reportes o decisiones?',
        options: [
            { text: 'Más de 3 días acumulados al mes', score: 0 },
            { text: 'Entre 1 y 3 días al mes', score: 1 },
            { text: 'Menos de 1 día al mes', score: 2 },
            { text: 'Está casi todo automatizado', score: 3 }
        ]
    },
    {
        section: 'Fricción Operativa',
        question: 'Cuando dirección necesita una cifra crítica para decidir el mismo día, ¿qué suele pasar?',
        options: [
            { text: 'Hay que construirla manualmente y se retrasa', score: 0 },
            { text: 'Hay que revisar varias fuentes antes de confiar', score: 1 },
            { text: 'Se consigue con algo de esfuerzo dentro del día', score: 2 },
            { text: 'Está disponible de inmediato y lista para usar', score: 3 }
        ]
    },
    {
        section: 'Fricción Operativa',
        question: '¿Qué tan integrados están hoy los sistemas o fuentes que alimentan tus reportes críticos?',
        options: [
            { text: 'Están muy fragmentados y dependen de cruces manuales', score: 0 },
            { text: 'Tienen integración parcial, con bastante intervención manual', score: 1 },
            { text: 'Están mayormente integrados', score: 2 },
            { text: 'Están integrados de forma estructurada y confiable', score: 3 }
        ]
    },
    {
        section: 'Fricción Operativa',
        question: 'En reuniones de seguimiento o comités, ¿cuánto tiempo se dedica a discutir cifras en vez de discutir decisiones?',
        options: [
            { text: 'La mayoría del tiempo', score: 0 },
            { text: 'Un tiempo considerable', score: 1 },
            { text: 'Poco tiempo', score: 2 },
            { text: 'Casi nada; las cifras ya llegan claras', score: 3 }
        ]
    },

    // ── BLOQUE 4: DEPENDENCIA DE PERSONAS ────────────────────────────────────
    {
        section: 'Dependencia de Personas',
        question: 'Si la persona que hoy entiende o consolida tus cifras clave deja la empresa, ¿qué pasaría con la operación de reportes y control?',
        options: [
            { text: 'Sería muy caótico; la operación quedaría seriamente comprometida', score: 0 },
            { text: 'Habría desorden importante y alto riesgo de errores', score: 1 },
            { text: 'Generaría dificultad, pero podría reorganizarse', score: 2 },
            { text: 'El proceso está estructurado y no depende de una sola persona', score: 3 }
        ]
    },
    {
        section: 'Dependencia de Personas',
        question: '¿Qué tan documentados están los procesos, reglas de negocio y pasos necesarios para generar tus reportes críticos?',
        options: [
            { text: 'No están documentados', score: 0 },
            { text: 'Hay documentación parcial o informal', score: 1 },
            { text: 'Hay documentación funcional, aunque incompleta', score: 2 },
            { text: 'Está todo documentado de forma clara y estructurada', score: 3 }
        ]
    },
    {
        section: 'Dependencia de Personas',
        question: '¿Qué tan estructurado está el control de calidad antes de que una cifra llegue a dirección o se use para decidir?',
        options: [
            { text: 'No existe un control formal', score: 0 },
            { text: 'Se valida informalmente según la urgencia', score: 1 },
            { text: 'Existen controles definidos en varios casos', score: 2 },
            { text: 'Existe un control estructurado y responsable asignado', score: 3 }
        ]
    },
    {
        section: 'Dependencia de Personas',
        question: '¿Qué tan distribuido está el conocimiento de tus datos, reportes y reglas críticas dentro de la organización?',
        options: [
            { text: 'Está concentrado en muy pocas personas', score: 0 },
            { text: 'Está bastante concentrado', score: 1 },
            { text: 'Está parcialmente distribuido', score: 2 },
            { text: 'Está distribuido y respaldado estructuralmente', score: 3 }
        ]
    }

];

// Compatibilidad navegador / Node
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QUESTIONS;
}
