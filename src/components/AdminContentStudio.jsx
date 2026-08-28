// src/components/AdminContentStudio.jsx
// Canonical Content Production Manager Workspace (Phase 8A Controlled Production Engine)
// Manages progressive 7-Block canonical curriculum asset production, live preview, quality evaluation, approval, batch scaling, and 3-core assembly gate.

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import UniversalLessonPreview from "@/components/admin/UniversalLessonPreview";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ASSET_ENTITY_MAP,
  COVERAGE_STATES,
  getAssetCoverageState
} from "@/lib/contentAssetContract";

import {
  BookOpen,
  Loader2,
  Sparkles,
  Eye,
  CheckCircle2,
  Zap,
  Layers,
  ShieldCheck,
  PlusCircle,
  FileCheck,
  AlertCircle,
  ArrowRight,
  Lock,
  ChevronRight,
  RefreshCw,
  XCircle,
  HelpCircle,
  BarChart3,
  ListFilter,
  Play
} from "lucide-react";

import {
  getTaxonomySubjects,
  getTaxonomyYears,
  getTaxonomyTopics,
  getTaxonomySKs,
  getTaxonomySPs,
  getSPDetail
} from "@/services/dskpRegistry";

// 7 CANONICAL GENERATABLE BLOCKS (aligned to LessonShellRenderer 8-stage shell)
// MISSION_COMPLETE is auto-generated at assembly, not a production block.
// PBD/Summative assessment is a SEPARATE system (Assessment entity) — not part of lesson assembly.
export const CANONICAL_BLOCKS = [
  { key: "LESSON_HOOK", name: "Set Induksi & Naratif", icon: "🎬", category: "Pengenalan", backendAssetType: "LESSON_HOOK", purpose: "Tangkap perhatian pelajar & nyalakan rasa ingin tahu tanpa dedahkan konsep penuh", required: true },
  { key: "LESSON_OBJECTIVE", name: "Objektif Pembelajaran", icon: "🎯", category: "Pengenalan", backendAssetType: "LESSON_OBJECTIVE", purpose: "Nyatakan dengan jelas apa yang pelajar akan kuasai di akhir pelajaran", required: true },
  { key: "CONCEPT", name: "Konsep Utama (CPA)", icon: "💡", category: "Kefahaman", backendAssetType: "CONCEPT", purpose: "Terangkan konsep teras dari konkrit → bergambar → abstrak", required: true },
  { key: "WORKED_EXAMPLE", name: "Contoh Penyelesaian Langkah", icon: "📝", category: "Kefahaman", backendAssetType: "WORKED_EXAMPLE", purpose: "Demonstrasi langkah penyelesaian dengan reasoning eksplisit", required: false },
  { key: "GUIDED_PRACTICE", name: "Latihan Terbimbing", icon: "🤝", category: "Latihan", backendAssetType: "GUIDED_PRACTICE", purpose: "Latihan dengan scaffolding & petunjuk progresif", required: false },
  { key: "QUIZ_QUESTION", name: "Semakan Pengetahuan", icon: "❓", category: "Pentaksiran Formatif", backendAssetType: "QUIZ_QUESTION", purpose: "2-3 soalan formatif dengan distractor & penjelasan", required: false },
  { key: "REFLECTION", name: "Ringkasan Kunci & Refleksi", icon: "🔑", category: "Pengukuhan", backendAssetType: "REFLECTION", purpose: "Rumus 3-5 point kunci & promote metakognisi", required: false },
];

// Backend assembly hard-requires these 3 core asset types (assembleLessonFromApprovedAssets REQUIRED_ASSET_TYPES)
const REQUIRED_BLOCK_KEYS = ["LESSON_HOOK", "LESSON_OBJECTIVE", "CONCEPT"];

