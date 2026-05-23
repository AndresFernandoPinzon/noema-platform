/**
 * UTM TRACKER
 * Manejo de parámetros UTM y tracking de sesión
 */

const UTMTracker = (function() {
    'use strict';

    // Parámetros UTM válidos
    const VALID_UTM_KEYS = new Set([
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'utm_id',
        'utm_creative_format',
        'utm_marketing_tactic'
    ]);

    const STORAGE_KEY = 'noema_utm';

    /**
     * Lee los parámetros UTM del sessionStorage
     */
    function read() {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error('Error reading UTM params:', e);
            return {};
        }
    }

    /**
     * Guarda los parámetros UTM en sessionStorage
     */
    function store(utmData) {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utmData));
        } catch (e) {
            console.error('Error storing UTM params:', e);
        }
    }

    /**
     * Verifica si un valor es válido (no vacío)
     */
    function isValidValue(value) {
        return typeof value === 'string' && value.trim() !== '';
    }

    /**
     * Extrae parámetros UTM de la URL actual
     */
    function extractFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const incoming = {};

        for (const [key, value] of urlParams.entries()) {
            const normalizedKey = key.toLowerCase();
            if (VALID_UTM_KEYS.has(normalizedKey) && isValidValue(value)) {
                incoming[normalizedKey] = String(value).trim();
            }
        }

        return incoming;
    }

    /**
     * Detecta el "angle" basado en la ruta actual
     */
    function detectAngle() {
        const path = (window.location.pathname || '/').toLowerCase();
        
        if (path.startsWith('/automatizacion')) return 'automatizacion';
        if (path.startsWith('/mixto')) return 'mixto';
        if (path.startsWith('/diagnostico')) return 'diagnostico';
        
        return 'home';
    }

    /**
     * Detecta la fuente de tráfico desde el referrer
     */
    function detectTrafficSource() {
        try {
            const referrer = document.referrer || '';
            if (!referrer) return 'direct';
            
            const hostname = new URL(referrer).hostname.replace(/^www\./, '');
            return hostname;
        } catch (e) {
            return 'direct';
        }
    }

    /**
     * Inicializa y actualiza los parámetros UTM
     */
    function initialize() {
        const incoming = extractFromURL();
        const previous = read();
        
        // Combinar datos previos con nuevos (nuevos tienen prioridad)
        const merged = {
            ...previous,
            ...incoming,
            angle: detectAngle(),
            landing_path: window.location.pathname || '/',
            landing_url: window.location.href
        };

        // Si no hay utm_source, detectar de referrer
        if (!merged.utm_source) {
            merged.utm_source = detectTrafficSource();
        }

        // Default para utm_medium
        if (!merged.utm_medium) {
            merged.utm_medium = 'organic';
        }

        // Guardar en sessionStorage
        store(merged);

        // Limpiar URL de parámetros UTM (opcional)
        cleanURL();

        // Exponer globalmente
        window.__NOEMA_UTM__ = merged;

        return merged;
    }

    /**
     * Limpia la URL removiendo parámetros UTM
     */
    function cleanURL() {
        const urlParams = new URLSearchParams(window.location.search);
        let hasUTMParams = false;

        for (const key of urlParams.keys()) {
            if (VALID_UTM_KEYS.has(key.toLowerCase())) {
                hasUTMParams = true;
                break;
            }
        }

        if (hasUTMParams) {
            const cleanUrl = window.location.origin + 
                            window.location.pathname + 
                            (window.location.hash || '');
            
            window.history.replaceState({}, '', cleanUrl);
        }
    }

    /**
     * Agrega parámetros UTM a un href
     */
    function withUTM(href) {
        try {
            // No modificar estos tipos de enlaces
            const skipPatterns = /^(mailto:|tel:|https?:\/\/(?!noema\.lat)|https?:\/\/(?!www\.noema\.lat)|https?:\/\/wa\.me)/i;
            if (skipPatterns.test(href)) {
                return href;
            }

            const url = new URL(href, window.location.origin);
            const params = new URLSearchParams(url.search);
            const utmData = read();

            // Agregar todos los parámetros UTM relevantes
            for (const [key, value] of Object.entries(utmData)) {
                if (VALID_UTM_KEYS.has(key) || ['angle', 'landing_path', 'landing_url'].includes(key)) {
                    params.set(key, value);
                }
            }

            url.search = params.toString();
            return url.toString();
        } catch (e) {
            console.error('Error adding UTM to href:', e);
            return href;
        }
    }

    /**
     * Aplica parámetros UTM a todos los enlaces con data-utm
     */
    function applyToLinks() {
        document.querySelectorAll('a[data-utm]').forEach(link => {
            const originalHref = link.getAttribute('href');
            if (originalHref) {
                link.setAttribute('href', withUTM(originalHref));
            }
        });
    }

    /**
     * Obtiene los datos actuales de UTM
     */
    function get() {
        return window.__NOEMA_UTM__ || read();
    }

    // Inicializar automáticamente cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initialize();
            applyToLinks();
        });
    } else {
        initialize();
        applyToLinks();
    }

    // API pública
    return {
        initialize,
        get,
        withUTM,
        applyToLinks,
        read,
        store
    };
})();

// Export para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UTMTracker;
}
