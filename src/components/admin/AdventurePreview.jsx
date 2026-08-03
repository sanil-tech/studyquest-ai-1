import React from "react";
import { Sparkles, Compass, Star, Trophy, BookOpen, Layers, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

/**
 * AdventurePreview Component
 * 
 * Visually renders an AI-generated or draft AdventurePackage (9-Step Macro Journey) for Admin/Teacher review.
 * 
 * @param {Object} props
 * @param {Object} props.adventurePackage - The AdventurePackage JSON object
 */
export function AdventurePreview({ adventurePackage }) {
  if (!adventurePackage) {
    return (
      <div className="p-6 text-center text-stone-400 border-2 border-dashed border-stone-800 rounded-2xl">
        Tiada AdventurePackage untuk dipaparkan.
      </div>
    );
  }

  const {
    spCode = "1.1.1",
    skCode = "1.1",
    grade = "Tahun 1",
    mode = "JUNIOR",
    pbdTarget = "TP3",
    world = {},
    adventure_story = {},
    otan_companion = {},
    steps = [],
    mission_journey = [],
    completion_report = {}
  } = adventurePackage;

  const displaySteps = (Array.isArray(steps) && steps.length > 0) ? steps : (Array.isArray(mission_journey) ? mission_journey : []);

  return (
    <div className="space-y-6 text-stone-100 text-left font-sans">
      {/* 1. World Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-indigo-950 p-5 rounded-2xl border-2 border-amber-500/40 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
            <Compass className="w-4 h-4" />
            <span>{world.world_icon || "🌎"} {world.world_name || "Dunia Pembelajaran KSSR"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 uppercase">
              MOD {mode} ({grade})
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
              PBD {pbdTarget}
            </span>
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-amber-100">
          {adventure_story.title || world.theme || `Misi Pembelajaran SP ${spCode}`}
        </h2>
        <p className="text-xs sm:text-sm text-stone-300">
          {world.description || `Pengembaraan berpandu bagi Standard Pembelajaran ${spCode}.`}
        </p>
      </div>

      {/* 2. Adventure Story Context */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
          <BookOpen className="w-4 h-4" />
          <span>Kisah Pengembaraan: {adventure_story.title || "Kisah Misi KSSR"}</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 space-y-1">
            <span className="font-black text-stone-400 uppercase text-[10px] block">Pengenalan</span>
            <p className="font-medium text-stone-200">{adventure_story.introduction || "Pelajaran bermula..."}</p>
          </div>
          <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 space-y-1">
            <span className="font-black text-amber-400 uppercase text-[10px] block">Cabaran Utama</span>
            <p className="font-medium text-stone-200">{adventure_story.problem || "Selesaikan soalan untuk maju!"}</p>
          </div>
          <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 space-y-1">
            <span className="font-black text-emerald-400 uppercase text-[10px] block">Matlamat Misi</span>
            <p className="font-medium text-stone-200">{adventure_story.mission_goal || "Kuasai kemahiran DSKP."}</p>
          </div>
        </div>
      </div>

      {/* 3. Mascot Companion Layer */}
      <div className="bg-stone-950 text-amber-100 p-4 rounded-2xl border border-stone-800 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
            {mode === "SENIOR" ? "🦊" : "🐢"}
          </div>
          <div>
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
              {mode === "SENIOR" ? "Maskot Ejen Suku" : "Maskot Suku Penyu"}
            </h4>
            <p className="text-xs text-stone-200 font-medium">"{otan_companion.greeting || "Hai! Mari kita belajar bersama!"}"</p>
          </div>
        </div>
      </div>

      {/* 4. 9-Step Macro Journey Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <h3 className="font-black text-sm text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" /> Pakej Misi 9-Langkah KSSR ({displaySteps.length} Langkah)
          </h3>
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Berjaya Dijana
          </span>
        </div>

        <div className="space-y-3">
          {displaySteps.map((st, idx) => {
            const stepNum = st.step_number || st.order_number || idx + 1;
            const stepType = st.step_type || st.stage || "STEP";

            return (
              <div key={idx} className="p-4 rounded-2xl border border-stone-800 bg-stone-950 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center">
                      {stepNum}
                    </span>
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      Langkah {stepNum}: {stepType}
                    </span>
                  </div>
                  <span className="text-xs text-stone-400 font-semibold">{st.title || st.name}</span>
                </div>

                {/* Step 1: Briefing */}
                {stepType === "BRIEFING" && (
                  <div className="space-y-1.5 text-xs text-stone-300">
                    <p><strong>Naratif Hook:</strong> {st.payload?.story_hook || st.description}</p>
                    {st.payload?.mascot_dialogue && (
                      <p className="text-amber-300 font-bold bg-stone-900 p-2.5 rounded-xl border border-stone-800">
                        🗣️ "{st.payload.mascot_dialogue}"
                      </p>
                    )}
                  </div>
                )}

                {/* Step 2: Engagement Micro-CPA Blocks */}
                {stepType === "ENGAGEMENT" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {(st.cpa_blocks || [
                      { block_type: "VISUAL_STORY", title: "Visual Story", content: { text: "Visual story" } },
                      { block_type: "COMPARISON_SPLIT", title: "Comparison", content: { left: "A", right: "B" } },
                      { block_type: "STEP_BY_STEP", title: "Steps", content: { steps: ["1"] } },
                      { block_type: "MYTH_BUSTER", title: "Myth Buster", content: { myth: "M", fact: "F" } }
                    ]).map((cpa, cIdx) => (
                      <div key={cIdx} className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          {cpa.block_type}
                        </span>
                        <h5 className="font-bold text-white text-[11px] mt-1">{cpa.title}</h5>
                        {cpa.block_type === "VISUAL_STORY" && <p className="text-stone-300 text-[11px]">{cpa.content?.text}</p>}
                        {cpa.block_type === "COMPARISON_SPLIT" && (
                          <div className="grid grid-cols-2 gap-1 text-[10px] pt-1">
                            <span className="p-1 bg-stone-950 rounded text-stone-300">⬅️ {cpa.content?.left}</span>
                            <span className="p-1 bg-stone-950 rounded text-stone-300">➡️ {cpa.content?.right}</span>
                          </div>
                        )}
                        {cpa.block_type === "STEP_BY_STEP" && (
                          <ol className="list-decimal list-inside text-stone-300 text-[10px] space-y-0.5">
                            {Array.isArray(cpa.content?.steps) ? cpa.content.steps.map((sItem, sI) => <li key={sI}>{sItem}</li>) : <li>{cpa.content?.text}</li>}
                          </ol>
                        )}
                        {cpa.block_type === "MYTH_BUSTER" && (
                          <div className="text-[10px] space-y-0.5">
                            <p className="text-rose-400 font-bold">❌ {cpa.content?.myth}</p>
                            <p className="text-emerald-400 font-bold">✅ {cpa.content?.fact}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 3: Lesson Breakdown */}
                {stepType === "LESSON" && (
                  <div className="space-y-2 text-xs">
                    <p className="text-stone-200 font-bold">{st.payload?.concept_summary || st.objective || "Penerangan konsep utama KSSR."}</p>
                    {Array.isArray(st.payload?.key_points) && (
                      <ul className="list-disc list-inside text-stone-400 space-y-0.5">
                        {st.payload.key_points.map((kp, kI) => <li key={kI}>{kp}</li>)}
                      </ul>
                    )}
                  </div>
                )}

                {/* Step 4: Practice Interactive Widget */}
                {stepType === "PRACTICE" && (
                  <div className="text-xs space-y-1">
                    <p className="text-emerald-400 font-bold">Widget Interaktif: <span className="underline">{st.payload?.widget_type || "base_ten_blocks"}</span></p>
                    <p className="text-stone-300">Objektif Aktiviti: {st.payload?.interactive_data?.topic || "Latihan Pengukuhan KSSR"}</p>
                  </div>
                )}

                {/* Step 5: Flashcards */}
                {stepType === "FLASHCARDS" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(st.cards || [{ term: "Terma KSSR", definition: "Definisi asas" }]).map((card, cI) => (
                      <div key={cI} className="p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                        <span className="font-black text-amber-400 block">{card.term}</span>
                        <span className="text-[11px] text-stone-300">{card.definition}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 6: Mini Game */}
                {stepType === "MINI_GAME" && (
                  <div className="text-xs space-y-1">
                    <p className="text-blue-300 font-bold">Permainan Mini: {st.payload?.game_type || "SortingGame"}</p>
                    <p className="text-stone-400">Sasaran: {st.payload?.game_config?.targetCategory || "Utama"}</p>
                  </div>
                )}

                {/* Step 7: Quiz Questions */}
                {stepType === "QUIZ" && (
                  <div className="space-y-2 text-xs">
                    {(st.questions || [{ question: "Soalan Kuiz PBD KSSR?", options: ["A", "B", "C"], explanation: "Penerangan jawapan tepat." }]).map((q, qI) => (
                      <div key={qI} className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-white">❓ {q.question}</p>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                            {q.pbd_level || "TP3"}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400">Pilihan: {Array.isArray(q.options) ? q.options.join(" | ") : q.options}</p>
                        <p className="text-[10px] text-emerald-400 font-medium">Penerangan: {q.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 8: Complete */}
                {stepType === "COMPLETE" && (
                  <div className="text-xs space-y-1">
                    <p className="text-teal-300 font-bold">{st.payload?.mastery_summary || "Penguasaan SP KSSR Selesai."}</p>
                    <p className="text-amber-400 font-bold">🏆 Ganjaran: +{st.payload?.xp_earned || 100} XP | 🪙 +{st.payload?.coins_earned || 25} Syiling</p>
                  </div>
                )}

                {/* Step 9: Reward */}
                {stepType === "REWARD" && (
                  <div className="text-xs flex items-center justify-between bg-stone-900 p-3 rounded-xl border border-stone-800">
                    <div>
                      <p className="font-black text-yellow-300">Lencana: {st.payload?.badge || "Wira KSSR"}</p>
                      <p className="text-stone-400 text-[11px]">Item Drop: {st.payload?.item_drop || "Pingat Kembara"}</p>
                    </div>
                    <span className="text-2xl">{st.payload?.item_icon || "👑"}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Completion Summary */}
      {completion_report.skills_mastered && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-xs space-y-1">
          <span className="font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Kemahiran Dikuasai:
          </span>
          <p className="text-emerald-100 font-medium">
            {completion_report.skills_mastered.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

export default AdventurePreview;
