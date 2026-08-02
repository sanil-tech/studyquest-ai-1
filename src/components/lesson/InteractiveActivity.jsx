// src/components/lesson/InteractiveActivity.jsx
// Interactive Learning Activity & Game Suite for StudyQuest (Dark Theme & Mobile Responsive)

import React, { useState } from "react";
import { CheckCircle2, X, RefreshCw, Gamepad2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { personalize } from "@/lib/personalize";

export default function InteractiveActivity({ activity, studentName = "Pengembara", onComplete, isCompleted }) {
  if (!activity) return null;

  const { type = "matching", title = "Aktiviti Interaktif", instructions, items = [] } = activity;

  // Format valid items array
  const rawItems = Array.isArray(items) ? items : [];
  const validItems = rawItems.filter((i) => i && (typeof i === "string" || Object.keys(i).length > 0));

  const cleanInstructions = instructions
    ? personalize(instructions, studentName)
    : "Selesaikan cabaran interaktif ini untuk menguji kefahaman anda!";

  return (
    <div className="space-y-4 text-left">
      <div className="p-5 sm:p-6 bg-stone-900/95 border-2 border-stone-800 rounded-3xl shadow-xl space-y-4">
        {/* Game Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-cyan-400" /> {personalize(title, studentName)}
          </h3>
          <span className="px-3 py-1 bg-cyan-950 text-cyan-300 text-[10px] font-black uppercase rounded-full border border-cyan-500/30">
            {type.replace(/_/g, " ")}
          </span>
        </div>

        {/* Instructions */}
        {cleanInstructions && (
          <div className="p-4 bg-cyan-950/30 border border-cyan-500/20 rounded-2xl">
            <p className="text-xs sm:text-sm text-cyan-200 font-bold leading-relaxed">
              💡 {cleanInstructions}
            </p>
          </div>
        )}

        {/* Dynamic Game Component Selection */}
        {validItems.length > 0 ? (
          <div>
            {(type.includes("match") || type.includes("drag")) && (
              <MatchingActivity items={validItems} studentName={studentName} onComplete={onComplete} isCompleted={isCompleted} />
            )}
            {type.includes("sort") && (
              <SortingActivity items={validItems} studentName={studentName} onComplete={onComplete} isCompleted={isCompleted} />
            )}
            {type.includes("fill") && (
              <FillBlankActivity items={validItems} studentName={studentName} onComplete={onComplete} isCompleted={isCompleted} />
            )}
            {(type.includes("true") || type.includes("false")) && (
              <TrueFalseActivity items={validItems} studentName={studentName} onComplete={onComplete} isCompleted={isCompleted} />
            )}
            {!type.includes("match") && !type.includes("drag") && !type.includes("sort") && !type.includes("fill") && !type.includes("true") && (
              <MatchingActivity items={validItems} studentName={studentName} onComplete={onComplete} isCompleted={isCompleted} />
            )}
          </div>
        ) : (
          /* Fallback Completion Trigger when items are not provided */
          <div className="pt-2 text-center">
            <Button
              onClick={onComplete}
              className="w-full h-13 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm rounded-2xl border-b-4 border-emerald-700 active:translate-y-0.5 transition-all"
            >
              {isCompleted ? "Aktiviti Selesai ✓" : "Selesai Aktiviti & Ambil +15 XP 🎮"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultBar({ correct, total, onReset, onComplete, isCompleted }) {
  const isPerfect = correct === total;

  return (
    <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3 text-center mt-4">
      <div className="flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <span className="text-sm font-black text-amber-200">
          Markah: {correct} / {total} {isPerfect ? "🎉 Cemerlang!" : "💪 Teruskan Usaha!"}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onReset}
          variant="outline"
          className="flex-1 border-stone-700 bg-stone-800 text-stone-300 font-black text-xs rounded-xl h-11"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" /> Cuba Lagi
        </Button>
        <Button
          onClick={onComplete}
          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl h-11 border-b-4 border-emerald-700 active:translate-y-0.5 transition-all"
        >
          {isCompleted ? "Aktiviti Selesai ✓" : "Teruskan Kembara 🚀"}
        </Button>
      </div>
    </div>
  );
}

/**
 * 1. MATCHING ACTIVITY COMPONENT
 */
function MatchingActivity({ items, studentName, onComplete, isCompleted }) {
  const formattedItems = items.map((item) => {
    if (typeof item === "string") {
      const parts = item.split("=");
      return { left: parts[0]?.trim() || item, right: parts[1]?.trim() || item };
    }
    return {
      left: item.left || item.pair_a || item.item || item.question || "Item",
      right: item.right || item.pair_b || item.match || item.answer || "Padanan",
    };
  });

  const [matches, setMatches] = useState({});
  const [checked, setChecked] = useState(false);

  // Randomize right options for matching
  const rightOptions = React.useMemo(() => {
    return [...formattedItems].map((i) => i.right).sort(() => Math.random() - 0.5);
  }, [items]);

  const isCorrect = (idx) => matches[idx] === formattedItems[idx].right;
  const correctCount = formattedItems.filter((_, idx) => isCorrect(idx)).length;

  return (
    <div className="space-y-3 pt-2">
      {formattedItems.map((item, idx) => (
        <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-stone-950/80 border border-stone-800 rounded-2xl">
          <div className="flex-1 p-3 bg-stone-900 rounded-xl border border-stone-800 text-xs sm:text-sm font-bold text-amber-200">
            {personalize(item.left, studentName)}
          </div>
          <select
            value={matches[idx] || ""}
            onChange={(e) => {
              if (!checked) setMatches((prev) => ({ ...prev, [idx]: e.target.value }));
            }}
            disabled={checked}
            className="flex-1 p-3 rounded-xl border border-cyan-500/30 bg-stone-900 text-stone-100 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
          >
            <option value="">— Pilih Padanan —</option>
            {rightOptions.map((opt, optIdx) => (
              <option key={optIdx} value={opt}>
                {personalize(opt, studentName)}
              </option>
            ))}
          </select>
          {checked && (
            <div className="flex items-center justify-center p-2">
              {isCorrect(idx) ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <X className="w-6 h-6 text-rose-400 shrink-0" />
              )}
            </div>
          )}
        </div>
      ))}

      {!checked ? (
        <Button
          onClick={() => {
            setChecked(true);
            if (onComplete) onComplete();
          }}
          disabled={Object.keys(matches).length !== formattedItems.length}
          className="w-full h-12 mt-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-stone-950 font-black text-xs sm:text-sm rounded-2xl border-b-4 border-cyan-700 active:translate-y-0.5 transition-all"
        >
          Semak Padanan! ✅
        </Button>
      ) : (
        <ResultBar
          correct={correctCount}
          total={formattedItems.length}
          onReset={() => {
            setMatches({});
            setChecked(false);
          }}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      )}
    </div>
  );
}

/**
 * 2. SORTING ACTIVITY COMPONENT
 */
function SortingActivity({ items, studentName, onComplete, isCompleted }) {
  const categories = React.useMemo(() => {
    const set = new Set();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).length > 0 ? Array.from(set) : ["Kategori A", "Kategori B"];
  }, [items]);

  const [placements, setPlacements] = useState({});
  const [checked, setChecked] = useState(false);

  const isCorrect = (idx) => placements[idx] === items[idx].category;
  const correctCount = items.filter((_, idx) => isCorrect(idx)).length;

  return (
    <div className="space-y-3 pt-2">
      {items.map((item, idx) => {
        const text = typeof item === "object" ? item.text || item.label || item.item : String(item);
        return (
          <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-stone-950/80 border border-stone-800 rounded-2xl">
            <div className="flex-1 p-3 bg-stone-900 rounded-xl border border-stone-800 text-xs sm:text-sm font-bold text-amber-200">
              {personalize(text, studentName)}
            </div>
            <select
              value={placements[idx] || ""}
              onChange={(e) => {
                if (!checked) setPlacements((prev) => ({ ...prev, [idx]: e.target.value }));
              }}
              disabled={checked}
              className="flex-1 p-3 rounded-xl border border-cyan-500/30 bg-stone-900 text-stone-100 font-bold text-xs sm:text-sm outline-none"
            >
              <option value="">— Pilih Kategori —</option>
              {categories.map((cat, cIdx) => (
                <option key={cIdx} value={cat}>
                  {personalize(cat, studentName)}
                </option>
              ))}
            </select>
            {checked && (
              <div className="flex items-center justify-center p-2">
                {isCorrect(idx) ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-6 h-6 text-rose-400 shrink-0" />
                )}
              </div>
            )}
          </div>
        );
      })}

      {!checked ? (
        <Button
          onClick={() => {
            setChecked(true);
            if (onComplete) onComplete();
          }}
          disabled={Object.keys(placements).length !== items.length}
          className="w-full h-12 mt-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-stone-950 font-black text-xs sm:text-sm rounded-2xl border-b-4 border-cyan-700 active:translate-y-0.5 transition-all"
        >
          Semak Isihan! ✅
        </Button>
      ) : (
        <ResultBar
          correct={correctCount}
          total={items.length}
          onReset={() => {
            setPlacements({});
            setChecked(false);
          }}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      )}
    </div>
  );
}

/**
 * 3. FILL BLANK ACTIVITY COMPONENT
 */
function FillBlankActivity({ items, studentName, onComplete, isCompleted }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  const isCorrect = (idx) => {
    const userAns = (answers[idx] || "").trim().toLowerCase();
    const targetAns = String(items[idx].answer || items[idx].correct || "").trim().toLowerCase();
    return userAns === targetAns;
  };
  const correctCount = items.filter((_, idx) => isCorrect(idx)).length;

  return (
    <div className="space-y-3 pt-2">
      {items.map((item, idx) => (
        <div key={idx} className="p-3 bg-stone-950/80 border border-stone-800 rounded-2xl space-y-2">
          <p className="text-xs sm:text-sm text-amber-200 font-bold">
            {personalize(item.sentence || item.question || item.prompt || "Ayat latihan", studentName)}
          </p>
          <div className="flex items-center gap-2">
            <Input
              value={answers[idx] || ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [idx]: e.target.value }))}
              disabled={checked}
              placeholder="Taip jawapan..."
              className="bg-stone-900 border-stone-800 text-white rounded-xl text-xs sm:text-sm font-bold"
            />
            {checked && (
              isCorrect(idx) ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <X className="w-6 h-6 text-rose-400 shrink-0" />
              )
            )}
          </div>
          {checked && !isCorrect(idx) && (
            <p className="text-xs font-bold text-emerald-400 mt-1">
              Jawapan betul: {item.answer || item.correct}
            </p>
          )}
        </div>
      ))}

      {!checked ? (
        <Button
          onClick={() => {
            setChecked(true);
            if (onComplete) onComplete();
          }}
          disabled={Object.keys(answers).length !== items.length}
          className="w-full h-12 mt-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-stone-950 font-black text-xs sm:text-sm rounded-2xl border-b-4 border-cyan-700 active:translate-y-0.5 transition-all"
        >
          Semak Jawapan! ✅
        </Button>
      ) : (
        <ResultBar
          correct={correctCount}
          total={items.length}
          onReset={() => {
            setAnswers({});
            setChecked(false);
          }}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      )}
    </div>
  );
}

