# Contratos actuales del Perfilador Inmobiliario

Documento de diagnostico inicial basado en los archivos reales del repositorio.
No describe una arquitectura ideal; describe como esta funcionando hoy el flujo
del perfilador para evitar romper produccion durante la evolucion hacia SaaS.

## Alcance

Producto documentado:

- Landing comercial: `productos/chatbot/perfilador/index.html`
- Formulario publico del lead: `productos/chatbot/perfilador/app.html`
- Panel del broker: `productos/chatbot/perfilador/admin.html`
- Dashboard de leads: `productos/chatbot/perfilador/dashboard.html`
- Rutas limpias: `_redirects`

Dependencias relacionadas, pero fuera del contrato principal de este documento:

- Diagnostico ICO: `productos/bi/diagnostico-ico/*`
- Google Apps Script del diagnostico ICO

## Rutas publicas actuales

Definidas en `_redirects`:

| Ruta publica | Archivo destino | Uso |
| --- | --- | --- |
| `/perfilador` | `productos/chatbot/perfilador/index.html` | Landing comercial del producto |
| `/perfilador/app` | `productos/chatbot/perfilador/app.html` | Formulario publico para clientes finales |
| `/perfilador/admin` | `productos/chatbot/perfilador/admin.html` | Panel de configuracion del broker |
| `/perfilador/dashboard` | `productos/chatbot/perfilador/dashboard.html` | Dashboard de leads del broker |
| `/admin` | `/perfilador/admin` | Redirect legacy permanente |
| `/admin.html` | `/perfilador/admin` | Redirect legacy permanente |

Nota: el archivo `_redirects` comenta "Netlify", pero el contexto del producto
indica Cloudflare. Antes de tocar rutas hay que confirmar como Cloudflare esta
interpretando estas reglas en produccion.

## Dependencias externas

### n8n

Los endpoints estan hardcodeados en frontend:

| Endpoint | Metodo usado | Archivo | Funcion |
| --- | --- | --- | --- |
| `https://n8n.noema.lat/webhook/broker-config` | GET | `app.html`, `admin.html` | Leer configuracion de broker |
| `https://n8n.noema.lat/webhook/broker-config` | POST | `admin.html` | Guardar configuracion de broker |
| `https://n8n.noema.lat/webhook/process-lead` | POST | `app.html` | Procesar lead capturado |
| `https://n8n.noema.lat/webhook/broker-leads` | GET | `dashboard.html` | Consultar leads del broker |

Headers observados:

```http
Content-Type: application/json
ngrok-skip-browser-warning: true
```

El header `ngrok-skip-browser-warning` aparece aunque los endpoints actuales
usan `n8n.noema.lat`. Puede ser residuo de pruebas o compatibilidad historica.

### WhatsApp

El sistema genera enlaces `wa.me`:

- En `app.html`, como fallback si falla el envio del formulario.
- En `dashboard.html`, para contactar leads desde la tarjeta del lead.

### Cloudflare

No se encontro `wrangler.toml`, Pages Functions ni Workers en el repositorio.
La evidencia local apunta a sitio estatico con `_redirects`.

## Contrato: carga de configuracion del broker

### Consumidores

- `productos/chatbot/perfilador/app.html`
- `productos/chatbot/perfilador/admin.html`

### Request desde formulario publico

El formulario publico lee el broker desde query string:

```text
/perfilador/app?broker={broker_id}
```

Luego consulta:

```text
GET https://n8n.noema.lat/webhook/broker-config?broker_id={broker_id}
```

Si no existe `broker`, usa `default`.

### Request desde panel admin

El panel pide:

```text
broker_id
token
```

Pero la lectura inicial de configuracion observada usa solo:

```text
GET https://n8n.noema.lat/webhook/broker-config?broker_id={broker_id}
```

El token queda guardado en memoria del navegador como `currentToken` y se usa al
guardar configuracion y al abrir el dashboard.

### Respuesta esperada de broker config

Campos usados por el frontend:

| Campo | Usado en | Uso |
| --- | --- | --- |
| `activo` | `app.html`, `admin.html` | Habilita o pausa el formulario |
| `nombre` | `app.html`, `admin.html` | Nombre visible del broker |
| `inmobiliaria` | `app.html`, `admin.html` | Subtitulo/marca del broker |
| `logo` | `app.html`, `admin.html` | Texto corto visible en formulario |
| `mensaje_intro` | `app.html`, `admin.html` | Mensaje inicial del formulario |
| `asesor` | `app.html`, `admin.html` | Nombre del asesor que contacta al lead |
| `whatsapp_destino` | `app.html`, `admin.html` | WhatsApp para fallback y recepcion |
| `ciudad` | `app.html` | Texto dinamico de zonas |
| `aliado_credito` | `app.html` | Mensaje final cuando el lead se deriva |
| `updated_at` | `admin.html` | Fecha mostrada en panel |
| `error` | `admin.html` | Estado de broker no encontrado |

