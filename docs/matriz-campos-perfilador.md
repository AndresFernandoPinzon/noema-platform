# Matriz de campos del Perfilador Inmobiliario

Documento de inventario basado en el comportamiento actual del repositorio.
No propone cambios ni arquitectura futura; fija el contrato real para reducir el
riesgo antes de evolucionar el producto hacia SaaS.

Archivos fuente revisados:

- `productos/chatbot/perfilador/app.html`
- `productos/chatbot/perfilador/admin.html`
- `productos/chatbot/perfilador/dashboard.html`
- `docs/contratos-perfilador.md`

## Convenciones

| Columna | Significado |
| --- | --- |
| Campo | Nombre usado en payload, query string, config o dashboard |
| Nace en | Lugar donde se captura, calcula o recibe |
| Requerido | Si el flujo actual bloquea avance/envio cuando falta |
| Valores permitidos | Enums o formato observado |
| Se usa en | Lugar donde participa |
| Viaja a n8n | Si se envia o consulta contra n8n |
| Dashboard | Si `dashboard.html` lo consume |
| Admin | Si `admin.html` lo consume |
| Riesgo si cambia | Impacto probable si se renombra, elimina o cambia formato |
| Observaciones | Detalles operativos importantes |

## Campos de entrada por URL

| Campo | Nace en | Requerido | Valores permitidos | Se usa en | Viaja a n8n | Dashboard | Admin | Riesgo si cambia | Observaciones |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `broker` | Query string de `/perfilador/app` | No; default `default` | String | `app.html` para cargar config | Si, como `broker_id` en lead | No directo | Si en autologin admin si viene con `token` | Alto | Identifica el broker propietario del formulario |
| `broker_id` | Query string de dashboard | Si para dashboard | String | `dashboard.html` | Si, en GET `broker-leads` | Si | Si, internamente como `currentBrokerId` | Alto | En dashboard se usa junto con `token` |
| `token` | Query string dashboard/admin autologin | Si para dashboard/admin autologin | String | `dashboard.html`, `admin.html` | Si, en GET `broker-leads` y POST config como `token_admin` | Si | Si | Alto | Viaja en URL; sensible |
| `utm_source` | Query string del formulario, generado por admin o campañas | No | String; desde admin usa lista cerrada | `app.html`, dashboard via n8n | Si, en payload lead | Si | Si al generar links | Medio | No persiste si se pierde la URL |
| `utm_medium` | Query string del formulario | No | String; admin fuerza `organic` | `app.html`, dashboard via n8n | Si | Si | Si al generar links | Medio | Puede distorsionar pago/organico si siempre es `organic` |
| `utm_campaign` | Query string del formulario | No | String; default admin `general` | `app.html`, dashboard via n8n | Si | Si | Si al generar links | Medio | Admin reemplaza espacios por `_` |
| `propiedad` | Query string del formulario | No | String | `app.html` | Si | No observado | Si al generar links | Medio | Identifica inmueble/publicacion; dashboard no lo muestra hoy |

## Configuracion del broker

Campos leidos desde `broker-config` y/o guardados desde admin.

