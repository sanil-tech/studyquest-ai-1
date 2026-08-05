// src/pages/LessonBuilder.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Replacement for LessonResources.jsx that targets the new
// LessonVersion / LessonContent / QuestionBank architecture.
//
// Key differences from LessonResources.jsx
//   • listLessonVersions()   – drives the lesson picker (LessonVersion-first,
//                               Quiz fallback)
//   • loadLessonContent()    – hydrates the form from either source
//   • saveLessonContent()    – writes to LessonVersion blocks or legacy Quiz
//   • Create mode            – still writes to Quiz (legacy) so the student
//                               LessonPage continues to work until full migration
//   • Image compression/upload logic is unchanged (same helper)
//   • AI generation buttons  – unchanged
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  BookOpen, Video, HelpCircle, Plus, Trash2, Save, Sparkles,
  Loader2, PlusCircle, Edit3, Search, UploadCloud, FileJson,
  Link as LinkIcon, Image as ImageIcon, FileText
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  listLessonVersions,
  loadLessonContent,
  saveLessonContent,
} from "@/services/lessonBuilderService";

// ─── image compression (unchanged from LessonResources) ──────────────────────
function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const MAX_WIDTH = 1200;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        const isPNG = file.type === "image/png";
        const mime = isPNG ? "image/png" : "image/jpeg";
        const ext  = isPNG ? ".png" : ".jpg";
        canvas.toBlob(
          (blob) =>
            resolve(
              new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, "") + ext,
                { type: mime, lastModified: Date.now() }
              )
            ),
          mime,
          isPNG ? undefined : 0.75
        );
      };
    };
  });
}

async function uploadImage(file) {
  const compressed = await compressImage(file);
  const formData = new FormData();
  formData.append("file", compressed);
  const attempts = [
    () => base44.integrations.UploadFile.upload({ file: compressed }),
    () => base44.integrations.UploadFile.execute({ file: compressed }),
    () => base44.integrations.UploadFile({ file: compressed }),
    () => base44.integrations.UploadFile.upload(formData),
  ];
  for (const attempt of attempts) {
    try {
      const res = await attempt();
      if (res) {
        const url =
          typeof res === "string"
            ? res
            : res.url || res.file_url || res.link || Object.values(res)[0];
        if (url && typeof url === "string" && url.startsWith("http"))
          return url;
      }
    } catch (_) {}
  }
  throw new Error("Kuota integrasi pelayan penuh.");
}

// ─── empty question factory ───────────────────────────────────────────────────
const emptyQuestion = () => ({
  questionText: "",
  questionImageUrl: "",
  questionFile: null,
  questionPreview: "",
  options: ["", "", "", ""],
  correctAnswer: "A",
  explanation: "",
});

