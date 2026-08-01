import React from "react";
import { Sparkles, Compass, Star, Trophy, BookOpen, Layers } from "lucide-react";

/**
 * AdventurePreview Component
 * 
 * Visually renders an AI-generated or draft AdventurePackage for Admin/Teacher review.
 * 
 * @param {Object} props
 * @param {Object} props.adventurePackage - The AdventurePackage JSON object
 */
export function AdventurePreview({ adventurePackage }) {
  if (!adventurePackage) {
    return (
      <div className="p-6 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
        Tiada AdventurePackage untuk dipaparkan.
      </div>
    );
  }

  const {
    world = {},
    adventure_story = {},
    otan_companion = {},
    mission_journey = [],
    completion_report = {}
  } = adventurePackage;

  return (
    <div className="space-y-6 text-stone-900 dark:text-stone-100">
      {/* 1. World Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-amber-100 p-5 rounded-2xl border-2 border-amber-500/40 shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
          <Compass className="w-4 h-4" />
          <span>{world.world_icon || "🌎"} {world.world_name || "Dunia Pembelajaran"}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-amber-100">
          {world.theme || "Tema Kembara"}
        </h2>
        <p className="text-xs sm:text-sm text-stone-300">
          {world.description}
        </p>
      </div>

      {/* 2. Adventure Story */}
      <div className="bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
          <BookOpen className="w-4 h-4" />
          <span>Kisah Pengembaraan: {adventure_story.title}</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-background/80 rounded-xl border space-y-1">
            <span className="font-black text-muted-foreground uppercase text-[10px] block">Pengenalan</span>
            <p className="font-medium">{adventure_story.introduction}</p>
          </div>
          <div className="p-3 bg-background/80 rounded-xl border space-y-1">
            <span className="font-black text-amber-600 dark:text-amber-400 uppercase text-[10px] block">Masalah</span>
            <p className="font-medium">{adventure_story.problem}</p>
          </div>
          <div className="p-3 bg-background/80 rounded-xl border space-y-1">
            <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase text-[10px] block">Matlamat Misi</span>
            <p className="font-medium">{adventure_story.mission_goal}</p>
          </div>
        </div>
      </div>

      {/* 3. Otan Companion Layer */}
      <div className="bg-stone-900 text-amber-100 p-4 rounded-2xl border border-stone-800 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-lg">
            🦧
          </div>
          <div>
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">Maskot Otan</h4>
            <p className="text-xs text-stone-300">{otan_companion.greeting}</p>
          </div>
        </div>

        {Array.isArray(otan_companion.hint_messages) && otan_companion.hint_messages.length > 0 && (
          <div className="text-xs space-y-1 pt-1 border-t border-stone-800">
            <span className="font-bold text-amber-300">💡 Contoh Petunjuk Otan:</span>
            <ul className="list-disc list-inside text-stone-300 pl-1 space-y-0.5">
              {otan_companion.hint_messages.map((hint, i) => (
                <li key={i}>{hint}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 4. Mission Journey (4 Stage Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Laluan Misi ({mission_journey.length})
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {mission_journey.map((m, idx) => (
            <div
              key={m.mission_id || idx}
              className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                  {m.stage}
                </span>
                <span className="text-xs font-bold text-muted-foreground">Misi {idx + 1}</span>
              </div>
              <h4 className="font-bold text-sm">{m.title}</h4>
              <p className="text-xs text-muted-foreground">{m.objective}</p>

              {/* Rewards preview */}
              <div className="flex items-center gap-2 pt-2 border-t text-[11px] font-bold">
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400" /> +{m.reward?.xp || 50} XP
                </span>
                <span className="text-amber-500">🪙 +{m.reward?.coins || 15}</span>
                {m.reward?.badge && (
                  <span className="text-purple-600 dark:text-purple-400 flex items-center gap-0.5 ml-auto">
                    <Trophy className="w-3 h-3" /> {m.reward.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Completion Summary */}
      {completion_report.skills_mastered && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-1">
          <span className="font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Kemahiran Dikuasai:
          </span>
          <p className="text-emerald-950 dark:text-emerald-100 font-medium">
            {completion_report.skills_mastered.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

export default AdventurePreview;
