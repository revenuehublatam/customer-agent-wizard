import { useParams } from "react-router-dom";
import { useWizardSession } from "@/hooks/useWizardSession";
import { useWizardStore } from "@/store/wizardStore";
import { AppShell } from "@/components/layout/AppShell";
import { WizardSidebar } from "@/components/layout/WizardSidebar";
import { Step1_ClientIdentification } from "@/components/wizard/Step1_ClientIdentification";
import { Step2_DataSources } from "@/components/wizard/Step2_DataSources";
import { Step3_ToneVoice } from "@/components/wizard/Step3_ToneVoice";
import { Step4_Domains } from "@/components/wizard/Step4_Domains";
import { Step5_Restrictions } from "@/components/wizard/Step5_Restrictions";
import { Step6_Actions } from "@/components/wizard/Step6_Actions";
import { Step7_Blueprint } from "@/components/wizard/Step7_Blueprint";
import { Step8_FileGeneration } from "@/components/wizard/Step8_FileGeneration";

export default function Wizard() {
  const { id: clientId } = useParams();
  const { loading, error, clientName } = useWizardSession(clientId);
  const { currentStep, setStep } = useWizardStore();

  const next = () => setStep(Math.min(currentStep + 1, 8));
  const back = () => setStep(Math.max(currentStep - 1, 1));

  const completedSteps = Array.from(
    { length: Math.max(currentStep - 1, 0) },
    (_, i) => i + 1,
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_ClientIdentification onNext={next} />;
      case 2:
        return <Step2_DataSources onBack={back} onNext={next} />;
      case 3:
        return <Step3_ToneVoice onBack={back} onNext={next} />;
      case 4:
        return <Step4_Domains onBack={back} onNext={next} />;
      case 5:
        return <Step5_Restrictions onBack={back} onNext={next} />;
      case 6:
        return <Step6_Actions onBack={back} onNext={next} />;
      case 7:
        return <Step7_Blueprint onBack={back} onNext={next} />;
      case 8:
        return <Step8_FileGeneration onBack={back} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Cargando sesión...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-destructive">
        Error: {error}
      </div>
    );
  }

  return (
    <AppShell clientName={clientName}>
      <WizardSidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
        onSelect={setStep}
      />
      <div className="flex-1 overflow-auto">{renderStep()}</div>
    </AppShell>
  );
}
