// src/components/AdminContentStudio.jsx
// Lesson Generation & Publishing Studio (v1.0 / v2.0)
// DSKP selection, deep AI content generation, interactive block override editor, live student preview, and 1-click publishing dispatcher.

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { generateKSSRMissionPackage, getPedagogyContext } from "@/services/aiContentEngine";
import { generateLesson } from "@/services/aiContentFiller";
import UniversalLessonPreview from "@/components/admin/UniversalLessonPreview";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Loader2,
  Sparkles,
  Eye,
  CheckCircle2,
  Zap,
  Sliders,
  Edit3,
  Rocket
} from "lucide-react";

import {
  getTaxonomySubjects,
  getTaxonomyYears,
  getTaxonomyTopics,
  getTaxonomySKs,
  getTaxonomySPs
} from "@/services/dskpRegistry";

export default function AdminContentStudio() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // SECTION 1: CURRICULUM SELECTION STATE
  const [subject, setSubject] = useState("Matematik");
  const [yearLevel, setYearLevel] = useState("Tahun 1");
  const [topic, setTopic] = useState("Nombor hingga 100");
  const [skCode, setSkCode] = useState("1.1");
  const [spCode, setSpCode] = useState("1.1.1");
  const [assignedClass, setAssignedClass] = useState("class_4_cemerlang");

  // SECTION 2: PEDAGOGY CONFIGURATION STATE
  const [targetTP, setTargetTP] = useState("TP3");
  const [misconceptionShield, setMisconceptionShield] = useState(
    "Keliru antara kuantiti yang lebih banyak dan lebih sedikit"
  );
  const [selectedWidget, setSelectedWidget] = useState("base_ten_blocks");

  // SECTION 3: GENERATION, OVERRIDE & PUBLISHING STATE
  const [generating, setGenerating] = useState(false);
  const [activePackage, setActivePackage] = useState(null);
  const [studioMode, setStudioMode] = useState("PREVIEW"); // "EDIT" | "PREVIEW"
  const [publishStatus, setPublishStatus] = useState("DRAFT"); // "DRAFT" | "PUBLISHED"
  const [, setPublishedLesson] = useState(null);

  // Taxonomy Data Resolution via Centralized DSKP Registry
  const availableSubjects = useMemo(() => getTaxonomySubjects(), []);
  const availableYears = useMemo(() => getTaxonomyYears(subject), [subject]);
  const availableTopics = useMemo(() => getTaxonomyTopics(subject, yearLevel), [subject, yearLevel]);
  const availableSKs = useMemo(() => getTaxonomySKs(subject, yearLevel, topic), [subject, yearLevel, topic]);
  const availableSPs = useMemo(() => getTaxonomySPs(subject, yearLevel, topic, skCode), [subject, yearLevel, topic, skCode]);

  const currentSPData = useMemo(
    () => availableSPs.find(sp => sp.sp_code === spCode) || availableSPs[0] || {},
    [availableSPs, spCode]
  );

  // Auto-populate topic defaults when Subject/Year changes
  useEffect(() => {
    if (availableTopics.length > 0 && !availableTopics.includes(topic)) {
      setTopic(availableTopics[0]);
    }
  }, [subject, yearLevel, availableTopics, topic]);

  useEffect(() => {
    if (availableSKs.length > 0) {
      setSkCode(availableSKs[0].sk_code);
    }
  }, [topic, availableSKs]);

  useEffect(() => {
    if (availableSPs.length > 0) {
      setSpCode(availableSPs[0].sp_code);
    }
  }, [skCode, availableSPs]);

  // Update Pedagogy Context when selection changes
  useEffect(() => {
    const pCtx = getPedagogyContext(subject, yearLevel, topic);
    if (pCtx) {
      if (pCtx.common_misconception) setMisconceptionShield(pCtx.common_misconception);
      if (pCtx.default_widget_type) setSelectedWidget(pCtx.default_widget_type);
    }
  }, [subject, yearLevel, topic]);

  // SECTION 3: AI GENERATION HANDLER
  const handleGeneratePackage = async (version = "v1") => {
    setGenerating(true);
    setPublishStatus("DRAFT");

    try {
      if (version === "v2") {
        const res = await generateLesson({
          subject,
          grade: yearLevel,
          sk_code: skCode,
          sp_code: spCode,
          sp_description: currentSPData.title || `Pelajaran SP ${spCode} bagi ${topic}`,
          topic,
          target_tp: targetTP
        });

        if (res.success) {
          setActivePackage({
            version: "2.0",
            lesson: res.lesson,
            admin_metadata: {
              target_tp: targetTP,
              misconception_shield: misconceptionShield,
              widget_focus: selectedWidget
            }
          });
          toast({
            title: "✨ Shell Pelajaran v2 Dijana!",
            description: `Berjaya menjana modul ${subject} (${yearLevel}) menggunakan saluran baru.`
          });
        } else {
          console.error("Validation failed:", res.validation?.errors);
          toast({
            variant: "destructive",
            title: "Gagal Menjana Shell",
            description: res.validation?.errors?.[0] || "Ralat pengesahan struktur AI."
          });
        }
      } else {
        // Legacy v1.0 Generation
        const res = await generateKSSRMissionPackage({
          spCode,
          spDescription: currentSPData.title || `Pelajaran SP ${spCode} bagi ${topic}`,
          skCode,
          grade: yearLevel,
          subject,
          topic,
          pbdTarget: targetTP
        });

        if (res.success) {
          const pkg = res.missionPackage || res.adventurePackage;
          if (pkg?.admin_metadata) {
            pkg.admin_metadata.target_tp = targetTP;
            pkg.admin_metadata.misconception_shield = misconceptionShield;
            pkg.admin_metadata.widget_focus = selectedWidget;
          }
          setActivePackage(pkg);
          toast({
            title: "✨ Pakej Legasi Dijana!",
            description: `Berjaya menjana modul lama ${subject} (${yearLevel}).`
          });
        } else {
          toast({
            variant: "destructive",
            title: "Gagal Menjana Pakej",
            description: res.validation_errors?.[0] || "Ralat pengesahan skema AI."
          });
        }
      }
    } catch (err) {
      console.error("Studio Generation Error:", err);
      toast({
        variant: "destructive",
        title: "Ralat Sistem AI",
        description: err.message || "Terdapat ralat semasa menjana pakej pelajaran."
      });
    } finally {
      setGenerating(false);
    }
  };

  // INTERACTIVE BLOCK OVERRIDE HANDLERS
  const handleDialogueOverride = (newDialogue) => {
    if (!activePackage) return;

    if (activePackage.version === "2.0") {
      setActivePackage(prev => {
        const newLesson = JSON.parse(JSON.stringify(prev.lesson));
        const introBlock = newLesson.blocks?.find(b => b.block_type === "INTRO" || b.content?.mascot_dialogue !== undefined);
        if (introBlock?.content) {
          introBlock.content.mascot_dialogue = newDialogue;
        }
        return { ...prev, lesson: newLesson };
      });
    } else {
      setActivePackage(prev => ({
        ...prev,
        student_ui: {
          ...prev.student_ui,
          mascot_dialogue: newDialogue
        }
      }));
    }
  };

  const handleWidgetOverride = (newWidget) => {
    setSelectedWidget(newWidget);
    if (!activePackage) return;

    setActivePackage(prev => {
      if (prev.version === "2.0" && prev.lesson) {
        const updatedBlocks = (prev.lesson.blocks || []).map(b => {
          if (b.block_type === "PRACTICE" || b.content?.widget_type !== undefined) {
            return {
              ...b,
              content: { ...b.content, widget_type: newWidget }
            };
          }
          return b;
        });
        return {
          ...prev,
          lesson: { ...prev.lesson, blocks: updatedBlocks }
        };
      }

      const updatedSteps = (prev.steps || []).map(st => {
        if (st.step_type === "PRACTICE") {
          return {
            ...st,
            payload: { ...st.payload, widget_type: newWidget }
          };
        }
        return st;
      });
      return { ...prev, steps: updatedSteps };
    });
  };

  // PUBLISHING DISPATCHER HANDLER
  const handlePublishLesson = () => {
    if (!activePackage) return;

    const publishedRecord = {
      id: `lesson_${Date.now()}`,
      status: "PUBLISHED",
      published_at: new Date().toISOString(),
      assigned_class: assignedClass,
      subject,
      grade: yearLevel,
      sp_code: spCode,
      topic,
      lesson_data: activePackage
    };

    setPublishStatus("PUBLISHED");
    setPublishedLesson(publishedRecord);

    toast({
      title: "🚀 Pelajaran Berjaya Diterbitkan!",
      description: `Modul SP ${spCode} (${topic}) kini aktif untuk murid kelas ${assignedClass}.`
    });
  };

  // Safe Dynamic Content Extraction for Edit View
  const currentDialogue = useMemo(() => {
    if (!activePackage) return "";
    if (activePackage.version === "2.0") {
      const block = activePackage.lesson?.blocks?.find(b => b.block_type === "INTRO" || b.content?.mascot_dialogue !== undefined);
      return block?.content?.mascot_dialogue || "";
    }
    return activePackage.student_ui?.mascot_dialogue || "";
  }, [activePackage]);

  const currentQuizQuestions = useMemo(() => {
    if (!activePackage) return [];
    if (activePackage.version === "2.0") {
      const quizBlock = activePackage.lesson?.blocks?.find(b => b.block_type === "QUIZ" || b.content?.questions !== undefined);
      return quizBlock?.content?.questions || [];
    }
    const quizStep = activePackage.steps?.find(st => st.step_type === "QUIZ");
    return quizStep?.questions || [];
  }, [activePackage]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 sm:p-8 space-y-8 font-sans">
      {/* HEADER BAR & PUBLISH ACTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
            🐢
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Studio Penjanaan & Penerbitan Pelajaran <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">v1.0 KSSR</span>
            </h1>
            <p className="text-xs text-stone-400 font-medium">
              Pusat Rekabentuk, Penyuntingan Teks & Penerbitan Modul Interaktif KSSR & PBD
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activePackage && (
            <Button
              onClick={handlePublishLesson}
              disabled={publishStatus === "PUBLISHED"}
              className={`h-11 px-5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${
                publishStatus === "PUBLISHED"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                  : "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 shadow-lg border-b-4 border-emerald-700"
              }`}
            >
              {publishStatus === "PUBLISHED" ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Diterbitkan ke Kelas ✓</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 text-stone-950" />
                  <span>🚀 Terbitkan Pelajaran ke Kelas</span>
                </>
              )}
            </Button>
          )}

          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded-xl text-xs font-bold transition-all"
          >
            Papan Pemuka
          </button>
        </div>
      </div>

      {/* STUDIO LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CONFIGURATOR & TRIGGER */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SECTION 1: DSKP SELECTION HUB */}
          <Card className="bg-stone-900/90 border-stone-800 shadow-xl">
            <CardHeader className="border-b border-stone-800/60 pb-3">
              <CardTitle className="text-sm font-black text-amber-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" /> 1. Hub Pemilih DSKP & Kelas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Subjek</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-10 px-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 font-bold focus:border-amber-500 outline-none"
                  >
                    {availableSubjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Tahun / Darjah</label>
                  <select
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value)}
                    className="w-full h-10 px-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 font-bold focus:border-amber-500 outline-none"
                  >
                    {availableYears.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase">Tajuk Utama DSKP</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full h-10 px-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 font-bold focus:border-amber-500 outline-none"
                >
                  {availableTopics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Standard Kandungan (SK)</label>
                  <select
                    value={skCode}
                    onChange={(e) => setSkCode(e.target.value)}
                    className="w-full h-10 px-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 font-bold focus:border-amber-500 outline-none"
                  >
                    {availableSKs.map(sk => <option key={sk.sk_code} value={sk.sk_code}>SK {sk.sk_code} - {sk.title}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Standard Pembelajaran (SP)</label>
                  <select
                    value={spCode}
                    onChange={(e) => setSpCode(e.target.value)}
                    className="w-full h-10 px-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 font-bold focus:border-amber-500 outline-none"
                  >
                    {availableSPs.map(sp => <option key={sp.sp_code} value={sp.sp_code}>SP {sp.sp_code}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase">Sasaran Kelas Sasaran</label>
                <select
                  value={assignedClass}
                  onChange={(e) => setAssignedClass(e.target.value)}
                  className="w-full h-10 px-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 font-bold focus:border-amber-500 outline-none"
                >
                  <option value="class_4_cemerlang">Kelas 4 Cemerlang</option>
                  <option value="class_1_pintar">Kelas 1 Pintar</option>
                  <option value="class_3_bijak">Kelas 3 Bijak</option>
                </select>
              </div>

            </CardContent>
          </Card>

          {/* SECTION 2: PEDAGOGICAL & WIDGET CONFIGURATOR */}
          <Card className="bg-stone-900/90 border-stone-800 shadow-xl">
            <CardHeader className="border-b border-stone-800/60 pb-3">
              <CardTitle className="text-sm font-black text-cyan-400 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" /> 2. Konfigurasi Pedagogi & Widget
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs font-sans">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase">Sasaran Tahap Penguasaan (TP1 - TP6)</label>
                <div className="grid grid-cols-6 gap-1.5">
                  {["TP1", "TP2", "TP3", "TP4", "TP5", "TP6"].map((tp) => (
                    <button
                      key={tp}
                      onClick={() => setTargetTP(tp)}
                      className={`h-9 rounded-xl text-xs font-black transition-all ${
                        targetTP === tp
                          ? "bg-cyan-500 text-stone-950 shadow-md scale-105"
                          : "bg-stone-950 text-stone-400 border border-stone-800 hover:text-white"
                      }`}
                    >
                      {tp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase">Fokus Widget Interaktif EduGame</label>
                <select
                  value={selectedWidget}
                  onChange={(e) => handleWidgetOverride(e.target.value)}
                  className="w-full h-10 px-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 font-bold focus:border-cyan-500 outline-none"
                >
                  <option value="base_ten_blocks">🔢 Blok Base Ten (Matematik CPA)</option>
                  <option value="drag_and_drop">🎯 Tarik & Lepas (Drag & Drop Category Sorter)</option>
                  <option value="matching_cards">🎴 Kad Padanan Istilah & Maksud</option>
                  <option value="quiz_wheel">🎰 Roda Cabaran Soalan Misteri</option>
                  <option value="money_counter">🪙 Kira Wang Ringgit & Sen (Kewangan)</option>
                  <option value="clock_face">⏰ Muka Jam Analog & Digital (Masa)</option>
                  <option value="shape_sorter">📐 Pengelas Bentuk 2D & 3D (Geometri)</option>
                  <option value="fraction_slicer">🍕 Pemotong Pecahan Pizza (Pecahan)</option>
                  <option value="sentence_builder">📚 Pembina Ayat Gramatis (Bahasa Melayu)</option>
                </select>
              </div>

            </CardContent>
          </Card>

          {/* AI GENERATION TRIGGER BUTTONS */}
          <div className="p-6 bg-gradient-to-r from-amber-950/40 via-stone-900 to-indigo-950/40 rounded-3xl border-2 border-amber-500/30 shadow-2xl space-y-4 text-center">
            <button
              onClick={() => handleGeneratePackage("v1")}
              disabled={generating}
              className="w-full h-12 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-300 font-bold text-sm sm:text-base rounded-xl border border-stone-700 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Jana (Legasi v1.0)</span>
            </button>
            <button
              onClick={() => handleGeneratePackage("v2")}
              disabled={generating}
              className="w-full h-14 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-stone-950 font-black text-sm sm:text-base rounded-2xl shadow-xl border-b-4 border-emerald-700 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-stone-950" />
                  <span>Suku Penyu sedang merangka (v2.0)... 🐢</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-stone-950" />
                  <span>⚡ Jana Pelajaran AI Baru (v2.0 Shell)</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: STUDIO EDITOR & PREVIEW */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="p-2 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-between">
            <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800">
              <button
                onClick={() => setStudioMode("PREVIEW")}
                className={`px-4 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                  studioMode === "PREVIEW"
                    ? "bg-amber-500 text-stone-950 shadow-md"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> 👁️ Pratonton Live Murid
              </button>

              <button
                onClick={() => setStudioMode("EDIT")}
                className={`px-4 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                  studioMode === "EDIT"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> ✏️ Sunting Teks Pelajaran
              </button>
            </div>

            {publishStatus === "PUBLISHED" && (
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> AKTIF DITERBITKAN
              </span>
            )}
          </div>

          {/* VIEW A: LIVE STUDENT PREVIEW */}
          {studioMode === "PREVIEW" && (
            <div className="space-y-4">
              {activePackage ? (
                <UniversalLessonPreview lessonPackage={activePackage} previewMode={true} />
              ) : (
                <div className="p-12 bg-stone-900/60 border border-stone-800 rounded-3xl text-center space-y-3">
                  <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
                  <h4 className="text-base font-black text-white">Sedia Untuk Pratinjau</h4>
                  <p className="text-xs text-stone-400 max-w-md mx-auto">
                    Klik butang <strong>"⚡ Jana Pelajaran AI"</strong> untuk melihat simulator pengalaman pelajar secara live.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* VIEW B: INTERACTIVE BLOCK OVERRIDE STUDIO */}
          {studioMode === "EDIT" && (
            <Card className="bg-stone-900 border-stone-800 shadow-xl text-xs font-sans">
              <CardHeader className="border-b border-stone-800/60 pb-3">
                <CardTitle className="text-sm font-black text-indigo-400 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-400" /> Studio Penyuntingan Teks Blok Guru
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {activePackage ? (
                  <div className="space-y-4">
                    
                    {/* Mascot Speech Override */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-400 uppercase">
                        🗣️ Dialogue Mascot Suku Penyu ({`{student_name}`} placeholder)
                      </label>
                      <textarea
                        value={currentDialogue}
                        onChange={(e) => handleDialogueOverride(e.target.value)}
                        rows={2}
                        className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-xs font-medium focus:border-amber-500 outline-none resize-none"
                      />
                    </div>

                    {/* Quiz Questions Override */}
                    <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-3">
                      <span className="font-bold text-rose-400 block">❓ Soalan Pentaksiran Diagnostik (PBD):</span>
                      {currentQuizQuestions.map((q, qI) => (
                        <div key={qI} className="space-y-2 p-3 bg-stone-900 rounded-xl border border-stone-800">
                          <label className="text-[10px] font-bold text-stone-400 uppercase">Batang Soalan {qI + 1}:</label>
                          <input
                            type="text"
                            value={q.question || q.stem || ""}
                            onChange={(e) => {
                              const newQText = e.target.value;
                              if (activePackage.version === "2.0") {
                                setActivePackage(prev => {
                                  const newLesson = JSON.parse(JSON.stringify(prev.lesson));
                                  const quizBlock = newLesson.blocks?.find(b => b.block_type === "QUIZ" || b.content?.questions !== undefined);
                                  if (quizBlock?.content?.questions?.[qI]) {
                                    quizBlock.content.questions[qI].stem = newQText;
                                  }
                                  return { ...prev, lesson: newLesson };
                                });
                              } else {
                                setActivePackage(prev => {
                                  const newSteps = prev.steps.map(st => {
                                    if (st.step_type === "QUIZ") {
                                      const newQs = [...st.questions];
                                      newQs[qI] = { ...newQs[qI], question: newQText };
                                      return { ...st, questions: newQs };
                                    }
                                    return st;
                                  });
                                  return { ...prev, steps: newSteps };
                                });
                              }
                            }}
                            className="w-full h-9 px-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 font-bold focus:border-amber-500 outline-none"
                          />
                        </div>
                      ))}
                    </div>

                  </div>
                ) : (
                  <div className="p-8 text-center text-stone-500">
                    Tiada kandungan untuk disunting. Sila jana pakej pelajaran terlebih dahulu.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>

      </div>
    </div>
  );
}