Estados especiales observados:

- HTTP `404`: broker no encontrado.
- `config.error`: broker no encontrado.
- `activo !== true && activo !== 'TRUE'`: formulario inactivo.

## Contrato: guardado de configuracion del broker

### Consumidor

- `productos/chatbot/perfilador/admin.html`

### Request

```text
POST https://n8n.noema.lat/webhook/broker-config
```

Payload enviado:

```json
{
  "broker_id": "string",
  "token_admin": "string",
  "activo": "TRUE | FALSE",
  "nombre": "string",
  "inmobiliaria": "string",
  "logo": "string",
  "asesor": "string",
  "whatsapp_destino": "string",
  "mensaje_intro": "string"
}
```

### Respuesta esperada

```json
{
  "ok": true
}
```

Estados especiales observados:

- HTTP `401`: token incorrecto.
- `ok !== true`: error de guardado.

## Contrato: formulario publico del lead

### Entrada por URL

Parametros leidos por `app.html`:

| Parametro | Uso |
| --- | --- |
| `broker` | Identifica broker propietario del formulario |
| `utm_source` | Origen/canal del lead |
| `utm_medium` | Medio/publicacion |
| `utm_campaign` | Campana |
| `propiedad` | Inmueble o publicacion asociada |

Estos valores se leen una vez desde `window.location.search` y se guardan en el
objeto global de estado `D`. No se observo persistencia en `sessionStorage` o
`localStorage` para el perfilador.

### Request de envio del lead

```text
POST https://n8n.noema.lat/webhook/process-lead
```

Payload enviado por `submitLead`:

```json
{
  "broker_id": "string",
  "nombre": "string",
  "celular": "string",
  "comprador": "string",
  "habitaciones": "string",
  "parqueadero": "string",
  "ascensor": "string",
  "zona": "string",
  "zona_flex": "string",
  "decisores": "string",
  "presupuesto": "string",
  "credito": "string",
  "recursos_propios": "string",
  "cuota": "string",
  "listo": "string",
  "vistos": "string",
  "horario": "string",
  "nota_comprador": "string",
  "nota_habitaciones": "string",
  "nota_ascensor": "string",
  "nota_credito": "string",
  "nota_anteriores": "string",
  "tipo_lead": "completo | derivar",
  "utm_source": "string",
  "utm_medium": "string",
  "utm_campaign": "string",
  "propiedad": "string"
}
```

### Respuesta esperada

Caso exitoso:

```json
{
  "ok": true,
  "asesor": "string"
}
```

Caso duplicado:

```json
{
  "ok": true,
  "duplicate": true,
  "asesor": "string",
  "message": "string"
}
```

Caso error:

```json
{
  "ok": false,
  "error": "string"
}
```

Si la respuesta HTTP no es `2xx`, o si `ok` no es verdadero, el formulario
muestra el bloque de error y permite reintentar.

## Flujo ramificado del lead

El flujo del formulario publico no es estrictamente lineal. El formulario avanza
por pasos, pero algunas respuestas cambian la ruta y el tipo de lead enviado.

Flujo base observado:

1. Cargar configuracion del broker por `broker`.
2. Validar que el broker este activo.
3. Capturar nombre y celular.
4. Capturar perfil de busqueda: comprador, habitaciones, parqueadero, ascensor,
   zona, zona flexible, decisores y presupuesto.
5. Capturar situacion financiera.
6. Enviar lead a n8n como `tipo_lead`.

Ramificaciones criticas:

| Condicion | Ruta | Resultado |
| --- | --- | --- |
| `credito === 'no'` | Salta a pantalla de llamada con aliado credito | `tipo_lead: derivar` |
| `credito === 'solo_recursos'` | Marca `recursos_propios: solo_contado` y continua a cuota | Puede terminar como completo o derivar |
| `credito` en `aprobado`, `proceso`, `mixto` | Pregunta recursos propios antes de cuota | Puede terminar como completo o derivar |
| `cuota === 'ahorrando'` | Salta a pantalla de llamada con aliado credito | `tipo_lead: derivar` |
| Flujo completo con `listo` y `vistos` | Envia perfil final | `tipo_lead: completo` |

