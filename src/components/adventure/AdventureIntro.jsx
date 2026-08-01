import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Target, Compass, Play, CheckCircle2 } from "lucide-react";

/**
 * AdventureIntro Component
 * 
 * Opening experience when Pengembara enters a new StudyQuest Learning Adventure.
 * 
 * @param {Object} props
 * @param {Object} props.adventure - Structured adventure object
 * @param {Function} props.onStart - Callback to start adventure and view quest map
 * @param {string} props.studentName - Student display name
 */
export function AdventureIntro({
  adventure,
  onStart,
  studentName = "Pengembara"
}) {
  if (!adventure) return null;

  const worldName = adventure.world?.name || adventure.worldName || "Dunia Pembelajaran";
  const adventureTitle = adventure.adventure?.title || adventure.adventureTitle || "Kembara Utama";
  const description = adventure.adventure?.description || "Kembara interaktif bagi menguasai topik ini.";
  const mascot = adventure.world?.mascot || adventure.mascot || {
    name: "Otan",
    avatar: "🦧",
    role: "Rakan Pengembaraan Pengembara"
  };

  const totalXp = adventure.totalXpAvailable || missionsXpSum(adventure.missions) || 300;
  const totalCoins = adventure.totalCoinsAvailable || missionsCoinsSum(adventure.missions) || 50;
  const bossBadge = adventure.missions?.find(m => m.reward?.badge)?.reward?.badge || `${worldName} Master`;

  const missionsCount = adventure.missions?.length || 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-2 sm:p-4 text-stone-100">
      {/* Hero Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-stone-900 to-amber-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6"
      >
        {/* Background Glow FX */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* World Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm">
          <Compass className="w-4 h-4 text-amber-400" />
          🌎 {worldName}
        </div>

        {/* Adventure Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black text-amber-100 tracking-tight leading-tight">
            {adventureTitle}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-medium max-w-lg mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Otan Companion Greeting Speech Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="relative bg-stone-900/90 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-5 text-left flex items-start gap-4 shadow-xl"
        >
          {/* Otan Mascot Avatar */}
          <div className="shrink-0 flex flex-col items-center">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-lg flex items-center justify-center text-4xl border-2 border-amber-200"
            >
              {mascot.avatar || "🦧"}
            </motion.div>
            <span className="mt-1 text-[10px] font-black tracking-wider uppercase text-amber-300 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-500/30">
              {mascot.name || "Otan"}
            </span>
          </div>

          {/* Otan Dialogue */}
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {mascot.role || "Rakan Pengembaraan"}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-amber-50 leading-relaxed">
              "Hai Pengembara {studentName}! Otan jumpa <span className="text-amber-300 font-bold">{missionsCount} misi baru</span> untuk kamu! Mari kita terokai rahsia {adventureTitle} bersama-sama!"
            </p>
          </div>
        </motion.div>

        {/* Learning Objectives List */}
        <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-4 text-left space-y-3">
          <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" /> Matlamat Kembara Ini
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-stone-200">
            {adventure.missions?.map((m, idx) => (
              <li key={m.id || idx} className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong className="text-amber-200">{m.title}</strong>: {m.stage} stage</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reward Preview Stats */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
            Ganjaran Kembara Yang Menanti
          </span>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-stone-900/80 p-3 rounded-2xl border border-amber-500/30 text-center">
              <span className="text-[10px] text-stone-400 font-bold block uppercase">⭐ Jumlah XP</span>
              <span className="text-base sm:text-lg font-black text-amber-400">+{totalXp} XP</span>
            </div>
            <div className="bg-stone-900/80 p-3 rounded-2xl border border-amber-500/30 text-center">
              <span className="text-[10px] text-stone-400 font-bold block uppercase">🪙 Syiling</span>
              <span className="text-base sm:text-lg font-black text-amber-300">+{totalCoins}</span>
            </div>
            <div className="bg-stone-900/80 p-3 rounded-2xl border border-amber-500/30 text-center truncate">
              <span className="text-[10px] text-stone-400 font-bold block uppercase">🏅 Lencana</span>
              <span className="text-xs sm:text-sm font-black text-emerald-300 truncate block mt-0.5">{bossBadge}</span>
            </div>
          </div>
        </div>

        {/* Start Adventure Main Action Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="w-full py-4 sm:py-5 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-amber-500/25 border-b-4 border-amber-700 transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-stone-950" />
          Mulakan Pengembaraan!
        </motion.button>
      </motion.div>
    </div>
  );
}

function missionsXpSum(missions = []) {
  return missions.reduce((sum, m) => sum + (m.reward?.xp || m.xpReward || 0), 0);
}

function missionsCoinsSum(missions = []) {
  return missions.reduce((sum, m) => sum + (m.reward?.coins || m.coinsReward || 0), 0);
}
