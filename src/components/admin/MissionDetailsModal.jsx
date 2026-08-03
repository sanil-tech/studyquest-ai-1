import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Eye, Edit3, CheckCircle2, Layers, BookOpen } from "lucide-react";

export default function MissionDetailsModal({
  isOpen,
  onClose,
  title = "Senarai Misi Dijana",
  subtitle = "Pilih misi untuk pratonton atau sunting terus di Admin Studio",
  missions = [],
  onEditMission,
  onPreviewMission
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMissions = useMemo(() => {
    if (!searchTerm.trim()) return missions;
    const term = searchTerm.toLowerCase();
    return missions.filter(
      (m) =>
        (m.sp_code && m.sp_code.toLowerCase().includes(term)) ||
        (m.title && m.title.toLowerCase().includes(term)) ||
        (m.subject_name && m.subject_name.toLowerCase().includes(term)) ||
        (m.year_level && m.year_level.toLowerCase().includes(term))
    );
  }, [missions, searchTerm]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl max-h-[85vh] bg-stone-900 border-2 border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Modal Header */}
          <div className="p-6 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Butiran Misi KSSR
                </span>
              </div>
              <h2 className="text-xl font-black text-white">{title}</h2>
              <p className="text-xs text-stone-400 font-medium">{subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 bg-stone-950/60 border-b border-stone-800/80 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari mengikut Kod SP, tajuk misi, subjek, atau tahun..."
                className="w-full bg-stone-900 border border-stone-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-amber-500/50"
              />
            </div>
            <span className="text-xs font-bold text-stone-400 whitespace-nowrap">
              {filteredMissions.length} Rekod Dijumpai
            </span>
          </div>

          {/* Table / Content List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredMissions.length === 0 ? (
              <div className="py-12 text-center text-stone-500 space-y-2">
                <BookOpen className="w-10 h-10 mx-auto opacity-30 text-amber-400" />
                <p className="text-xs font-bold">Tiada misi dijumpai untuk padanan ini.</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-800/80 border border-stone-800/80 rounded-2xl overflow-hidden bg-stone-950/40">
                {filteredMissions.map((mission, idx) => (
                  <div
                    key={mission.id || idx}
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-900/60 transition-colors"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-500/30 text-[10px] font-black rounded-lg uppercase">
                          SP {mission.sp_code || "1.4.1"}
                        </span>
                        <span className="text-xs text-stone-400 font-bold">
                          {mission.subject_name || "Matematik"} · {mission.year_level || "Tahun 1"}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          9/9 Langkah Lengkap ✅
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white truncate">
                        {mission.title || mission.topic_name || `Kembara SP ${mission.sp_code}`}
                      </h4>
                      <p className="text-[11px] text-stone-400 font-medium truncate">
                        {mission.description || `Modul pengembaraan KSSR ${mission.year_level || "Tahun 1"} mengikut piawaian DSKP.`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => onPreviewMission && onPreviewMission(mission)}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pratonton</span>
                      </button>
                      <button
                        onClick={() => onEditMission && onEditMission(mission)}
                        className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sunting</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-stone-950/80 border-t border-stone-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl transition-all"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
