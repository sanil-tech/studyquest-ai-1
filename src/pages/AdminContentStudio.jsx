// src/pages/AdminContentStudio.jsx
// Phase 4: Modernized 6-Step Malaysian Curriculum (KSSR Semakan / KSSM & DSKP) Lesson Authoring Studio
// Step 1: Select Curriculum ➔ Step 2: Choose Topic & Standard ➔ Step 3: Generate AI Package ➔ Step 4: Review Blocks ➔ Step 5: AI Quality Check ➔ Step 6: Publish

const DSKP_MAPPING = {
  "Matematik": {
    "Tahun 1": {
      "Nombor hingga 100": {
        "SK 1.4 Nilai Tempat": [
          "SP 1.4.1 Menyatakan nilai tempat dan nilai digit bagi sebarang nombor hingga 100."
        ],
        "SK 1.5 Membandingkan Nombor": [
          "SP 1.5.1 Membandingkan nilai dua nombor menggunakan lebih besar atau lebih kecil."
        ]
      },
      "Pecahan": {
        "SK 1.1 Pecahan": [
          "SP 1.1.1 Mengenal pasti pecahan satu perdua, satu perempat, dua perempat dan tiga perempat."
        ]
      }
    },
    "Tahun 4": {
      "Pecahan, Perpuluhan dan Peratus": {
        "SK 1.1 Pecahan": [
          "SP 1.1.1 Menyelesaikan ayat matematik tambah hingga tiga nombor melibatkan pecahan wajar."
        ]
      }
    }
  }
};

