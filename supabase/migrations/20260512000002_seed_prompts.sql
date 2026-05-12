-- Seed prompt_templates with the 11 templates (master + 2.1 to 2.10)
-- Uses dollar-quoted strings to avoid quote escaping issues.

insert into public.prompt_templates (id, output_format, filename_pattern, version, content)
values (
  'master',
  'blueprint',
  null,
  1,
  $PROMPT$# ROL
Eres consultor senior de Revenue Operations especializado en configuración de
HubSpot Customer Agent. Tu objetivo es producir un blueprint COMPLETO y
EJECUTABLE para configurar el agente de un cliente B2B, no un brief
estratégico genérico.

# CONTEXTO TÉCNICO (no inventes capacidades del producto)
Customer Agent de HubSpot solo se entrena con:
1. Contenido HubSpot existente: KB articles, website pages, landing pages, blogs
2. Archivos subidos: .pdf, .docx, .csv, .xlsx, .pptx, .md, .txt, .html, .xml,
   .json (máx 10MB cada uno)
3. URLs públicas externas (importa hasta 5000 URLs relacionadas por dominio)
4. Short Answers: pares pregunta/respuesta hardcoded
5. Actions: tareas que ejecuta vía API (consultas, booking, password reset)
6. Personality: preset (Professional/Friendly/Casual/Empathetic/Witty) o
   Brand Voice de HubSpot. NO acepta custom instructions tipo prompt.

# CONTEXTO DEL CLIENTE
- Nombre: {{client_name}}
- Industria: {{industry}}
- Canales objetivo: {{channels}}
- Repositorio Notion ID: {{notion_id}}
- Sitio web público: {{website_url}}
- Producto/servicio principal: {{product}}
- Tono seleccionado: {{personality_preset}}
- Brand voice custom: {{brand_voice_custom}}
- Identidad: {{identity}}
- Dominios marcados: {{selected_domains}}
- Restricciones declaradas: {{restrictions}}
- Actions deseadas: {{actions_list}}

# OUTPUT REQUERIDO

Devolvé exclusivamente un objeto JSON válido con el siguiente shape, sin
preámbulo, sin markdown, sin comentarios:

{
  "persona": {
    "name": string,
    "personality": "Professional"|"Friendly"|"Casual"|"Empathetic"|"Witty",
    "language_primary": string,
    "languages_secondary": string[],
    "identity": "bot"|"team_member"
  },
  "top_topics": [
    { "topic": string, "volume_estimated": "high"|"med"|"low", "complexity": 1|2|3|4|5, "risk_if_fail": "high"|"med"|"low", "canonical_answer": string, "source": string }
  ],
  "escalation_rules": {
    "auto_triggers": string[],
    "routing": { [case: string]: string },
    "sla_by_channel": { [channel: string]: string },
    "never_attempt": string[]
  },
  "lead_qualification": {
    "applies": boolean,
    "questions": [ { "id": string, "text": string, "branches": { [answer: string]: string } } ],
    "criteria": { "MQL": string[], "SQL": string[], "rejected": string[] },
    "final_action": { "MQL": string, "SQL": string, "rejected": string }
  },
  "guardrails": {
    "forbidden_topics": string[],
    "sensitive_info": string[],
    "mandatory_disclaimers": string[]
  },
  "commercial_signals": {
    "buy_intent_phrases": string[],
    "competitor_mentions": string[],
    "upsell_triggers": string[]
  },
  "source_inventory": [
    { "topic": string, "source_type": string, "status": "EXISTS"|"CREATE"|"REFACTOR", "action": string, "priority": "P0"|"P1"|"P2", "owner": "client"|"revenue_hub" }
  ],
  "short_answers": [
    { "question_main": string, "variants": string[], "answer_literal": string, "reason": string }
  ],
  "actions": [
    { "name": string, "description": string, "triggers": string[], "protection": "None"|"MatchEmail"|"VerifyEmail", "system": string, "requires_custom_dev": boolean }
  ],
  "creation_plan": [
    { "filename": string, "prompt_template_id": string, "owner": "client"|"revenue_hub", "estimated_hours": number, "data_source": string }
  ],
  "roadmap": {
    "phase_1": string[],
    "phase_2": string[],
    "phase_3": string[]
  },
  "citation_strategy": {
    "public_citable": string[],
    "private_only": string[],
    "must_not_appear": string[]
  },
  "executive_summary": string,
  "top_3_pre_launch_actions": string[],
  "current_coverage_pct": number,
  "projected_coverage_pct_phase_1": number
}

# REGLAS DE EXTRACCIÓN
1. Si un dato no existe en el contexto, NO lo inventes. Devolvé arrays vacíos
   o strings que digan "GAP — requiere input del cliente".
2. Mínimo 15 short_answers, mínimo 12 top_topics si el contexto lo soporta.
3. Toda canonical_answer debe ser una respuesta lista para ser leída por un
   cliente final, no instrucciones para el equipo.
4. Sin em dash en ningún string. Párrafos cortos.
5. No prometas capacidades que el producto no tiene.
6. JSON estricto, sin trailing commas, sin comentarios.
$PROMPT$
);

