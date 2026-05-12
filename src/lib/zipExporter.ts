import JSZip from "jszip";
import { downloadFile } from "./api";
import type { Client, GeneratedFile } from "./types";

function buildReadme(client: Client, files: GeneratedFile[]): string {
  return `# Customer Agent Setup - ${client.name}

Paquete generado por Revenue Hub Latam para configurar HubSpot Customer Agent.

## Contenido del .zip

${files
  .map((f) => `- ${f.filename} (${f.output_format}) - template ${f.prompt_template_id}`)
  .join("\n")}

## Cómo usar

1. Lee RUNBOOK.md y sigue los pasos numerados.
2. Sube los archivos .md y .csv al Knowledge Base de HubSpot o como Short Answers según corresponda.
3. Aplica la persona y guardrails desde el blueprint.
4. Valida con un test manual antes de activar el agente en producción.

Generado: ${new Date().toISOString()}
`;
}

function buildRunbook(client: Client, files: GeneratedFile[]): string {
  return `# Runbook - Configuración de HubSpot Customer Agent

Cliente: ${client.name}
Industria: ${client.industry ?? "n/a"}

## Paso 1. Preparar el portal de HubSpot

1. Asegúrate de tener un workspace de Service Hub Professional o superior.
2. Verifica que el equipo de soporte tenga inboxes configurados.
3. Confirma que el Knowledge Base esté activo.

## Paso 2. Cargar contenido al Knowledge Base

1. Abre Service > Knowledge Base > New article.
2. Por cada archivo .md de FAQ del .zip, crea un artículo nuevo.
3. Copia el contenido respetando los headers y separadores.
4. Marca el artículo como publicado solo cuando un humano lo haya revisado.

## Paso 3. Cargar Short Answers

1. Ve a HubSpot > Customer Agent > Knowledge > Short Answers.
2. Por cada fila del CSV short-answers, crea una entrada.
3. Variantes de pregunta van en el campo de sinónimos.
4. Prioriza P0 antes de activar el agente.

## Paso 4. Configurar Persona y Brand Voice

1. Ve a Customer Agent > Settings > Persona.
2. Selecciona el personality_preset indicado en el blueprint.
3. Si se definió brand voice custom, pégalo en el campo correspondiente.
4. Define la identidad (bot o team_member) según el blueprint.

## Paso 5. Configurar Actions

1. Ve a Customer Agent > Actions.
2. Por cada action del blueprint con requires_custom_dev = false, créala con su endpoint.
3. Para actions con custom_dev, abre ticket interno con engineering.
4. Asigna la protección (None, MatchEmail o VerifyEmail).

## Paso 6. Configurar reglas de escalación

1. Implementa los triggers automáticos en HubSpot > Conversations > Inbox Settings.
2. Crea rutas a equipos según el routing del blueprint.
3. Define SLAs por canal.

## Paso 7. Cargar guardrails

1. Lleva la lista de forbidden_topics a un Short Answer de tipo "no responder".
2. Pega los mandatory_disclaimers al final de las respuestas relevantes.

## Paso 8. Validar antes de lanzar

1. Ejecuta el validador de HubSpot desde la app de Revenue Hub.
2. Corre 10 conversaciones de prueba cubriendo los top_topics del blueprint.
3. Revisa que las escalaciones funcionen y los disclaimers aparezcan.

## Paso 9. Activar el agente

1. Sube el agente a un canal piloto (ej: web chat fuera de horario).
2. Monitorea las primeras 100 conversaciones.
3. Itera Short Answers y FAQs con base en fallos reales.

## Archivos en este paquete

${files.map((f, i) => `${i + 1}. ${f.filename}`).join("\n")}
`;
}

export async function exportAsZip(
  client: Client,
  files: GeneratedFile[],
): Promise<Blob> {
  const zip = new JSZip();

  for (const f of files) {
    try {
      const content = await downloadFile(f.storage_path);
      zip.file(f.filename, content);
    } catch (err) {
      zip.file(f.filename, f.preview ?? "");
    }
  }

  zip.file("README.md", buildReadme(client, files));
  zip.file("RUNBOOK.md", buildRunbook(client, files));

  return await zip.generateAsync({ type: "blob" });
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
