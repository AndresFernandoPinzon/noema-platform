# Evolucion del perfilador hacia SaaS multiindustria

Documento conceptual para separar el motor SaaS reutilizable del vertical
inmobiliario actual. No describe cambios inmediatos de runtime; sirve como guia
para evolucionar sin romper el perfilador publicado.

## Principio rector

El perfilador inmobiliario actual no debe convertirse de golpe en una plataforma
generica. Primero hay que hacer explicito el contrato actual, luego convertir
partes estables en configuracion, y solo despues extraer un motor reutilizable.

Regla:

```text
explicito -> configurable -> motor SaaS
```

## 1. Entidades universales

Estas entidades deberian existir en cualquier industria, aunque cambien los
nombres visibles.

| Entidad | Descripcion | Ejemplos de uso |
| --- | --- | --- |
| `tenant` | Empresa o cliente que usa la plataforma | Inmobiliaria, universidad, clinica, aseguradora |
| `workspace` | Espacio operativo dentro de un tenant | Linea de negocio, ciudad, marca, proyecto |
| `user` | Persona que entra al sistema | Admin, asesor, agente, analista |
| `role` | Permisos del usuario | Owner, admin, asesor, viewer |
| `profile` | Perfil publico/configuracion visible | Nombre, marca, logo, mensaje inicial |
| `form` | Experiencia de captacion/perfilamiento | Formulario publico, quiz, diagnostico |
| `question` | Pregunta individual del flujo | Nombre, presupuesto, necesidad, urgencia |
| `option` | Opcion de respuesta | Si/no, rangos, categorias |
| `branch_rule` | Regla de salto o derivacion | Si no tiene credito, derivar |
| `lead` | Contacto capturado | Persona interesada |
| `lead_response` | Respuesta del lead a una pregunta | Campo + valor |
| `lead_profile` | Resumen estructurado del lead | Datos normalizados para dashboard |
| `score` | Puntaje calculado | Calidad, urgencia, riesgo, fit |
| `category` | Clasificacion comercial | Caliente, tibio, frio, derivar |
| `recommendation` | Siguiente accion sugerida | Llamar hoy, nutrir, derivar |
| `assignment` | Asignacion a responsable | Broker, asesor, ejecutivo |
| `status` | Estado operativo del lead | Nuevo, contactado, descartado, convertido |
| `campaign` | Campana o grupo de origen | Mayo 2026, lanzamiento norte |
| `tracking` | Atribucion de origen | UTM, referrer, landing, publicacion |
| `integration` | Conexion externa | n8n, WhatsApp, Sheets, CRM |
| `event` | Historial/auditoria | Creado, enviado, duplicado, visto |
| `dashboard_view` | Forma de visualizar leads | Filtros, columnas, badges, acciones |

## 2. Entidades especificas de inmobiliaria

Estas entidades pertenecen al vertical inmobiliario actual. No deberian formar
parte rigida del motor SaaS.

| Entidad/campo | Rol en inmobiliaria | Equivalente generico |
| --- | --- | --- |
| `broker` | Responsable comercial inmobiliario | `user`, `assignee`, `advisor` |
| `inmobiliaria` | Marca/empresa del broker | `tenant` o `workspace` |
| `propiedad` | Inmueble/publicacion asociada al lead | `asset`, `offer`, `campaign_item` |
| `comprador` | Intencion del comprador | `intent` |
| `habitaciones` | Requisito del inmueble | `requirement` |
| `parqueadero` | Requisito del inmueble | `requirement` |
| `ascensor` | Requisito del inmueble | `requirement` |
| `zona` | Ubicacion deseada | `location_preference` |
| `zona_flex` | Flexibilidad de ubicacion | `flexibility` |
| `presupuesto` | Rango de compra | `budget_range` |
| `credito` | Estado de financiacion | `qualification_factor` |
| `recursos_propios` | Recursos disponibles | `qualification_factor` |
| `cuota` | Cuota inicial disponible | `qualification_factor` |
| `decisores` | Personas que deciden | `decision_process` |
| `vistos` | Apartamentos visitados | `market_readiness_signal` |
| `listo` | Disposicion para avanzar | `intent_strength` |
| `aliado_credito` | Derivacion financiera | `partner_referral` |

## 3. Campos universales vs campos inmobiliarios

### Campos universales

Estos deberian sobrevivir en cualquier vertical:

