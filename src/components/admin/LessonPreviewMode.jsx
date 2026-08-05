import React from 'react';
import { Eye, ArrowRight, FileQuestion, HelpCircle, Gamepad2 } from 'lucide-react';

const LessonPreviewMode = ({ lesson }) => {
  if (!lesson) return null;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden flex flex-col h-full">
      <div className="p-4 bg-stone-950 border-b border-stone-800 flex justify-between items-center shrink-0">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-400" /> Student View Simulation
        </h3>
        <div className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded uppercase font-bold tracking-wider border border-indigo-500/30">
          Preview Mode
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col bg-stone-900 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full space-y-8">
          
          {/* Mock Header */}
          <div className="text-center">
            <div className="inline-block bg-stone-800 text-stone-400 text-xs px-3 py-1 rounded-full mb-4">
              SP {lesson.sp_code} • {lesson.topic}
            </div>
            <h2 className="text-3xl font-black text-white leading-tight">
              Mari Belajar {lesson.topic}!
            </h2>
          </div>

          {/* Mock Widget Area */}
          <div className="aspect-video bg-stone-950 border-2 border-stone-800 rounded-2xl flex flex-col items-center justify-center text-stone-600">
            <Gamepad2 className="w-16 h-16 mb-4 opacity-50" />
            <p className="font-medium">Interactive Widget Placeholder</p>
            <p className="text-xs mt-2">Test animations, drag/drop, and responsiveness here.</p>
          </div>

          {/* Mock Concept Box */}
          <div className="bg-emerald-950/20 border border-emerald-900/50 p-6 rounded-2xl">
            <h4 className="text-emerald-400 font-bold flex items-center gap-2 mb-2">
              <FileQuestion className="w-4 h-4" /> Konsep Utama
            </h4>
            <div className="h-4 bg-stone-800 rounded w-full mb-3" />
            <div className="h-4 bg-stone-800 rounded w-5/6 mb-3" />
            <div className="h-4 bg-stone-800 rounded w-4/6" />
          </div>

          {/* AI Tutor Simulation */}
          <div className="flex gap-4 p-4 border border-indigo-900/50 bg-indigo-950/20 rounded-2xl relative">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-indigo-400 mb-1">Cikgu AI</div>
              <p className="text-sm text-stone-300">Simulate making a mistake to see if Cikgu AI provides a conceptual hint or a direct answer. (Hint should be conceptual!)</p>
            </div>
          </div>

        </div>
      </div>

      <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-between shrink-0">
        <button className="text-stone-500 hover:text-stone-300 text-sm font-bold transition-colors">
          Exit Preview
        </button>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
          Next Section <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LessonPreviewMode;
