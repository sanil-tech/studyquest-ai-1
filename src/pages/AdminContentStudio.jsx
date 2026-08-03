// src/pages/AdminContentStudio.jsx
// Phase 4: Modernized 6-Step Malaysian Curriculum (KSSR Semakan / KSSM & DSKP) Lesson Authoring Studio
// Step 1: Select Curriculum ➔ Step 2: Choose Topic & Standard ➔ Step 3: Generate AI Package ➔ Step 4: Review Blocks ➔ Step 5: AI Quality Check ➔ Step 6: Publish

const DSKP_MAPPING = {
  "Matematik": {
    "Tahun 1": {
      "Nombor hingga 100": {
        "SK 1.1 Kuantiti secara intuitif": ["SP 1.1.1 Menyatakan kuantiti secara membandingkan banyak atau sedikit, sama banyak atau tidak sama banyak."],
        "SK 1.2 Nilai Nombor": ["SP 1.2.1 Membilang objek dan menyebut nombor.", "SP 1.2.2 Membandingkan nilai dua kumpulan objek."],
        "SK 1.3 Menulis Nombor": ["SP 1.3.1 Menulis nombor dalam angka dan perkataan."],
        "SK 1.4 Kombinasi Nombor": ["SP 1.4.1 Menyatakan kombinasi nombor satu digit."],
        "SK 1.5 Rangkaian Nombor": ["SP 1.5.1 Menyusun nombor secara tertib menaik dan menurun."],
        "SK 1.6 Nilai Tempat": ["SP 1.6.1 Menyatakan nilai tempat (puluh dan sa) dan nilai digit bagi sebarang nombor."],
        "SK 1.7 Menganggar": ["SP 1.7.1 Memberi anggaran kuantiti yang munasabah."],
        "SK 1.8 Membundarkan Nombor": ["SP 1.8.1 Membundarkan nombor bulat kepada puluh terdekat."],
        "SK 1.9 Pola Nombor": ["SP 1.9.1 Mengenal pasti pola nombor."]
      },
      "Tambah dan Tolak": {
        "SK 2.1 Konsep Tambah dan Tolak": ["SP 2.1.1 Menggunakan perbendaharaan kata dan simbol + dan =.", "SP 2.1.2 Mengenal baki, beza, simbol - dan fakta asas tolak.", "SP 2.1.3 Menggunakan simbol tambah, tolak dan sama dengan."],
        "SK 2.2 Tambah dalam lingkungan 100": ["SP 2.2.1 Menambah dua nombor tanpa dan dengan kumpul semula dalam bentuk lazim."],
        "SK 2.3 Tolak dalam lingkungan 100": ["SP 2.3.1 Menolak dua nombor tanpa dan dengan kumpul semula."],
        "SK 2.4 Selesaikan Masalah": ["SP 2.4.1 Rekabentuk cerita dan menyelesaikan masalah harian.", "SP 2.4.2 Menyelesaikan masalah harian yang melibatkan tambah dan tolak."],
        "SK 2.5 Tambah Berulang": ["SP 2.5.1 Membilang dan menulis ayat matematik tambah berulang."],
        "SK 2.6 Tolak Berturut-turut": ["SP 2.6.1 Membahagi kumpulan objek secara tolak berturut-turut."]
      },
      "Pecahan": {
        "SK 3.1 Konsep satu perdua dan satu perempat": ["SP 3.1.1 Mengenal pasti setengah, suku, satu perdua, dan satu perempat daripada satu objek utuh."]
      },
      "Wang": {
        "SK 4.1 Wang kertas dan duit syiling": ["SP 4.1.1 Mengenal pasti duit syiling (5c, 10c, 20c, 50c) dan wang kertas (RM1, RM5, RM10).", "SP 4.1.2 Mewakilkan nilai wang dan menukar wang yang sama nilai."],
        "SK 4.3 Pengurusan Kewangan": ["SP 4.3.1 Merekodkan sumber wang saku, simpanan, dan perbelanjaan harian."]
      },
      "Masa dan Waktu": {
        "SK 5.1 Hari dan Bulan": ["SP 5.1.1 Menyatakan waktu dalam sehari.", "SP 5.1.2 Menyatakan urutan 7 hari seminggu dan 12 bulan setahun."],
        "SK 5.2 Muka Jam": ["SP 5.2.1 Mengenal pasti jarum jam, jarum minit, serta menyebut waktu tepat, suku jam, dan setengah jam."]
      },
      "Panjang, Jisim dan Isi Padu Cecair": {
        "SK 6.1 Unit bukan piawai": [
          "SP 6.1.1 Membandingkan dan mengukur panjang, jisim dan isi padu cecair menggunakan unit bukan piawai.",
          "SP 6.1.2 Membandingkan dan mengukur panjang menggunakan jengkal, depa, langkah, atau klip kertas.",
          "SP 6.1.3 Menyatakan paras penuh, setengah, suku, dan menyukat isi padu cecair guna cawan/kole."
        ]
      },
      "Bentuk": {
        "SK 7.1 Bentuk 3D": ["SP 7.1.1 Mengenal pasti kubus, kuboid, piramid, kon, silinder, sfera serta ciri-ciri permukaannya."],
        "SK 7.2 Bentuk 2D": ["SP 7.2.1 Mengenal pasti segi empat sama, segi empat tepat, segi tiga, bulatan serta ciri sisinya."]
      },
      "Data": {
        "SK 8.1 Mengumpul data": ["SP 8.1.1 Mengumpul data berdasarkan situasi harian menggunakan kaedah gundal."],
        "SK 8.2 Piktograf": ["SP 8.2.1 Membaca dan memperoleh maklumat daripada piktograf bersimbol."]
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

import kssrTaxonomy from "@/data/kssrTaxonomy.json";
import { getKSSRModeByGrade } from "@/services/generateKSSRContent";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import BlockRenderer from "@/components/lesson/BlockRenderer";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-rose-950/40 border-2 border-rose-500/40 rounded-3xl text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="text-rose-300 font-black">Ralat Rendering Blok</h3>
          <p className="text-rose-400/80 text-xs">{this.state.error?.message || "Data blok tidak lengkap atau rosak."}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function InlineVideoUrlEditor({ blockId, initialPayload, onSaved }) {
  const [videoUrl, setVideoUrl] = useState(() => {
    try {
      const parsed = typeof initialPayload === "string" ? JSON.parse(initialPayload) : (initialPayload || {});
      return parsed.video_url || "";
    } catch { return ""; }
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const parsed = typeof initialPayload === "string" ? JSON.parse(initialPayload) : (initialPayload || {});
      parsed.video_url = videoUrl;
      await base44.entities.LessonBlock.update(blockId, { payload: parsed });
      setSaved(true);
      if (onSaved) onSaved();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Gagal mengemaskini pautan video.");
    } finally {
      setSaving(false);
    }
  };

  const isValid = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

  return (
    <div className="mt-3 w-full p-3 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold text-stone-300">
        Pautan Video (YouTube / MP4)
        {isValid && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
      </div>
      <div className="flex gap-2">
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="flex-1 bg-stone-950 border border-stone-800 text-stone-200 text-xs rounded-lg px-3 h-8 outline-none focus:border-amber-500/50"
          disabled={saving}
        />
        <button
          onClick={handleSave}
          disabled={saving || !videoUrl}
          className="px-3 h-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : (saved ? <CheckCircle2 className="w-3 h-3" /> : "Simpan Pautan")}
        </button>
      </div>
    </div>
  );
}

export default function AdminContentStudio() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Active Wizard Step (1 to 6)
  const [activeStep, setActiveStep] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState("VERSION_KSSR_ACTIVE");
  const [completeness, setCompleteness] = useState(null);
  const [loadingCompleteness, setLoadingCompleteness] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  
  // Preview Approval Workflow States
  const [previewChecklist, setPreviewChecklist] = useState({ content: false, interactive: false, reward: false });
  const [previewApproved, setPreviewApproved] = useState(false);
  const [approvingPreview, setApprovingPreview] = useState(false);

  // Live Preview State (Phase 4)
  const [previewBlock, setPreviewBlock] = useState(null);
  const [previewMission, setPreviewMission] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);

  // Curriculum State (Phase 1 & 4)
  const [subject, setSubject] = useState("Matematik");
  const [curriculumType, setCurriculumType] = useState("KSSR_SEMAKAN");
  const [educationLevel, setEducationLevel] = useState("PRIMARY");
  const [yearLevel, setYearLevel] = useState("Tahun 1");
  const [topic, setTopic] = useState("Nombor hingga 100");
  const [skCode, setSkCode] = useState("");
  const [spCode, setSpCode] = useState("");
  const [activePackage, setActivePackage] = useState(null);
  const [availableTopics, setAvailableTopics] = useState([]);
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
  const [currentStageText, setCurrentStageText] = useState("");
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
    const taxonomySubject = kssrTaxonomy.subjects?.[subject];
    const taxonomyItems = taxonomySubject?.[yearLevel];

    if (Array.isArray(taxonomyItems) && taxonomyItems.length > 0) {
      const sks = Array.from(new Set(taxonomyItems.map(item => item.sk_code)));
      const sps = Array.from(new Set(taxonomyItems.map(item => item.sp_code)));
      setAvailableTopics([topic || `${subject} ${yearLevel}`]);
      setAvailableSKs(sks);
      setAvailableSPs(sps);

      if (!sks.includes(skCode) && sks.length > 0) setSkCode(sks[0]);
      if (!sps.includes(spCode) && sps.length > 0) setSpCode(sps[0]);
    } else {
      const topicsObj = DSKP_MAPPING[subject]?.[yearLevel];
      if (topicsObj) {
        const tKeys = Object.keys(topicsObj);
        setAvailableTopics(tKeys);

        let currentTopic = topic;
        if (!tKeys.includes(topic)) {
          currentTopic = tKeys[0];
          setTopic(currentTopic);
        }

        const topicData = topicsObj[currentTopic];
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
          setAvailableSKs([]);
          setAvailableSPs([]);
        }
      } else {
        setAvailableTopics([topic || "KSSR Semakan"]);
        setAvailableSKs(["1.1", "1.4", "2.1"]);
        setAvailableSPs(["1.1.1", "1.4.1", "2.1.1"]);
      }
    }
  }, [subject, yearLevel, topic, skCode]);

  const activeTaxonomyItems = useMemo(() => {
    return kssrTaxonomy.subjects?.[subject]?.[yearLevel] || [];
  }, [subject, yearLevel]);

  const selectedSPItem = useMemo(() => {
    return activeTaxonomyItems.find(item => item.sp_code === spCode) || null;
  }, [activeTaxonomyItems, spCode]);

  const getSKTitle = useCallback((sk) => {
    const match = activeTaxonomyItems.find(item => item.sk_code === sk);
    return match?.title || match?.sk_title || `Standard Kandungan ${sk}`;
  }, [activeTaxonomyItems]);

  const getSPTitle = useCallback((sp) => {
    const match = activeTaxonomyItems.find(item => item.sp_code === sp);
    return match?.title || match?.sp_title || `Standard Pembelajaran ${sp}`;
  }, [activeTaxonomyItems]);

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

  // Step 3: Generate 9-Step Macro Journey KSSR Mission Package
  const handleGeneratePackage = async () => {
    if (!selectedVersion) return;
    setGeneratingPackage(true);
    setGenerationProgress(0);
    setCurrentStageText("🚀 [Langkah 1: BRIEFING] Menjana Naratif Hook & Dialog Maskot...");
    
    // Simulate progression while waiting
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        const next = prev + Math.floor(Math.random() * 5) + 2;
        if (next > 95) return 95; // Wait at 95% for actual completion
        
        // Update text based on progress
        if (next >= 85) setCurrentStageText("👑 [Langkah 9: REWARD] Menjana Lencana Kembara & Item Drop...");
        else if (next >= 70) setCurrentStageText("🎯 [Langkah 7: QUIZ] Menyedia Penilaian PBD (TP1-TP6 Gamifikasi)...");
        else if (next >= 50) setCurrentStageText("🎮 [Langkah 6: MINI_GAME] Membina Konfigurasi Permainan Mini...");
        else if (next >= 30) setCurrentStageText("📖 [Langkah 3: LESSON] Menerangkan Konsep Utama KSSR Semakan...");
        else if (next >= 15) setCurrentStageText("🖼️ [Langkah 2: ENGAGEMENT] Membina 4-Blok Micro CPA (Visual, Comparison, Steps, Myth)...");
        
        return next;
      });
    }, 300);

    try {
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

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setCurrentStageText("✅ Penjanaan Misi 9-Langkah KSSR Selesai! Mengalihkan ke Langkah 4...");

      if (res.data?.success) {
        await fetchCompletenessAndBlocks();
        await handleEvaluateQuality();
        
        // Wait 1 second before transitioning
        await new Promise(r => setTimeout(r, 1000));
        setActiveStep(4); // Move to Step 4: Block Review
        toast({ title: "Berjaya!", description: "Pakej Misi 9-Langkah KSSR berjaya dijana." });
      } else {
        toast({ title: "Ralat Penjanaan", description: res.data?.error || "Gagal menjana pakej pelajaran.", variant: "destructive" });
      }
    } catch (err) {
      clearInterval(progressInterval);
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
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 text-white text-xs rounded-xl p-3 font-bold"
                    >
                      {availableTopics.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-300">Standard Kandungan (SK Code & Tajuk)</label>
                      <select
                        value={skCode}
                        onChange={(e) => setSkCode(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 text-white text-xs rounded-xl p-3 font-bold truncate max-w-full"
                      >
                        {availableSKs.map(sk => {
                          const title = getSKTitle(sk);
                          return (
                            <option key={sk} value={sk}>
                              {sk} - {title}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-300">Standard Pembelajaran (SP Code & Deskripsi)</label>
                      <select
                        value={spCode}
                        onChange={(e) => setSpCode(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 text-white text-xs rounded-xl p-3 font-bold truncate max-w-full"
                      >
                        {availableSPs.map(sp => {
                          const title = getSPTitle(sp);
                          return (
                            <option key={sp} value={sp}>
                              {sp} - {title}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* KSSR SP Metadata Badge & Dynamic Description */}
                  <div className="p-4 bg-stone-950/80 border border-stone-800 rounded-2xl space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-400">Penerangan DSKP ({spCode || "KSSR"})</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 uppercase">
                          {selectedSPItem?.bloom_level || "TP3 / APPLY"}
                        </span>
                        {selectedSPItem?.default_widget_type && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                            Widget: {selectedSPItem.default_widget_type}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                        getKSSRModeByGrade(yearLevel) === "JUNIOR"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      }`}>
                        MOD ENJIN: {getKSSRModeByGrade(yearLevel)} ({yearLevel})
                      </span>
                    </div>
                    <p className="text-xs text-stone-200 font-semibold leading-relaxed">
                      {selectedSPItem?.title
                        ? `SP ${spCode} - ${selectedSPItem.title}`
                        : (spCode ? `Standard Pembelajaran KSSR ${spCode} bagi tajuk ${topic} (${yearLevel}).` : "Pilih kod SP untuk melihat butiran taksonomi.")}
                    </p>
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
            <Card className="bg-stone-900/90 border-stone-800 shadow-xl p-2">
              <CardContent className="p-4 space-y-6">
                <AIGenerationPanel
                  spCode={spCode}
                  spDescription={spCode ? `Pelajaran SP ${spCode} bagi ${topic}` : topic}
                  skCode={skCode}
                  grade={yearLevel}
                  subject={subject}
                  topic={topic}
                  mode={getKSSRModeByGrade(yearLevel)}
                  pbdTarget="TP3"
                  onPackageGenerated={(pkg) => {
                    setActivePackage(pkg);
                    toast({ title: "Misi Dijana!", description: "Pakej Misi 9-Langkah KSSR berjaya dijana." });
                  }}
                />

                <div className="flex justify-between border-t border-stone-800 pt-4">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="h-10 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl"
                  >
                    Kembali ke Langkah 2
                  </button>
                  <button
                    onClick={() => setActiveStep(4)}
                    className="h-10 px-6 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl border-b-2 border-amber-600 flex items-center gap-1.5"
                  >
                    <span>Seterusnya: Semak Blok</span> <ChevronRight className="w-4 h-4" />
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
                    <Eye className="w-4 h-4 text-amber-400" /> LANGKAH 4: SEMAK & SAHKAN BLOK KANDUNGAN ({
                      activePackage?.steps 
                        ? activePackage.steps.reduce((acc, step) => acc + (step.cpa_blocks?.length || step.cards?.length || step.questions?.length || 1), 0)
                        : (blocks.length > 0 ? blocks.length : 12)
                    } BLOK)
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setPreviewMission(true); setPreviewStep(0); }}
                      className="h-8 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3 h-3" /> Pratonton Keseluruhan Misi
                    </button>
                    <button
                      onClick={fetchCompletenessAndBlocks}
                      className="text-xs text-stone-400 font-bold flex items-center gap-1 hover:text-white"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Muat Semula
                    </button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingBlocks && !activePackage ? (
                  <div className="py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { num: 1, type: "BRIEFING", label: "Langkah 1: BRIEFING", theme: "from-indigo-950/50 to-indigo-900/20 border-indigo-500/30 text-indigo-300", badge: "bg-indigo-500/20 text-indigo-200 border-indigo-500/30", icon: "📣", desc: "Story hook & dialog pengenalan maskot Suku Penyu / Ejen Suku." },
                      { num: 2, type: "ENGAGEMENT", label: "Langkah 2: ENGAGEMENT (4-Blok Micro CPA)", theme: "from-cyan-950/50 to-cyan-900/20 border-cyan-500/30 text-cyan-300", badge: "bg-cyan-500/20 text-cyan-200 border-cyan-500/40", icon: "🖼️", desc: "4 Blok CPA: VISUAL_STORY, COMPARISON_SPLIT, STEP_BY_STEP, & MYTH_BUSTER.", isCPA: true },
                      { num: 3, type: "LESSON", label: "Langkah 3: LESSON", theme: "from-amber-950/50 to-amber-900/20 border-amber-500/30 text-amber-300", badge: "bg-amber-500/20 text-amber-200 border-amber-500/30", icon: "📖", desc: "Pecahan konsep utama KSSR Semakan & penerangan istilah." },
                      { num: 4, type: "PRACTICE", label: "Langkah 4: PRACTICE", theme: "from-emerald-950/50 to-emerald-900/20 border-emerald-500/30 text-emerald-300", badge: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30", icon: "✏️", desc: "Latihan interaktif berasaskan widget (Base Ten / Sentence Builder)." },
                      { num: 5, type: "FLASHCARDS", label: "Langkah 5: FLASHCARDS", theme: "from-purple-950/50 to-purple-900/20 border-purple-500/30 text-purple-300", badge: "bg-purple-500/20 text-purple-200 border-purple-500/30", icon: "🎴", desc: "Kad imbasan terma penting & formula pengukuhan." },
                      { num: 6, type: "MINI_GAME", label: "Langkah 6: MINI_GAME", theme: "from-blue-950/50 to-blue-900/20 border-blue-500/30 text-blue-300", badge: "bg-blue-500/20 text-blue-200 border-blue-500/30", icon: "🎮", desc: "Permainan mini interaktif (SortingGame / MatchingGame)." },
                      { num: 7, type: "QUIZ", label: "Langkah 7: QUIZ", theme: "from-rose-950/50 to-rose-900/20 border-rose-500/30 text-rose-300", badge: "bg-rose-500/20 text-rose-200 border-rose-500/30", icon: "❓", desc: "Penilaian PBD berserta tag aras TP1-TP6." },
                      { num: 8, type: "COMPLETE", label: "Langkah 8: COMPLETE", theme: "from-teal-950/50 to-teal-900/20 border-teal-500/30 text-teal-300", badge: "bg-teal-500/20 text-teal-200 border-teal-500/30", icon: "🏆", desc: "Kiraan XP, mata syiling, & rumusan penguasaan." },
                      { num: 9, type: "REWARD", label: "Langkah 9: REWARD", theme: "from-yellow-950/50 to-yellow-900/20 border-yellow-500/30 text-yellow-300", badge: "bg-yellow-500/20 text-yellow-200 border-yellow-500/30", icon: "👑", desc: "Pemberian lencana kembara & item drop." }
                    ].map((step, idx) => {
                      const stepData = activePackage?.steps?.[idx];

                      return (
                        <details key={step.num} open className={`rounded-2xl border bg-gradient-to-br ${step.theme} shadow-lg overflow-hidden`}>
                          <summary className="p-4 cursor-pointer outline-none flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{step.icon}</span>
                              <div className="text-left">
                                <h3 className="text-sm font-black uppercase tracking-wider">{step.label}</h3>
                                <p className="text-[10px] font-bold opacity-70">{step.desc}</p>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${step.badge}`}>
                              {step.isCPA ? "4 Micro CPA Blocks" : "1 Blok"}
                            </span>
                          </summary>

                          <div className="p-4 pt-0 space-y-3 bg-stone-950/50">
                            {step.isCPA ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                                {(stepData?.cpa_blocks || [
                                  { block_type: "VISUAL_STORY", title: "Kisah Visual Nombor", content: { text: "Gambaran ilustrasi visual." } },
                                  { block_type: "COMPARISON_SPLIT", title: "Perbandingan Kumpulan", content: { left: "Kumpulan A", right: "Kumpulan B" } },
                                  { block_type: "STEP_BY_STEP", title: "Langkah Pembelajaran", content: { steps: ["Langkah 1", "Langkah 2"] } },
                                  { block_type: "MYTH_BUSTER", title: "Mitos & Fakta Nombor", content: { myth: "Mitos biasa", fact: "Fakta tepat" } }
                                ]).map((cpa, cpaIdx) => (
                                  <div key={cpa.block_type || cpaIdx} className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-black rounded-md uppercase">
                                        {cpa.block_type}
                                      </span>
                                    </div>
                                    <h4 className="text-xs font-black text-white">{cpa.title}</h4>
                                    
                                    {/* Render CPA specific content */}
                                    {cpa.block_type === "VISUAL_STORY" && (
                                      <p className="text-[11px] text-stone-300 font-medium">{cpa.content?.text}</p>
                                    )}
                                    {cpa.block_type === "COMPARISON_SPLIT" && (
                                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                                        <div className="p-2 bg-stone-950 rounded border border-stone-800 text-stone-300 font-bold">⬅️ {cpa.content?.left}</div>
                                        <div className="p-2 bg-stone-950 rounded border border-stone-800 text-stone-300 font-bold">➡️ {cpa.content?.right}</div>
                                      </div>
                                    )}
                                    {cpa.block_type === "STEP_BY_STEP" && (
                                      <ol className="list-decimal list-inside text-[11px] text-stone-300 font-medium space-y-0.5 pt-1">
                                        {Array.isArray(cpa.content?.steps) ? cpa.content.steps.map((st, sIdx) => <li key={sIdx}>{st}</li>) : <li>{cpa.content?.text || "Langkah pembelajaran"}</li>}
                                      </ol>
                                    )}
                                    {cpa.block_type === "MYTH_BUSTER" && (
                                      <div className="space-y-1 text-[11px] pt-1">
                                        <p className="text-rose-400 font-bold">❌ Mitos: {cpa.content?.myth}</p>
                                        <p className="text-emerald-400 font-bold">✅ Fakta: {cpa.content?.fact}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-3 pt-3">
                                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                                  <span className="px-2 py-0.5 bg-stone-800 text-stone-300 border border-stone-700 text-[10px] font-black rounded-lg uppercase">
                                    Step #{step.num}: {step.type}
                                  </span>
                                  <span className="text-xs font-bold text-amber-400">{stepData?.title || step.label}</span>
                                </div>

                                {/* Step-specific rich data bindings */}
                                {step.num === 1 && (
                                  <div className="space-y-2 text-xs">
                                    <p className="text-stone-300 font-medium"><strong>Hook Naratif:</strong> {stepData?.payload?.story_hook || "Naratif hook pengenalan..."}</p>
                                    <p className="text-amber-300 font-bold bg-stone-950 p-3 rounded-xl border border-stone-800">🗣️ <strong>Dialog Maskot:</strong> "{stepData?.payload?.mascot_dialogue || "Hai! Suku Penyu sedia membantu!"}"</p>
                                  </div>
                                )}

                                {step.num === 3 && (
                                  <div className="space-y-2 text-xs">
                                    <p className="text-stone-200 font-bold">{stepData?.payload?.concept_summary || "Rumusan konsep DSKP."}</p>
                                    {Array.isArray(stepData?.payload?.key_points) && (
                                      <ul className="list-disc list-inside text-stone-400 space-y-1">
                                        {stepData.payload.key_points.map((kp, kIdx) => <li key={kIdx}>{kp}</li>)}
                                      </ul>
                                    )}
                                  </div>
                                )}

                                {step.num === 4 && (
                                  <div className="text-xs space-y-1.5">
                                    <p className="text-emerald-400 font-bold">Widget Interaktif: <span className="underline">{stepData?.payload?.widget_type || "base_ten_blocks"}</span></p>
                                    <p className="text-stone-300">Topik Sasaran: {stepData?.payload?.interactive_data?.topic || "Matematik KSSR"}</p>
                                  </div>
                                )}

                                {step.num === 5 && (
                                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                                    {(stepData?.cards || [{ term: "Terma KSSR", definition: "Definisi asas terma" }]).map((card, cIdx) => (
                                      <div key={cIdx} className="p-2.5 bg-stone-950 rounded-xl border border-stone-800">
                                        <span className="font-black text-amber-400 block">{card.term}</span>
                                        <span className="text-[11px] text-stone-300">{card.definition}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {step.num === 6 && (
                                  <div className="text-xs space-y-1">
                                    <p className="text-blue-300 font-bold">Permainan Mini: {stepData?.payload?.game_type || "SortingGame"}</p>
                                    <p className="text-stone-400 text-[11px]">Kategori: {stepData?.payload?.game_config?.targetCategory || "Utama"}</p>
                                  </div>
                                )}

                                {step.num === 7 && (
                                  <div className="space-y-2 text-xs">
                                    {(stepData?.questions || [{ question: "Soalan Kuiz PBD KSSR?", options: ["A", "B", "C"], explanation: "Penerangan jawapan tepat." }]).map((q, qIdx) => (
                                      <div key={qIdx} className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
                                        <p className="font-bold text-white">❓ {q.question}</p>
                                        <p className="text-[11px] text-stone-400">Pilihan: {q.options?.join(" | ")}</p>
                                        <p className="text-[10px] text-emerald-400 font-medium">Penerangan: {q.explanation}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {step.num === 8 && (
                                  <div className="text-xs space-y-1">
                                    <p className="text-teal-300 font-bold">{stepData?.payload?.mastery_summary || "Penguasaan SP KSSR."}</p>
                                    <p className="text-amber-400 font-bold">🏆 Ganjaran: +{stepData?.payload?.xp_earned || 100} XP | 🪙 +{stepData?.payload?.coins_earned || 25} Syiling</p>
                                  </div>
                                )}

                                {step.num === 9 && (
                                  <div className="text-xs flex items-center justify-between bg-stone-950 p-3 rounded-xl border border-stone-800">
                                    <div>
                                      <p className="font-black text-yellow-300">Lencana: {stepData?.payload?.badge || "Wira KSSR"}</p>
                                      <p className="text-stone-400 text-[11px]">Item Drop: {stepData?.payload?.item_drop || "Pingat Kembara"}</p>
                                    </div>
                                    <span className="text-2xl">{stepData?.payload?.item_icon || "👑"}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </details>
                      );
                    })}
                  </div>
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

      {/* INDIVIDUAL BLOCK PREVIEW MODAL */}
      {previewBlock && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-3xl flex flex-col max-h-[90vh] shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-900/50 rounded-t-3xl shrink-0">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" /> Pratonton Paparan Pelajar (Blok #{previewBlock.order_number || 1})
              </h2>
              <button onClick={() => setPreviewBlock(null)} className="p-2 bg-stone-800 hover:bg-stone-700 rounded-xl text-stone-300">
                <span className="sr-only">Tutup</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto bg-stone-950 rounded-b-3xl">
              <ErrorBoundary>
                <BlockRenderer block={previewBlock} studentName="Pelajar Cemerlang" />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      )}

      {/* FULL MISSION PREVIEW MODAL */}
      {previewMission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-8">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-4xl h-full flex flex-col shadow-2xl relative">
            <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-900/80 rounded-t-3xl shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Misi Pratonton ({previewStep + 1}/{blocks.length})
                </h2>
                <div className="flex gap-1">
                  {blocks.map((_, idx) => (
                    <div key={idx} className={`w-2 h-2 rounded-full ${idx === previewStep ? "bg-indigo-500" : idx < previewStep ? "bg-emerald-500" : "bg-stone-700"}`} />
                  ))}
                </div>
              </div>
              <button onClick={() => setPreviewMission(false)} className="p-2 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-xl border border-rose-900/50">
                <span className="sr-only">Tutup</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              {blocks.length > 0 ? (
                <ErrorBoundary>
                  <BlockRenderer 
                    block={blocks[previewStep]} 
                    studentName="Pelajar Cemerlang" 
                    onComplete={() => {
                      if (previewStep < blocks.length - 1) {
                        setPreviewStep(prev => prev + 1);
                      } else {
                        toast({ title: "Misi Selesai!", description: "Pratonton keseluruhan misi tamat." });
                      }
                    }}
                  />
                </ErrorBoundary>
              ) : (
                <div className="text-center text-stone-500 font-bold p-10">Tiada blok untuk dipratonton.</div>
              )}
            </div>

            <div className="p-4 border-t border-stone-800 bg-stone-900/50 flex justify-between items-center rounded-b-3xl shrink-0">
              <button 
                onClick={() => setPreviewStep(p => Math.max(0, p - 1))}
                disabled={previewStep === 0}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-50 text-xs font-bold rounded-xl transition-all"
              >
                Kembali
              </button>
              
              <button 
                onClick={() => {
                  if (previewStep < blocks.length - 1) {
                    setPreviewStep(p => p + 1);
                  } else {
                    setPreviewMission(false);
                    toast({ title: "Misi Selesai!", description: "Pratonton keseluruhan misi tamat." });
                  }
                }}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-indigo-900/20"
              >
                {previewStep < blocks.length - 1 ? "Seterusnya" : "Tamat Misi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}