/**
 * DIAGNOSTIC-LOGIC.JS — NOEMA ICO v3.0  (Motor Premium)
 *
 * Frente 1: Motor de lectura ejecutiva — veredicto, riesgo dominante, exposición, prioridad 30d
 * Frente 2: Scoring ponderado — pesos por criticidad + reglas compuestas
 * Frente 3: Render premium — 5 bloques ejecutivos
 * Frente 4: Campo tamano_empresa en formulario y payload
 *
 * ✅ Google Sheets: columnas legacy intactas
 * ✅ 16 preguntas, 4 dimensiones
 * ✅ Tracking de abandono y form-view intactos
 */

'use strict';

/* ══════════════════════════════════════════
   PESOS POR PREGUNTA (Q1-Q16, índice 0-15)
══════════════════════════════════════════ */
const QUESTION_WEIGHTS = [
    1.35, // Q1  trazabilidad de cifras              ALTO
    1.00, // Q2  alineación de KPIs                  MEDIO
    1.20, // Q3  defendibilidad ante auditoría        MEDIO-ALTO
    1.30, // Q4  errores detectados post-reporte      ALTO
    1.30, // Q5  confiabilidad del margen             ALTO
    1.20, // Q6  impacto diferencias interáreas       MEDIO-ALTO
    1.00, // Q7  impacto económico de reprocesos      MEDIO
    1.30, // Q8  rentabilidad para decidir            ALTO
    1.15, // Q9  esfuerzo mensual de conciliación     MEDIO-ALTO
    1.20, // Q10 urgencia cuando dirección pide cifra MEDIO-ALTO
    1.00, // Q11 integración de fuentes               MEDIO
    1.10, // Q12 tiempo discutiendo cifras            MEDIO
    1.35, // Q13 dependencia crítica de personas      ALTO
    1.00, // Q14 documentación de procesos            MEDIO
    1.15, // Q15 control de calidad antes de dir.     MEDIO-ALTO
    1.00  // Q16 distribución del conocimiento        MEDIO
];

/* ══════════════════════════════════════════
   Sectores
══════════════════════════════════════════ */

const SECTORS = [
  { value: "retail", label: "Retail / Comercio" },
  { value: "manufactura", label: "Manufactura" },
  { value: "logistica", label: "Logística / Distribución" },
  { value: "alimentos", label: "Alimentos y Bebidas" },
  { value: "hoteleria", label: "Hotelería y Turismo" },
  { value: "salud", label: "Salud / Clínicas" },
  { value: "construccion", label: "Construcción / Inmobiliario" },
  { value: "servicios", label: "Servicios B2B" },
  { value: "tecnologia", label: "Tecnología / Software" },
  { value: "educacion", label: "Educación" },
  { value: "otro", label: "Otro" }
];

/* ══════════════════════════════════════════
   REGLAS COMPUESTAS
   threshold = promedio que activa el riesgo
══════════════════════════════════════════ */
const COMPOSITE_RULES = [
    { key: 'systemic_fragility',      label: 'Fragilidad sistémica',             questions: [0, 3, 12],     threshold: 1.15 },
    { key: 'financial_decision_risk', label: 'Riesgo de decisión financiera',    questions: [4, 5, 7],      threshold: 1.35 },
    { key: 'operational_friction',    label: 'Fricción operativa estructural',   questions: [8, 9, 10, 11], threshold: 1.40 },
    { key: 'governance_gap',          label: 'Brecha de gobernanza operativa',   questions: [1, 2, 13, 15], threshold: 1.45 }
];

