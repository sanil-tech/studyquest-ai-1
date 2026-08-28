// src/components/widgets/DragAndDropWidget.jsx
// Interactive Drag-and-Drop & Category Sorter EduGame Widget

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gamepad2, RefreshCcw } from "lucide-react";
import confetti from "canvas-confetti";

export default function DragAndDropWidget({
  payload = {},
  instruction = "Isih item ke dalam kumpulan yang betul!",
  onComplete = () => {},
  isCompleted = false,
  onMistake = () => {}
}) {
  // Normalize categories → targets (accept payload.targets OR payload.categories array)
  const categoriesList =
    Array.isArray(payload.categories) && payload.categories.length > 0
      ? payload.categories
      : Array.isArray(payload.targets)
      ? payload.targets.map((t) => t.category).filter(Boolean)
      : [];

  const targetsList =
    Array.isArray(payload.targets) && payload.targets.length > 0
      ? payload.targets
      : categoriesList.map((c) => ({ category: c, title: c }));

  // Normalize items: accept [{id,label,category}] or legacy [string]
  const rawItems = Array.isArray(payload.items) && payload.items.length > 0 ? payload.items : [];
  const itemsList = rawItems.map((it, idx) => {
    if (typeof it === "string") {
      return { id: String(idx + 1), label: it, category: null };
    }
    return {
      id: String(it.id ?? idx + 1),
      label: it.label || it.text || String(it),
      category: it.category || null,
    };
  });

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [placedItems, setPlacedItems] = useState({}); // { [itemId]: targetCategory }
  const [feedback, setFeedback] = useState(null);

  const handleSelectItem = (id) => {
    if (placedItems[id]) return;
    setSelectedItemId(id);
    setFeedback(null);
  };

  const handlePlaceInTarget = (targetCategory) => {
    if (!selectedItemId) {
      setFeedback({ type: "warning", message: "Pilih item terlebih dahulu!" });
      return;
    }

    const item = itemsList.find(i => i.id === selectedItemId);
    if (!item) return;

    if (item.category === targetCategory) {
      const newPlaced = { ...placedItems, [selectedItemId]: targetCategory };
      setPlacedItems(newPlaced);
      setSelectedItemId(null);
      setFeedback({ type: "success", message: `Tepat! "${item.label}" disisihkan dengan betul. 🎉` });

      if (Object.keys(newPlaced).length === itemsList.length) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        onComplete();
      }
    } else {
      setFeedback({ type: "error", message: `Maaflah, "${item.label}" bukan untuk kumpulan ini. Cuba lagi!` });
      onMistake();
      setSelectedItemId(null);
    }
  };

  const handleReset = () => {
    setPlacedItems({});
    setSelectedItemId(null);
    setFeedback(null);
  };

  const isAllPlaced = Object.keys(placedItems).length === itemsList.length;

  return (
    <div className="p-5 bg-gradient-to-br from-amber-950/40 via-stone-900 to-cyan-950/40 border-2 border-amber-500/30 rounded-3xl space-y-5 text-left shadow-xl font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-amber-400" />
          <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider">Aktiviti Pengisihan (Drag & Drop)</h4>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
          {Object.keys(placedItems).length} / {itemsList.length} Disisih
        </span>
      </div>

      <p className="text-xs font-bold text-stone-200">
        📌 {payload.instruction || instruction}
      </p>

      {/* ITEM BANK */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">
          1. Pilih Item:
        </span>
        <div className="flex flex-wrap gap-2">
          {itemsList.map((item) => {
            const isPlaced = !!placedItems[item.id];
            const isSelected = selectedItemId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                disabled={isPlaced}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all border-2 ${
                  isPlaced
                    ? "bg-stone-950 border-stone-800 text-stone-600 opacity-40 cursor-not-allowed"
                    : isSelected
                    ? "bg-amber-400 border-amber-300 text-stone-950 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-105"
                    : "bg-stone-900 border-stone-700 text-amber-200 hover:border-amber-400 hover:bg-stone-800"
                }`}
              >
                {item.label} {isPlaced && "✓"}
              </button>
            );
          })}
        </div>
      </div>

      {/* TARGET CATEGORIES */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">
          2. Klik Kumpulan Untuk Meletakkan Item:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {targetsList.map((target) => {
            const itemsInTarget = itemsList.filter(i => placedItems[i.id] === target.category);

            return (
              <button
                key={target.category}
                onClick={() => handlePlaceInTarget(target.category)}
                className="p-4 bg-stone-950/80 hover:bg-stone-900 border-2 border-stone-800 hover:border-cyan-500/50 rounded-2xl text-left space-y-2 transition-all min-h-[100px] flex flex-col justify-between"
              >
                <span className="text-xs font-black text-cyan-300 block">{target.title}</span>
                
                <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                  {itemsInTarget.length > 0 ? (
                    itemsInTarget.map(it => (
                      <span key={it.id} className="px-2.5 py-1 rounded-xl bg-cyan-950 text-cyan-200 text-[11px] font-bold border border-cyan-500/40">
                        {it.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-stone-600 italic">Klik di sini untuk letak item...</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FEEDBACK & CONTROLS */}
      {feedback && (
        <div className={`p-3 rounded-xl border text-xs font-bold ${
          feedback.type === "success" ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300" :
          feedback.type === "error" ? "bg-rose-950/60 border-rose-500/40 text-rose-300" :
          "bg-amber-950/60 border-amber-500/40 text-amber-300"
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleReset}
          variant="outline"
          className="px-3 bg-stone-950 border-stone-800 text-stone-400 hover:text-white h-12 rounded-xl"
        >
          <RefreshCcw className="w-4 h-4 mr-1" /> Semula
        </Button>

        <Button
          onClick={onComplete}
          className={`flex-1 h-12 rounded-xl font-black text-sm transition-all ${
            isAllPlaced || isCompleted
              ? "bg-emerald-500 hover:bg-emerald-400 text-stone-950 border-b-4 border-emerald-700"
              : "bg-amber-500 hover:bg-amber-400 text-stone-950 border-b-4 border-amber-700"
          }`}
        >
          {isAllPlaced || isCompleted ? "Aktiviti Selesai ✓" : "Selesai Isih ➡️"}
        </Button>
      </div>
    </div>
  );
}