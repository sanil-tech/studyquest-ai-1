import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, TrendingUp, Zap, Clock, ShieldAlert } from "lucide-react";

/**
 * AdventureJournalCard Component
 * 
 * Displays Otan's learning journey summary, recent chronological milestones,
 * learning velocity, and key insights.
 * 
 * @param {Object} props
 * @param {Object} props.journeyData - Journey Intelligence object from buildLearningJourney
 * @param {Function} props.onOpenJournal - Handler to view detailed journal analysis
 */
export function AdventureJournalCard({ journeyData, onOpenJournal }) {
  const otanSummary = journeyData?.otan_summary || "Otan gembira melihat kesungguhan kamu meneroka kembara ilmu hari ini!";
  const momentum = journeyData?.learning_momentum || "STABLE";
  const retention = journeyData?.retention_score ?? 75;
  const speed = journeyData?.learning_speed || "NORMAL";
  const timeline = journeyData?.timeline || [];
  const insights = journeyData?.insights || { strengths: [], improvements: [], celebrations: [] };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="p-5 sm:p-6 rounded-3xl border-2 bg-card text-card-foreground shadow-sm space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm uppercase tracking-wide text-foreground">
              Jurnal Kembara Otan
            </h3>
            <span className="text-[11px] text-muted-foreground block">
              Nota pintar analisis kemajuan murid
            </span>
          </div>
        </div>

        <button
          onClick={onOpenJournal}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          Analisis Penuh
        </button>
      </div>

      {/* Otan Summary Box */}
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-950 dark:text-indigo-100 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🦧</span>
          <span className="font-black text-xs uppercase text-indigo-600 dark:text-indigo-300">
            Catatan Otan
          </span>
        </div>
        <p className="text-xs font-medium leading-relaxed italic">
          "{otanSummary}"
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl border bg-muted/40 space-y-0.5">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> Momentum
          </span>
          <span className="font-black text-emerald-600 dark:text-emerald-400">{momentum}</span>
        </div>

        <div className="p-2.5 rounded-xl border bg-muted/40 space-y-0.5">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" /> Ingatan
          </span>
          <span className="font-black text-amber-600 dark:text-amber-400">{retention}%</span>
        </div>

        <div className="p-2.5 rounded-xl border bg-muted/40 space-y-0.5">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-indigo-500" /> Kelajuan
          </span>
          <span className="font-black text-indigo-600 dark:text-indigo-400">{speed}</span>
        </div>
      </div>

      {/* Timeline Preview */}
      {timeline.length > 0 && (
        <div className="space-y-2 pt-1 border-t">
          <span className="text-xs font-bold text-muted-foreground block">
            Garisan Masa Kembara Terkini ({timeline.length} Aktiviti)
          </span>
          <div className="space-y-1.5">
            {timeline.slice(-2).map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border bg-background text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-bold">{item.topic}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">{item.accuracy}% Tepat</span>
                  <span className="text-muted-foreground">{item.mastery}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Flags or Celebrations */}
      {insights.risk_flags && insights.risk_flags.length > 0 ? (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Fokus Cadangan Otan:</span>
            <span className="text-[11px]">{insights.risk_flags[0]}</span>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}

export default React.memo(AdventureJournalCard);