El campo `horario` es requerido para los leads derivados. Los campos `listo` y
`vistos` son requeridos para los leads completos.

## Enums actuales del formulario

Estos valores estan embebidos en `productos/chatbot/perfilador/app.html` y son
parte del contrato con n8n, Google Sheets o cualquier almacenamiento intermedio.
No deberian renombrarse sin migracion coordinada.

| Campo | Valores actuales |
| --- | --- |
| `comprador` | `yo_familia`, `yo_solo`, `otra_persona`, `inversion` |
| `habitaciones` | `1`, `2`, `3`, `4+`, `flexible` |
| `parqueadero` | `carro`, `moto`, `carro_moto`, `no` |
| `ascensor` | `cualquier`, `con_ascensor`, `piso_bajo`, `piso_bajo_ascensor` |
| `zona_flex` | `si`, `no` |
| `decisores` | `solo`, `pareja`, `familia`, `varios` |
| `presupuesto` | `hasta_200`, `200_300`, `300_500`, `500_800`, `mas_800`, `no_definido` |
| `credito` | `aprobado`, `proceso`, `solo_recursos`, `mixto`, `no` |
| `recursos_propios` | `si_disponibles`, `parcial`, `dependen_de_algo`, `no`, `solo_contado` |
| `cuota` | `disponible`, `pronto`, `activo`, `ahorrando` |
| `horario` | `manana`, `tarde`, `cualquier` |
| `listo` | `si`, `quizas`, `no` |
| `vistos` | `ninguno`, `pocos`, `muchos` |
| `tipo_lead` | `completo`, `derivar` |

Notas:

- `solo_contado` no aparece como opcion visible; se asigna automaticamente
  cuando `credito === 'solo_recursos'`.
- `FRIO` y `FRÍO` aparecen como variantes aceptadas en el dashboard para
  categoria fria.

## Contrato: dashboard de leads

### Entrada por URL

El dashboard requiere:

```text
/perfilador/dashboard?broker_id={broker_id}&token={token}
```

Si falta `broker_id` o `token`, muestra estado no autorizado.

### Request

```text
GET https://n8n.noema.lat/webhook/broker-leads?broker_id={broker_id}&token={token}
```

El dashboard recarga automaticamente cada 60 segundos.

### Respuesta esperada

El frontend espera un arreglo JSON:

```json
[
  {
    "lead_id": "string",
    "timestamp": "string",
    "estado": "string",
    "tipo_lead": "string",
    "categoria": "CALIENTE | TIBIO | FRIO | FRÍO | DERIVAR",
    "score": "number|string",
    "nombre": "string",
    "celular": "string",
    "comprador": "string",
    "habitaciones": "string",
    "parqueadero": "string",
    "ascensor": "string",
    "presupuesto": "string",
    "zona": "string",
    "zona_flex": "si|string",
    "credito": "aprobado | proceso | no | string",
    "cuota": "disponible | pronto | activo | ahorrando | string",
    "recursos_propios": "si_disponibles | parcial | dependen_de_algo | no | string",
    "decisores": "string",
    "listo": "si | quizas | string",
    "vistos": "string",
    "horario": "string",
    "nota_comprador": "string",
    "nota_habitaciones": "string",
    "nota_ascensor": "string",
    "nota_anteriores": "string",
    "nota_credito": "string",
    "accion_recomendada": "string separada por |",
    "utm_source": "string",
    "utm_medium": "string",
    "utm_campaign": "string"
  }
]
```

Si la respuesta no es arreglo, el dashboard usa `[]`.

## Campos calculados externamente por n8n

El repositorio no contiene la logica que calcula la calidad comercial del lead.
El formulario envia datos crudos; el dashboard espera recibir campos enriquecidos.

Campos que parecen depender de n8n, Google Sheets u otra capa externa:

| Campo | Uso en dashboard | Riesgo si falta o cambia |
| --- | --- | --- |
| `score` | Score numerico, promedio, anillo visual y barra | Cards pierden jerarquia; score cae a `0` |
| `categoria` | Filtros y badges: caliente, tibio, frio, derivar | Filtros quedan incorrectos |
| `accion_recomendada` | Lista de acciones dentro de la tarjeta | Broker pierde guia operativa |
| `lead_id` | Identificador visual y `dataset.id` | Dificulta trazabilidad |
| `timestamp` | Meta de la tarjeta | Dificulta priorizacion reciente |
| `estado` | Estado mostrado al final de la tarjeta | No hay seguimiento visible |
| `tipo_lead` | Muestra si es completo o derivado | Se pierde contexto del flujo |