| Campo | Nace en | Requerido | Valores permitidos | Se usa en | Viaja a n8n | Dashboard | Admin | Riesgo si cambia | Observaciones |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `broker_id` | Input admin o query `broker` | Si para config real | String lowercase en admin | Config, lead, dashboard | Si | Si como query | Si | Alto | Llave principal del broker |
| `token_admin` | Input `token` en admin | Si para guardar | String | POST `broker-config` | Si | No | Si | Alto | No se usa en GET config observado |
| `activo` | Config broker / select admin | Si funcional | `TRUE`, `FALSE`, `true` | Activa o pausa formulario | Si en POST config | No | Si | Alto | `app.html` acepta boolean `true` o string `TRUE` |
| `nombre` | Config broker / input admin | No bloqueante | String | Header formulario, iniciales, intro | Si en POST config | No | Si | Medio | Default visual: `Tu Broker` |
| `inmobiliaria` | Config broker / input admin | No | String | Subtitulo del broker | Si | No | Si | Bajo/medio | Puede quedar vacio |
| `logo` | Config broker / input admin | No | String corto | Chip/logo en formulario | Si | No | Si | Bajo | Default visual: `HABI` |
| `mensaje_intro` | Config broker / textarea admin | No | String | Intro del formulario | Si | No | Si | Medio | Se inserta con `innerHTML`; requiere saneamiento aguas arriba |
| `asesor` | Config broker / input admin | No | String | Mensajes finales y asesor visible | Si | No | Si | Medio | Default: `nuestro asesor` |
| `whatsapp_destino` | Config broker / input admin | No, pero importante | Numero con pais, sin `+` | Fallback WhatsApp | Si | No | Si | Alto | Si falta, fallback WhatsApp puede quedar `#` |
| `ciudad` | Config broker desde n8n | No | String | Texto dinamico de zona | No desde admin observado | No | No | Bajo | Default: `la ciudad` |
| `aliado_credito` | Config broker desde n8n | No | String | Thank you para derivados | No desde admin observado | No | No | Bajo/medio | Default: `HabiCredit`/`HabiCredito` segun texto |
| `updated_at` | n8n/almacenamiento externo | No | Fecha/string | Ultima actualizacion en admin | No desde admin observado | No | Si | Bajo | Solo informativo |
| `error` | Respuesta n8n | No | Boolean/string | Estado broker no encontrado | No | No | Si | Medio | Admin lo interpreta como config invalida |

## Campos capturados en el formulario publico

Campos que se agregan al objeto `D` y se envian a `process-lead`.

| Campo | Nace en | Requerido | Valores permitidos/enums | Se usa en | Viaja a n8n | Dashboard | Admin | Riesgo si cambia | Observaciones |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `nombre` | Input paso datos | Si | String | Payload lead, mensajes dashboard | Si | Si | No | Alto | Dashboard muestra `Sin nombre` si falta |
| `celular` | Input paso datos | Si | String telefono | Payload lead, WhatsApp dashboard | Si | Si | No | Alto | Dashboard limpia no digitos y antepone `57` |
| `comprador` | Opcion formulario | Si | `yo_familia`, `yo_solo`, `otra_persona`, `inversion` | Payload lead, perfil dashboard | Si | Si | No | Medio | Define intencion de compra |
| `habitaciones` | Opcion formulario | Si | `1`, `2`, `3`, `4+`, `flexible` | Payload lead, meta/card dashboard | Si | Si | No | Medio | Se muestra en encabezado y detalle |
| `parqueadero` | Opcion formulario | Si | `carro`, `moto`, `carro_moto`, `no` | Payload lead, detalle dashboard | Si | Si | No | Medio | Campo de caracteristicas |
| `ascensor` | Opcion formulario | Si | `cualquier`, `con_ascensor`, `piso_bajo`, `piso_bajo_ascensor` | Payload lead, detalle dashboard | Si | Si | No | Medio | Campo sensible para movilidad/piso |
| `zona` | Input texto | No; default `No especificada` | String | Payload lead, encabezado dashboard | Si | Si | No | Medio | Campo libre |
| `zona_razon` | Textarea formulario | No | String | Estado interno solamente | No observado en payload | No | No | Bajo | Se captura pero no viaja a n8n en payload actual |
| `zona_flex` | Opcion formulario | Si | `si`, `no` | Payload lead, detalle dashboard | Si | Si | No | Medio | Dashboard muestra `Si` solo si valor exacto `si`; otros como `No` |
| `decisores` | Opcion formulario | Si | `solo`, `pareja`, `familia`, `varios` | Payload lead, perfil financiero dashboard | Si | Si | No | Medio | Afecta priorizacion comercial externa |
| `presupuesto` | Opcion formulario | Si | `hasta_200`, `200_300`, `300_500`, `500_800`, `mas_800`, `no_definido` | Payload lead, dashboard | Si | Si | No | Alto | Dashboard mapea estos valores a etiquetas de presupuesto |
| `credito` | Opcion formulario | Si | `aprobado`, `proceso`, `solo_recursos`, `mixto`, `no` | Ramificacion, payload, dashboard | Si | Si | No | Alto | Controla si deriva o continua |
| `recursos_propios` | Opcion o asignacion automatica | Segun ruta | `si_disponibles`, `parcial`, `dependen_de_algo`, `no`, `solo_contado` | Payload, dashboard | Si | Si | No | Medio/alto | `solo_contado` se asigna automaticamente |
| `cuota` | Opcion formulario | Segun ruta | `disponible`, `pronto`, `activo`, `ahorrando` | Ramificacion, payload, dashboard | Si | Si | No | Alto | `ahorrando` deriva el lead |
| `listo` | Opcion cierre | Si para `completo` | `si`, `quizas`, `no` | Payload, dashboard | Si | Si | No | Medio | Requerido solo en flujo completo |
| `vistos` | Opcion cierre | Si para `completo` | `ninguno`, `pocos`, `muchos` | Payload, dashboard | Si | Si | No | Medio | Requerido solo en flujo completo |
| `horario` | Opcion llamada | Si para `derivar` | `manana`, `tarde`, `cualquier` | Payload, dashboard | Si | Si | No | Medio | Requerido solo en flujos derivados |
| `nota_comprador` | Textarea formulario | No | String | Payload, notas dashboard | Si | Si | No | Bajo/medio | Render solo si tiene contenido |
| `nota_habitaciones` | Textarea formulario | No | String | Payload, notas dashboard | Si | Si | No | Bajo/medio | Render solo si tiene contenido |
| `nota_ascensor` | Textarea formulario | No | String | Payload, notas dashboard | Si | Si | No | Bajo/medio | Render solo si tiene contenido |
| `nota_credito` | Input condicional | No | String | Payload, banco/monto dashboard | Si | Si | No | Medio | Puede contener banco y monto aprobado |
| `nota_anteriores` | Textarea cierre | No | String | Payload, notas dashboard | Si | Si | No | Bajo/medio | Aplica si ya vio apartamentos |
| `tipo_lead` | Parametro de `submitLead` | Si | `completo`, `derivar` | Payload, dashboard | Si | Si | No | Alto | Resume la rama del flujo |