// ─── component ────────────────────────────────────────────────────────────────
export default function LessonBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // auth
  const [checkingAuth, setCheckingAuth]   = useState(true);
  const [hasAccess,    setHasAccess]      = useState(false);

  // page state
  const [formMode, setFormMode]                       = useState("create"); // "create" | "edit"
  const [versionList, setVersionList]                 = useState([]);       // { id, label, source }
  const [selectedVersionId, setSelectedVersionId]     = useState("");
  const [selectedSource, setSelectedSource]           = useState("Quiz");   // "LessonVersion" | "Quiz"
  const [isLoadingList, setIsLoadingList]             = useState(false);
  const [isLoadingContent, setIsLoadingContent]       = useState(false);
  const [isSaving, setIsSaving]                       = useState(false);

  // form fields
  const [topicId,          setTopicId]          = useState("");
  const [title,            setTitle]            = useState("");
  const [subtitle,         setSubtitle]         = useState("");
  const [youtubeUrl,       setYoutubeUrl]       = useState("");
  const [notes,            setNotes]            = useState("");
  const [noteImageUrl,     setNoteImageUrl]     = useState("");
  const [noteImageFile,    setNoteImageFile]    = useState(null);
  const [noteImagePreview, setNoteImagePreview] = useState("");
  const [infographicUrl,   setInfographicUrl]   = useState("");
  const [infographicFile,  setInfographicFile]  = useState(null);
  const [infographicPreview, setInfographicPreview] = useState("");
  const [questions,        setQuestions]        = useState([emptyQuestion()]);
  const [subtopics,        setSubtopics]        = useState([]);
  const [newSubtopic,      setNewSubtopic]      = useState("");

  // JSON paste
  const [showPasteJson, setShowPasteJson] = useState(false);
  const [pastedJson,    setPastedJson]    = useState("");
  const jsonFileInputRef = useRef(null);

  // AI modular generation (top card – unchanged from LessonResources)
  const [modularTopics,          setModularTopics]          = useState([]);
  const [selectedModularTopicId, setSelectedModularTopicId] = useState("");
  const [topicSearchQuery,       setTopicSearchQuery]       = useState("");
  const [isGeneratingModular,    setIsGeneratingModular]    = useState(false);

  // AI generation for selected edit version (second card)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // ── auth check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const checkAccess = async () => {
      try {
        setCheckingAuth(true);
        const me = await base44.auth.me();
        if (!me) throw new Error("Sesi tidak sah.");
        const role = me.app_role;
        if (
          role === "admin" ||
          role === "teacher" ||
          role === "parent" ||
          me.is_admin === true
        ) {
          if (!cancelled) {
            setHasAccess(true);
            loadVersionList();
            loadModularTopics();
          }
        } else {
          toast({ title: "Akses Disekat! 🛑", variant: "destructive" });
          navigate("/dashboard");
        }
      } catch {
        navigate("/login");
      } finally {
        if (!cancelled) setCheckingAuth(false);
      }
    };
    checkAccess();
    return () => { cancelled = true; };
  }, [navigate, toast]);

  // ── data loaders ─────────────────────────────────────────────────────────────
  const loadVersionList = async () => {
    setIsLoadingList(true);
    try {
      const list = await listLessonVersions();
      setVersionList(list || []);
    } catch {
      toast({ title: "Gagal memuat senarai versi", variant: "destructive" });
    } finally {
      setIsLoadingList(false);
    }
  };

  const loadModularTopics = async () => {
    try {
      const topics = await base44.entities.Topic.list("-created_date", 100);
      setModularTopics(topics || []);
    } catch {
      toast({ title: "Gagal memuat senarai topik", variant: "destructive" });
    }
  };

  // ── version picker ────────────────────────────────────────────────────────────
  const handleSelectVersion = async (e) => {
    const id = e.target.value;
    setSelectedVersionId(id);
    if (!id) { resetForm(); return; }

    const item = versionList.find((v) => v.id === id);
    const source = item?.source || "Quiz";
    setSelectedSource(source);

    setIsLoadingContent(true);
    try {
      const state = await loadLessonContent(id, source);
      hydrateForm(state);
    } catch (err) {
      toast({
        title: "Gagal memuatkan kandungan",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingContent(false);
    }
  };

  const hydrateForm = (state) => {
    setTopicId(state.topicId);
    setTitle(state.title);
    setSubtitle(state.subtitle);
    setYoutubeUrl(state.youtubeUrl);
    setNotes(state.notes);
    setNoteImageUrl(state.noteImageUrl);
    setNoteImagePreview(state.noteImageUrl);
    setNoteImageFile(null);
    setInfographicUrl(state.infographicUrl);
    setInfographicPreview(state.infographicUrl);
    setInfographicFile(null);
    setSubtopics(state.subtopics);
    setQuestions(state.questions.length > 0 ? state.questions : [emptyQuestion()]);
  };

  const resetForm = () => {
    setTopicId(""); setTitle(""); setSubtitle(""); setYoutubeUrl("");
    setNotes(""); setNoteImageUrl(""); setNoteImageFile(null); setNoteImagePreview("");
    setInfographicUrl(""); setInfographicFile(null); setInfographicPreview("");
    setQuestions([emptyQuestion()]); setSubtopics([]); setNewSubtopic("");
  };

  const switchMode = (mode) => {
    setFormMode(mode);
    setSelectedVersionId("");
    resetForm();
    if (mode === "edit") loadVersionList();
  };

  // ── question helpers ──────────────────────────────────────────────────────────
  const addQuestion        = ()                          => setQuestions([...questions, emptyQuestion()]);
  const removeQuestion     = (i)                         => setQuestions(questions.filter((_, idx) => idx !== i));
  const changeQuestion     = (i, field, val)             => { const q = [...questions]; q[i][field] = val; setQuestions(q); };
  const changeOption       = (qi, oi, val)               => { const q = [...questions]; if (!q[qi].options) q[qi].options = ["","","",""]; q[qi].options[oi] = val; setQuestions(q); };
  const onQuestionImagePick= (i, file)                   => { if (!file) return; const q = [...questions]; q[i].questionFile = file; q[i].questionPreview = URL.createObjectURL(file); setQuestions(q); };

  const addSubtopic    = () => { const v = newSubtopic.trim(); if (!v) return; setSubtopics([...subtopics, v]); setNewSubtopic(""); };
  const removeSubtopic = (i) => setSubtopics(subtopics.filter((_, idx) => idx !== i));

  // ── JSON import ───────────────────────────────────────────────────────────────
  const processRawJSON = (jsonString) => {
    try {
      let clean = jsonString.trim();
      if (clean.startsWith("```json")) clean = clean.replace(/^```json/, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(clean);
      if (!Array.isArray(parsed)) throw new Error("Format mestilah Array [ … ].");
      const imported = parsed.map((q) => {
        const img = q.questionImageUrl || q.question_image_url || "";
        return {
          questionText:    q.question || "",
          questionImageUrl: img,
          questionFile:    null,
          questionPreview: img,
          options:         Array.isArray(q.options) ? [...q.options, "", "", "", ""].slice(0, 4) : ["", "", "", ""],
          correctAnswer:   q.correct_answer || "A",
          explanation:     q.explanation || "",
        };
      });
      setQuestions(imported);
      toast({ title: `Import Berjaya! 🎉`, description: `${imported.length} soalan disusun.` });
      setShowPasteJson(false);
      setPastedJson("");
      if (jsonFileInputRef.current) jsonFileInputRef.current.value = "";
    } catch (err) {
      toast({ title: "Ralat Membaca JSON ❌", description: err.message, variant: "destructive" });
    }
  };

  const onJSONFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => processRawJSON(ev.target.result);
    reader.readAsText(file);
  };

  // ── save ──────────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (formMode === "create" && !topicId) {
      toast({ title: "ID Topik Diperlukan", variant: "destructive" });
      return;
    }
    if (!title || !youtubeUrl) {
      toast({ title: "Medan Diperlukan", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      // upload images if new files selected
      let finalInfographicUrl = infographicUrl;
      if (infographicFile) {
        try { finalInfographicUrl = await uploadImage(infographicFile); } catch (_) {}
      }

      let finalNoteImageUrl = noteImageUrl;
      if (noteImageFile) {
        try {
          finalNoteImageUrl = await uploadImage(noteImageFile);
        } catch {
          alert("🛑 Gagal muat naik gambar nota. Gunakan pautan URL alternatif.");
          setIsSaving(false);
          return;
        }
      }

      // upload per-question images
      const resolvedQuestions = [];
      for (const q of questions) {
        let imgUrl = q.questionImageUrl;
        if (q.questionFile) {
          try { imgUrl = await uploadImage(q.questionFile); } catch (_) {}
        }
        resolvedQuestions.push({ ...q, questionImageUrl: imgUrl });
      }

      await saveLessonContent({
        mode: formMode,
        // For edit, source is whatever was loaded; for create always Quiz (legacy)
        source: formMode === "edit" ? selectedSource : "Quiz",
        lessonVersionId: selectedVersionId,
        topicId,
        title,
        subtitle,
        youtubeUrl,
        notes,
        noteImageUrl: finalNoteImageUrl,
        infographicUrl: finalInfographicUrl,
        subtopics,
        questions: resolvedQuestions,
      });

      toast({ title: "Kandungan Berjaya Disimpan! 🎉" });
      resetForm();
      setSelectedVersionId("");
      if (formMode === "edit") setTimeout(loadVersionList, 500);
    } catch (err) {
      toast({ title: "Ralat Menyimpan", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // ── AI generation – modular (top card) ───────────────────────────────────────
  const handleGenerateModularContent = async () => {
    if (!selectedModularTopicId) {
      toast({ title: "Pilih topik dahulu", variant: "destructive" });
      return;
    }
    const ok = window.confirm(
      "Jana semua kandungan AI modular untuk topik ini?\n\n" +
      "Ini akan menjana: Nota, Peta Minda, Soalan Kuiz, Flashcard, Permainan, Panduan Guru.\n\n" +
      "Kandungan sedia ada akan ditimpa."
    );
    if (!ok) return;

    setIsGeneratingModular(true);
    try {
      const res = await base44.functions.invoke("generateModularLessonContent", {
        topic_id: selectedModularTopicId,
        force: true,
      });
      if (res.data?.success) {
        toast({ title: "Kandungan Modular Dijana! 🎉" });
      } else {
        toast({ title: "Ralat", description: res.data?.error || "Gagal menjana.", variant: "destructive" });
      }
    } catch (err) {
      const msg = String(err.message || err).toLowerCase();
      const isTimeout = msg.includes("timeout") || msg.includes("timed out") || msg.includes("aborted") || msg.includes("network");
      toast({
        title: isTimeout ? "Timeout ⏳" : "Ralat Sistem",
        description: isTimeout
          ? "Kandungan mungkin masih diproses. Tunggu sebentar dan segarkan halaman."
          : err.message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingModular(false);
    }
  };

  // ── AI generation – selected edit version (second card) ──────────────────────
  const handleGenerateAIContent = async () => {
    if (!selectedVersionId) {
      toast({ title: "Pilih topik dahulu", variant: "destructive" });
      return;
    }
    const ok = window.confirm(
      "Jana semua kandungan AI modular untuk versi ini?\n\nKandungan sedia ada akan ditimpa."
    );
    if (!ok) return;

    setIsGeneratingAI(true);
    try {
      const res = await base44.functions.invoke("generateModularLessonContent", {
        topic_id: selectedVersionId,
        force: true,
      });
      if (res.data?.success) {
        toast({ title: "Kandungan Modular Dijana! 🎉" });
      } else {
        toast({ title: "Ralat", description: res.data?.error || "Gagal menjana.", variant: "destructive" });
      }
    } catch (err) {
      const msg = String(err.message || err).toLowerCase();
      const isTimeout = msg.includes("timeout") || msg.includes("timed out");
      toast({
        title: isTimeout ? "Timeout ⏳" : "Ralat Sistem",
        description: isTimeout
          ? "Kandungan mungkin masih diproses. Tunggu sebentar."
          : err.message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────────
  if (checkingAuth)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 bg-slate-50/30 min-h-screen font-sans">

      {/* ── header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
            Lesson Builder
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Menyokong LessonVersion + LessonContent + QuestionBank (dengan fallback ke Quiz legacy).
          </p>
        </div>
        <div className="flex bg-slate-200/70 p-1 rounded-xl shadow-inner self-start sm:self-center">
          <button
            type="button"
            onClick={() => switchMode("create")}
            className={`px-4 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 ${formMode === "create" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-500" /> Cipta Baru
          </button>
          <button
            type="button"
            onClick={() => switchMode("edit")}
            className={`px-4 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 ${formMode === "edit" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-500" /> Edit / Padam
          </button>
        </div>
      </div>

      {/* ── CARD 1: AI modular generation ── */}
      <Card className="p-4 bg-purple-50/30 border border-purple-200/60 rounded-2xl shadow-2xs space-y-3">
        <label className="text-xs font-black text-purple-800 uppercase flex items-center gap-1.5 mb-1">
          <Sparkles className="w-4 h-4 animate-pulse" /> Jana Kandungan AI Modular (Sistem Baru)
        </label>
        <p className="text-[11px] text-slate-500 font-medium">
          Jana SEMUA aset pelajaran ke entiti modular berasingan dalam satu panggilan AI.
        </p>
        <div className="relative space-y-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={topicSearchQuery}
              onChange={(e) => setTopicSearchQuery(e.target.value)}
              placeholder="Taip nama topik untuk cari..."
              className="w-full pl-8 pr-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div className="max-h-44 overflow-y-auto rounded-xl border border-purple-100 bg-white shadow-sm">
            {(() => {
              const filtered = modularTopics.filter((t) =>
                (t.name || "").toLowerCase().includes(topicSearchQuery.toLowerCase())
              );
              if (filtered.length === 0)
                return <p className="text-[11px] text-slate-400 font-medium p-3 text-center">Tiada topik dijumpai.</p>;
              return filtered.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setSelectedModularTopicId(t.id); setTopicSearchQuery(t.name); }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold border-b border-slate-50 last:border-0 transition-colors ${
                    selectedModularTopicId === t.id ? "bg-purple-100 text-purple-900" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {t.name}
                </button>
              ));
            })()}
          </div>
          {selectedModularTopicId && (
            <p className="text-[10px] text-purple-600 font-bold">
              ✓ Topik dipilih: {modularTopics.find((t) => t.id === selectedModularTopicId)?.name}
            </p>
          )}
        </div>
        <Button
          type="button"
          onClick={handleGenerateModularContent}
          disabled={isGeneratingModular || !selectedModularTopicId}
          className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGeneratingModular
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Menjana Kandungan Modular...</>
            : <><Sparkles className="w-4 h-4" /> Jana Kandungan AI Modular</>}
        </Button>
      </Card>

      {/* ── CARD 2: version picker + second AI button (edit mode only) ── */}
      {formMode === "edit" && (
        <Card className="p-4 bg-amber-50/30 border border-amber-200/60 rounded-2xl shadow-2xs space-y-3">
          <label className="text-xs font-black text-amber-800 uppercase flex items-center gap-1.5 mb-1">
            <Search className="w-4 h-4" /> Pilih Versi / Modul Untuk Disunting
          </label>
          <select
            value={selectedVersionId}
            onChange={handleSelectVersion}
            disabled={isLoadingList || isLoadingContent}
            className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm"
          >
            <option value="">-- Sila Pilih Versi Pelajaran --</option>
            {versionList.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
          {isLoadingContent && (
            <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Memuatkan kandungan...
            </p>
          )}
          {selectedVersionId && (
            <Button
              type="button"
              onClick={handleGenerateAIContent}
              disabled={isGeneratingAI}
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              {isGeneratingAI
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Menjana...</>
                : <><Sparkles className="w-4 h-4" /> Jana Kandungan AI Modular</>}
            </Button>
          )}
        </Card>
      )}

      {/* ── FORM ── */}
      {(formMode === "create" || selectedVersionId) ? (
        <form onSubmit={handleSave} className="space-y-6">

          {/* 1 – Core parameters */}
          <Card className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-black border-b pb-2 uppercase text-[11px] tracking-wider text-emerald-600">
              <BookOpen className="w-4 h-4 inline mr-1" /> 1. Parameter Teras
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label htmlFor="lb-topic-id" className="text-[10px] font-bold text-slate-500 uppercase">
                  ID Unik Topik*
                </label>
                <input
                  id="lb-topic-id"
                  type="text"
                  required
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  disabled={formMode === "edit"}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-slate-50"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label htmlFor="lb-title" className="text-[10px] font-bold text-slate-500 uppercase">
                  Tajuk Utama Modul*
                </label>
                <input
                  id="lb-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            {/* Subtopics */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> Subtopik (Pilihan)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtopic}
                  onChange={(e) => setNewSubtopic(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubtopic(); } }}
                  placeholder="cth: Penambahan, Penolakan…"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
                <Button type="button" size="sm" onClick={addSubtopic} className="h-9 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold gap-1 shrink-0">
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </Button>
              </div>
              {subtopics.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {subtopics.map((st, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px] font-bold">
                      {st}
                      <button type="button" onClick={() => removeSubtopic(i)} className="text-rose-500 hover:text-rose-700">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* 2 – Video */}
          <Card className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-black border-b pb-2 uppercase text-[11px] tracking-wider text-emerald-600">
              <Video className="w-4 h-4 inline mr-1" /> 2. Video YouTube
            </h3>
            <div className="space-y-1">
              <label htmlFor="lb-youtube" className="text-[10px] font-bold text-slate-500 uppercase">URL YouTube*</label>
              <input
                id="lb-youtube"
                type="url"
                required
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>
          </Card>

          {/* 3 – Notes & infographic */}
          <Card className="p-5 bg-blue-50/40 border border-blue-200/70 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-black text-blue-700 border-b border-blue-200 pb-2 uppercase text-[11px] tracking-wider">
              <ImageIcon className="w-4 h-4 inline mr-1" /> 3. Nota & Infografik
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="lb-note-file" className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">🖼️ Muat Naik Infografik Nota</label>
                <input
                  id="lb-note-file"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (!f) return;
                    setNoteImageFile(f);
                    setNoteImagePreview(URL.createObjectURL(f));
                  }}
                  className="w-full text-xs text-slate-500 border border-blue-200 rounded-xl bg-white p-1 cursor-pointer"
                />
              </div>
              <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1">
                <label htmlFor="lb-note-url" className="text-[10px] font-bold text-slate-600 uppercase">URL Gambar Alternatif</label>
                <input
                  id="lb-note-url"
                  type="text"
                  placeholder="URL Gambar (PNG/JPG)"
                  value={noteImageUrl}
                  onChange={(e) => {
                    setNoteImageUrl(e.target.value);
                    if (e.target.value) setNoteImagePreview(e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                />
              </div>
            </div>
            {noteImagePreview && (
              <div className="p-2 bg-white border border-dashed border-blue-300 rounded-xl max-w-xs">
                <img src={noteImagePreview} alt={noteImageFile?.name ?? "Preview gambar nota"} className="w-full h-auto rounded-lg max-h-32 object-contain" />
                <button
                  type="button"
                  onClick={() => { setNoteImageFile(null); setNoteImagePreview(""); setNoteImageUrl(""); }}
                  className="text-[9px] font-bold text-rose-500 mt-1"
                >
                  Buang Gambar
                </button>
              </div>
            )}
            <div className="space-y-1 pt-2 border-t border-blue-100">
              <label htmlFor="lb-notes-text" className="text-[10px] font-bold text-slate-500 uppercase">Teks Nota (Pilihan)</label>
              <textarea
                id="lb-notes-text"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Taip huraian pengajaran (jika ada)..."
                className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-xl text-xs font-medium shadow-inner"
              />
            </div>
          </Card>

          {/* 4 – Mind-map / infographic image */}
          <Card className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-black border-b pb-2 uppercase text-[11px] tracking-wider text-purple-600">
              <UploadCloud className="w-4 h-4 inline mr-1" /> 4. Peta Minda Keseluruhan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="lb-infographic-file" className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">Muat Naik Gambar Peta Minda</label>
                <input
                  id="lb-infographic-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (!f) return;
                    setInfographicFile(f);
                    setInfographicPreview(URL.createObjectURL(f));
                  }}
                  className="w-full text-xs text-slate-500 border border-slate-200 rounded-xl bg-slate-50/50 p-1 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="lb-infographic-url" className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1">URL Gambar Alternatif</label>
                <input
                  id="lb-infographic-url"
                  type="text"
                  placeholder="URL Peta Minda"
                  value={infographicUrl}
                  onChange={(e) => {
                    setInfographicUrl(e.target.value);
                    if (e.target.value) setInfographicPreview(e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                />
              </div>
            </div>
            {infographicPreview && (
              <div className="mt-2 p-2 bg-slate-50 border border-dashed rounded-xl max-w-xs">
                <img src={infographicPreview} alt={infographicFile?.name ?? "Preview peta minda"} className="w-full h-auto rounded-lg max-h-32 object-contain bg-white" />
                <button
                  type="button"
                  onClick={() => { setInfographicFile(null); setInfographicPreview(""); setInfographicUrl(""); }}
                  className="text-[9px] font-bold text-rose-500 mt-1"
                >
                  Buang Fail
                </button>
              </div>
            )}
          </Card>

          {/* 5 – Quiz questions */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-1 gap-4">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase text-[12px]">
                <HelpCircle className="w-4 h-4 text-emerald-600" /> 5. Set Kuiz Objektif ({questions.length})
              </h3>
              <div className="flex flex-wrap bg-slate-100/60 p-1.5 rounded-xl border border-slate-200 gap-2 shadow-inner">
                <input
                  type="file"
                  accept=".json,application/json"
                  ref={jsonFileInputRef}
                  onChange={onJSONFileUpload}
                  className="hidden"
                />
                <Button type="button" size="sm" onClick={() => jsonFileInputRef.current?.click()} className="h-9 text-[11px] bg-slate-800 text-white rounded-xl font-bold gap-1.5">
                  <FileJson className="w-4 h-4 text-amber-400" /> Fail .JSON
                </Button>
                <Button type="button" size="sm" onClick={() => setShowPasteJson(!showPasteJson)} className="h-9 text-[11px] bg-indigo-600 text-white rounded-xl font-bold gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Tampal Teks
                </Button>
                <Button type="button" size="sm" onClick={addQuestion} className="h-9 text-[11px] bg-emerald-600 text-white rounded-xl font-bold">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Manual
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {showPasteJson && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-indigo-50/50 border-2 border-indigo-200 rounded-2xl space-y-3 shadow-inner"
                >
                  <label className="text-xs font-black text-indigo-800 uppercase flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Tampal Kod JSON Di Sini:
                  </label>
                  <textarea
                    rows={6}
                    value={pastedJson}
                    onChange={(e) => setPastedJson(e.target.value)}
                    placeholder={`[ { "question": "...", "options": ["A","B","C","D"], "correct_answer": "A" } ]`}
                    className="w-full p-3 text-[11px] font-mono leading-relaxed text-stone-700 bg-white border border-indigo-200 rounded-xl shadow-xs"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <Button type="button" variant="outline" onClick={() => setShowPasteJson(false)} className="h-9 text-xs font-bold rounded-xl text-stone-500">Batal</Button>
                    <Button type="button" onClick={() => processRawJSON(pastedJson)} className="h-9 text-xs font-black rounded-xl bg-indigo-600 text-white">Susun Soalan 🚀</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {questions.map((q, qi) => (
              <Card key={qi} className="p-5 bg-white border border-emerald-100/60 rounded-2xl space-y-4 relative">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px]">Soalan #{qi + 1}</span>
                  {questions.length > 1 && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeQuestion(qi)} className="text-rose-500 h-7 text-[10px]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label htmlFor={`lb-q-text-${qi}`} className="text-[10px] font-bold text-slate-500 uppercase">Ayat Soalan*</label>
                    <textarea
                      id={`lb-q-text-${qi}`}
                      rows={2}
                      required
                      value={q.questionText}
                      onChange={(e) => changeQuestion(qi, "questionText", e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={`lb-q-img-${qi}`} className="text-[10px] font-bold text-slate-500 uppercase">Gambar Soalan</label>
                    <input
                      id={`lb-q-img-${qi}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => onQuestionImagePick(qi, e.target.files[0])}
                      className="w-full text-xs text-slate-500 border rounded-xl bg-slate-50 p-1 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                  <label htmlFor={`lb-q-imgurl-${qi}`} className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-emerald-500" /> URL Gambar Soalan #{qi + 1}
                  </label>
                  <input
                    id={`lb-q-imgurl-${qi}`}
                    type="text"
                    placeholder="URL gambar langsung (AI / Google Drive)"
                    value={q.questionImageUrl || ""}
                    onChange={(e) => {
                      changeQuestion(qi, "questionImageUrl", e.target.value);
                      if (e.target.value) changeQuestion(qi, "questionPreview", e.target.value);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>
                {q.questionPreview && (
                  <div className="p-2 bg-slate-50 border border-dashed rounded-xl max-w-xs">
                    <img src={q.questionPreview} alt={`Preview soalan ${qi + 1}`} className="w-full h-auto rounded-lg max-h-24 object-contain bg-white border" />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...questions];
                        updated[qi].questionFile = null;
                        updated[qi].questionPreview = "";
                        updated[qi].questionImageUrl = "";
                        setQuestions(updated);
                      }}
                      className="text-[9px] font-bold text-rose-500 mt-1"
                    >
                      Buang Gambar
                    </button>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {["A", "B", "C", "D"].map((label, oi) => (
                      <div key={oi} className="flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-xl border border-slate-100">
                        <span className="w-6 h-6 rounded-lg bg-white border font-black text-xs text-slate-700 flex items-center justify-center">{label}</span>
                        <input
                          type="text"
                          required
                          value={q.options?.[oi] ?? ""}
                          onChange={(e) => changeOption(qi, oi, e.target.value)}
                          className="flex-1 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border flex items-center shrink-0">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Jawapan Betul:</span>
                    <select
                      value={q.correctAnswer || "A"}
                      onChange={(e) => changeQuestion(qi, "correctAnswer", e.target.value)}
                      className="ml-3 bg-white border rounded-lg text-xs font-black px-4 py-1 text-purple-700 cursor-pointer"
                    >
                      <option value="A">Pilihan A</option>
                      <option value="B">Pilihan B</option>
                      <option value="C">Pilihan C</option>
                      <option value="D">Pilihan D</option>
                    </select>
                  </div>
                  <div className="flex-1 w-full bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                    <textarea
                      rows={1}
                      placeholder="Penerangan jawapan..."
                      value={q.explanation || ""}
                      onChange={(e) => changeQuestion(qi, "explanation", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg text-xs font-medium shadow-inner"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Save button */}
          <div className="pt-4 flex items-center justify-end border-t">
            <Button
              type="submit"
              disabled={isSaving}
              className="text-white font-black text-xs rounded-xl shadow-md px-6 h-10 bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              {isSaving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Sedang Menyimpan...</>
                : <><Save className="w-4 h-4" /> Kunci Kandungan Modul</>}
            </Button>
          </div>
        </form>
      ) : (
        <Card className="p-8 text-center border-dashed border-2 border-slate-200 rounded-2xl bg-white">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Pilih satu versi pelajaran di atas untuk suntingan.
          </p>
        </Card>
      )}
    </div>
  );
}