Contrato implicito:

- `score` deberia ser interpretable por `parseInt`.
- `categoria` deberia coincidir con `CALIENTE`, `TIBIO`, `FRIO`, `FRÍO` o
  `DERIVAR`.
- `accion_recomendada` se separa por el caracter `|`.

## Contrato visual del dashboard

El dashboard no solo lista datos: interpreta los leads como una herramienta de
priorizacion comercial para el broker.

Elementos visuales dependientes del contrato:

| Elemento | Campos usados | Comportamiento esperado |
| --- | --- | --- |
| Resumen superior | `categoria`, `score` | Total, calientes, tibios, frios y score promedio |
| Filtros | `categoria` | Filtra por todos, calientes, tibios y frios |
| Badge de categoria | `categoria` | Color y etiqueta de prioridad |
| Anillo/barra de score | `score` | Rojo si >= 70, amarillo si >= 40, azul si menor |
| Boton WhatsApp | `celular`, `nombre` | Abre `wa.me/57{celular}` con mensaje prellenado |
| Perfil de compra | `comprador`, `habitaciones`, `parqueadero`, `ascensor`, `presupuesto`, `zona`, `zona_flex` | Muestra datos principales del inmueble buscado |
| Perfil financiero | `credito`, `nota_credito`, `cuota`, `recursos_propios`, `decisores`, `listo`, `vistos`, `horario` | Muestra capacidad de avance |
| Notas | `nota_comprador`, `nota_habitaciones`, `nota_ascensor`, `nota_anteriores`, `nota_credito` | Solo se renderiza si hay contenido |
| Accion recomendada | `accion_recomendada` | Divide recomendaciones usando `|` |
| Tracking | `utm_source`, `utm_medium`, `utm_campaign` | Muestra origen, publicacion y campana |
| Estado final | `estado`, `tipo_lead`, `lead_id` | Muestra trazabilidad basica |

Reglas de fallback observadas:

- Si no hay nombre, muestra `Sin nombre`.
- Si no hay categoria, usa `FRÍO`.
- Si no hay score valido, usa `0`.
- Si no hay celular, el link de WhatsApp queda como `#`.
- Si no hay UTMs, muestra `directo` o `—`.

## Contrato: links UTM generados desde admin

El panel admin genera links con esta forma:

```text
https://noema.lat/perfilador/app?broker={broker_id}&utm_source={origen}&utm_medium=organic&utm_campaign={campana}&propiedad={propiedad}
```

Campos de entrada:

- `utm-origen`
- `utm-propiedad`
- `utm-campana`

## Fuentes UTM permitidas desde admin

El panel admin limita `utm_source` a una lista cerrada desde el selector visual:

| Valor | Etiqueta visible |
| --- | --- |
| `tiktok` | TikTok |
| `instagram` | Instagram |
| `facebook` | Facebook |
| `whatsapp` | WhatsApp |
| `email` | Email |
| `portal_inmobiliario` | Portal inmobiliario |
| `referido` | Referido |
| `google` | Google Ads |
| `otro` | Otro |

Reglas observadas:

- `propiedad` reemplaza espacios por `_`.
- `campana` reemplaza espacios por `_`.
- Si no hay campana, usa `general`.
- Si no hay broker cargado, usa `default`.
- `utm_medium` queda fijo en `organic`.
- El historial de links generados vive solo en memoria del navegador.

## Contrato implicito de scoring y clasificacion

El archivo `app.html` no calcula `score` ni `categoria` para el dashboard.
El dashboard espera recibir esos campos ya calculados desde n8n o desde la hoja
intermedia:

- `score`
- `categoria`
- `accion_recomendada`

Por tanto, la clasificacion actual del lead parece depender de n8n o de una
capa externa no presente en este repositorio.

## Diferencias entre perfilador y diagnostico ICO

El diagnostico ICO tiene piezas reutilizables conceptualmente, pero no estan
conectadas al perfilador inmobiliario.

| Tema | Perfilador inmobiliario | Diagnostico ICO |
| --- | --- | --- |
| Integracion principal | n8n en `n8n.noema.lat` | Google Apps Script |
| Tracking UTM | Lee query string una vez en `app.html` | Usa `UTMTracker` con `sessionStorage` |
| Persistencia UTM | No observada | `sessionStorage` con clave `noema_utm` |
| Defaults UTM | Campos quedan vacios si no vienen en URL | `utm_source` desde referrer o `direct`; `utm_medium` como `organic` |
| Landing metadata | Perfilador landing independiente | Diagnostico ICO con scripts modulares |
| Tracking abandono | No observado en perfilador | `ico_abandoned` en `beforeunload` y `visibilitychange` |
| Form view no enviado | No observado en perfilador | `ico_form_viewed_not_submitted` tras timeout |
| Estructura JS | JS embebido en HTML | JS separado por `config`, preguntas, logica y UTM |
| Payload | Lead inmobiliario hacia n8n | Diagnostico y respuestas hacia Apps Script |

