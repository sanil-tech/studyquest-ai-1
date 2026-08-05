// src/components/Stepper.jsx
import React from "react";

/**
 * Simple horizontal stepper component.
 * Props:
 *  - steps: array of step names (strings)
 *  - current: name of the current step
 *  - onStepClick: optional callback(stepName) for navigating back to completed steps
 */
export default function Stepper({ steps, current, onStepClick }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-6 overflow-x-auto">
      {steps.map((step, idx) => {
        const isCompleted = steps.indexOf(current) > idx;
        const isActive = step === current;
        const circleClasses = `w-8 h-8 flex items-center justify-center rounded-full transition-all text-sm font-bold ${
          isCompleted
            ? "bg-emerald-500 text-white"
            : isActive
            ? "bg-cyan-500 text-white ring-2 ring-cyan-300"
            : "bg-stone-800 text-stone-400"
        }`;
        const labelClasses = `text-xs mt-1 ${isActive ? "text-cyan-400 font-black" : "text-stone-500"}`;
        return (
          <div key={step} className="flex flex-col items-center cursor-pointer" onClick={() => onStepClick && isCompleted && onStepClick(step)}>
            <div className={circleClasses}>
              {isCompleted ? "✓" : idx + 1}
            </div>
            <div className={labelClasses}>{step}</div>
          </div>
        );
      })}
    </div>
  );
}