| Campo | Motivo |
| --- | --- |
| `tenant_id` / `broker_id` actual | Identifica propietario del flujo |
| `lead_id` | Trazabilidad |
| `nombre` | Identidad del contacto |
| `celular` | Canal de contacto |
| `tipo_lead` | Resume rama o naturaleza del lead |
| `score` | Priorizacion |
| `categoria` | Clasificacion interpretable |
| `accion_recomendada` | Proxima accion |
| `estado` | Gestion operativa |
| `timestamp` | Orden y auditoria |
| `utm_source` | Atribucion |
| `utm_medium` | Atribucion |
| `utm_campaign` | Atribucion |
| `propiedad` como concepto generico | Item/campana/oferta de origen |
| `asesor` | Responsable visible |
| `whatsapp_destino` | Canal de contacto del responsable |

### Campos inmobiliarios

Estos deberian vivir en una plantilla de industria:

| Campo | Motivo |
| --- | --- |
| `comprador` | Especifico de compra inmobiliaria |
| `habitaciones` | Requisito de vivienda |
| `parqueadero` | Requisito de vivienda |
| `ascensor` | Requisito de vivienda |
| `zona` | Preferencia inmobiliaria |
| `zona_flex` | Preferencia inmobiliaria |
| `decisores` | Logica comercial inmobiliaria |
| `presupuesto` | Rango de compra inmobiliaria |
| `credito` | Calificacion financiera inmobiliaria |
| `recursos_propios` | Calificacion financiera inmobiliaria |
| `cuota` | Calificacion financiera inmobiliaria |
| `listo` | Senal de avance inmobiliario |
| `vistos` | Madurez de busqueda |
| `horario` | Aplica a derivacion/seguimiento |
| `nota_comprador` | Nota del vertical |
| `nota_habitaciones` | Nota del vertical |
| `nota_ascensor` | Nota del vertical |
| `nota_credito` | Nota del vertical |
| `nota_anteriores` | Nota del vertical |

## 4. Logica universal vs logica inmobiliaria

### Logica universal

Esta logica deberia moverse gradualmente hacia un motor reutilizable:

| Logica | Descripcion |
| --- | --- |
| Cargar configuracion publica | Obtener configuracion del flujo por identificador |
| Validar activo/inactivo | Permitir pausar un formulario sin borrar links |
| Capturar respuestas | Guardar valores por campo/pregunta |
| Validar requeridos | Bloquear avance cuando faltan campos criticos |
| Ejecutar ramas | Saltar pantallas segun respuestas |
| Construir payload | Normalizar lead antes de enviarlo |
| Enviar a integracion | n8n, CRM, Sheets u otro destino |
| Manejar duplicados | Mostrar mensaje especial si ya existe |
| Mostrar confirmacion | Thank you page segun resultado |
| Capturar UTMs | Mantener atribucion de campana |
| Mostrar dashboard | Listar, filtrar y priorizar leads |
| Clasificar leads | Convertir respuestas en score/categoria |
| Recomendar accion | Traducir score en siguiente paso |
| Registrar eventos | Auditoria, abandono, submit, errores |

### Logica inmobiliaria

Esta logica deberia mantenerse aislada como vertical:

| Logica | Descripcion |
| --- | --- |
| Derivar si no tiene credito | Regla propia de compra de vivienda |
| Derivar si no tiene cuota | Regla propia de preparacion financiera |
| Interpretar presupuesto VIS/No VIS | Contexto inmobiliario colombiano |
| Preguntar habitaciones/parqueadero/ascensor | Requisitos de vivienda |
| Evaluar zona y flexibilidad | Requisito de busqueda inmobiliaria |
| Evaluar decisores | Senal comercial de cierre |
| Evaluar apartamentos vistos | Senal de madurez de busqueda |
| Mostrar guia caliente/tibio/frio para brokers | UX especifica del broker |
| WhatsApp con mensaje de busqueda de apartamento | Mensaje vertical |
| Aliado credito | Derivacion financiera del caso inmobiliario |

## 5. Que deberia convertirse en configuracion futura

No todo debe volverse dinamico al mismo tiempo. La configuracion debe crecer por
capas.

### Configuracion de tenant

- Nombre visible.
- Marca/logo.
- Estado activo/inactivo.
- Ciudad o mercado.
- Responsable visible.
- WhatsApp destino.
- Texto introductorio.
- Texto de privacidad.
- Integraciones activas.

### Configuracion de formulario

- Lista de pasos.
- Preguntas.
- Opciones.
- Campos requeridos.
- Orden del flujo.
- Textos de ayuda.
- Validaciones.
- Pantallas finales.
- Pantallas de error.

### Configuracion de ramas

- Condiciones.
- Destinos de salto.
- Tipo de lead resultante.
- Reglas de derivacion.
- Mensajes por rama.

Ejemplo conceptual:

