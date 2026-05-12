import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Blueprint, GeneratedFile, WizardFormData } from "@/lib/types";

interface WizardState {
  sessionId: string | null;
  clientId: string | null;
  currentStep: number;
  formData: WizardFormData;
  blueprint: Blueprint | null;
  blueprintApproved: boolean;
  generatedFiles: GeneratedFile[];
  setSession: (
    sessionId: string,
    clientId: string,
    step: number,
    formData: WizardFormData,
    blueprint: Blueprint | null,
    approved: boolean,
  ) => void;
  setStep: (step: number) => void;
  updateFormData: (partial: Partial<WizardFormData>) => void;
  setBlueprint: (b: Blueprint | null) => void;
  setBlueprintApproved: (v: boolean) => void;
  setGeneratedFiles: (files: GeneratedFile[]) => void;
  upsertGeneratedFile: (f: GeneratedFile) => void;
  reset: () => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

async function persistSession(sessionId: string, patch: Record<string, unknown>) {
  await supabase.from("wizard_sessions").update(patch).eq("id", sessionId);
}

function scheduleSave(sessionId: string, patch: Record<string, unknown>) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    persistSession(sessionId, patch).catch((e) =>
      console.error("session save failed", e),
    );
  }, 800);
}

export const useWizardStore = create<WizardState>((set, get) => ({
  sessionId: null,
  clientId: null,
  currentStep: 1,
  formData: {},
  blueprint: null,
  blueprintApproved: false,
  generatedFiles: [],
  setSession: (sessionId, clientId, step, formData, blueprint, approved) =>
    set({
      sessionId,
      clientId,
      currentStep: step,
      formData,
      blueprint,
      blueprintApproved: approved,
    }),
  setStep: (step) => {
    set({ currentStep: step });
    const { sessionId } = get();
    if (sessionId) scheduleSave(sessionId, { current_step: step });
  },
  updateFormData: (partial) => {
    const merged = { ...get().formData, ...partial };
    set({ formData: merged });
    const { sessionId } = get();
    if (sessionId) scheduleSave(sessionId, { form_data: merged });
  },
  setBlueprint: (b) => {
    set({ blueprint: b });
    const { sessionId } = get();
    if (sessionId) scheduleSave(sessionId, { blueprint: b });
  },
  setBlueprintApproved: (v) => {
    set({ blueprintApproved: v });
    const { sessionId } = get();
    if (sessionId) scheduleSave(sessionId, { blueprint_approved: v });
  },
  setGeneratedFiles: (files) => set({ generatedFiles: files }),
  upsertGeneratedFile: (f) => {
    const existing = get().generatedFiles;
    const idx = existing.findIndex(
      (x) => x.prompt_template_id === f.prompt_template_id,
    );
    if (idx >= 0) {
      const next = [...existing];
      next[idx] = f;
      set({ generatedFiles: next });
    } else {
      set({ generatedFiles: [...existing, f] });
    }
  },
  reset: () =>
    set({
      sessionId: null,
      clientId: null,
      currentStep: 1,
      formData: {},
      blueprint: null,
      blueprintApproved: false,
      generatedFiles: [],
    }),
}));