## Campos UTM y tracking

| Campo | Nace en | Requerido | Valores permitidos/enums | Se usa en | Viaja a n8n | Dashboard | Admin | Riesgo si cambia | Observaciones |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `utm_source` | URL o generador admin | No | Desde admin: `tiktok`, `instagram`, `facebook`, `whatsapp`, `email`, `portal_inmobiliario`, `referido`, `google`, `otro` | Payload, tracking dashboard | Si | Si | Si | Medio/alto | Sin persistencia en perfilador |
| `utm_medium` | URL o generador admin | No | String; admin usa `organic` | Payload, tracking dashboard | Si | Si | Si | Medio | Puede ser incorrecto para pauta paga |
| `utm_campaign` | URL o generador admin | No | String; default admin `general` | Payload, tracking dashboard | Si | Si | Si | Medio | Agrupa publicaciones |
| `propiedad` | URL o input `utm-propiedad` admin | No | String con espacios reemplazados por `_` desde admin | Payload lead | Si | No observado | Si | Medio | Util para atribuir inmueble aunque dashboard no lo muestra |
| `trackingHistory` | Memoria del navegador admin | No | Array en JS | Historial visual admin | No | No | Si | Bajo | Se pierde al recargar |

## Campos enriquecidos esperados por dashboard

Estos campos no nacen en el formulario publico. Parecen ser calculados o
persistidos por n8n/Google Sheets/otra capa externa antes de ser leidos por
`dashboard.html`.

| Campo | Nace en | Requerido | Valores permitidos/enums | Se usa en | Viaja a n8n | Dashboard | Admin | Riesgo si cambia | Observaciones |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `lead_id` | n8n/almacenamiento externo | No, pero recomendado | String | Dataset/card/trazabilidad | Vuelve desde n8n | Si | No | Medio | Si falta usa `Math.random()` para dataset |
| `timestamp` | n8n/almacenamiento externo | No | String fecha/hora | Meta encabezado tarjeta | Vuelve desde n8n | Si | No | Medio | Ayuda a priorizar nuevos leads |
| `estado` | n8n/almacenamiento externo | No | String; default visual `nuevo` | Footer tarjeta | Vuelve desde n8n | Si | No | Medio | No se edita desde dashboard actual |
| `categoria` | n8n/scoring externo | Si para filtros correctos | `CALIENTE`, `TIBIO`, `FRIO`, `FRÍO`, `DERIVAR` | Stats, filtros, badge | Vuelve desde n8n | Si | No | Alto | Si falta, card usa `FRÍO` pero stats/filtros pueden fallar |
| `score` | n8n/scoring externo | Si para priorizacion | Numero/string parseable | Stats, anillo, barra | Vuelve desde n8n | Si | No | Alto | Si falta o no parsea, cae a `0` |
| `accion_recomendada` | n8n/scoring externo | No | String separada por `|` | Caja de accion recomendada | Vuelve desde n8n | Si | No | Medio/alto | Si cambia separador, lista se rompe |