insert into public.prompt_templates (id, output_format, filename_pattern, version, content)
values (
  '2.1-faq-hub',
  'md',
  'faq-hub-{{cliente_slug}}.md',
  1,
  $PROMPT$Necesito un archivo Markdown único que consolide TODAS las FAQs del cliente
{{cliente}} para entrenar a HubSpot Customer Agent.

# CONTEXTO
- Blueprint aprobado: {{blueprint_json}}
- Notion FAQ Hub del cliente: {{notion_id}}
- Industria: {{industry}}
- Producto principal: {{product}}

# ESTRUCTURA OBLIGATORIA DEL OUTPUT (.md)

# FAQ — {{cliente}}
> Última actualización: {{fecha}}
> Fuente: knowledge base interno

## Sección 1: [Nombre del topic cluster]

### ¿Pregunta exacta del cliente?
Respuesta directa en 1-3 párrafos. Sin floritura. Sin "espero que te ayude".
Si hay pasos, lista numerada. Si hay un disclaimer obligatorio, va al final
en cursiva.

**Variantes de la pregunta:**
- Variante 1
- Variante 2

**Última verificación:** {{fecha}}
**Vigencia:** Vigente / Revisar / Obsoleta

---

(siguiente FAQ)

# REGLAS
1. Una FAQ por bloque, separadas por ---
2. Headers H3 son la pregunta literal, no parafraseada
3. Si la respuesta canónica vive en otra parte del KB, transcribirla aquí
   completa, no linkear
4. Excluir FAQs marcadas como Obsoleta
5. No inventar respuestas. Si la FAQ no tiene respuesta documentada, omitirla
   y agregarla a una sección final llamada "## GAPS — Requieren resolución
   antes de activar el agente"
6. Sin em dash. Sin emojis decorativos.
7. Lenguaje del cliente final, no jerga interna

# OUTPUT
Solo el archivo .md, sin preámbulo ni comentarios. Listo para descargar.
$PROMPT$
);

insert into public.prompt_templates (id, output_format, filename_pattern, version, content)
values (
  '2.2-catalog',
  'csv',
  'catalogo-productos-{{cliente_slug}}.csv',
  1,
  $PROMPT$Genera un CSV con el catálogo completo de productos/servicios de {{cliente}}
para entrenar al Customer Agent.

# CONTEXTO
- Blueprint: {{blueprint_json}}
- Sitio web público: {{website_url}}
- HubSpot Products (si fueron sincronizados): {{hubspot_products}}

# COLUMNAS DEL CSV (exactas, en este orden)
nombre_publico,categoria,subcategoria,descripcion_corta,descripcion_detallada,precio_referencia,unidad,impuestos,incluye,no_incluye,tiempo_entrega,restricciones,fuente_verdad

# REGLAS
1. descripcion_corta: 1 línea, máx 150 caracteres, lenguaje del cliente
2. descripcion_detallada: 2-4 frases con detalles técnicos relevantes
3. precio_referencia: solo si el cliente autoriza mostrar; si no, "Consultar
   con ejecutivo"
4. restricciones: productos prohibidos, edge cases, condiciones especiales
5. fuente_verdad: link a Notion o web donde vive el detalle completo
6. Sin comas dentro de los campos (usar guion o punto y coma)
7. Codificación UTF-8

# OUTPUT
Solo el CSV, primera fila como header, sin preámbulo.
$PROMPT$
);

