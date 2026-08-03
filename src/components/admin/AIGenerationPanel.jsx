import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle2, ShieldCheck, Layers, BookOpen } from "lucide-react";
import { AdventurePreview } from "@/components/admin/AdventurePreview";
import { generateKSSRMissionPackage } from "@/services/aiContentEngine";

export default function AIGenerationPanel({
  spCode = "1.1.1",
  spDescription = "",
  skCode = "1.1",
  grade = "Tahun 1",
  subject = "Matematik",
  topic = "Nombor hingga 100",
  mode = "JUNIOR",
  pbdTarget = "TP3",
  onPackageGenerated
}) {
  const [generating, setGenerating] = useState(false);
  const [generatedPackage, setGeneratedPackage] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  const handleGenerateMission = async () => {
    setGenerating(true);
    setValidationResult(null);

    try {
      const res = await generateKSSRMissionPackage({
        spCode,
        spDescription,
        skCode,
        grade,
        subject,
        topic,
        pbdTarget
      });

      if (res.success) {
        setGeneratedPackage(res.adventurePackage);
        setValidationResult({ valid: true, errors: [] });
        if (onPackageGenerated) onPackageGenerated(res.adventurePackage);
      } else {
        setValidationResult({ valid: false, errors: res.validation_errors || ["Gagal mengesahkan skema."] });
      }
    } catch (err) {
      console.error("AI Generation error:", err);
      setValidationResult({ valid: false, errors: [err.message || "Ralat sistem semasa menjana."] });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Action Header */}
      <div className="p-6 bg-gradient-to-r from-amber-950/40 via-stone-900 to-indigo-950/40 rounded-3xl border-2 border-amber-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                mode === "JUNIOR" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
              }`}>
                MOD {mode} ({grade})
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                PBD {pbdTarget}
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1">
              Jana Pakej Misi 9-Langkah KSSR
            </h3>
            <p className="text-xs text-stone-400">
              SP {spCode}: {spDescription || topic}
            </p>
          </div>

          <Button
            size="lg"
            disabled={generating}
            onClick={handleGenerateMission}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-sm px-6 h-12 rounded-2xl shadow-lg border-b-4 border-amber-600 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menjana Misi AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>[ 🪄 Generate KSSR Mission ]</span>
              </>
            )}
          </Button>
        </div>

        {/* Validation Status Badge */}
        {validationResult && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-3 ${
            validationResult.valid
              ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/50 border-rose-500/40 text-rose-300"
          }`}>
            {validationResult.valid ? (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-emerald-200">Sah & Patuh Skema 9-Step Macro Journey!</p>
                  <p className="text-[11px] text-emerald-400/80 font-medium">Kesemua 9 langkah termasuk 4-Blok CPA (Step 2) berjaya disahkan.</p>
                </div>
              </>
            ) : (
              <div>
                <p className="font-black text-rose-200 mb-1">Ralat Pematuhan Skema:</p>
                <ul className="list-disc list-inside space-y-0.5 text-rose-300/90 font-mono text-[11px]">
                  {validationResult.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Preview Container */}
      {generatedPackage && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-sm font-black text-stone-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" /> Pratinjau Misi KSSR (AdventurePreview)
            </h4>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Berjaya Dijana
            </span>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl">
            <AdventurePreview adventurePackage={generatedPackage} />
          </div>
        </div>
      )}
    </div>
  );
}