```json
{
  "when": { "field": "credito", "equals": "no" },
  "goTo": "derivacion_credito",
  "leadType": "derivar"
}
```

### Configuracion de scoring

- Ponderaciones.
- Umbrales.
- Categorias.
- Acciones recomendadas.
- Reglas de duplicado.
- Campos que afectan prioridad.

### Configuracion de dashboard

- Filtros visibles.
- Badges.
- Colores por categoria.
- Campos principales de tarjeta.
- Campos secundarios.
- Acciones rapidas.
- Orden por defecto.
- Vistas por rol.

### Configuracion de integraciones

- Endpoint o destino.
- Mapeo de campos.
- Headers permitidos.
- Reintentos.
- Eventos enviados.
- Respuestas esperadas.
- Manejo de errores.

## 6. Roadmap gradual: explicito -> configurable -> motor SaaS

### Fase 1: Explicito

Objetivo: documentar y congelar contratos actuales.

Ya iniciado:

- `docs/contratos-perfilador.md`
- `docs/matriz-campos-perfilador.md`
- Este documento de separacion SaaS/vertical.

Siguiente documentacion util:

- `docs/spec-real-estate-profile.json` como especificacion espejo, sin conectar
  al runtime.
- Mapa n8n/Sheets con campos reales de entrada y salida.

### Fase 2: Configurable sin runtime dinamico

Objetivo: crear configuraciones espejo que describan el comportamiento actual,
pero sin que el sitio dependa aun de ellas.

Entregables:

- Especificacion JSON del vertical inmobiliario.
- Tabla de ramas.
- Tabla de scoring esperado.
- Tabla de dashboard esperado.
- Mapeo payload frontend -> n8n -> dashboard.

Beneficio: permite revisar con negocio y operaciones antes de tocar codigo.

### Fase 3: Configurable parcialmente

Objetivo: extraer piezas de bajo riesgo.

Primeras candidatas:

- Textos de labels y ayudas.
- Enums del formulario.
- Fuentes UTM.
- Mapeos visuales del dashboard.
- Constantes de endpoints solo cuando exista estrategia segura de entorno.

No extraer todavia:

- Ramas criticas.
- Payload n8n.
- Auth/token.
- Scoring.

### Fase 4: Motor de formulario

Objetivo: que el formulario pueda renderizar preguntas/opciones desde una
configuracion validada.

Requisitos previos:

- Pruebas manuales o automatizadas del flujo actual.
- Fixture de payload esperado.
- Validacion de respuestas n8n.
- Staging real.

### Fase 5: Motor de scoring y dashboard

Objetivo: separar score/categoria/accion del vertical.

Opciones:

- Mantener scoring en n8n pero versionarlo por vertical.
- Mover scoring a backend propio.
- Mantener scoring mixto mientras se migra.

### Fase 6: Plataforma SaaS

Objetivo: multi-tenant, multiindustria, con configuracion gobernada.

Capacidades:

- Tenants.
- Usuarios y roles.
- Formularios por industria.
- Dashboard por tenant.
- Integraciones por tenant.
- Auditoria.
- Staging/config previews.
- Versionado de formularios.

## 7. Riesgos de intentar volver todo dinamico demasiado pronto

| Riesgo | Por que importa |
| --- | --- |
| Romper el flujo productivo actual | El perfilador ya esta publicado y conectado a n8n |
| Perder conversion | Cambios en pasos, textos o ramas pueden bajar envios |
| Romper n8n | Renombrar campos o enums puede invalidar workflows |
| Romper dashboard | Si cambian `score`, `categoria` o `accion_recomendada`, la priorizacion falla |
| Crear configuracion dificil de gobernar | Un motor demasiado generico puede volverse mas fragil que el HTML actual |
| Dificultar debugging | Cuando todo es dinamico, encontrar el origen de un bug es mas lento |
| Mezclar tenants sin seguridad suficiente | Multiindustria exige aislamiento real de datos |
| Subestimar auth | Token por URL no escala bien a SaaS |
| Convertir deuda en plataforma | Si se abstraen errores actuales, se vuelven parte del producto |
| Sobrediseno prematuro | El motor debe nacer de dos o tres verticales entendidos, no de una abstraccion imaginada |

## Primer paso recomendado

Crear una especificacion espejo del vertical actual:

```text
docs/spec-real-estate-profile.json
```

Debe describir, sin conectarse al runtime:

- Campos.
- Enums.
- Pasos.
- Ramas.
- Payload esperado.
- Campos esperados del dashboard.
- Categorias y acciones esperadas.

Ese archivo seria el puente entre documentacion humana y futura configuracion
maquina, sin riesgo para produccion.