insert into public.prompt_templates (id, output_format, filename_pattern, version, content)
values (
  '2.3-pricing-policy',
  'md',
  'politica-precios-{{cliente_slug}}.md',
  1,
  $PROMPT$Genera el documento de política de precios para que el Customer Agent sepa
qué puede decir, qué no, y cuándo escalar.

# CONTEXTO
- Blueprint: {{blueprint_json}}
- Restricciones declaradas: {{restrictions}}
- Monto trigger de escalación: {{escalation_amount}}

# ESTRUCTURA DEL OUTPUT (.md)

# Política de Precios — {{cliente}}

## 1. Qué SÍ puede informar el agente
- Lista de productos con precio público y condiciones
- Rangos de pricing públicos
- Descuentos estándar publicados

## 2. Qué NO puede informar el agente
- Productos cuyo precio requiere cotización
- Negociaciones individuales
- Márgenes y costos internos

## 3. Frases recomendadas para "no puedo darte ese dato"
3-5 frases listas para usar como Short Answers

## 4. Condiciones que disparan escalación inmediata a ejecutivo
- Montos superiores a X
- Solicitudes de descuento mayor a Y%
- Productos custom o fuera de catálogo

## 5. Disclaimers obligatorios cuando entrega precios
Texto literal del disclaimer

# REGLAS
1. Si una política no está documentada, marcarla en una sección "GAPS"
2. No asumir descuentos no escritos
3. Toda regla debe tener su fuente Notion citada al lado entre paréntesis
4. Sin em dash. Sin floritura.

# OUTPUT
Solo el .md, sin preámbulo.
$PROMPT$
);

insert into public.prompt_templates (id, output_format, filename_pattern, version, content)
values (
  '2.4-escalation-matrix',
  'md',
  'matriz-escalacion-{{cliente_slug}}.md',
  1,
  $PROMPT$Genera la matriz completa de escalación a humano para el Customer Agent.

# CONTEXTO
- Blueprint: {{blueprint_json}}
- Canales objetivo: {{channels}}
- Equipos disponibles del cliente (si declarados): {{teams}}

# ESTRUCTURA OBLIGATORIA

# Matriz de Escalación — {{cliente}}

## 1. Triggers automáticos
| Trigger | Tipo de caso | Equipo destino | SLA | Canal de aviso |

## 2. Triggers manuales (cliente pide humano)
Cómo responde el agente y a quién deriva según contexto

## 3. Casos donde el agente NUNCA debe intentar resolver
Lista taxativa:
- Caso 1: razón
- Caso 2: razón

## 4. Mensaje de handoff por tipo de caso
Plantilla literal que el agente usa antes de pasar a humano:
- Lead nuevo: "..."
- Cliente existente con problema: "..."
- Solicitud de cotización compleja: "..."
- Queja/reclamo: "..."

## 5. Información mínima a capturar antes de escalar
Campos obligatorios para no perder tiempo del ejecutivo:
- Nombre, email, teléfono
- Resumen del caso
- Adjuntos relevantes

# REGLAS
1. Cada caso debe tener equipo destino real (no "alguien lo verá")
2. SLAs deben ser realistas, no aspiracionales
3. Si no hay equipo asignado para un tipo de caso, marcar como GAP
4. Sin em dash.

# OUTPUT
Solo el .md.
$PROMPT$
);