import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContentHierarchy from "@/components/admin/ContentHierarchy";
import CompletenessDashboard from "@/components/admin/CompletenessDashboard";
import AIGenerationPanel from "@/components/admin/AIGenerationPanel";
import LessonVideoField from "@/components/admin/LessonVideoField";
import ManualContentPanel from "@/components/admin/ManualContentPanel";
import ContentQualityPanel from "@/components/admin/ContentQualityPanel";
import { validateLessonQuality, saveLessonReview } from "@/services/contentQualityService";
import {
  BookOpen,
  Loader2,
  Send,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Award,
  Zap,
  RefreshCw,
  ChevronRight,
  Sliders,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export default function AdminContentStudio() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Active Wizard Step (1 to 6)
  const [activeStep, setActiveStep] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [completeness, setCompleteness] = useState(null);
  const [loadingCompleteness, setLoadingCompleteness] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  
  // Preview Approval Workflow States
  const [previewChecklist, setPreviewChecklist] = useState({ content: false, interactive: false, reward: false });
  const [previewApproved, setPreviewApproved] = useState(false);
  const [approvingPreview, setApprovingPreview] = useState(false);

  // Curriculum State (Phase 1 & 4)
  const [subject, setSubject] = useState("Matematik");
  const [curriculumType, setCurriculumType] = useState("KSSR_SEMAKAN");
  const [educationLevel, setEducationLevel] = useState("PRIMARY");
  const [yearLevel, setYearLevel] = useState("Tahun 4");
  const [topic, setTopic] = useState("Pecahan, Perpuluhan dan Peratus");
  const [skCode, setSkCode] = useState("");
  const [spCode, setSpCode] = useState("");
  const [availableSKs, setAvailableSKs] = useState([]);
  const [availableSPs, setAvailableSPs] = useState([]);

  // Block Review & Single Block Regeneration State (Phase 4 & 5)
  const [blocks, setBlocks] = useState([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [regeneratingBlockId, setRegeneratingBlockId] = useState(null);
  const [blockApprovalStatus, setBlockApprovalStatus] = useState({});

  // Generation & Quality Audit State (Phase 2 & 3)
  const [generatingPackage, setGeneratingPackage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [evaluatingQuality, setEvaluatingQuality] = useState(false);
  const [qualityReport, setQualityReport] = useState(null);

  const handleHierarchySelect = useCallback((selection) => {
    setSelectedVersion(selection.version);
    setPublishResult(null);
    setQualityReport(null);
    
    if (selection.subjectName) setSubject(selection.subjectName);
    if (selection.levelName) setYearLevel(selection.levelName);
    if (selection.topicName) setTopic(selection.topicName);
  }, []);

  useEffect(() => {
    const topicData = DSKP_MAPPING[subject]?.[yearLevel]?.[topic];
    if (topicData) {
      const sks = Object.keys(topicData);
      setAvailableSKs(sks);
      
      let currentSk = skCode;
      if (!sks.includes(skCode)) {
        currentSk = sks[0];
        setSkCode(currentSk);
      }
      
      const sps = topicData[currentSk] || [];
      setAvailableSPs(sps);
      
      if (!sps.includes(spCode)) {
        setSpCode(sps[0] || "");
      }
    } else {
      setAvailableSKs(["SK Default"]);
      setAvailableSPs(["SP Default"]);
      setSkCode("SK Default");
      setSpCode("SP Default");
    }
  }, [subject, yearLevel, topic]);

  useEffect(() => {
    const topicData = DSKP_MAPPING[subject]?.[yearLevel]?.[topic];
    if (topicData) {
      const sps = topicData[skCode] || [];
      setAvailableSPs(sps);
      if (!sps.includes(spCode)) {
        setSpCode(sps[0] || "");
      }
    }
  }, [skCode, subject, yearLevel, topic, spCode]);

  const fetchCompletenessAndBlocks = useCallback(async () => {
    if (!selectedVersion) {
      setCompleteness(null);
      setBlocks([]);
      return;
    }
    setLoadingCompleteness(true);
    setLoadingBlocks(true);
    try {
      const [compRes, blocksRes] = await Promise.all([
        base44.functions.invoke("getLessonCompleteness", { lesson_version_id: selectedVersion }),
        base44.entities.LessonBlock.filter({ lesson_version_id: selectedVersion }),
      ]);
      setCompleteness(compRes.data);
      setBlocks(blocksRes || []);
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setLoadingCompleteness(false);
      setLoadingBlocks(false);
    }
  }, [selectedVersion]);

  useEffect(() => {
    fetchCompletenessAndBlocks();
  }, [fetchCompletenessAndBlocks]);

  // Step 3: Generate Full 7-Part DSKP Lesson Package
  const handleGeneratePackage = async () => {
    if (!selectedVersion) return;
    setGeneratingPackage(true);
    setGenerationProgress(20);
    try {
      setGenerationProgress(50);
      const res = await base44.functions.invoke("generateModularLessonContent", {
        lesson_version_id: selectedVersion,
        sk_code: skCode,
        sp_code: spCode,
        subject: subject,
        year_level: yearLevel,
        curriculum_type: curriculumType,
        topic: topic,
        language: "Bahasa Melayu",
        taxonomy: "Bloom",
      });

      setGenerationProgress(85);
      if (res.data?.success) {
        setGenerationProgress(100);
        await fetchCompletenessAndBlocks();
        await handleEvaluateQuality();
        setActiveStep(4); // Move to Step 4: Block Review
        toast({ title: "Berjaya!", description: "Pakej Pelajaran AI berjaya dijana." });
      } else {
        toast({ title: "Ralat Penjanaan", description: res.data?.error || "Gagal menjana pakej pelajaran.", variant: "destructive" });
      }
    } catch (err) {
      console.error("Generate package error:", err);
      toast({ title: "Ralat Sistem", description: err.message || "Gagal menjana modul.", variant: "destructive" });
    } finally {
      setGeneratingPackage(false);
    }
  };

  // Step 4: Single Block Regeneration (Token Optimization)
  const handleRegenerateBlock = async (blockId) => {
    try {
      setRegeneratingBlockId(blockId);
      const res = await base44.functions.invoke("regenerateLessonBlock", {
        block_id: blockId,
      });
      if (res.data?.success) {
        await fetchCompletenessAndBlocks();
      }
    } catch (err) {
      console.error("Regenerate block error:", err);
    } finally {
      setRegeneratingBlockId(null);
    }
  };

  const handleToggleBlockApproval = (blockId, isApproved) => {
    setBlockApprovalStatus((prev) => ({
      ...prev,
      [blockId]: isApproved,
    }));
  };

  // Step 5: Evaluate Quality (5-Part Rubric & Tiers)
  const handleEvaluateQuality = async () => {
    if (!selectedVersion || !completeness) return;
    setEvaluatingQuality(true);
    try {
      const lessonObj = {
        title: completeness.title,
        learning_objective: completeness.learning_objective,
        content_blocks: blocks
      };
      
      const report = await validateLessonQuality(lessonObj, true);
      setQualityReport(report);
      await saveLessonReview(selectedVersion, report);
    } catch (err) {
      console.error("Evaluate quality error:", err);
    } finally {
      setEvaluatingQuality(false);
    }
  };

  // Step 6: Preview and Publish Workflow
  const handlePreview = () => {
    window.open(`/lesson/preview/preview?preview=true&lesson_version_id=${selectedVersion}`, "_blank");
  };

  const handleApprovePreview = async () => {
    setApprovingPreview(true);
    try {
      const res = await base44.functions.invoke("approveLessonPreview", {
        lesson_version_id: selectedVersion,
        preview_status: "APPROVED",
        preview_checklist_completed: true
      });
      if (res.data?.success) {
        setPreviewApproved(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApprovingPreview(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setPublishResult(null);
    try {
      const res = await base44.functions.invoke("publishLessonVersion", {
        lesson_version_id: selectedVersion,
      });
      setPublishResult(res.data);
      if (res.data?.success) {
        fetchCompletenessAndBlocks();
      }
    } catch (err) {
      setPublishResult({ success: false, error: err.message || "Gagal menerbitkan." });
    } finally {
      setPublishing(false);
    }
  };

  const WIZARD_STEPS = [
    { num: 1, label: "Pilih Kurikulum" },
    { num: 2, label: "Pilih SK & SP" },
    { num: 3, label: "Jana Pakej AI" },
    { num: 4, label: "Semak Blok" },
    { num: 5, label: "Audit Kualiti" },
    { num: 6, label: "Terbitkan" },
  ];

  return (
    <div className="min-h-screen bg-stone-950 font-sans text-stone-100 p-4 sm:p-6 max-w-6xl mx-auto space-y-6 text-left">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="p-2 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-300 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-white">
              <BookOpen className="w-6 h-6 text-amber-400" /> Studio Penulisan Modul DSKP KPM
            </h1>
            <p className="text-xs text-stone-400 font-bold">
              Wizard Penggubalan Kandungan Kurikulum KSSR Semakan & KSSM
            </p>
          </div>
        </div>
      </div>

      {/* Content Hierarchy Selection Header */}
      <Card className="bg-stone-900/90 border-stone-800 shadow-xl">
        <CardContent className="p-4">
          <ContentHierarchy onSelect={handleHierarchySelect} />
        </CardContent>
      </Card>

      {/* 6-STEP WIZARD PROGRESS BAR */}
      <div className="p-4 bg-stone-900/90 border border-stone-800 rounded-3xl shadow-xl">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
          {WIZARD_STEPS.map((s) => {
            const isActive = activeStep === s.num;
            const isDone = activeStep > s.num;
            return (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className={`p-2.5 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1 ${
                  isActive
                    ? "bg-amber-400 text-stone-950 border-amber-500 shadow-lg scale-105"
                    : isDone
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                    : "bg-stone-950 text-stone-500 border-stone-800"
                }`}
              >
                <span className="text-[10px] font-black uppercase">Langkah {s.num}</span>
                <span className="truncate max-w-full">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!selectedVersion && (
        <Card className="bg-stone-900/50 border-stone-800">
          <CardContent className="p-8 text-center text-stone-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-400" />
            <p className="text-sm font-bold">Sila pilih versi pelajaran dalam hierarki di atas untuk memulakan Wizard Penulisan.</p>
          </CardContent>
        </Card>
      )}

      {selectedVersion && (
        <>
          {/* STEP 1: SELECT CURRICULUM */}
          {activeStep === 1 && (
            <Card className="bg-stone-900/90 border-stone-800 shadow-xl space-y-4">
              <CardHeader>
                <CardTitle className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" /> Langkah 1: Tetapkan Asas Kurikulum KPM
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-300">Subjek</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 text-white text-xs rounded-xl p-3 font-bold"
                    >
                      <option value="Matematik">Matematik</option>
                      <option value="Sains">Sains</option>
                      <option value="Bahasa Melayu">Bahasa Melayu</option>
                      <option value="Sejarah">Sejarah</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-300">Rangka Kurikulum</label>
                    <select
                      value={curriculumType}
                      onChange={(e) => setCurriculumType(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 text-white text-xs rounded-xl p-3 font-bold"
                    >
                      <option value="KSSR_SEMAKAN">KSSR Semakan (Rendah)</option>
                      <option value="KSSM">KSSM (Menengah)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-300">Tingkatan / Tahun</label>
                    <select
                      value={yearLevel}
                      onChange={(e) => setYearLevel(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 text-white text-xs rounded-xl p-3 font-bold"
                    >
                      <option value="Tahun 1">Tahun 1</option>
                      <option value="Tahun 2">Tahun 2</option>
                      <option value="Tahun 3">Tahun 3</option>
                      <option value="Tahun 4">Tahun 4</option>
                      <option value="Tahun 5">Tahun 5</option>
                      <option value="Tahun 6">Tahun 6</option>
                      <option value="Tingkatan 1">Tingkatan 1</option>
                      <option value="Tingkatan 2">Tingkatan 2</option>
                      <option value="Tingkatan 3">Tingkatan 3</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="h-10 px-6 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl border-b-2 border-amber-600 flex items-center gap-1.5"
                  >
                    <span>Seterusnya: Pilih SK & SP</span> <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: CHOOSE TOPIC & LEARNING STANDARD */}
          {activeStep === 2 && (
            <Card className="bg-stone-900/90 border-stone-800 shadow-xl space-y-4">
              <CardHeader>
                <CardTitle className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" /> Langkah 2: Pilih Tajuk, SK & SP DSKP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-300">Tajuk Modul</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 text-white text-xs rounded-xl p-3 font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-300">Standard Kandungan (SK Code)</label>
                      <select
                        value={skCode}
                        onChange={(e) => setSkCode(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 text-white text-xs rounded-xl p-3 font-bold"
                      >
                        {availableSKs.map(sk => (
                          <option key={sk} value={sk}>{sk}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-300">Standard Pembelajaran (SP Code)</label>
                      <select
                        value={spCode}
                        onChange={(e) => setSpCode(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 text-white text-xs rounded-xl p-3 font-bold"
                      >
                        {availableSPs.map(sp => (
                          <option key={sp} value={sp}>{sp}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setActiveStep(1)}
                    className="h-10 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="h-10 px-6 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl border-b-2 border-amber-600 flex items-center gap-1.5"
                  >
                    <span>Seterusnya: Jana Pakej AI</span> <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 3: GENERATE AI PACKAGE */}
          {activeStep === 3 && (
            <Card className="bg-gradient-to-br from-indigo-950/40 via-stone-900 to-amber-950/40 border-2 border-indigo-500/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-sm font-black text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Langkah 3: Penjanaan Pakej Pelajaran AI 7-Bahagian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-stone-300 font-medium leading-relaxed">
                  Sistem akan menjana modul DSKP lengkap merangkumi Set Induksi Misteri Suku 🐢, Nota 5-Fasa, Contoh Terbimbing, 3 Aktiviti Interaktif, Pentaksiran PBD, dan Ganjaran Syiling/XP.
                </p>

                {generatingPackage && (
                  <div className="space-y-2 py-4">
                    <div className="flex items-center justify-between text-xs font-black text-indigo-300">
                      <span>Penjanaan Berlangsung...</span>
                      <span>{generationProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-800 p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="h-10 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl"
                  >
                    Kembali
                  </button>

                  <button
                    onClick={handleGeneratePackage}
                    disabled={generatingPackage}
                    className="h-11 px-8 bg-indigo-500 hover:bg-indigo-400 text-stone-950 font-black text-xs rounded-xl border-b-4 border-indigo-700 active:translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    {generatingPackage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Jana Modul Pelajaran DSKP 7-Bahagian Lengkap</span>
                      </>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 4: REVIEW & EDIT CONTENT BLOCKS */}
          {activeStep === 4 && (
            <Card className="bg-stone-900/90 border-stone-800 shadow-xl space-y-4">
              <CardHeader>
                <CardTitle className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400" /> Langkah 4: Semak & Sahkan Blok Kandungan ({blocks.length} Blok)
                  </span>
                  <button
                    onClick={fetchCompletenessAndBlocks}
                    className="text-xs text-stone-400 font-bold flex items-center gap-1 hover:text-white"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Muat Semula
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingBlocks ? (
                  <div className="py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto" />
                  </div>
                ) : blocks.length > 0 ? (
                  <div className="space-y-3">
                    {blocks.map((block, idx) => {
                      const isRegenerating = regeneratingBlockId === block.id;
                      const isApproved = blockApprovalStatus[block.id] !== false;

                      return (
                        <div
                          key={block.id || idx}
                          className="p-4 bg-stone-950/90 rounded-2xl border border-stone-800 space-y-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-black rounded-lg uppercase">
                                Blok #{block.order_number || idx + 1}: {block.block_type}
                              </span>
                              <span className="text-[10px] font-bold text-stone-400 uppercase">
                                Fasa: {block.pedagogical_phase || "CONCEPT"}
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-black text-white">{block.title || `Blok Kandungan ${block.block_type}`}</h4>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleRegenerateBlock(block.id)}
                              disabled={isRegenerating}
                              className="px-3 h-8 bg-stone-800 hover:bg-stone-700 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold rounded-xl flex items-center gap-1"
                            >
                              {isRegenerating ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <RotateCcw className="w-3 h-3" /> Semula
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleToggleBlockApproval(block.id, true)}
                              className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                                isApproved ? "bg-emerald-950 text-emerald-300 border-emerald-500/40" : "bg-stone-900 text-stone-500 border-stone-800"
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleBlockApproval(block.id, false)}
                              className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                                !isApproved ? "bg-rose-950 text-rose-300 border-rose-500/40" : "bg-stone-900 text-stone-500 border-stone-800"
                              }`}
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 font-bold py-4 text-center">
                    Belum ada blok kandungan. Sila tekan "Jana Pakej AI" pada Langkah 3.
                  </p>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setActiveStep(3)}
                    className="h-10 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={() => {
                      handleEvaluateQuality();
                      setActiveStep(5);
                    }}
                    disabled={blocks.length === 0}
                    className="h-10 px-6 bg-amber-400 hover:bg-amber-300 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-black text-xs rounded-xl border-b-2 border-amber-600 disabled:border-stone-800 flex items-center gap-1.5"
                  >
                    <span>Seterusnya: Audit Kualiti AI</span> <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 5: AI QUALITY CHECK */}
          {activeStep === 5 && (
            <Card className="bg-stone-900/90 border-stone-800 shadow-xl space-y-4">
              <CardHeader>
                <CardTitle className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" /> Langkah 5: Penilaian Audit Kualiti DSKP AI (5 Matriks)
                  </span>
                  <button
                    onClick={handleEvaluateQuality}
                    disabled={evaluatingQuality}
                    className="text-xs text-amber-300 font-bold flex items-center gap-1 hover:underline"
                  >
                    {evaluatingQuality ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Audit Semula
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {qualityReport ? (
                  <ContentQualityPanel 
                    report={qualityReport} 
                    onApprove={() => setActiveStep(6)} 
                    onReject={() => setActiveStep(4)} 
                  />
                ) : (
                  <div className="py-8 text-center">
                    <button
                      onClick={handleEvaluateQuality}
                      disabled={evaluatingQuality}
                      className="px-6 h-10 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 mx-auto"
                    >
                      {evaluatingQuality ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />} Jalankan Audit Kualiti AI Sekarang
                    </button>
                    <div className="flex justify-between pt-6">
                      <button
                        onClick={() => setActiveStep(4)}
                        className="h-10 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl"
                      >
                        Kembali
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* STEP 6: PUBLISH WITH QUALITY SHIELD */}
          {activeStep === 6 && (
            <Card className="bg-stone-900/90 border-stone-800 shadow-xl space-y-4">
              <CardHeader>
                <CardTitle className="text-sm font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" /> Langkah 6: Penerbitan Modul DSKP Rasmi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-stone-300 font-medium leading-relaxed">
                  Modul yang diterbitkan akan terus muncul dalam Dashboard Pembelajaran Murid. Perisai Kualiti AI akan memastikan skor kualiti mencapai sekurang-kurangnya 80% sebelum menerbit.
                </p>

                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-300">Pratonton Pelajar (Wajib)</span>
                    <button
                      onClick={handlePreview}
                      disabled={qualityReport?.quality_score < 80}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-[10px] rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Buka Pratonton
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-400">
                      <input type="checkbox" checked={previewChecklist.content} onChange={e => setPreviewChecklist(p => ({...p, content: e.target.checked}))} className="rounded text-amber-500" />
                      Semua blok kandungan dan arahan jelas
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-400">
                      <input type="checkbox" checked={previewChecklist.interactive} onChange={e => setPreviewChecklist(p => ({...p, interactive: e.target.checked}))} className="rounded text-amber-500" />
                      Aktiviti interaktif (kuiz, dll) berfungsi dengan baik
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-400">
                      <input type="checkbox" checked={previewChecklist.reward} onChange={e => setPreviewChecklist(p => ({...p, reward: e.target.checked}))} className="rounded text-amber-500" />
                      Format mematuhi standard DSKP KPM
                    </label>
                  </div>

                  <button
                    onClick={handleApprovePreview}
                    disabled={approvingPreview || previewApproved || !previewChecklist.content || !previewChecklist.interactive || !previewChecklist.reward}
                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 text-white disabled:text-stone-500 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    {approvingPreview ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {previewApproved ? "Pratonton Telah Diluluskan ✅" : "Luluskan Pratonton Ini"}
                  </button>
                </div>

                <button
                  onClick={handlePublish}
                  disabled={publishing || !previewApproved}
                  className="w-full sm:w-auto h-12 px-8 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 text-stone-950 disabled:text-stone-500 font-black text-xs rounded-xl border-b-4 disabled:border-b-0 border-amber-700 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Terbitkan Modul DSKP Kepada Murid</span>
                </button>

                {publishResult && (
                  <div className={`p-4 rounded-2xl text-xs font-bold ${publishResult.success ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40" : "bg-rose-950/80 text-rose-300 border border-rose-500/40"}`}>
                    {publishResult.success ? (
                      <p>✅ {publishResult.message} ({publishResult.completion_percentage}% lengkap)</p>
                    ) : (
                      <div>
                        <p className="font-bold">❌ {publishResult.error}</p>
                        {publishResult.missing?.length > 0 && (
                          <ul className="mt-2 list-disc list-inside text-[11px]">
                            {publishResult.missing.map((m, i) => <li key={i}>{m}</li>)}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}