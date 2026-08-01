import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  Video,
  GitFork,
  Image,
  HelpCircle,
  Gamepad2,
  Sparkles,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

const ICONS = {
  notes: FileText,
  flashcards: Layers,
  video: Video,
  mindmap: GitFork,
  infographic: Image,
  questions: HelpCircle,
  activities: Gamepad2,
  explanations: Sparkles,
  common_mistakes: AlertTriangle,
  teacher_guide: BookOpen,
};

export default function CompletenessDashboard({ completeness }) {
  if (!completeness) return null;

  const checks = completeness.checks || {};
  const counts = completeness.counts || {};

  const items = [
    {
      key: "notes",
      label: "Notes",
      met: !!checks.notes,
      count: checks.notes ? "✓" : "✗",
    },
    {
      key: "flashcards",
      label: "Flashcard",
      met: !!checks.flashcards,
      count: checks.flashcards ? (counts.flashcards ? `${counts.flashcards} (min 5)` : "✓ (min 5)") : `${counts.flashcards || 0} (min 5)`,
    },
    {
      key: "video",
      label: "Video",
      met: !!checks.video,
      count: checks.video ? (counts.video ? `${counts.video}` : "✓") : "✗",
    },
    {
      key: "mindmap",
      label: "Mind Map",
      met: !!checks.mindmap,
      count: checks.mindmap ? (counts.mindmap ? `${counts.mindmap}` : "✓") : "✗",
    },
    {
      key: "infographic",
      label: "Infographic",
      met: !!checks.infographic,
      count: checks.infographic ? (counts.infographic ? `${counts.infographic}` : "✓") : "✗",
    },
    {
      key: "questions",
      label: "Quiz",
      met: !!checks.questions,
      count: checks.questions ? (counts.questions ? `${counts.questions} (min 10)` : "✓ (min 10)") : `${counts.questions || 0} (min 10)`,
    },
    {
      key: "activities",
      label: "Interactive Activity",
      met: !!checks.activities,
      count: checks.activities ? (counts.activities ? `${counts.activities} (min 1)` : "✓ (min 1)") : `${counts.activities || 0} (min 1)`,
    },
    {
      key: "explanations",
      label: "AI Explanation",
      met: !!(checks.explanations ?? checks.ai_explanation),
      count: (checks.explanations || checks.ai_explanation) ? ((counts.explanations || counts.ai_explanation) ? `${counts.explanations || counts.ai_explanation}` : "✓") : "✗",
    },
    {
      key: "common_mistakes",
      label: "Common Mistakes",
      met: !!checks.common_mistakes,
      count: checks.common_mistakes ? (counts.common_mistakes ? `${counts.common_mistakes}` : "✓") : "✗",
    },
    {
      key: "teacher_guide",
      label: "Teacher Guide",
      met: !!checks.teacher_guide,
      count: checks.teacher_guide ? "✓" : "✗",
    },
  ];

  const metCount = items.filter((item) => item.met).length;
  const pct = Math.round((metCount / items.length) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-heading font-bold">Dashboard Kesempurnaan</h3>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-black text-primary">{pct}%</div>
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full transition-all rounded-full"
              style={{
                width: `${pct}%`,
                background: pct === 100 ? "#22c55e" : pct >= 60 ? "#eab308" : "#ef4444",
              }}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => {
          const Icon = ICONS[item.key] || HelpCircle;
          return (
            <div
              key={item.key}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                item.met ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className={`p-2 rounded-lg ${item.met ? "bg-emerald-100" : "bg-amber-100"}`}>
                <Icon className={`w-4 h-4 ${item.met ? "text-emerald-600" : "text-amber-600"}`} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.count}</div>
              </div>
              {item.met ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