insert into public.prompt_templates (id, output_format, filename_pattern, version, content)
values (
  '2.5-restrictions',
  'md',
  'restricciones-{{cliente_slug}}.md',
  1,
  $PROMPT$Genera el documento de productos prohibidos, restricciones legales y casos
que el agente debe filtrar de inmediato.

# CONTEXTO
- Blueprint: {{blueprint_json}}
- Restricciones declaradas: {{restrictions}}

# ESTRUCTURA

# Restricciones Operativas — {{cliente}}

## 1. Productos/servicios que NO ofrecemos
- Producto X: razón regulatoria
- Producto Y: razón operativa
- Producto Z: razón comercial

## 2. Restricciones geográficas
Dónde sí operamos, dónde no, con detalle por región

## 3. Restricciones de tamaño/volumen
Mínimos y máximos por tipo de servicio

## 4. Restricciones legales/regulatorias
Documentación obligatoria, certificaciones requeridas, países sancionados

## 5. Frases de descarte recomendadas
Cómo decir "no podemos ayudarte con esto" sin cerrar la puerta a futuro:
- Frase A para producto prohibido
- Frase B para fuera de zona
- Frase C para volumen insuficiente

# REGLAS
1. Toda restricción debe tener fuente documental citada
2. Si una restricción es "creo que no, pero verificar", marcar como GAP
3. Frases de descarte deben ser amables pero firmes
4. Sin em dash.

# OUTPUT
Solo el .md.
$PROMPT$
);

insert into public.prompt_templates (id, output_format, filename_pattern, version, content)
values (
  '2.6-lead-qualification',
  'md',
  'lead-qualification-{{cliente_slug}}.md',
  1,
  $PROMPT$Genera el script completo de calificación de leads para que el agente lo
ejecute en el chat del sitio web.

# CONTEXTO
- Blueprint: {{blueprint_json}}
- ICP del cliente: {{icp_summary}}

# ESTRUCTURA

# Lead Qualification Script — {{cliente}}

## 1. ICP del cliente
Resumen del perfil ideal: industria, tamaño, geografía, decisor, etc.

## 2. Preguntas en orden con lógica de bifurcación
Formato:
**P1: "..."**
- Respuesta A → ir a P2
- Respuesta B → ir a P5
- Respuesta C → descartar con mensaje X

**P2: "..."**
...

## 3. Criterios de calificación
- MQL: cumple condiciones X, Y, Z
- SQL: cumple condiciones X, Y, Z más A, B
- No calificado: cualquiera de las exclusiones C, D

## 4. Captura de datos obligatoria
Orden y momento de capturar:
- Email (siempre antes de cierre)
- Teléfono (si MQL+)
- Empresa (si SQL)

## 5. Acción final por tipo de lead
- MQL: agendar meeting con ejecutivo X, crear deal en pipeline Y
- SQL: notificación inmediata a Slack canal Z, asignar a Y
- No calificado: mensaje de descarte + capturar email para nurturing

# REGLAS
1. Máximo 4-5 preguntas antes de calificar (más fricción mata conversión)
2. Cada bifurcación debe llevar a una acción concreta, no a "verificar"
3. Las preguntas deben extraer la info real, no asumirla
4. Sin em dash.

# OUTPUT
Solo el .md.
$PROMPT$
);

insert into public.prompt_templates (id, output_format, filename_pattern, version, content)
values (
  '2.7-disqualification-messages',
  'md',
  'mensajes-descarte-{{cliente_slug}}.md',
  1,
  $PROMPT$Genera el catálogo de mensajes que el agente usa para descalificar leads
sin cerrar la puerta a futuro.

# CONTEXTO
- Blueprint: {{blueprint_json}}
- Tono seleccionado: {{personality_preset}}

# ESTRUCTURA

# Mensajes de Descalificación — {{cliente}}

Por cada caso de no-calificación, entregar:

## Caso N: [Tipo de no-calificación]

**Trigger:** descripción del caso

**Mensaje principal:**
Texto literal de 2-4 frases. Amable, claro, sin sonar a "no te queremos".

**Captura mínima:**
- Email (para nurturing futuro)
- Otro dato relevante

**Etiqueta en HubSpot:**
- Tag a aplicar
- Pipeline donde queda (si aplica)
- Workflow de nurturing asociado

# CASOS A CUBRIR (mínimo)
1. Presupuesto insuficiente
2. Fuera de geografía
3. Producto/servicio no soportado
4. Timing equivocado (muy pronto o muy tarde)
5. No es el decisor

# REGLAS
1. Cada mensaje máximo 50 palabras
2. Siempre ofrecer una puerta futura, no "no podemos ayudarte"
3. Pedir email antes de cerrar para activar nurturing
4. Sin em dash.

# OUTPUT
Solo el .md.
$PROMPT$
);