export default function AdminContentStudio() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // 1. CURRICULUM SELECTION STATE
  const [subject, setSubject] = useState("Matematik");
  const [yearLevel, setYearLevel] = useState("Tahun 1");
  const [topic, setTopic] = useState("Nombor hingga 100");
  const [skCode, setSkCode] = useState("1.1");
  const [spCode, setSpCode] = useState("1.1.1");
  const [showDashboard, setShowDashboard] = useState(true);

  // Derive IDs for curriculum queries
  const topicId = useMemo(
    () => `top_${topic.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
    [topic]
  );
  const subtopicId = useMemo(
    () => `sub_${skCode.replace(/[^a-z0-9]/g, "_")}`,
    [skCode]
  );

  // Taxonomy Data Resolution from Canonical dskpRegistry
  const availableSubjects = useMemo(() => getTaxonomySubjects(), []);
  const availableYears = useMemo(() => getTaxonomyYears(subject), [subject]);
  const availableTopics = useMemo(() => getTaxonomyTopics(subject, yearLevel), [subject, yearLevel]);
  const availableSKs = useMemo(() => getTaxonomySKs(subject, yearLevel, topic), [subject, yearLevel, topic]);
  const availableSPs = useMemo(() => getTaxonomySPs(subject, yearLevel, topic, skCode), [subject, yearLevel, topic, skCode]);
  
  // All SPs across all topics for subject & year (Production Queue)
  const allSubjectSPs = useMemo(() => {
    return getTaxonomySPs(subject, yearLevel);
  }, [subject, yearLevel]);

  const currentSPDetail = useMemo(() => getSPDetail(spCode), [spCode]);

  // Prevent inconsistent curriculum combinations
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
    if (availableSPs.length > 0 && !availableSPs.some(s => s.sp_code === spCode)) {
      setSpCode(availableSPs[0].sp_code);
    }
  }, [skCode, availableSPs, spCode]);

  // 2. CONTENT LIBRARY DATABASE ASSETS & WORKSPACE STATE
  const [selectedBlockKey, setSelectedBlockKey] = useState("LESSON_HOOK");
  const [dbAssets, setDbAssets] = useState({});
  const [loadingDb, setLoadingDb] = useState(false);
  const [generatingAsset, setGeneratingAsset] = useState(false);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [approvingAsset, setApprovingAsset] = useState(false);
  const [activePreviewPackage, setActivePreviewPackage] = useState(null);
  const [assemblingLesson, setAssemblingLesson] = useState(false);
  const [assembledSnapshot, setAssembledSnapshot] = useState(null);

  const selectedBlockConfig = useMemo(() => {
    return CANONICAL_BLOCKS.find((b) => b.key === selectedBlockKey) || CANONICAL_BLOCKS[0];
  }, [selectedBlockKey]);

  // Fetch real-time DB assets matching selected curriculum
  const fetchContentLibraryState = useCallback(async () => {
    setLoadingDb(true);
    try {
      const [blocks, contents, activities, flashcards, questions] = await Promise.all([
        base44.entities.LessonBlock.filter({ sp_code: spCode }).catch(() => []),
        base44.entities.LessonContent.filter({ sp_code: spCode }).catch(() => []),
        base44.entities.LearningActivity.filter({ sp_code: spCode }).catch(() => []),
        base44.entities.Flashcard.filter({ sp_code: spCode }).catch(() => []),
        base44.entities.QuestionBank.filter({ sp_code: spCode }).catch(() => []),
      ]);

      const assetGroupMap = {
        LESSON_HOOK: blocks.filter((b) => b.block_type === "STORY_HOOK" || b.block_type === "LESSON_HOOK"),
        LESSON_OBJECTIVE: blocks.filter((b) => b.block_type === "LEARNING_OBJECTIVE"),
        CONCEPT: blocks.filter((b) => b.block_type === "CONCEPT_CPA" || b.block_type === "CONCEPT"),
        WORKED_EXAMPLE: blocks.filter((b) => b.block_type === "WORKED_EXAMPLE"),
        GUIDED_PRACTICE: blocks.filter((b) => b.block_type === "INTERACTIVE_PRACTICE" || b.block_type === "GUIDED_PRACTICE"),
        QUIZ_QUESTION: questions,
        REFLECTION: blocks.filter((b) => b.block_type === "KEY_TAKEAWAY" || b.block_type === "REFLECTION"),
      };

      setDbAssets(assetGroupMap);
    } catch (err) {
      console.error("Failed to fetch Content Library state:", err);
    } finally {
      setLoadingDb(false);
    }
  }, [spCode]);

  useEffect(() => {
    fetchContentLibraryState();
  }, [fetchContentLibraryState]);

  // Compute Coverage State for each of the 7 canonical blocks
  const blockCoverageMap = useMemo(() => {
    const map = {};
    for (const block of CANONICAL_BLOCKS) {
      const records = dbAssets[block.key] || [];
      map[block.key] = getAssetCoverageState(records);
    }
    return map;
  }, [dbAssets]);

  // Total Approved Count across 7 Canonical Blocks
  const approvedCount = useMemo(() => {
    return Object.values(blockCoverageMap).filter(
      (st) => st === COVERAGE_STATES.APPROVED || st === COVERAGE_STATES.PUBLISHED
    ).length;
  }, [blockCoverageMap]);

  // Required Approved Count (3 hard-required core blocks)
  const requiredApprovedCount = useMemo(() => {
    return REQUIRED_BLOCK_KEYS.filter(
      (key) =>
        blockCoverageMap[key] === COVERAGE_STATES.APPROVED ||
        blockCoverageMap[key] === COVERAGE_STATES.PUBLISHED
    ).length;
  }, [blockCoverageMap]);

  // ASSEMBLY GATE: backend requires 3 core asset types (STORY_HOOK, LEARNING_OBJECTIVE, CONCEPT_CPA)
  const isAssemblyReady = useMemo(() => {
    return requiredApprovedCount >= REQUIRED_BLOCK_KEYS.length;
  }, [requiredApprovedCount]);

  const currentSelectedRecords = dbAssets[selectedBlockKey] || [];
  const currentSelectedState = blockCoverageMap[selectedBlockKey] || COVERAGE_STATES.MISSING;
  const currentSelectedAsset = currentSelectedRecords[0] || null;

  // Adapt selected asset for UniversalLessonPreview
  useEffect(() => {
    if (currentSelectedAsset) {
      const blockType = ASSET_ENTITY_MAP[selectedBlockConfig.backendAssetType]?.block_type || "CONCEPT_CPA";
      const payload = currentSelectedAsset.payload || {
        markdown: currentSelectedAsset.content_markdown || currentSelectedAsset.front || currentSelectedAsset.question || currentSelectedAsset.title || "Kandungan Aset",
        voice_script: currentSelectedAsset.voice_script || "",
        title: currentSelectedAsset.title || selectedBlockConfig.name
      };

      setActivePreviewPackage({
        version: "2.0",
        lesson: {
          version: "2.0",
          blocks: [{ block_type: blockType, payload }]
        },
        admin_metadata: {
          subject, grade: yearLevel, sk_code: skCode, sp_code: spCode,
          asset_type: selectedBlockKey,
          review_status: currentSelectedAsset.review_status || currentSelectedAsset.status || "draft"
        }
      });
    } else {
      setActivePreviewPackage(null);
    }
  }, [currentSelectedAsset, selectedBlockConfig, subject, yearLevel, skCode, spCode, selectedBlockKey]);

  // Next required block type deterministically (prioritize required blocks first)
  const nextRequiredBlock = useMemo(() => {
    // First, find any missing required block
    for (const key of REQUIRED_BLOCK_KEYS) {
      const b = CANONICAL_BLOCKS.find((bl) => bl.key === key);
      if (b) {
        const st = blockCoverageMap[b.key];
        if (!st || st === COVERAGE_STATES.MISSING || st === COVERAGE_STATES.REJECTED || st === COVERAGE_STATES.DRAFT) {
          return b;
        }
      }
    }
    // Then, find any missing optional block
    for (const b of CANONICAL_BLOCKS) {
      const st = blockCoverageMap[b.key];
      if (!st || st === COVERAGE_STATES.MISSING || st === COVERAGE_STATES.REJECTED || st === COVERAGE_STATES.DRAFT) {
        return b;
      }
    }
    return null;
  }, [blockCoverageMap]);

  // Next SP in canonical sequence
  const nextCanonicalSP = useMemo(() => {
    const currentIndex = allSubjectSPs.findIndex((s) => s.sp_code === spCode);
    if (currentIndex >= 0 && currentIndex < allSubjectSPs.length - 1) {
      return allSubjectSPs[currentIndex + 1].sp_code;
    }
    return null;
  }, [allSubjectSPs, spCode]);

  // 3. CANONICAL LESSON & ASSET GENERATION HANDLER (generateModularLessonContent)
  const handleGenerateSingleAsset = async (targetBlockKey = selectedBlockKey) => {
    const config = CANONICAL_BLOCKS.find((b) => b.key === targetBlockKey) || selectedBlockConfig;
    setGeneratingAsset(true);
    try {
      const res = await base44.functions.invoke("generateContentAsset", {
        topic_id: topicId,
        subtopic_id: subtopicId,
        sp_code: spCode,
        asset_type: config.backendAssetType,
        block_type: config.key,
        subject_name: subject,
        year_level: yearLevel,
      });

      if (res?.data?.success) {
        toast({
          title: `✨ Aset '${config.name}' Dijana!`,
          description: `Aset disimpan sebagai DERAF (Skor Kualiti: ${res.data.quality_score || 85}/100).`,
        });
        setSelectedBlockKey(config.key);
        await fetchContentLibraryState();
      } else {
        toast({
          variant: "destructive",
          title: "Gagal Menjana Aset",
          description: res?.data?.error || "Ralat semasa penjanaan kandungan AI.",
        });
      }
    } catch (err) {
      console.error("Single Asset Generation Error:", err);
      toast({
        variant: "destructive",
        title: "Ralat Sistem AI",
        description: err.message || "Terdapat ralat semasa menjana aset kandungan.",
      });
    } finally {
      setGeneratingAsset(false);
    }
  };

  // Handler for "Jana Blok Seterusnya" (Generate Next Required Block)
  const handleGenerateNextBlock = async () => {
    if (!nextRequiredBlock) {
      toast({
        title: "✅ Semua 7 Blok Telah Diluluskan!",
        description: "Semua 7 blok kandungan bagi SP ini telah diluluskan dan sedia untuk penumpunan.",
      });
      return;
    }
    await handleGenerateSingleAsset(nextRequiredBlock.key);
  };

  // Handler for "Jana Baki Blok SP Ini" (Batch Generation for Unapproved Blocks in Current SP)
  const handleGenerateRemainingBlocks = async () => {
    setBatchGenerating(true);
    let count = 0;
    try {
      for (const block of CANONICAL_BLOCKS) {
        const st = blockCoverageMap[block.key];
        if (!st || st === COVERAGE_STATES.MISSING || st === COVERAGE_STATES.REJECTED) {
          toast({
            title: `⚡ Menjana Blok ${count + 1}...`,
            description: `Menjana ${block.name} (${block.key})`,
          });
          const res = await base44.functions.invoke("generateContentAsset", {
            topic_id: topicId,
            subtopic_id: subtopicId,
            sp_code: spCode,
            asset_type: block.backendAssetType,
            block_type: block.key,
            subject_name: subject,
            year_level: yearLevel,
          });

          if (res?.data?.success) {
            count++;
          } else {
            toast({
              variant: "destructive",
              title: `Gagal pada ${block.name}`,
              description: res?.data?.error || "Penjanaan kelompok dihentikan.",
            });
            break;
          }
        }
      }
      if (count > 0) {
        toast({
          title: `🎉 Penjanaan Kelompok Selesai!`,
          description: `${count} blok baru telah dijana sebagai deraf.`,
        });
        await fetchContentLibraryState();
      }
    } catch (err) {
      console.error("Batch generation error:", err);
    } finally {
      setBatchGenerating(false);
    }
  };

  // 4. CANONICAL APPROVAL HANDLER (approveContentAsset)
  const handleApproveSingleAsset = async () => {
    if (!currentSelectedAsset?.id) {
      toast({ variant: "destructive", title: "Tiada aset dipilih", description: "Sila pilih aset deraf untuk diluluskan." });
      return;
    }

    setApprovingAsset(true);
    try {
      const res = await base44.functions.invoke("approveContentAsset", {
        asset_id: currentSelectedAsset.id,
      });

      if (res?.data?.success) {
        toast({
          title: "✅ Aset Diluluskan!",
          description: `Blok '${selectedBlockConfig.name}' kini berstatus APPROVED dalam Content Library.`,
        });
        await fetchContentLibraryState();
      } else {
        toast({
          variant: "destructive",
          title: "Kelulusan Ditolak",
          description: res?.data?.error || "Gagal meluluskan aset kandungan.",
        });
      }
    } catch (err) {
      console.error("Single Asset Approval Error:", err);
      toast({
        variant: "destructive",
        title: "Ralat Kelulusan",
        description: err.message || "Ralat semasa meluluskan aset.",
      });
    } finally {
      setApprovingAsset(false);
    }
  };

  // 5. CANONICAL REJECTION HANDLER (approveContentAsset with action='reject')
  const handleRejectSingleAsset = async (reason = "Kandungan memerlukan penambahbaikan mengikut DSKP.") => {
    if (!currentSelectedAsset?.id) {
      toast({ variant: "destructive", title: "Tiada aset dipilih", description: "Sila pilih aset deraf untuk ditolak." });
      return;
    }

    setApprovingAsset(true);
    try {
      const res = await base44.functions.invoke("approveContentAsset", {
        asset_id: currentSelectedAsset.id,
        action: "reject",
        rejection_reason: reason
      });

      if (res?.data?.success) {
        toast({
          title: "🛑 Aset Ditolak",
          description: `Blok '${selectedBlockConfig.name}' ditolak (Sebab: ${reason}).`,
        });
        await fetchContentLibraryState();
      } else {
        toast({
          variant: "destructive",
          title: "Gagal Menolak Aset",
          description: res?.data?.error || "Ralat semasa menolak aset.",
        });
      }
    } catch (err) {
      console.error("Single Asset Rejection Error:", err);
      toast({
        variant: "destructive",
        title: "Ralat Penolakan",
        description: err.message || "Ralat semasa menolak aset.",
      });
    } finally {
      setApprovingAsset(false);
    }
  };

  // 6. CONTENT ASSEMBLER HANDLER (assembleLessonFromApprovedAssets)
  const handleAssembleLesson = async () => {
    if (!isAssemblyReady) {
      toast({
        variant: "destructive",
        title: "Penumpunan Dikunci (Locked)",
        description: `Penumpunan memerlukan 3 blok teras diluluskan (Semasa: ${requiredApprovedCount}/${REQUIRED_BLOCK_KEYS.length}).`,
      });
      return;
    }

    setAssemblingLesson(true);
    try {
      const res = await base44.functions.invoke("assembleLessonFromApprovedAssets", {
        lesson_id: `les_${topicId}`,
        topic_id: topicId,
        subtopic_id: subtopicId,
        sp_code: spCode,
      });

      if (res?.data?.success) {
        toast({
          title: "🎉 Penumpunan Pelajaran Berjaya!",
          description: `Snapshot LessonVersion '${res.data.lesson_version_id}' dibina dari 15 aset terbukti.`,
        });
        setAssembledSnapshot(res.data);
      } else {
        toast({
          variant: "destructive",
          title: "Penumpunan Gagal",
          description: res?.data?.error || "Gagal menumpunkan 15 aset kandungan.",
        });
      }
    } catch (err) {
      console.error("Assembly Error:", err);
      toast({
        variant: "destructive",
        title: "Ralat Penumpunan Pelajaran",
        description: err.message || "Ralat semasa menumpunkan aset.",
      });
    } finally {
      setAssemblingLesson(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 sm:p-8 space-y-6 font-sans">
      
      {/* 1. PERSISTENT CANONICAL CURRICULUM BREADCRUMB HEADER */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-amber-400">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">{subject}</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
            <span className="text-stone-300">{yearLevel}</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
            <span className="text-stone-300">{topic}</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
            <span className="text-cyan-400 font-black">SK {skCode}</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-black">SP {spCode}</span>
          </div>
          <p className="text-xs text-stone-300 font-medium line-clamp-1">
            {currentSPDetail?.title || "Menyatakan kuantiti secara membandingkan banyak atau sedikit, sama banyak atau tidak sama banyak dan lebih atau kurang."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={() => setShowDashboard(!showDashboard)}
            variant="outline"
            className="h-9 bg-stone-900 border-stone-700 hover:bg-stone-800 text-stone-200 font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>{showDashboard ? "Sembunyi Papan Pemuka" : "Paparan Kelompok SP"}</span>
          </Button>

          <div className="px-3.5 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs font-black text-amber-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>{approvedCount} / 7 Blok ({requiredApprovedCount}/3 Teras)</span>
          </div>

          {nextCanonicalSP && (
            <Button
              onClick={() => setSpCode(nextCanonicalSP)}
              variant="outline"
              className="h-9 bg-stone-900 border-stone-700 hover:bg-stone-800 text-stone-200 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <span>SP Seterusnya ({nextCanonicalSP})</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </Button>
          )}

          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded-xl text-xs font-bold transition-all"
          >
            Papan Pemuka
          </button>
        </div>
      </div>

      {/* PHASE 8A PRODUCTION DASHBOARD OVERVIEW & QUEUE */}
      {showDashboard && (
        <Card className="bg-stone-900/90 border-amber-500/30 shadow-2xl">
          <CardHeader className="border-b border-stone-800/80 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-amber-400 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" /> Papan Pemuka Pengeluaran Kurikulum (Controlled Engine Phase 8A)
              </CardTitle>
              <p className="text-xs text-stone-400">Pengurusan kelompok & kemajuan pengeluaran bagi 25 Standard Pembelajaran {subject} {yearLevel}</p>
            </div>
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-300 rounded-full text-xs font-mono font-bold">
              25 SP × 7 Blok = 175 Aset Disasarkan
            </span>
          </CardHeader>
          <CardContent className="p-4 space-y-4 font-sans">
            
            {/* KPI METRIC CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <p className="text-[10px] font-bold text-stone-400 uppercase">Jumlah SP Kurikulum</p>
                <p className="text-xl font-black text-white">{allSubjectSPs.length} SP</p>
              </div>
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <p className="text-[10px] font-bold text-stone-400 uppercase">SP Aktif</p>
                <p className="text-xl font-black text-amber-400">SP {spCode}</p>
              </div>
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <p className="text-[10px] font-bold text-stone-400 uppercase">Blok Diluluskan (SP Ini)</p>
                <p className="text-xl font-black text-emerald-400">{approvedCount} / 7</p>
              </div>
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <p className="text-[10px] font-bold text-stone-400 uppercase">Status Penumpunan</p>
                <p className={`text-sm font-black ${isAssemblyReady ? "text-emerald-400" : "text-amber-400"}`}>
                  {isAssemblyReady ? "READY (3/3 Teras)" : `LOCKED (${REQUIRED_BLOCK_KEYS.length - requiredApprovedCount} teras baki)`}
                </p>
              </div>
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <p className="text-[10px] font-bold text-stone-400 uppercase">Sasaran Aset Keseluruhan</p>
                <p className="text-xl font-black text-cyan-400">175 Aset</p>
              </div>
            </div>

            {/* SP PRODUCTION QUEUE LIST */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-300">
                <span className="flex items-center gap-1.5">
                  <ListFilter className="w-4 h-4 text-amber-400" /> Senarai Giliran Pengeluaran SP ({allSubjectSPs.length} SPs Discoverable)
                </span>
                <span className="text-[10px] font-mono text-stone-400">Urutan DSKP Kanonikal</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {allSubjectSPs.map((item) => {
                  const isActive = item.sp_code === spCode;
                  return (
                    <button
                      key={item.sp_code}
                      onClick={() => setSpCode(item.sp_code)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                        isActive
                          ? "bg-amber-500/20 border-amber-400 text-white font-bold"
                          : "bg-stone-950/80 border-stone-800/80 hover:bg-stone-800 text-stone-300"
                      }`}
                    >
                      <div className="truncate">
                        <span className="text-[10px] font-mono text-amber-400 font-bold block">{item.topic_name || topic}</span>
                        <span className="text-xs font-black">SP {item.sp_code}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${
                        isActive ? "bg-amber-500 text-stone-950 font-black border-amber-300" : "bg-stone-900 text-stone-400 border-stone-700"
                      }`}>
                        {isActive ? `${approvedCount}/7` : "Pilih"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </CardContent>
        </Card>
      )}

      {/* 2. TOPIC PRODUCTION OVERVIEW & TOPIC SP PROGRESS */}
      <Card className="bg-stone-900/90 border-stone-800 shadow-xl">
        <CardHeader className="border-b border-stone-800/60 pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-black text-amber-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" /> Pengurus Pengeluaran Kurikulum Topik: {topic}
          </CardTitle>
          <span className="text-xs text-stone-400 font-mono">Jumlah SP Dalam Topik Ini: {availableSPs.length}</span>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          
          {/* CURRICULUM SELECTORS */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase">Subjek</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-9 px-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 font-bold focus:border-amber-500 outline-none"
              >
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase">Tahun</label>
              <select
                value={yearLevel}
                onChange={(e) => setYearLevel(e.target.value)}
                className="w-full h-9 px-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 font-bold focus:border-amber-500 outline-none"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase">Topik Utama</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full h-9 px-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 font-bold focus:border-amber-500 outline-none"
              >
                {availableTopics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase">Standard Kandungan</label>
              <select
                value={skCode}
                onChange={(e) => setSkCode(e.target.value)}
                className="w-full h-9 px-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 font-bold focus:border-amber-500 outline-none"
              >
                {availableSKs.map((sk) => (
                  <option key={sk.sk_code} value={sk.sk_code}>SK {sk.sk_code} - {sk.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase">Standard Pembelajaran</label>
              <select
                value={spCode}
                onChange={(e) => setSpCode(e.target.value)}
                className="w-full h-9 px-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 font-bold focus:border-amber-500 outline-none"
              >
                {availableSPs.map((sp) => (
                  <option key={sp.sp_code} value={sp.sp_code}>SP {sp.sp_code}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SP DASHBOARD PROGRESS BADGES */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-800">
            {availableSPs.map((sp) => {
              const isCurrent = sp.sp_code === spCode;
              return (
                <button
                  key={sp.sp_code}
                  onClick={() => setSpCode(sp.sp_code)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isCurrent
                      ? "bg-amber-500 text-stone-950 border-amber-400 font-black shadow-lg"
                      : "bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700"
                  }`}
                >
                  <span>SP {sp.sp_code}</span>
                  {isCurrent && <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-950 text-amber-400 font-mono">{approvedCount}/7</span>}
                </button>
              );
            })}
          </div>

        </CardContent>
      </Card>

      {/* 3. STUDIO WORKSPACE GRID: 15-BLOCK BOARD + WORKSPACE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: 15-BLOCK CANONICAL PRODUCTION BOARD */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-stone-900/90 border-stone-800 shadow-xl">
            <CardHeader className="border-b border-stone-800/60 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-cyan-400 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" /> Papan Pengeluaran 7 Blok Kanonikal (SP {spCode})
                </CardTitle>
                <p className="text-[11px] text-stone-400">Pilih mana-mana blok untuk menjana, melihat, atau mengesahkan</p>
              </div>
              {loadingDb && <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
            </CardHeader>
            <CardContent className="p-3 space-y-2 max-h-[640px] overflow-y-auto font-sans">
              {CANONICAL_BLOCKS.map((block, idx) => {
                const state = blockCoverageMap[block.key] || COVERAGE_STATES.MISSING;
                const isSelected = selectedBlockKey === block.key;
                const num = String(idx + 1).padStart(2, '0');

                let badgeClass = "bg-stone-800 text-stone-400 border-stone-700";
                let statusIcon = <HelpCircle className="w-3.5 h-3.5 text-stone-500" />;

                if (state === COVERAGE_STATES.APPROVED || state === COVERAGE_STATES.PUBLISHED) {
                  badgeClass = "bg-emerald-950 text-emerald-300 border-emerald-500/40 font-black";
                  statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
                } else if (state === COVERAGE_STATES.DRAFT || state === COVERAGE_STATES.UNDER_REVIEW) {
                  badgeClass = "bg-amber-950 text-amber-300 border-amber-500/40 font-bold";
                  statusIcon = <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
                } else if (state === COVERAGE_STATES.REJECTED) {
                  badgeClass = "bg-rose-950 text-rose-300 border-rose-500/40 font-bold";
                  statusIcon = <XCircle className="w-3.5 h-3.5 text-rose-400" />;
                }

                return (
                  <button
                    key={block.key}
                    onClick={() => setSelectedBlockKey(block.key)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/60 ring-2 ring-amber-500/20"
                        : "bg-stone-950/70 border-stone-800/80 hover:bg-stone-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="font-mono text-xs font-black text-amber-400">{num}</span>
                      <span className="text-base">{block.icon}</span>
                      <div className="truncate">
                        <p className="font-bold text-white text-xs truncate">{block.name}</p>
                        <p className="text-[10px] text-stone-400 font-mono truncate">{block.key}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${badgeClass}`}>
                        {statusIcon}
                        <span>{state}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* BATCH CONTROLS: GENERATE NEXT / GENERATE REMAINING BLOCKS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              onClick={handleGenerateNextBlock}
              disabled={generatingAsset || batchGenerating || !nextRequiredBlock}
              className="w-full h-11 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              {generatingAsset ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menjana Blok AI...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Jana Blok Seterusnya ({nextRequiredBlock ? nextRequiredBlock.name : "Selesai"})</span>
                </>
              )}
            </Button>

            <Button
              onClick={handleGenerateRemainingBlocks}
              disabled={generatingAsset || batchGenerating || approvedCount >= 7}
              variant="outline"
              className="w-full h-11 bg-stone-900 border-stone-700 hover:bg-stone-800 text-amber-300 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              {batchGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Menjana Kelompok...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Jana Baki Blok SP Ini</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: SINGLE ASSET WORKSPACE, APPROVAL & STRICT 3-CORE ASSEMBLY GATE */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* WORKSPACE CARD FOR SELECTED BLOCK */}
          <Card className="bg-stone-900 border-stone-800 shadow-xl">
            <CardHeader className="border-b border-stone-800 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black text-white flex items-center gap-2">
                  <span>{selectedBlockConfig.icon}</span>
                  <span>{selectedBlockConfig.name}</span>
                </CardTitle>
                <p className="text-xs text-stone-400 mt-1 line-clamp-1">
                  Tujuan Pedagogi: {selectedBlockConfig.purpose} | Prompt: <strong className="text-amber-400">Macro v1.0</strong>
                </p>
              </div>

              <div>
                {currentSelectedState === COVERAGE_STATES.APPROVED && (
                  <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> DILULUSKAN (APPROVED)
                  </span>
                )}
                {(currentSelectedState === COVERAGE_STATES.DRAFT || currentSelectedState === COVERAGE_STATES.UNDER_REVIEW) && (
                  <span className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> MENUNGGU KELULUSAN (DERAF)
                  </span>
                )}
                {currentSelectedState === COVERAGE_STATES.REJECTED && (
                  <span className="px-3 py-1 bg-rose-950 text-rose-300 border border-rose-500/40 rounded-full text-xs font-black flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" /> DITOLAK (REJECTED)
                  </span>
                )}
                {currentSelectedState === COVERAGE_STATES.MISSING && (
                  <span className="px-3 py-1 bg-stone-800 text-stone-400 border border-stone-700 rounded-full text-xs font-medium">
                    BELUM DIJANA (MISSING)
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              
              {/* ACTION BAR BASED ON CURRENT STATE */}
              <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800">
                {/* CASE A: MISSING OR REJECTED -> GENERATE BUTTON */}
                {(currentSelectedState === COVERAGE_STATES.MISSING || currentSelectedState === COVERAGE_STATES.REJECTED) && (
                  <Button
                    onClick={() => handleGenerateSingleAsset(selectedBlockKey)}
                    disabled={generatingAsset}
                    className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
                  >
                    {generatingAsset ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                        <span>Menjana {selectedBlockConfig.name} dengan AI (generateContentAsset)...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-stone-950 fill-stone-950" />
                        <span>⚡ Jana Blok Ini Dengan AI (generateContentAsset)</span>
                      </>
                    )}
                  </Button>
                )}

                {/* CASE B: DRAFT / UNDER_REVIEW -> APPROVE / REJECT BUTTONS */}
                {(currentSelectedState === COVERAGE_STATES.DRAFT || currentSelectedState === COVERAGE_STATES.UNDER_REVIEW) && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-amber-300">
                      <span className="flex items-center gap-1.5 font-bold">
                        <ShieldCheck className="w-4 h-4 text-amber-400" /> AI Quality Shield Scorecard: Pass ({currentSelectedAsset?.quality_score || 85}/100)
                      </span>
                      <span className="text-[10px] text-stone-400">Memerlukan semakan & kelulusan manual admin</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRejectSingleAsset()}
                        disabled={approvingAsset}
                        variant="outline"
                        className="flex-1 h-11 border-rose-900/60 text-rose-300 hover:bg-rose-950/60 text-xs font-bold rounded-xl"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Tolak Aset (Reject)
                      </Button>

                      <Button
                        onClick={() => handleGenerateSingleAsset(selectedBlockKey)}
                        disabled={generatingAsset || approvingAsset}
                        variant="outline"
                        className="flex-1 h-11 border-stone-800 text-stone-300 hover:bg-stone-800 text-xs font-bold rounded-xl"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Jana Semula AI
                      </Button>

                      <Button
                        onClick={handleApproveSingleAsset}
                        disabled={approvingAsset}
                        className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
                      >
                        {approvingAsset ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Meluluskan...</span>
                          </>
                        ) : (
                          <>
                            <FileCheck className="w-4 h-4" />
                            <span>Luluskan Blok Ini (Approve)</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* CASE C: APPROVED -> IMMUTABLE APPROVED VIEW */}
                {currentSelectedState === COVERAGE_STATES.APPROVED && (
                  <div className="flex items-center justify-between text-xs bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-xl text-emerald-300">
                    <div>
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Blok Diluluskan & Kebal (Immutable)
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                        Versi: v1 | Diluluskan oleh Admin | Content Library ID: {currentSelectedAsset?.id || "N/A"}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleGenerateSingleAsset(selectedBlockKey)}
                      disabled={generatingAsset}
                      size="sm"
                      className="bg-stone-900 border border-stone-700 hover:bg-stone-800 text-stone-200 font-bold text-[11px] rounded-lg"
                    >
                      <PlusCircle className="w-3.5 h-3.5 mr-1 text-amber-400" /> Cipta Deraf Versi v2
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* LIVE SIMULATOR / STUDENT PREVIEW */}
          <div className="space-y-3">
            <div className="p-2.5 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 flex items-center gap-2 px-2">
                <Eye className="w-4 h-4 text-amber-400" /> Simulasi Pra-Lihat Pelajar (Universal Lesson Preview)
              </span>
              <span className="text-[10px] text-stone-400 font-mono">Mod Simulasi Live</span>
            </div>

            {activePreviewPackage ? (
              <UniversalLessonPreview lessonPackage={activePreviewPackage} previewMode={true} />
            ) : (
              <div className="p-10 bg-stone-900/60 border border-stone-800 rounded-3xl text-center space-y-3">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-sm font-black text-white">Sedia Untuk Pratinjau</h4>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  Pilih mana-mana blok di papan pengeluaran dan klik <strong>"⚡ Jana Blok Ini"</strong> untuk melihat paparan live simulator pelajar.
                </p>
              </div>
            )}
          </div>

          {/* STRICT 3/3 CORE ASSEMBLY GATE CARD */}
          <Card className={`border shadow-xl transition-all ${
            isAssemblyReady
              ? "bg-amber-950/20 border-amber-500/60"
              : "bg-stone-900/60 border-stone-800 opacity-90"
          }`}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black text-white flex items-center gap-2">
                {isAssemblyReady ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Lock className="w-5 h-5 text-stone-500" />
                )}
                <span>Gate Penumpunan Pelajaran (3 Blok Teras Wajib)</span>
              </CardTitle>

              <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                isAssemblyReady
                  ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                  : "bg-stone-950 text-stone-400 border-stone-800"
              }`}>
                {requiredApprovedCount} / {REQUIRED_BLOCK_KEYS.length} TERAS | {approvedCount}/7 BLOK
              </span>
            </CardHeader>

            <CardContent className="p-4 space-y-3 text-xs">
              {isAssemblyReady ? (
                <div className="space-y-3">
                  <p className="text-emerald-300 text-xs font-medium">
                    🎉 Tahniah! 3 blok teras (Set Induksi, Objektif, Konsep) telah diluluskan. Anda kini boleh membina snapshot LessonVersion. Blok tambahan (Contoh, Latihan, Semakan, Ringkasan) akan dimasukkan jika tersedia.
                  </p>

                  <Button
                    onClick={handleAssembleLesson}
                    disabled={assemblingLesson}
                    className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
                  >
                    {assemblingLesson ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                        <span>Menumpunkan Blok Teras (assembleLessonFromApprovedAssets)...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-5 h-5 text-stone-950" />
                        <span>BINA SNAPSHOT PELAJARAN (ASSEMBLE LESSON)</span>
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-stone-400 text-xs">
                    🔒 <strong>PENUMPUNAN DIKUNCI:</strong> Backend <code className="text-amber-400">assembleLessonFromApprovedAssets</code> memerlukan 3 blok teras diluluskan (APPROVED): <strong>Set Induksi, Objektif, Konsep</strong>. Blok tambahan dimasukkan jika tersedia.
                  </p>
                  <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800 text-[11px] font-mono text-stone-400 flex items-center justify-between">
                    <span>Baki Blok Teras Memerlukan Kelulusan:</span>
                    <strong className="text-amber-400">{REQUIRED_BLOCK_KEYS.length - requiredApprovedCount} Blok Teras Lagi</strong>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}