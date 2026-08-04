// src/components/lesson/blocks/InteractivePracticeBlock.jsx
// Block 5: Guided hands-on learning via interactive widget
// System selects widget from pedagogyMapping; AI provides seed data

import React from "react";
import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWidgetComponent } from "@/lib/widgetRegistry";
import { personalize } from "@/lib/personalize";

export default function InteractivePracticeBlock({ content, studentName, onComplete, isCompleted, onMistake }) {
  const widgetType = content.widget_type || "drag_and_drop";
  const instruction = personalize(content.instruction || "Selesaikan aktiviti interaktif ini.", studentName);
  const seedData = content.seed_data || {};

  const WidgetComponent = getWidgetComponent(widgetType);

  return (
    <div className="p-5 bg-stone-900 border-2 border-cyan-500/30 rounded-3xl space-y-4 text-left shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
          <Gamepad2 className="w-4 h-4 text-cyan-400" /> Latihan Interaktif
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
          +25 XP • +10 Syiling
        </span>
      </div>

      {/* Instruction */}
      <div className="p-3 bg-cyan-950/40 border border-cyan-500/20 rounded-xl">
        <p className="text-xs sm:text-sm font-bold text-cyan-200">
          🎮 {instruction}
        </p>
      </div>

      {/* Interactive widget */}
      <div className="min-h-[200px]">
        <WidgetComponent
          payload={seedData}
          instruction={instruction}
          onComplete={onComplete}
          isCompleted={isCompleted}
          onMistake={onMistake || (() => {})}
          // Pass common seed_data fields directly as props for widget compatibility
          targetNumber={seedData.target_number}
          targetSentence={seedData.target_sentence}
          targetFraction={seedData.target_fraction}
          shapeType={seedData.shape_type}
          leftVal={seedData.left_val}
          rightVal={seedData.right_val}
          correctRelation={seedData.correct_relation}
          wordBank={seedData.word_bank}
        />
      </div>

      {/* Fallback continue button (in case widget doesn't call onComplete) */}
      {!isCompleted && (
        <Button
          onClick={onComplete}
          variant="outline"
          className="w-full h-10 border-stone-700 text-stone-400 font-bold text-xs rounded-xl hover:bg-stone-800"
        >
          Langkau Aktiviti ➡️
        </Button>
      )}
    </div>
  );
}