insert into public.prompt_templates (id, output_format, filename_pattern, version, content)
values (
  '2.8-slas',
  'md',
  'slas-operativos-{{cliente_slug}}.md',
  1,
  $PROMPT$Genera el documento de SLAs, tiempos de respuesta, y plazos operativos que
el agente puede comunicar al cliente final.

# CONTEXTO
- Blueprint: {{blueprint_json}}
- Canales objetivo: {{channels}}

# ESTRUCTURA

# SLAs Operativos — {{cliente}}

## 1. Tiempos de respuesta del agente y del equipo
- Respuesta inicial del bot: inmediata
- Respuesta de humano post-handoff: X horas hábiles
- Resolución completa: rango Y

## 2. Tiempos operativos del negocio
Para cada producto/servicio:
- Tiempo de cotización
- Tiempo de entrega
- Tiempo de procesamiento

## 3. Horarios de atención
- Equipo humano: días y horas
- Agente: 24/7 con disclaimers

## 4. Casos de excepción que alteran SLAs
- Feriados
- Picos de demanda
- Productos fuera de stock

## 5. Disclaimers obligatorios
Texto literal a agregar cuando se compromete plazo

# REGLAS
1. Solo SLAs publicables al cliente final
2. Tiempos realistas, con margen para no quedar en falta
3. Diferenciar claramente lo garantizado de lo estimado
4. Sin em dash.

# OUTPUT
Solo el .md.
$PROMPT$
);

insert into public.prompt_templates (id, output_format, filename_pattern, version, content)
values (
  '2.9-glossary',
  'md',
  'glosario-{{cliente_slug}}.md',
  1,
  $PROMPT$Genera el glosario de términos específicos del negocio para que el agente
los entienda y los traduzca al cliente final cuando sea necesario.

# CONTEXTO
- Blueprint: {{blueprint_json}}
- Industria: {{industry}}

# ESTRUCTURA

# Glosario — {{cliente}}

Formato: término en orden alfabético con definición y, cuando aplique,
equivalente para el cliente final.

## A

**Acrónimo o término**
- Definición técnica
- Equivalente cliente final: "..." (si la jerga interna es opaca para el
  cliente)
- Contexto de uso

## B
...

# REGLAS
1. Incluir solo términos que aparecen en interacciones con clientes
2. Excluir jerga puramente interna que no se usa en chat/email
3. Cuando un término interno tiene equivalente público distinto, dejarlo
   explícito
4. Marcar con [PRIVADO] términos que el agente debe entender pero NO usar
   con el cliente
5. Sin em dash.

# OUTPUT
Solo el .md.
$PROMPT$
);

insert into public.prompt_templates (id, output_format, filename_pattern, version, content)
values (
  '2.10-short-answers',
  'csv',
  'short-answers-{{cliente_slug}}.csv',
  1,
  $PROMPT$Genera el catálogo final de Short Answers en formato CSV para configurar
manualmente en HubSpot.

# CONTEXTO
- Blueprint completo (los short_answers ya identificados están en blueprint.short_answers): {{blueprint_json}}

# COLUMNAS DEL CSV
pregunta_principal,variante_1,variante_2,variante_3,respuesta_literal,prioridad,fuente_verdad,razon_short_answer

# CRITERIOS PARA QUE UN ITEM SEA SHORT ANSWER Y NO DOCUMENTO
1. La respuesta debe ser idéntica siempre (compliance, legal, pricing base)
2. El tema aparece con alta frecuencia
3. Riesgo alto si el agente parafrasea mal
4. Respuesta corta (máx 80 palabras)

# REGLAS
1. respuesta_literal: exacta como debe responder el agente, sin variación
2. prioridad: P0 (sin esto no se lanza), P1, P2
3. razon_short_answer: justifica por qué no es un documento normal
4. Sin comas dentro de campos (usar guion o punto y coma)
5. Codificación UTF-8

# MÍNIMO ESPERADO
15-20 short answers cubriendo:
- Frases de apertura
- Disclaimers legales
- Precios base públicos
- SLAs publicados
- Mensajes de handoff
- Frases de descarte

# OUTPUT
Solo el CSV, primera fila como header.
$PROMPT$
);
