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
export function GenericWidgetFallback({ widgetType = "unknown", data = {} }) {
  console.warn(`[WidgetRegistry] Unknown content renderer / widget: [${widgetType}]`);

  return (
    <div className="p-5 bg-stone-900 border-2 border-dashed border-amber-500/40 rounded-2xl text-left space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
          ✨ Aktiviti Pembelajaran Baharu Dikesan
        </span>
        <span className="text-[10px] font-mono text-stone-400">Type: {widgetType}</span>
      </div>
      <h4 className="text-sm font-black text-white">
        Aktiviti Interaktif ({widgetType.replace(/_/g, " ").toUpperCase()})
      </h4>
      <p className="text-xs text-stone-300">
        Aktiviti ini sedang berjalan menggunakan mod pemaparan generik StudyQuest.
      </p>
      {data && Object.keys(data).length > 0 && (
        <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-[11px] font-mono text-stone-400 space-y-1">
          <span className="font-bold text-amber-400 block">Konfigurasi Data Aktiviti:</span>
          <pre className="overflow-x-auto text-[10px]">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
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