/**
 * 4. TRUE / FALSE ACTIVITY COMPONENT
 */
function TrueFalseActivity({ items, studentName, onComplete, isCompleted }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  const isCorrect = (idx) => answers[idx] === Boolean(items[idx].is_true ?? items[idx].correct);
  const correctCount = items.filter((_, idx) => isCorrect(idx)).length;

  return (
    <div className="space-y-3 pt-2">
      {items.map((item, idx) => (
        <div key={idx} className="p-3 bg-stone-950/80 border border-stone-800 rounded-2xl space-y-2">
          <p className="text-xs sm:text-sm text-amber-200 font-bold">
            {personalize(item.statement || item.question || item.text || "Kenyataan", studentName)}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (!checked) setAnswers((prev) => ({ ...prev, [idx]: true }));
              }}
              disabled={checked}
              className={`flex-1 p-2.5 rounded-xl text-xs sm:text-sm font-black border-2 transition-all ${
                answers[idx] === true
                  ? checked
                    ? isCorrect(idx) ? "border-emerald-500 bg-emerald-950/80 text-emerald-200" : "border-rose-500 bg-rose-950/80 text-rose-200"
                    : "border-cyan-500 bg-cyan-950/80 text-cyan-200"
                  : "border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200"
              }`}
            >
              ✅ Betul
            </button>
            <button
              type="button"
              onClick={() => {
                if (!checked) setAnswers((prev) => ({ ...prev, [idx]: false }));
              }}
              disabled={checked}
              className={`flex-1 p-2.5 rounded-xl text-xs sm:text-sm font-black border-2 transition-all ${
                answers[idx] === false
                  ? checked
                    ? isCorrect(idx) ? "border-emerald-500 bg-emerald-950/80 text-emerald-200" : "border-rose-500 bg-rose-950/80 text-rose-200"
                    : "border-cyan-500 bg-cyan-950/80 text-cyan-200"
                  : "border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200"
              }`}
            >
              ❌ Salah
            </button>
          </div>
        </div>
      ))}

      {!checked ? (
        <Button
          onClick={() => {
            setChecked(true);
            if (onComplete) onComplete();
          }}
          disabled={Object.keys(answers).length !== items.length}
          className="w-full h-12 mt-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-stone-950 font-black text-xs sm:text-sm rounded-2xl border-b-4 border-cyan-700 active:translate-y-0.5 transition-all"
        >
          Semak Jawapan! ✅
        </Button>
      ) : (
        <ResultBar
          correct={correctCount}
          total={items.length}
          onReset={() => {
            setAnswers({});
            setChecked(false);
          }}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      )}
    </div>
  );
}