## Campos de UI/admin que no viajan como lead

| Campo | Nace en | Requerido | Valores permitidos/enums | Se usa en | Viaja a n8n | Dashboard | Admin | Riesgo si cambia | Observaciones |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `input-broker-id` | Input admin | Si para login admin | String | Cargar config | Como `broker_id` | No | Si | Alto | Se normaliza a lowercase |
| `input-token` | Input admin | Si para login admin | String | Guardar config, abrir dashboard | Como `token_admin` o query `token` | Indirecto | Si | Alto | Se mantiene en memoria como `currentToken` |
| `f-nombre` | Input admin | No | String | Editar `nombre` | Si en POST config | No | Si | Medio | Refleja preview hero |
| `f-inmobiliaria` | Input admin | No | String | Editar `inmobiliaria` | Si | No | Si | Bajo/medio | Refleja preview hero |
| `f-logo` | Input admin | No | String | Editar `logo` | Si | No | Si | Bajo | Texto corto |
| `f-activo` | Select admin | Si funcional | `TRUE`, `FALSE` | Estado formulario | Si | No | Si | Alto | Controla si formulario publico queda activo |
| `f-mensaje-intro` | Textarea admin | No | String | Editar `mensaje_intro` | Si | No | Si | Medio | Termina en `innerHTML` del formulario |
| `f-asesor` | Input admin | No | String | Editar `asesor` | Si | No | Si | Medio | Aparece en pantallas finales |
| `f-whatsapp` | Input admin | No, importante | Numero con pais | Editar `whatsapp_destino` | Si | No | Si | Alto | Define fallback de contacto |
| `utm-origen` | Select admin | Si para link tracking | Ver fuentes UTM | Generar links | No directo hasta que lead usa link | No | Si | Medio | Se convierte en `utm_source` |
| `utm-propiedad` | Input admin | Si para link tracking | String | Generar links | No directo hasta que lead usa link | No | Si | Medio | Se convierte en `propiedad` |
| `utm-campana` | Input admin | No | String | Generar links | No directo hasta que lead usa link | No | Si | Bajo/medio | Se convierte en `utm_campaign` |

## Riesgos principales por cambio de campo

| Tipo de cambio | Riesgo |
| --- | --- |
| Renombrar campos enviados por `app.html` | n8n puede dejar de procesar, clasificar o guardar leads |
| Renombrar enums de formulario | Scoring externo puede clasificar mal |
| Cambiar `categoria` | Filtros, stats y badges del dashboard pueden fallar |
| Cambiar `score` a texto no numerico | Dashboard mostrara `0` y promedio incorrecto |
| Cambiar `accion_recomendada` sin `|` | Dashboard no separara acciones |
| Quitar `token` de URL sin alternativa | Dashboard quedara sin autenticacion funcional |
| Cambiar `broker_id`/`broker` | Se rompe asociacion broker-formulario-dashboard |
| Cambiar `_redirects` de rutas perfilador | Links compartidos por brokers pueden romperse |

## Primeros campos que conviene estabilizar antes de tocar codigo

Prioridad alta:

- `broker_id`
- `token_admin` / `token`
- `tipo_lead`
- `credito`
- `cuota`
- `score`
- `categoria`
- `accion_recomendada`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `propiedad`

Prioridad media:

- `presupuesto`
- `recursos_propios`
- `estado`
- `lead_id`
- `timestamp`
- `whatsapp_destino`

Prioridad baja:

- Textos visuales de broker: `nombre`, `inmobiliaria`, `logo`,
  `mensaje_intro`, `asesor`, siempre que se preserve saneamiento y fallback.