/* ══════════════════════════════════════════
   APP
══════════════════════════════════════════ */
const DiagnosticApp = (function () {
    'use strict';

    const state = { cur: 0, answers: [], reached: 0, submitted: false, abandoned: false, formTimer: null, results: null };

    function $(id) { return document.getElementById(id); }

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const el = $(id);
        if (el) { el.classList.add('active'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    }

    /* ── PROGRESS ─────────────────────────────────────────── */
    function renderDashes() {
        const c = $('progressDashes'); if (!c) return; c.innerHTML = '';
        QUESTIONS.forEach((_, i) => { const d = document.createElement('div'); d.className = 'dash' + (i < state.cur ? ' done' : '') + (i === state.cur ? ' current' : ''); c.appendChild(d); });
    }

    /* ── PREGUNTAS ────────────────────────────────────────── */
    function renderQuestion() {
        const q = QUESTIONS[state.cur];
        $('qCounter') && ($('qCounter').textContent = 'Pregunta ' + (state.cur + 1) + ' de ' + QUESTIONS.length);
        $('qSection') && ($('qSection').textContent = q.section);
        $('qNum')     && ($('qNum').textContent     = String(state.cur + 1).padStart(2, '0'));
        $('qText')    && ($('qText').textContent    = q.question);
        renderDashes(); renderOptions(q.options); updateNavButtons();
        const card = $('qCard');
        if (card) { card.style.animation = 'none'; void card.offsetHeight; card.style.animation = 'fadeSlideIn 0.28s ease forwards'; }
    }

    function renderOptions(options) {
        const list = $('optsList'); if (!list) return; list.innerHTML = '';
        options.forEach((opt, i) => {
            const btn = document.createElement('button'); btn.type = 'button';
            btn.className = 'opt' + (state.answers[state.cur]?.index === i ? ' selected' : '');
            btn.innerHTML = '<div class="opt-radio"><div class="opt-radio-dot"></div></div><span class="opt-label">' + opt.text + '</span>';
            btn.addEventListener('click', () => selectOption(i, opt));
            list.appendChild(btn);
        });
    }

    function selectOption(index, opt) {
        state.answers[state.cur] = { index, text: opt.text, score: opt.score, section: QUESTIONS[state.cur].section };
        if (state.cur >= state.reached) state.reached = state.cur + 1;
        document.querySelectorAll('.opt').forEach((b, i) => b.classList.toggle('selected', i === index));
        $('btnNext') && ($('btnNext').disabled = false);
    }

    /* ── NAVEGACIÓN ───────────────────────────────────────── */
    function updateNavButtons() {
        const prev = $('btnPrev'), next = $('btnNext');
        if (prev) prev.style.display = state.cur > 0 ? 'inline-flex' : 'none';
        if (next) { next.disabled = !state.answers[state.cur]; next.textContent = state.cur === QUESTIONS.length - 1 ? 'Ver mi ICO →' : 'Siguiente →'; }
    }
    function prevQ() { if (state.cur > 0) { state.cur--; renderQuestion(); } }
    function nextQ() { if (!state.answers[state.cur]) return; if (state.cur < QUESTIONS.length - 1) { state.cur++; renderQuestion(); } else showCalculating(); }

    /* ── CALCULANDO ───────────────────────────────────────── */
    function showCalculating() {
        showScreen('screen-calculating');
        const fill = $('calcFill'), label = $('calcLabel');
        const msgs = ['Analizando respuestas...', 'Aplicando pesos por criticidad...', 'Construyendo tu Índice ICO...', 'Preparando lectura ejecutiva...'];
        let pct = 0, mi = 0;
        const t = setInterval(() => {
            pct += 2; if (fill) fill.style.width = pct + '%';
            if (pct % 25 === 0 && mi < msgs.length - 1) { mi++; if (label) { label.style.opacity = '0'; setTimeout(() => { label.textContent = msgs[mi]; label.style.opacity = '1'; }, 150); } }
            if (pct >= 100) { clearInterval(t); setTimeout(showResults, 350); }
        }, 44);
    }

    /* ══════════════════════════════════════════════════════
       MOTOR PREMIUM — FRENTES 1 + 2
    ══════════════════════════════════════════════════════ */
    function avgScore(answers, idxs) { const v = idxs.map(i => answers[i]?.score ?? 0); return v.reduce((a, b) => a + b, 0) / v.length; }

    function evaluateCompositeRules(answers) {
        return COMPOSITE_RULES.map(r => ({ ...r, avg: Number(avgScore(answers, r.questions).toFixed(2)), triggered: avgScore(answers, r.questions) <= r.threshold }))
            .filter(r => r.triggered).sort((a, b) => a.avg - b.avg);
    }

    function getDominantRisk(alerts, weakest) { return alerts.length ? alerts[0] : { key: 'dimension_risk', label: weakest.name, avg: 0 }; }

    function buildVerdict(ico, risk, weakest) {
        if (ico >= 76) return 'Tu operación muestra una base confiable, pero todavía puede romperse bajo presión si no fortaleces los puntos débiles detectados.';
        if (risk.key === 'systemic_fragility')      return 'La empresa puede operar, pero hoy depende demasiado de trazabilidad frágil, errores posteriores y conocimiento concentrado.';
        if (risk.key === 'financial_decision_risk') return 'El mayor riesgo no está en producir reportes, sino en decidir con rentabilidad y cifras financieras que no siempre son defendibles.';
        if (risk.key === 'operational_friction')    return 'La fricción manual está consumiendo tiempo directivo y operativo que debería estar dedicado a decidir, no a reconciliar cifras.';
        if (risk.key === 'governance_gap')          return 'Las definiciones críticas y controles no están suficientemente formalizados, lo que genera interpretaciones distintas en cada área.';
        return 'Tu principal exposición está en ' + weakest.name.toLowerCase() + ', y eso limita la confiabilidad real de la operación.';
    }

    function buildExposure(risk, weakest, ico) {
        if (risk.key === 'systemic_fragility')      return 'La cifra existe, pero no siempre se puede rastrear, defender o sostener sin depender de personas clave.';
        if (risk.key === 'financial_decision_risk') return 'La empresa puede ver números, pero no siempre convertirlos en decisiones financieras confiables.';
        if (risk.key === 'operational_friction')    return 'La información llega, pero con demasiado trabajo manual y demasiado tarde para algunas decisiones.';
        if (risk.key === 'governance_gap')          return 'La empresa reporta, pero los criterios detrás de cada cifra varían según quién la construyó.';
        if (ico < 45) return 'Hoy la operación está más cerca de reaccionar que de controlar.';
        return 'La exposición dominante se concentra en ' + weakest.name.toLowerCase() + '.';
    }

    function buildPriority(risk, weakest) {
        const map = {
            systemic_fragility:      'Asegurar trazabilidad, controlar errores posteriores y reducir dependencia en personas clave antes de seguir escalando.',
            financial_decision_risk: 'Validar margen, rentabilidad y coherencia entre áreas antes de seguir tomando decisiones de inversión o corrección.',
            operational_friction:    'Reducir conciliación manual, acelerar disponibilidad de cifras y ordenar integración de fuentes críticas.',
            governance_gap:          'Alinear definiciones, responsables de datos y controles formales antes de llevar estas cifras a dirección.'
        };
        return map[risk.key] || 'Intervenir primero la dimensión ' + weakest.name + ' con acciones de control, claridad y continuidad operativa.';
    }

    function buildStrengths(secArr) {
        const best = secArr.filter(s => s.pct >= 60).sort((a, b) => b.pct - a.pct).slice(0, 2);
        if (!best.length) return ['El diagnóstico no detecta aún una fortaleza estructural clara — el valor está en saber exactamente dónde no seguir improvisando.'];
        const map = {
            'Impacto Financiero':      'Existe una base razonable para conectar operación con impacto económico y leer el negocio en términos financieros.',
            'Fricción Operativa':      'La operación ya tiene señales de capacidad para mover cifras con menor desgaste que otras empresas en etapa similar.',
            'Dependencia de Personas': 'Hay una base de continuidad mejor estructurada que en organizaciones donde el conocimiento está completamente concentrado.',
            'Exposición al Riesgo':    'La trazabilidad y consistencia de las cifras críticas tiene una base que puede fortalecerse sin reconstruir todo desde cero.'
        };
        return best.map(s => map[s.name] || s.name + ' muestra un desempeño relativo sólido frente a las otras dimensiones evaluadas.');
    }

    function buildFindings(answers, alerts) {
        const low = answers.filter(a => (a?.score ?? 0) <= 1).map(a => a.qIndex);
        const f = [];
        if (low.includes(0))  f.push('La trazabilidad de cifras críticas aún depende de esfuerzo manual o conocimiento disperso — cualquier salida afecta la operación.');
        if (low.includes(3))  f.push('Ya han ocurrido errores detectados después de reportar o decidir, lo que genera riesgo reputacional y operativo acumulado.');
        if (low.includes(7))  f.push('La rentabilidad por producto, canal o cliente todavía no parece suficientemente confiable para sostener decisiones estratégicas.');
        if (low.includes(12)) f.push('La continuidad del control puede verse comprometida si una persona clave deja la operación — el riesgo es mayor de lo que parece.');
        if (low.includes(4))  f.push('El margen reportado puede no reflejar completamente la realidad — descuentos, devoluciones o ajustes podrían estar distorsionando la lectura.');
        alerts.forEach(a => { if (a.key === 'operational_friction') f.push('La conciliación y validación siguen consumiendo tiempo que debería estar disponible para gestión y dirección.'); });
        return [...new Set(f)].slice(0, 3);
    }

    function buildWins(answers) {
        const wins = []; const map = { 1: 'Formalizar definiciones críticas de KPIs entre áreas — una reunión de 2 horas puede resolver meses de discusión.', 9: 'Reducir el tiempo de respuesta cuando dirección pide una cifra crítica el mismo día.', 10: 'Priorizar integración básica de las 2 fuentes más críticas antes de seguir sumando reportes.', 13: 'Completar documentación mínima de procesos y reglas de negocio para las cifras más sensibles.', 14: 'Formalizar un control de calidad básico antes de que la cifra llegue a dirección.' };
        answers.forEach(a => { if ((a?.score ?? 0) === 1 && map[a.qIndex]) wins.push(map[a.qIndex]); });
        if (!wins.length) wins.push('No hay quick wins obvios en este perfil — la intervención correcta es por prioridad sistémica, no por comodidad.');
        return [...new Set(wins)].slice(0, 3);
    }

    /* ── CÁLCULO PRINCIPAL ────────────────────────────────── */
    function calculateResults() {
        const answers = state.answers.map((a, i) => a ? { ...a, qIndex: i } : { score: 0, qIndex: i, text: '', section: QUESTIONS[i].section });

        const wTotal = answers.reduce((s, a, i) => s + (a.score ?? 0) * (QUESTION_WEIGHTS[i] || 1), 0);
        const wMax   = QUESTIONS.reduce((s, _, i) => s + 3 * (QUESTION_WEIGHTS[i] || 1), 0);
        const raw    = answers.reduce((s, a) => s + (a.score ?? 0), 0);
        const ico    = Math.round((wTotal / wMax) * 100);
        const level  = CONFIG.ICO_LEVELS.find(l => ico >= l.min && ico <= l.max) || CONFIG.ICO_LEVELS[0];

        const secMap = {};
        answers.forEach((a, i) => {
            const k = QUESTIONS[i].section, w = QUESTION_WEIGHTS[i] || 1;
            if (!secMap[k]) secMap[k] = { name: k, wT: 0, wM: 0, rT: 0, rM: 0 };
            secMap[k].wT += (a.score ?? 0) * w; secMap[k].wM += 3 * w;
            secMap[k].rT += (a.score ?? 0);     secMap[k].rM += 3;
        });
        const secArr = Object.values(secMap).map(s => ({ ...s, pct: Math.round((s.wT / s.wM) * 100) }));

        const strongest = secArr.reduce((a, b) => a.pct > b.pct ? a : b);
        const weakest   = secArr.reduce((a, b) => a.pct < b.pct ? a : b);

        const alerts   = evaluateCompositeRules(answers);
        const risk     = getDominantRisk(alerts, weakest);
        const verdict  = buildVerdict(ico, risk, weakest);
        const exposure = buildExposure(risk, weakest, ico);
        const priority = buildPriority(risk, weakest);
        const strengths = buildStrengths(secArr);
        const findings  = buildFindings(answers, alerts);
        const wins      = buildWins(answers);

        const gSec = name => { const f = secArr.find(s => s.name === name); return f ? (f.wT / f.wM).toFixed(2) : '0.00'; };

        return {
            ico, raw, wTotal: +wTotal.toFixed(2), wMax: +wMax.toFixed(2),
            level, secArr, strongest, weakest,
            dominantRisk: risk, executiveVerdict: verdict, mainExposure: exposure, priority30d: priority,
            strengths, criticalFindings: findings, tacticalWins: wins,
            compositeAlerts: alerts,
            criticalCount: answers.filter(a => (a.score ?? 0) <= 1).length,
            quickWinCount: answers.filter(a => (a.score ?? 0) === 1).length,
            // Legacy Sheets
            indiceMad:   (raw / 4).toFixed(2),
            nivel:       level.name,
            gobierno:    gSec('Exposición al Riesgo'),
            integracion: gSec('Impacto Financiero'),
            calidad:     gSec('Fricción Operativa'),
            metricas:    gSec('Dependencia de Personas'),
            adopcion:    ''
        };
    }

    /* ══════════════════════════════════════════════════════
       RENDER PREMIUM — FRENTE 3
    ══════════════════════════════════════════════════════ */
    function showResults() {
        const r = calculateResults(); state.results = r; window.diagnosticoResults = r;
        console.log('📊 ICO v3:', r.ico, '|', r.level.name, '| Riesgo:', r.dominantRisk.label);
        document.documentElement.style.setProperty('--level-color', r.level.color);
        document.documentElement.style.setProperty('--level-bg',    r.level.bg);
        showScreen('screen-results'); renderResultsAndForm(r); startFormViewTimer();
    }

    function barColor(p) { return p >= 76 ? '#10b981' : p >= 56 ? '#eab308' : p >= 31 ? '#f97316' : '#ef4444'; }

    function renderResultsAndForm(r) {
        const c = $('resultsInner');
        if (!c) { console.error('❌ resultsInner no encontrado'); return; }

        c.innerHTML =
            '<div class="score-card" style="--level-color:' + r.level.color + ';--level-bg:' + r.level.bg + '">' +
                '<div class="score-num-col"><div class="score-unit-label">ICO</div><span class="score-big" id="scoreNum">0</span><div class="score-of">de 100</div></div>' +
                '<div class="score-info"><div class="score-level-pill" style="color:' + r.level.color + ';border-color:' + r.level.color + ';background:' + r.level.bg + '">' + r.level.name + '</div><div class="score-title">' + r.level.title + '</div><div class="score-desc">' + r.level.desc + '</div></div>' +
            '</div>' +

            '<div class="executive-card">' +
                '<div class="card-label">Veredicto Ejecutivo</div>' +
                '<p class="exec-verdict">' + r.executiveVerdict + '</p>' +
                '<p class="exec-exposure">' + r.mainExposure + '</p>' +
            '</div>' +

            '<div class="risk-highlight">' +
                '<div class="rh-label">Riesgo dominante</div>' +
                '<div class="rh-value">' + r.dominantRisk.label + '</div>' +
                '<div class="rh-sub">Principal fuente de exposición operativa detectada</div>' +
            '</div>' +

            '<div class="results-divider"><div class="results-divider-line"></div><div class="results-divider-text">Tu informe ejecutivo incluye el análisis completo</div><div class="results-divider-line"></div></div>' +

            '<div class="inline-form-wrapper">' +
                '<div class="inline-form-header">' +
                    '<div class="inline-form-eyebrow">Informe Ejecutivo ICO</div>' +
                    '<h2 class="inline-form-h2">¿A quién enviamos tu análisis?</h2>' +
                    '<p class="inline-form-sub">Tu score ya está calculado. El informe detalla las dimensiones afectadas, los hallazgos críticos, las fortalezas detectadas y las acciones inmediatas priorizadas.</p>' +
                '</div>' +
                '<div class="inline-form-deliverables">' +
                    '<div class="ifd-item"><span class="ifd-check">✓</span><div><strong>Informe PDF ejecutivo</strong><span>Score ICO, riesgos dominantes y hallazgos priorizados</span></div></div>' +
                    '<div class="ifd-item"><span class="ifd-check">✓</span><div><strong>Diagnóstico por dimensión</strong><span>Análisis detallado de las 4 dimensiones operativas</span></div></div>' +
                    '<div class="ifd-item"><span class="ifd-check">✓</span><div><strong>Plan de acción inmediato</strong><span>Acciones concretas ordenadas por impacto y urgencia</span></div></div>' +
                    '<div class="ifd-item"><span class="ifd-check">✓</span><div><strong>Sesión de revisión 1:1</strong><span>30 minutos con NOEMA para revisar el caso en profundidad</span></div></div>' +
                '</div>' +
                '<form id="inlineForm" novalidate>' +
                    '<div class="f-group"><label class="f-label">Nombre completo <span class="req">*</span></label><input type="text" name="nombre" class="f-input" placeholder="Tu nombre" required></div>' +
                    '<div class="f-group"><label class="f-label">Cargo <span class="req">*</span></label><input type="text" name="cargo" class="f-input" placeholder="CEO, Gerente General, Director de Ops..." required></div>' +
                    '<div class="f-group"><label class="f-label">Email corporativo <span class="req">*</span></label><input type="email" name="email" id="inlineEmailInput" class="f-input" placeholder="nombre@tuempresa.com" required><div class="f-error" id="inlineEmailError">Usa tu email corporativo (no Gmail, Hotmail ni similares)</div></div>' +
                    '<div class="f-group"><label class="f-label">WhatsApp <span class="req">*</span></label><input type="tel" name="whatsapp" class="f-input" placeholder="+57 300 000 0000" required></div>' +
                    '<div class="f-group"><label class="f-label">Empresa <span class="req">*</span></label><input type="text" name="empresa" class="f-input" placeholder="Nombre de tu empresa" required></div>' +
                    '<div class="f-group"><label class="f-label">Sector <span class="req">*</span></label><select name="sector" class="f-select" required>' +
                    '<option value="">Selecciona tu sector...</option>' +
                    SECTORS.map(s => '<option value="' + s.value + '">' + s.label + '</option>').join('') +
                    '</select></div>' +
                    '<div class="f-group"><label class="f-label">Tamaño de empresa <span class="req">*</span></label><select name="tamano_empresa" class="f-select" required><option value="">Selecciona un rango...</option><option value="1_10">1 a 10 empleados</option><option value="11_50">11 a 50 empleados</option><option value="51_200">51 a 200 empleados</option><option value="201_500">201 a 500 empleados</option><option value="500_plus">Más de 500 empleados</option></select></div>' +
                    '<div class="privacy-row"><input type="checkbox" id="inlinePrivacyCheck" required><label for="inlinePrivacyCheck" class="privacy-txt">Autorizo el tratamiento de mis datos personales según la <a href="/politica-datos.html" target="_blank">Política de Tratamiento de Datos</a> de NOEMA Framework BI.</label></div>' +
                    '<div class="inline-urgency">Tu informe estará en tu bandeja en los próximos minutos.</div>' +
                    '<button type="button" id="inlineBtnSubmit" class="btn-submit">Recibir mi Informe Ejecutivo ICO →</button>' +
                    '<div class="form-trust-row"><span>🔒 Datos confidenciales</span><span>·</span><span>PDF en minutos</span><span>·</span><span>Sesión 1:1 incluida</span></div>' +
                '</form>' +
            '</div>';

        const btn = $('inlineBtnSubmit');
        if (btn) btn.addEventListener('click', handleInlineSubmit);
        animateCounter(r.ico);
    }

    function animateCounter(target) {
        const el = $('scoreNum'); if (!el) return;
        let n = 0; const step = Math.max(target / 55, 1);
        const t = setInterval(() => { n = Math.min(n + step, target); el.textContent = Math.round(n); if (n >= target) clearInterval(t); }, 22);
    }

    /* ══════════════════════════════════════════════════════
       FORMULARIO — FRENTE 4
    ══════════════════════════════════════════════════════ */
    function handleInlineSubmit() {
        const pc = $('inlinePrivacyCheck'); if (!pc?.checked) { alert('Debes aceptar la Política de Tratamiento de Datos para continuar.'); return; }
        const emailEl = $('inlineEmailInput'), errEl = $('inlineEmailError');

        const emailValue = (emailEl?.value || '').trim();

        // 1. Validar formato completo de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(emailValue)) {
            emailEl.classList.add('err');
            if (errEl) {
                errEl.textContent = 'Ingresa un email corporativo válido';
                errEl.classList.add('show');
            }
            emailEl.focus();
            return;
        }

        // 2. Validar dominio (después del @)
        const domain = (emailValue.split('@')[1] || '').toLowerCase();

        // 3. Validar que tenga punto (ej: empresa.com)
        if (!domain.includes('.')) {
            emailEl.classList.add('err');
            if (errEl) {
                errEl.textContent = 'Ingresa un dominio corporativo válido (ej: empresa.com)';
                errEl.classList.add('show');
            }
            emailEl.focus();
            return;
        }

        // 4. Bloquear dominios públicos (gmail, etc.)
        if (CONFIG.VALIDATION.PUBLIC_EMAIL_DOMAINS.includes(domain)) {
            emailEl.classList.add('err');
            if (errEl) {
                errEl.textContent = 'Usa tu email corporativo (no Gmail, Hotmail ni similares)';
                errEl.classList.add('show');
            }
            emailEl.focus();
            return;
        }

        // limpiar error si todo está bien
        emailEl.classList.remove('err');
        if (errEl) errEl.classList.remove('show');

        
        const form = $('inlineForm');
        const vals = ['nombre','cargo','whatsapp','empresa','sector','tamano_empresa'].map(n => form.querySelector('[name="' + n + '"]')?.value.trim());
        if (vals.some(v => !v) || !emailEl?.value.trim()) { alert('Por favor completa todos los campos requeridos.'); return; }

        state.submitted = true; window.formSubmitted = true; stopFormViewTimer();
        const btn = $('inlineBtnSubmit'); if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }
        const payload = buildPayload(new FormData(form));
        console.log('📤 Enviando payload ICO v3:', payload);
        submitToSheets(payload, btn);
    }

    function buildPayload(fd) {
        const utm = UTMTracker.get(), r = state.results || {};
        const base = {
            event: 'ico_submitted',
            nombre:         String(fd.get('nombre')         || '').trim(),
            cargo:          String(fd.get('cargo')          || '').trim(),
            email:          String(fd.get('email')          || '').trim(),
            whatsapp:       String(fd.get('whatsapp')       || '').trim(),
            empresa:        String(fd.get('empresa')        || '').trim(),
            sector:         String(fd.get('sector')         || '').trim(),
            tamano_empresa: String(fd.get('tamano_empresa') || '').trim(),
            ico_score:      r.ico                  ?? '',
            ico_nivel:      r.nivel                ?? '',
            ico_riesgo:     r.dominantRisk?.label  ?? '',
            ico_veredicto:  r.executiveVerdict      ?? '',
            ico_prioridad:  r.priority30d           ?? '',
            // Legacy Sheets
            indiceMad:      r.indiceMad   ?? '',
            nivel:          r.nivel       ?? '',
            gobierno:       r.gobierno    ?? '',
            integracion:    r.integracion ?? '',
            calidad:        r.calidad     ?? '',
            metricas:       r.metricas    ?? '',
            adopcion:       r.adopcion    ?? '',
            utm_source:     utm.utm_source    || 'direct',
            utm_medium:     utm.utm_medium    || 'organic',
            utm_campaign:   utm.utm_campaign  || '',
            utm_term:       utm.utm_term      || '',
            utm_content:    utm.utm_content   || '',
            utm_id:         utm.utm_id        || '',
            angle:          'ico-diagnostico',
            landing_path:   utm.landing_path  || window.location.pathname,
            landing_url:    utm.landing_url   || window.location.href,
            page_referrer:  document.referrer || '',
            submitted_at:   new Date().toISOString()
        };
        QUESTIONS.forEach((q, i) => {
            const a = state.answers[i] || {}, n = String(i + 1).padStart(2, '0');
            base['q' + n + '_section']  = q.section;
            base['q' + n + '_question'] = q.question;
            base['q' + n + '_answer']   = a.text  ?? '';
            base['q' + n + '_score']    = a.score !== undefined ? a.score : '';
        });
        return base;
    }

    function submitToSheets(payload, btn) {
        fetch(CONFIG.API.GOOGLE_APPS_SCRIPT, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) })
        .then(r => r.text())
        .then(() => { console.log('✅ Enviado'); trackConversion(); showScreen('screen-thanks'); })
        .catch(err => { console.error('❌ Error:', err); alert('Hubo un problema al enviar. Por favor intenta nuevamente.'); if (btn) { btn.disabled = false; btn.textContent = 'Enviar mi Informe Ejecutivo ICO →'; } });
    }

    /* ── TRACKING ─────────────────────────────────────────── */
    function trackPageView()   { try { if (typeof gtag === 'function') gtag('event', 'page_view', { page_path: window.location.pathname }); } catch {} try { if (typeof fbq === 'function') fbq('track', 'PageView'); } catch {} }
    function trackConversion() { try { if (typeof fbq  === 'function') fbq('track', 'Lead'); } catch {} try { if (typeof gtag === 'function') gtag('event', 'generate_lead'); } catch {} }

    function sendAbandon() {
        if (state.abandoned || state.submitted || state.reached === 0 || state.reached >= QUESTIONS.length) return;
        state.abandoned = true; const utm = UTMTracker.get();
        try { fetch(CONFIG.API.GOOGLE_APPS_SCRIPT, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, keepalive: true, body: JSON.stringify({ event: 'ico_abandoned', question_reached: state.reached, total_questions: QUESTIONS.length, utm_source: utm.utm_source || 'direct', utm_medium: utm.utm_medium || 'organic', utm_campaign: utm.utm_campaign || '', angle: 'ico-diagnostico', ts: new Date().toISOString() }) }).catch(() => {}); } catch {}
    }

    function startFormViewTimer() {
        if (state.formTimer || state.submitted) return;
        state.formTimer = setTimeout(() => {
            if (state.submitted) return; const utm = UTMTracker.get();
            fetch(CONFIG.API.GOOGLE_APPS_SCRIPT, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ event: 'ico_form_viewed_not_submitted', ico_score: state.results?.ico || '', utm_source: utm.utm_source || 'direct', utm_medium: utm.utm_medium || 'organic', utm_campaign: utm.utm_campaign || '', ts: new Date().toISOString() }) }).catch(() => {});
        }, CONFIG.TIMING.FORM_VIEW_TIMEOUT);
    }

    function stopFormViewTimer() { if (state.formTimer) { clearTimeout(state.formTimer); state.formTimer = null; } }

    /* ── INIT ─────────────────────────────────────────────── */
    function init() {
        console.log('🚀 NOEMA ICO v3.0 — Motor Premium —', QUESTIONS.length, 'preguntas');
        $('btnStart')?.addEventListener('click', () => { showScreen('screen-questions'); renderQuestion(); });
        $('btnPrev') ?.addEventListener('click', prevQ);
        $('btnNext') ?.addEventListener('click', nextQ);
        window.addEventListener('beforeunload', sendAbandon);
        document.addEventListener('visibilitychange', () => { if (document.hidden) sendAbandon(); });
        trackPageView();
    }

    return { init, state, getResults: () => state.results };
})();

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => DiagnosticApp.init()); }
else { DiagnosticApp.init(); }
