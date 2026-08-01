import React from "react";
import { CheckCircle2, XCircle, AlertCircle, ShieldCheck } from "lucide-react";

/**
 * AdventureValidationPanel Component
 * 
 * Displays schema validation checklist for AdventurePackage objects in Content Studio.
 * 
 * @param {Object} props
 * @param {Object} props.adventurePackage - The AdventurePackage JSON to validate
 */
export function AdventureValidationPanel({ adventurePackage }) {
  if (!adventurePackage) {
    return (
      <div className="p-4 border rounded-xl text-xs text-muted-foreground bg-muted/30">
        Menunggu data AdventurePackage untuk pengesahan schema...
      </div>
    );
  }

  const {
    world,
    adventure_story,
    otan_companion,
    mission_journey,
    assessment,
    completion_report
  } = adventurePackage;

  // Check 1: Required sections
  const hasSections = Boolean(
    world &&
    adventure_story &&
    otan_companion &&
    mission_journey &&
    assessment &&
    completion_report
  );

  // Check 2: Four mission stages
  const stages = Array.isArray(mission_journey) ? mission_journey.map(m => m.stage) : [];
  const requiredStages = ["DISCOVER", "INTERACT", "PRACTICE", "CHALLENGE"];
  const hasFourStages = requiredStages.every(stage => stages.includes(stage));

  // Check 3: Assessment exists
  const hasAssessment = Boolean(
    assessment &&
    Array.isArray(assessment.quiz) &&
    assessment.quiz.length > 0 &&
    assessment.ai_explanation
  );

  // Check 4: Otan dialogue exists
  const hasOtanDialogue = Boolean(
    otan_companion &&
    otan_companion.greeting &&
    Array.isArray(otan_companion.hint_messages) &&
    otan_companion.hint_messages.length > 0 &&
    Array.isArray(otan_companion.encouragement)
  );

  const checks = [
    {
      id: "sections",
      label: "6 Seksyen Wajib Wujud",
      detail: "World, Story, Otan, Mission Journey, Assessment, Report",
      passed: hasSections
    },
    {
      id: "stages",
      label: "4 Peringkat Misi Kembara",
      detail: "DISCOVER, INTERACT, PRACTICE, CHALLENGE",
      passed: hasFourStages
    },
    {
      id: "assessment",
      label: "Soalan Penilaian & AI Explanation",
      detail: "Kuiz dan syarat penguasaan murid lengkap",
      passed: hasAssessment
    },
    {
      id: "otan",
      label: "Dialog & Petunjuk Maskot Otan",
      detail: "Ucapan aluan, petunjuk, dan pujian lengkap",
      passed: hasOtanDialogue
    }
  ];

  const allPassed = checks.every(c => c.passed);

  return (
    <div className="p-4 border-2 rounded-xl bg-card text-card-foreground space-y-3">
      <div className="flex items-center justify-between pb-2 border-b">
        <h4 className="font-heading font-bold text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" /> Audit Pengesahan Schema
        </h4>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
            allPassed
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
          }`}
        >
          {allPassed ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" /> Lulus Schema
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5" /> Perlu Perhatian
            </>
          )}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {checks.map(check => (
          <div
            key={check.id}
            className={`p-2.5 rounded-lg border text-xs space-y-0.5 flex items-start gap-2 ${
              check.passed
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            {check.passed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">{check.label}</span>
              <span className="text-[11px] text-muted-foreground">{check.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdventureValidationPanel;