Implicacion: no conviene copiar codigo del ICO directamente sin adaptar el
contrato, pero si sirve como referencia para una mejora futura de tracking del
perfilador.

## Drift entre documentacion y realidad

Documentacion local revisada:

- `README_ARQUITECTURA.md`
- `GUIA_RAPIDA.md`

Hallazgos:

| Archivo | Drift observado |
| --- | --- |
| `README_ARQUITECTURA.md` | Dice que `_redirects` es para Netlify, aunque el contexto actual indica Cloudflare |
| `README_ARQUITECTURA.md` | Lista `index.html`, `app.html` y `admin.html`, pero no lista `dashboard.html` |
| `GUIA_RAPIDA.md` | Esta centrada en Diagnostico ICO, no en Perfilador Inmobiliario |
| `GUIA_RAPIDA.md` | Menciona nombres legacy como `diagnostico-refactored.html`, no observado en el arbol actual |
| `GUIA_RAPIDA.md` | Documenta `GOOGLE_APPS_SCRIPT`, pero no documenta endpoints n8n del perfilador |

Implicacion: la documentacion existente ayuda para el producto ICO, pero no es
suficiente para operar el perfilador como producto SaaS.

## Riesgos de produccion documentados

1. Los endpoints de n8n estan expuestos en HTML publico.
2. El token del dashboard viaja por query string.
3. La lectura de configuracion del broker desde admin parece hacerse sin token.
4. El contrato con n8n no esta versionado ni validado en el frontend.
5. El perfilador no persiste UTMs si se pierden los parametros de URL.
6. El dashboard depende de nombres exactos de campos enviados por n8n.
7. Cambiar `_redirects` puede afectar links ya compartidos por brokers.
8. `app.html`, `admin.html` y `dashboard.html` mezclan UI, estado, integracion y
   render, lo que aumenta el riesgo de cambios pequenos.

## Riesgos de seguridad/atribucion adicionales

Riesgos agregados despues de revisar el flujo completo:

1. El panel admin solicita token, pero la lectura inicial de configuracion usa
   solo `broker_id`. Si n8n retorna informacion sensible en GET, podria quedar
   expuesta.
2. El dashboard recibe `token` por query string. Ese valor puede quedar en
   historial del navegador, capturas, logs o links reenviados.
3. La URL del dashboard se abre desde admin con `broker_id` y `token` en claro.
4. Los endpoints n8n no estan abstraidos por un backend propio o Worker local al
   repo; el contrato queda publico en el HTML.
5. El perfilador no tiene persistencia UTM; si el usuario pierde parametros o
   llega por una redireccion intermedia, la atribucion puede quedar incompleta.
6. `utm_medium` se fija siempre en `organic` desde admin, incluso para `google`
   o campanas pagas. Esto puede distorsionar reportes.
7. El historial de links UTM del admin vive solo en memoria; se pierde al cerrar
   o recargar la pagina.
8. El formulario usa varios `innerHTML` con datos de configuracion o respuestas
   externas. El riesgo real depende de como n8n sanee valores como `mensaje_intro`
   o `message`.
9. No se observo rate limiting, captcha, firma de payload ni proteccion anti-spam
   en el frontend.
10. La ausencia de staging visible aumenta el riesgo de probar cambios contra
    endpoints productivos.

## No tocar todavia

- Endpoints de n8n.
- Nombres de campos del payload.
- Rutas `/perfilador/app`, `/perfilador/admin`, `/perfilador/dashboard`.
- Logica de `duplicate`.
- Token enviado al dashboard, hasta definir una alternativa.
- Campos `categoria`, `score` y `accion_recomendada`, hasta revisar n8n.
- `_redirects`, hasta confirmar comportamiento real en Cloudflare.

## Primer cambio tecnico seguro sugerido despues de este documento

Sin cambiar comportamiento:

Crear un segundo documento con una matriz de campos:

- Campo
- Donde nace
- Donde se envia
- Donde se muestra
- Requerido/opcional
- Riesgo si cambia

Esto permitiria luego extraer constantes o validar payloads con bajo riesgo.
