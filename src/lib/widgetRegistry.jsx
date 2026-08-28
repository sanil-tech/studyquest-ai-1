import React from "react";
import BaseTenBlocksWidget from "@/components/widgets/BaseTenBlocksWidget";
import SentenceBuilderWidget from "@/components/widgets/SentenceBuilderWidget";
import FractionSlicerWidget from "@/components/widgets/FractionSlicerWidget";
import NumberScaleWidget from "@/components/widgets/NumberScaleWidget";
import DragAndDropWidget from "@/components/widgets/DragAndDropWidget";
import MatchingCardsWidget from "@/components/widgets/MatchingCardsWidget";
import QuizWheelWidget from "@/components/widgets/QuizWheelWidget";
import InteractiveActivity from "@/components/lesson/InteractiveActivity";

/**
 * Generic Fallback Component for unknown / upcoming widgets
 */
export function GenericWidgetFallback({ widgetType = "unknown", data = {}, instruction, onComplete, isCompleted }) {
  console.warn(`[WidgetRegistry] Unknown content renderer / widget: [${widgetType}]`);

  return (
    <div className="p-5 bg-stone-900 border-2 border-dashed border-cyan-500/40 rounded-2xl text-center space-y-4 shadow-lg">
      <div className="text-5xl">🎮</div>
      <p className="text-sm font-black text-cyan-300">
        {instruction || "Mari main aktiviti ini!"}
      </p>
      <p className="text-xs text-stone-400 font-medium">
        Tekan butang di bawah selepas kamu cuba.
      </p>
      <button
        type="button"
        onClick={onComplete}
        disabled={isCompleted}
        className="w-full h-12 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-stone-950 font-black text-sm rounded-xl border-b-4 border-cyan-700 active:translate-y-1 transition-all"
      >
        {isCompleted ? "Selesai ✓" : "Saya Dah Cuba! ➡️"}
      </button>
    </div>
  );
}

/**
 * Central Widget Registry
 * Maps widget type strings to actual React components.
 */
export const widgetRegistry = {
  base_ten_blocks: BaseTenBlocksWidget,
  sentence_builder: SentenceBuilderWidget,
  fraction_slicer: FractionSlicerWidget,
  number_scale: NumberScaleWidget,
  drag_and_drop: DragAndDropWidget,
  matching_cards: MatchingCardsWidget,
  matching: MatchingCardsWidget,
  sorting: DragAndDropWidget,
  quiz_wheel: QuizWheelWidget,
  money_counter: InteractiveActivity,
  clock_face: InteractiveActivity,
  shape_sorter: InteractiveActivity,
  piktograf_chart: InteractiveActivity,
  word_matching: SentenceBuilderWidget,
  phonics_sound_board: SentenceBuilderWidget,
  science_lab_simulator: InteractiveActivity,
  organ_system_explorer: InteractiveActivity,
  lifecycle_sequencer: InteractiveActivity
};

/**
 * Resolves a React Component for a given widget_type string
 * @param {string} widgetType 
 * @returns {React.Component}
 */
export function getWidgetComponent(widgetType) {
  if (!widgetType) return GenericWidgetFallback;
  return widgetRegistry[widgetType] || GenericWidgetFallback;
}