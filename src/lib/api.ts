import { supabase } from "./supabase";
import type { Blueprint } from "./types";

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) throw error;
  return data as T;
}

export async function generateBlueprint(sessionId: string): Promise<{ blueprint: Blueprint }> {
  return invoke("generate-blueprint", { session_id: sessionId });
}

export async function generateFile(
  sessionId: string,
  promptTemplateId: string,
): Promise<{ file_id: string; storage_path: string; preview: string }> {
  return invoke("generate-file", {
    session_id: sessionId,
    prompt_template_id: promptTemplateId,
  });
}

export async function validateHubspot(clientId: string): Promise<{ checks: any[] }> {
  return invoke("validate-hubspot", { client_id: clientId });
}

export async function downloadFile(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("generated-files")
    .download(storagePath);
  if (error) throw error;
  return await data.text();
}
