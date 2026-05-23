/
├── index.html                          ✅ Home principal de NOEMA
├── nosotros.html                       ✅ Página institucional
├── politica-datos.html                 ✅ Política de tratamiento de datos
├── politica-cookies.html               ✅ Política de cookies
├── favicon.svg                         ✅ Favicon principal
├── favicon.png                         ✅ Favicon alternativo
├── _redirects                          ✅ Rutas limpias para Netlify
├── INDICE.md                           ✅ Índice/documentación del proyecto
├── GUIA_RAPIDA.md                      ✅ Guía rápida interna
├── README_ARQUITECTURA.md              ✅ Arquitectura general del sitio
│
└── productos/                          ✅ Contenedor principal de productos NOEMA
    │
    ├── bi/                             ✅ Línea de productos BI / datos
    │   │
    │   └── diagnostico-ico/            ✅ Producto: Diagnóstico ICO
    │       ├── index.html              ✅ Aplicación principal del diagnóstico
    ├───────────README.md               ✅ Documentación del producto
    │       │
    │       ├── scripts/                ✅ Scripts propios del diagnóstico
    │       │   ├── config.js           ✅ Configuración del diagnóstico
    │       │   ├── questions-data.js   ✅ Preguntas del diagnóstico
    │       │   ├── diagnostic-logic.js ✅ Lógica, cálculo y flujo
    │       │   └── utm-tracker.js      ✅ Captura y persistencia de UTMs
    │       │
    │       └── styles/                 ✅ Estilos propios del diagnóstico
    │           └── diagnostic.css      ✅ CSS visual del Diagnóstico ICO
    │
    └── chatbot/                        ✅ Línea de productos tipo chatbot / formularios inteligentes
        │
        └── perfilador/                 ✅ Producto: Perfilador de Clientes Inmobiliarios
            ├── index.html              ✅ Landing comercial del perfilador
            ├── app.html                ✅ Formulario/perfilador usado por clientes finales
            └── admin.html              ✅ Panel de configuración para brokers