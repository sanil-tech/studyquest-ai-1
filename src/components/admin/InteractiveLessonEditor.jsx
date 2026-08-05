// src/components/admin/InteractiveLessonEditor.jsx
import React, { useState } from "react";
import sukuPenyuMascotImg from "@/assets/images/suku_penyu_mascot_1785919182374.jpg";
import { generateDynamicImagePrompt, getPromptSeed } from "@/utils/generateDynamicImagePrompt";
import { getStaticFallbackImage } from "@/services/aiImageEngine";
import StoryHookMedia from "@/components/lesson/StoryHookMedia";
import { getWidgetComponent } from "@/lib/widgetRegistry";
import {
  Edit3,
  Video,
  Image as ImageIcon,
  Sparkles,
  HelpCircle,
  BookOpen,
  Gamepad2
} from "lucide-react";

export default function InteractiveLessonEditor({ activePackage, onUpdatePackage }) {
  const [activeTab, setActiveTab] = useState("ALL"); // "ALL" | "HOOK" | "TEACHING" | "PRACTICE" | "QUIZ"

  if (!activePackage) {
    return (
      <div className="p-12 text-center bg-stone-900/60 border border-stone-800 rounded-3xl space-y-3">
        <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
        <h4 className="text-base font-black text-white">Studio Penyuntingan Teks & Media</h4>
        <p className="text-xs text-stone-400 max-w-md mx-auto">
          Tiada kandungan untuk disunting. Sila jana pakej pelajaran terlebih dahulu untuk mula menyunting teks, gambar, dan video.
        </p>
      </div>
    );
  }

  const isV2 = Boolean(activePackage.version === "2.0" || activePackage.lesson?.blocks);

  // ─────────────────────────────────────────────────────────
  // HELPER UPDATERS FOR BOTH V1 AND V2 PACKAGES
  // ─────────────────────────────────────────────────────────

  // 1. Update Briefing / Intro Data
  const updateBriefingField = (field, value) => {
    onUpdatePackage((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (isV2 && next.lesson?.blocks) {
        const introBlock = next.lesson.blocks.find(
          (b) => b.block_type === "INTRO" || b.block_type === "STORY_HOOK" || b.content?.story_hook !== undefined || b.content?.mascot_dialogue !== undefined
        );
        if (introBlock?.content) {
          introBlock.content[field] = value;
          if (field === "story_hook") introBlock.content.story_text = value;
        }
      } else if (Array.isArray(next.steps)) {
        const briefingStep = next.steps.find((st) => st.step_type === "BRIEFING" || st.stage === "BRIEFING");
        if (briefingStep) {
          if (!briefingStep.payload) briefingStep.payload = {};
          briefingStep.payload[field] = value;
          if (field === "story_hook") briefingStep.description = value;
          if (field === "title") briefingStep.title = value;
        }
        if (field === "mascot_dialogue") {
          if (!next.student_ui) next.student_ui = {};
          next.student_ui.mascot_dialogue = value;
        }
      }
      return next;
    });
  };

  // 2. Update Teaching / Concept Summary Data
  const updateConceptField = (field, value) => {
    onUpdatePackage((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (isV2 && next.lesson?.blocks) {
        const teachBlock = next.lesson.blocks.find(
          (b) => b.block_type === "TEACHING" || b.block_type === "CPA_VISUAL" || b.content?.concept_summary !== undefined
        );
        if (teachBlock?.content) {
          teachBlock.content[field] = value;
        }
      } else if (Array.isArray(next.steps)) {
        const teachStep = next.steps.find((st) => st.step_type === "ENGAGEMENT" || st.step_type === "LESSON");
        if (teachStep?.payload) {
          teachStep.payload[field] = value;
        }
      }
      return next;
    });
  };

  // 3. Update Interactive Practice Data
  const updatePracticeField = (field, value) => {
    onUpdatePackage((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (isV2 && next.lesson?.blocks) {
        const practiceBlock = next.lesson.blocks.find(
          (b) => b.block_type === "PRACTICE" || b.content?.widget_type !== undefined
        );
        if (practiceBlock?.content) {
          practiceBlock.content[field] = value;
        }
      } else if (Array.isArray(next.steps)) {
        const practiceStep = next.steps.find((st) => st.step_type === "PRACTICE");
        if (practiceStep) {
          if (!practiceStep.payload) practiceStep.payload = {};
          practiceStep.payload[field] = value;
          if (field === "widget_type") practiceStep.widget_type = value;
        }
      }
      return next;
    });
  };

  // 4. Update Quiz Question Data
  const updateQuizQuestion = (qIndex, field, value) => {
    onUpdatePackage((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (isV2 && next.lesson?.blocks) {
        const quizBlock = next.lesson.blocks.find(
          (b) => b.block_type === "QUIZ" || b.content?.questions !== undefined
        );
        if (quizBlock?.content?.questions?.[qIndex]) {
          quizBlock.content.questions[qIndex][field] = value;
        }
      } else if (Array.isArray(next.steps)) {
        const quizStep = next.steps.find((st) => st.step_type === "QUIZ");
        if (quizStep?.questions?.[qIndex]) {
          quizStep.questions[qIndex][field] = value;
        } else if (quizStep?.payload?.questions?.[qIndex]) {
          quizStep.payload.questions[qIndex][field] = value;
        }
      }
      return next;
    });
  };

  // 5. Update Quiz Option Data
  const updateQuizOption = (qIndex, optIndex, value) => {
    onUpdatePackage((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const updateOptList = (qObj) => {
        if (qObj && Array.isArray(qObj.options)) {
          const newOpts = [...qObj.options];
          newOpts[optIndex] = value;
          qObj.options = newOpts;
        }
      };

      if (isV2 && next.lesson?.blocks) {
        const quizBlock = next.lesson.blocks.find(
          (b) => b.block_type === "QUIZ" || b.content?.questions !== undefined
        );
        updateOptList(quizBlock?.content?.questions?.[qIndex]);
      } else if (Array.isArray(next.steps)) {
        const quizStep = next.steps.find((st) => st.step_type === "QUIZ");
        if (quizStep?.questions?.[qIndex]) updateOptList(quizStep.questions[qIndex]);
        if (quizStep?.payload?.questions?.[qIndex]) updateOptList(quizStep.payload.questions[qIndex]);
      }
      return next;
    });
  };

  // ─────────────────────────────────────────────────────────
  // EXTRACT CURRENT DATA FROM PACKAGE
  // ─────────────────────────────────────────────────────────

  const getBriefingData = () => {
    if (isV2 && activePackage.lesson?.blocks) {
      const block = activePackage.lesson.blocks.find(
        (b) => b.block_type === "INTRO" || b.block_type === "STORY_HOOK" || b.content?.story_hook !== undefined || b.content?.mascot_dialogue !== undefined
      );
      const c = block?.content || {};
      return {
        title: c.title || activePackage.lesson?.metadata?.topic || "Kisah Misi Kembara",
        story_hook: c.story_hook || c.story_text || "",
        help_continuation: c.help_continuation || c.help_guide || "",
        mascot_dialogue: c.mascot_dialogue || "",
        image_url: c.image_url || c.visual_url || "",
        video_url: c.video_url || c.media_url || "",
        topic: activePackage.lesson?.metadata?.topic || "Matematik"
      };
    }
    const briefingStep = (activePackage.steps || []).find((st) => st.step_type === "BRIEFING" || st.stage === "BRIEFING") || {};
    const payload = briefingStep.payload || {};
    return {
      title: briefingStep.title || payload.title || activePackage.topic || "Kisah Misi Kembara",
      story_hook: payload.story_hook || briefingStep.description || "",
      help_continuation: payload.help_continuation || payload.help_guide || "",
      mascot_dialogue: payload.mascot_dialogue || activePackage.student_ui?.mascot_dialogue || "",
      image_url: payload.image_url || payload.visual_url || "",
      video_url: payload.video_url || payload.media_url || activePackage.video_url || "",
      topic: activePackage.topic || "Matematik"
    };
  };

  const getTeachingData = () => {
    if (isV2 && activePackage.lesson?.blocks) {
      const block = activePackage.lesson.blocks.find(
        (b) => b.block_type === "TEACHING" || b.block_type === "CPA_VISUAL" || b.content?.concept_summary !== undefined
      );
      const c = block?.content || {};
      return {
        concept_summary: c.concept_summary || "",
        key_points: c.key_points || [],
        cpa_blocks: c.cpa_blocks || []
      };
    }
    const teachStep = (activePackage.steps || []).find((st) => st.step_type === "ENGAGEMENT" || st.step_type === "LESSON") || {};
    const payload = teachStep.payload || {};
    return {
      concept_summary: payload.concept_summary || "",
      key_points: payload.key_points || [],
      cpa_blocks: teachStep.cpa_blocks || payload.cpa_blocks || []
    };
  };

  const getPracticeData = () => {
    if (isV2 && activePackage.lesson?.blocks) {
      const block = activePackage.lesson.blocks.find(
        (b) => b.block_type === "PRACTICE" || b.content?.widget_type !== undefined
      );
      const c = block?.content || {};
      return {
        widget_type: c.widget_type || "base_ten_blocks",
        instruction: c.instruction || "Bantu Suku Penyu menyelesaikan soalan interaktif di bawah:",
        targetNumber: c.targetNumber || c.target_number || 35,
        targetSentence: c.targetSentence || c.target_sentence || "Ahmad membilang epal di kedai Pak Cik Abu"
      };
    }
    const practiceStep = (activePackage.steps || []).find((st) => st.step_type === "PRACTICE") || {};
    const payload = practiceStep.payload || {};
    return {
      widget_type: payload.widget_type || practiceStep.widget_type || "base_ten_blocks",
      instruction: payload.instruction || "Bantu Suku Penyu menyelesaikan soalan interaktif di bawah:",
      targetNumber: payload.targetNumber || payload.target_number || 35,
      targetSentence: payload.targetSentence || payload.target_sentence || "Ahmad membilang epal di kedai Pak Cik Abu"
    };
  };

  const getQuizData = () => {
    if (isV2 && activePackage.lesson?.blocks) {
      const quizBlock = activePackage.lesson.blocks.find(
        (b) => b.block_type === "QUIZ" || b.content?.questions !== undefined
      );
      return quizBlock?.content?.questions || [];
    }
    const quizStep = (activePackage.steps || []).find((st) => st.step_type === "QUIZ") || {};
    return quizStep.questions || quizStep.payload?.questions || [];
  };

  const briefing = getBriefingData();
  const teaching = getTeachingData();
  const practice = getPracticeData();
  const questions = getQuizData();

  // Dynamic image prompt logic
  const fallbackStorySceneImg = getStaticFallbackImage(briefing.topic, briefing.story_hook);
  const dynamicStoryPrompt = generateDynamicImagePrompt({
    subject: activePackage.subject || "Matematik",
    grade: activePackage.grade || "Tahun 1",
    topic: briefing.topic,
    sceneType: "STORY",
    visualDescription: "",
    storyText: briefing.story_hook || briefing.title
  });
  const storySeed = getPromptSeed(dynamicStoryPrompt);
  const storyBannerUrl = (briefing.image_url && !briefing.image_url.includes("suku_penyu_mascot"))
    ? briefing.image_url
    : `https://image.pollinations.ai/prompt/${encodeURIComponent(dynamicStoryPrompt)}?width=800&height=450&nologo=true&seed=${storySeed}`;

  const WidgetComponent = getWidgetComponent(practice.widget_type);

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left font-sans">
      {/* NAVIGATION TABS FOR STUDIO EDITOR */}
      <div className="p-3 bg-stone-900 border border-stone-800 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-black text-amber-400">
          <Edit3 className="w-4 h-4 text-amber-400" />
          <span>Pusat Penyuntingan Pelajaran Live</span>
        </div>

        <div className="flex flex-wrap gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === "ALL" ? "bg-amber-500 text-stone-950 font-black" : "text-stone-400 hover:text-white"
            }`}
          >
            Semua Blok
          </button>
          <button
            onClick={() => setActiveTab("HOOK")}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === "HOOK" ? "bg-amber-500 text-stone-950 font-black" : "text-stone-400 hover:text-white"
            }`}
          >
            1. Kisah & Media
          </button>
          <button
            onClick={() => setActiveTab("TEACHING")}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === "TEACHING" ? "bg-amber-500 text-stone-950 font-black" : "text-stone-400 hover:text-white"
            }`}
          >
            2. Rumusan & CPA
          </button>
          <button
            onClick={() => setActiveTab("PRACTICE")}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === "PRACTICE" ? "bg-amber-500 text-stone-950 font-black" : "text-stone-400 hover:text-white"
            }`}
          >
            3. Widget Interaktif
          </button>
          <button
            onClick={() => setActiveTab("QUIZ")}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === "QUIZ" ? "bg-amber-500 text-stone-950 font-black" : "text-stone-400 hover:text-white"
            }`}
          >
            4. Pentaksiran ({questions.length})
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* SECTION 1: KISAH MISI & VISUAL MEDIA (VIDEO / GAMBAR)    */}
      {/* ───────────────────────────────────────────────────────── */}
      {(activeTab === "ALL" || activeTab === "HOOK") && (
        <div className="p-5 bg-stone-900 border-2 border-amber-500/40 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> 1. Kisah Misi Kembara & Media Visual / Video
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
              Pratonton Live
            </span>
          </div>

          {/* LIVE MEDIA & EDITABLE URL CONTROLS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Live Media Frame */}
            <div className="md:col-span-5 relative w-full h-48 sm:h-56 bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden shadow-md">
              <StoryHookMedia content={briefing} storyVisual={storyBannerUrl} fallbackSceneImg={fallbackStorySceneImg} />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                <span className="px-2 py-0.5 bg-amber-500/90 text-stone-950 text-[10px] font-black uppercase rounded">
                  Kisah Misi Suku Penyu
                </span>
                <span className="text-xs">🐢✨</span>
              </div>
            </div>

            {/* Editable Media Inputs */}
            <div className="md:col-span-7 space-y-3 bg-stone-950 p-4 rounded-2xl border border-stone-800/80">
              <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider block">
                🎬 Tetapan Video & Gambar Media (Firebase / YouTube)
              </span>

              {/* Video URL Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-emerald-400" /> URL Video Pengajaran / Story Visual (MP4 / YouTube)
                </label>
                <input
                  type="text"
                  value={briefing.video_url}
                  onChange={(e) => updateBriefingField("video_url", e.target.value)}
                  placeholder="https://firebasestorage.googleapis.com/.../video.mp4 atau https://youtube.com/..."
                  className="w-full h-9 px-3 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 text-xs font-mono focus:border-amber-500 outline-none"
                />
                <p className="text-[10px] text-stone-500">
                  Tampal pautan terus MP4 dari Firebase Storage atau YouTube.
                </p>
              </div>

              {/* Image URL Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" /> URL Gambar Visual Kustom (Jika Tiada Video)
                </label>
                <input
                  type="text"
                  value={briefing.image_url}
                  onChange={(e) => updateBriefingField("image_url", e.target.value)}
                  placeholder="https://... / gambar kustom.jpg"
                  className="w-full h-9 px-3 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 text-xs font-mono focus:border-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* EDITABLE STORY HOOK TEXTS */}
          <div className="space-y-3 bg-stone-950 p-4 rounded-2xl border border-stone-800">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-amber-400 uppercase block">
                📌 Tajuk Misi Pembelajaran:
              </label>
              <input
                type="text"
                value={briefing.title}
                onChange={(e) => updateBriefingField("title", e.target.value)}
                className="w-full h-9 px-3 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 font-bold text-xs focus:border-amber-500 outline-none"
              />
            </div>

            {/* Story Hook */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-amber-400 uppercase block">
                📣 Teks Pengenalan Kisah Misi (Story Hook):
              </label>
              <textarea
                value={briefing.story_hook}
                onChange={(e) => updateBriefingField("story_hook", e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 text-xs font-medium focus:border-amber-500 outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Help Guide */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-amber-400 uppercase block">
                💡 Teks Panduan Membantu Mascot Suku Penyu:
              </label>
              <textarea
                value={briefing.help_continuation}
                onChange={(e) => updateBriefingField("help_continuation", e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 text-xs font-medium focus:border-amber-500 outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Mascot Dialogue */}
            <div className="space-y-1 pt-2 border-t border-stone-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={sukuPenyuMascotImg} alt="Suku Penyu" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-amber-400 uppercase block">
                    🗣️ Dialog Mascot Suku Penyu 🐢 ({`{student_name}`} disokong):
                  </label>
                  <textarea
                    value={briefing.mascot_dialogue}
                    onChange={(e) => updateBriefingField("mascot_dialogue", e.target.value)}
                    rows={2}
                    className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 font-bold text-xs focus:border-amber-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* SECTION 2: BAHAN PEMBELAJARAN CPA & RUMUSAN KONSEP      */}
      {/* ───────────────────────────────────────────────────────── */}
      {(activeTab === "ALL" || activeTab === "TEACHING") && (
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" /> 2. Rumusan Konsep DSKP & Blok Visual CPA
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              Pengajaran Utama
            </span>
          </div>

          <div className="space-y-3 bg-stone-950 p-4 rounded-2xl border border-stone-800">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-cyan-400 uppercase block">
                📖 Rumusan Konsep DSKP (Penerangan Guru):
              </label>
              <textarea
                value={teaching.concept_summary}
                onChange={(e) => updateConceptField("concept_summary", e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 text-xs font-medium focus:border-cyan-500 outline-none resize-none leading-relaxed"
              />
            </div>

            {/* CPA Visual Blocks */}
            {Array.isArray(teaching.cpa_blocks) && teaching.cpa_blocks.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <span className="text-[10px] font-black text-stone-400 uppercase block">
                  🖼️ Blok Pembelajaran Visual CPA ({teaching.cpa_blocks.length} blok):
                </span>
                <div className="space-y-2">
                  {teaching.cpa_blocks.map((cpa, cI) => (
                    <div key={cI} className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 uppercase">
                          {cpa.block_type || "CPA"}
                        </span>
                        <span className="text-[10px] text-stone-500">Blok {cI + 1}</span>
                      </div>
                      <input
                        type="text"
                        value={cpa.title || ""}
                        onChange={(e) => {
                          const newBlocks = [...teaching.cpa_blocks];
                          newBlocks[cI] = { ...newBlocks[cI], title: e.target.value };
                          updateConceptField("cpa_blocks", newBlocks);
                        }}
                        className="w-full h-8 px-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 font-bold text-xs focus:border-cyan-500 outline-none"
                        placeholder="Tajuk Blok Visual..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* SECTION 3: AKTIVITI WIDGET INTERAKTIF                   */}
      {/* ───────────────────────────────────────────────────────── */}
      {(activeTab === "ALL" || activeTab === "PRACTICE") && (
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-emerald-400" /> 3. Aktiviti Interaktif (Widget Simulator)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              Kemahiran Praktikal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Widget Selection & Parameters */}
            <div className="space-y-3 bg-stone-950 p-4 rounded-2xl border border-stone-800">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-emerald-400 uppercase block">
                  🎮 Pilih Jenis Widget Interaktif:
                </label>
                <select
                  value={practice.widget_type}
                  onChange={(e) => updatePracticeField("widget_type", e.target.value)}
                  className="w-full h-9 px-3 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 text-xs font-bold focus:border-emerald-500 outline-none cursor-pointer"
                >
                  <option value="base_ten_blocks">🧱 Blok Asas 10 (Base Ten Blocks)</option>
                  <option value="fraction_pie">🍕 Pai Pecahan (Fraction Pie)</option>
                  <option value="number_line">📏 Garis Nombor (Number Line)</option>
                  <option value="comparison_balance">⚖️ Penimbang Perbandingan (Comparison)</option>
                  <option value="word_scramble">🔤 Susunan Kata DSKP (Word Scramble)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-emerald-400 uppercase block">
                  🎯 Target Nombor / Kuantiti:
                </label>
                <input
                  type="number"
                  value={practice.targetNumber}
                  onChange={(e) => updatePracticeField("targetNumber", parseInt(e.target.value, 10) || 0)}
                  className="w-full h-9 px-3 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 text-xs font-bold focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-emerald-400 uppercase block">
                  📝 Ayat / Arahan Sasaran Aktiviti:
                </label>
                <input
                  type="text"
                  value={practice.targetSentence}
                  onChange={(e) => updatePracticeField("targetSentence", e.target.value)}
                  className="w-full h-9 px-3 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 text-xs font-bold focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Live Widget Preview Box */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 shadow-inner flex flex-col justify-center">
              <span className="text-[10px] font-bold text-stone-400 uppercase block mb-2">
                👁️ Live Simulator Widget Murid:
              </span>
              <div className="p-3 bg-stone-900 rounded-xl border border-stone-800">
                <WidgetComponent
                  widgetType={practice.widget_type}
                  targetNumber={practice.targetNumber}
                  targetSentence={practice.targetSentence}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* SECTION 4: SOALAN PENTAKSIRAN DIAGNOSTIK (QUIZ)         */}
      {/* ───────────────────────────────────────────────────────── */}
      {(activeTab === "ALL" || activeTab === "QUIZ") && (
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <span className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-rose-400" /> 4. Pentaksiran Diagnostik PBD (Soalan & Pilihan)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
              {questions.length} Soalan
            </span>
          </div>

          <div className="space-y-4">
            {questions.map((q, qI) => {
              const options = Array.isArray(q.options) ? q.options : ["Option 1", "Option 2", "Option 3"];
              const correctIdx = q.correct_index ?? 0;

              return (
                <div key={qI} className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
                    <span className="text-xs font-black text-rose-300 flex items-center gap-1">
                      ❓ Soalan {qI + 1}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                      PBD {q.pbd_level || "TP3"}
                    </span>
                  </div>

                  {/* Question Stem */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase block">
                      Batang Soalan:
                    </label>
                    <textarea
                      value={q.question || q.stem || ""}
                      onChange={(e) => updateQuizQuestion(qI, "question", e.target.value)}
                      rows={2}
                      className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 font-bold text-xs focus:border-rose-500 outline-none resize-none"
                    />
                  </div>

                  {/* Options List */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase block">
                      Pilihan Jawapan (Tanda bulatan bagi jawapan yang BETUL):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {options.map((opt, oI) => (
                        <div
                          key={oI}
                          className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                            correctIdx === oI
                              ? "bg-emerald-950/60 border-emerald-500 text-emerald-200"
                              : "bg-stone-900 border-stone-800 text-stone-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct_q_${qI}`}
                            checked={correctIdx === oI}
                            onChange={() => updateQuizQuestion(qI, "correct_index", oI)}
                            className="accent-emerald-500 cursor-pointer w-4 h-4"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateQuizOption(qI, oI, e.target.value)}
                            className="w-full h-8 px-2 bg-transparent text-xs font-bold outline-none border-b border-stone-700/50 focus:border-emerald-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase block">
                      💡 Penerangan Jawapan (Maklumbalas Suku Penyu):
                    </label>
                    <input
                      type="text"
                      value={q.explanation || ""}
                      onChange={(e) => updateQuizQuestion(qI, "explanation", e.target.value)}
                      className="w-full h-9 px-3 bg-stone-900 border border-stone-800 rounded-xl text-stone-300 text-xs font-medium focus:border-rose-500 outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
