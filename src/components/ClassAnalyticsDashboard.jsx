// src/components/ClassAnalyticsDashboard.jsx
// Teacher Class Analytics & Diagnostic Dashboard (v1.0)
// High-impact DSKP TP1-TP6 mastery metrics, misconception heatmaps, and one-click remediation dispatch.

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Users,
  Award,
  AlertCircle,
  CheckCircle2,
  Send,
  BarChart3,
  ShieldAlert,
  RefreshCw,
  Flame
} from "lucide-react";

export default function ClassAnalyticsDashboard({
  classId = "class_4_cemerlang",
  className = "4 Cemerlang",
  subject = "Matematik",
  yearLevel = "Tahun 4"
}) {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState(classId);
  const [dispatchingSp, setDispatchingSp] = useState(null);
  const [dispatchedSps, setDispatchedSps] = useState([]);

  // Mock Diagnostic Class Data
  const metrics = {
    totalStudents: 32,
    avgMastery: "TP3 (Menguasai)",
    weakSubtopicsCount: 2,
    completionRate: 84
  };

  const tpDistribution = [
    { tp: "TP1", count: 2, percentage: 6, label: "Tahu", bg: "bg-rose-500", text: "text-rose-400" },
    { tp: "TP2", count: 4, percentage: 12, label: "Faham", bg: "bg-amber-500", text: "text-amber-400" },
    { tp: "TP3", count: 14, percentage: 44, label: "Menguasai", bg: "bg-cyan-500", text: "text-cyan-400" },
    { tp: "TP4", count: 7, percentage: 22, label: "Menguasai dengan Beradab", bg: "bg-emerald-500", text: "text-emerald-400" },
    { tp: "TP5", count: 3, percentage: 9, label: "Beradab Terpuji", bg: "bg-purple-500", text: "text-purple-400" },
    { tp: "TP6", count: 2, percentage: 6, label: "Beradab Mithali", bg: "bg-yellow-400", text: "text-yellow-300" }
  ];

  const weakSubtopics = [
    {
      sp_code: "4.1.1",
      sp_title: "Nilai Duit Syiling dan Mata Wang",
      topic: "Wang",
      fail_rate: "38% Keliru",
      affected_count: 12,
      misconception: "Murid cenderung menganggap syiling 20 sen lebih besar daripada 50 sen kerana keliru saiz dan warna.",
      recommended_widget: "money_counter",
      remediation_module: "Infografik Visual Nilai Duit Syiling & Kad Nota CPA"
    },
    {
      sp_code: "5.2.1",
      sp_title: "Membaca Muka Jam Analog & Digital",
      topic: "Masa dan Waktu",
      fail_rate: "31% Keliru",
      affected_count: 10,
      misconception: "Murid keliru antara peranan jarum pendek (jam) dan jarum panjang (minit) apabila jarum berada di antara dua nombor.",
      recommended_widget: "clock_face",
      remediation_module: "Infografik Visual Jarum Jam & Aktiviti Muka Jam"
    }
  ];

  const handleDispatchRemediation = (spCode, spTitle, affectedCount) => {
    setDispatchingSp(spCode);

    setTimeout(() => {
      setDispatchedSps(prev => [...prev, spCode]);
      setDispatchingSp(null);

      toast({
        title: "⚡ Modul Ulangkaji Berjaya Dihantar!",
        description: `Modul Infografik Visual bagi SP ${spCode} (${spTitle}) telah dikirim kepada ${affectedCount} murid terjejas.`
      });
    }, 1000);
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 bg-stone-950 text-stone-100 font-sans min-h-screen">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">
            📊
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Papan Analitis & Diagnostik Kelas <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">v1.0</span>
            </h1>
            <p className="text-xs text-stone-400">
              Analisis Tahap Penguasaan DSKP (TP1–TP6), Mitos Pembelajaran, dan Penghantaran Pemulihan KSSR
            </p>
          </div>
        </div>

        {/* Class Selector Dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-10 px-3 bg-stone-900 border border-stone-800 rounded-xl text-xs font-bold text-stone-200 focus:border-amber-500 outline-none"
          >
            <option value="class_4_cemerlang">Kelas 4 Cemerlang (Matematik Tahun 4)</option>
            <option value="class_1_pintar">Kelas 1 Pintar (Matematik Tahun 1)</option>
            <option value="class_3_bijak">Kelas 3 Bijak (Sains Tahun 3)</option>
          </select>
        </div>
      </div>

      {/* SECTION 1: 📊 KEY METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-stone-900/90 border-stone-800 shadow-xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Jumlah Murid Aktif</span>
              <h3 className="text-xl font-black text-white">{metrics.totalStudents} Murid</h3>
              <span className="text-[10px] font-semibold text-cyan-400">Kehadiran 100% Modul</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-stone-900/90 border-stone-800 shadow-xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Purata Penguasaan Kelas</span>
              <h3 className="text-xl font-black text-white">{metrics.avgMastery}</h3>
              <span className="text-[10px] font-semibold text-emerald-400">Standard PBD KSSR</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-stone-900/90 border-stone-800 shadow-xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Subtopik Lemah Kritikal</span>
              <h3 className="text-xl font-black text-white">{metrics.weakSubtopicsCount} Subtopik</h3>
              <span className="text-[10px] font-semibold text-rose-400">Perlu Pemulihan Prompt</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-stone-900/90 border-stone-800 shadow-xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Kadar Penyelesaian Misi</span>
              <h3 className="text-xl font-black text-white">{metrics.completionRate}%</h3>
              <span className="text-[10px] font-semibold text-amber-400">Penyelesaian 9-Langkah</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: 📈 TP LEVEL DISTRIBUTION (TP1 – TP6) */}
      <Card className="bg-stone-900/90 border-stone-800 shadow-xl">
        <CardHeader className="border-b border-stone-800/60 pb-3">
          <CardTitle className="text-sm font-black text-amber-400 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" /> Taburan Tahap Penguasaan DSKP (TP1 hingga TP6)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {tpDistribution.map((item) => (
              <div key={item.tp} className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-2 text-center">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black ${item.text}`}>{item.tp}</span>
                  <span className="text-[10px] font-bold text-stone-400">{item.count} Murid</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.bg} transition-all duration-500`}
                    style={{ width: `${Math.max(item.percentage, 8)}%` }}
                  />
                </div>

                <span className="text-[9px] font-bold text-stone-400 block truncate" title={item.label}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3 & 4: 🛡️ MISCONCEPTION HEATMAP & ONE-CLICK REMEDIATION DISPATCH */}
      <Card className="bg-stone-900/90 border-stone-800 shadow-xl">
        <CardHeader className="border-b border-stone-800/60 pb-3">
          <CardTitle className="text-sm font-black text-rose-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" /> Peta Mitos & Subtopik Lemah Kritikal (Tindakan Pemulihan)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weakSubtopics.map((subtopic) => {
              const isDispatched = dispatchedSps.includes(subtopic.sp_code);

              return (
                <div
                  key={subtopic.sp_code}
                  className="p-5 bg-gradient-to-br from-rose-950/40 via-stone-950 to-stone-900 border-2 border-rose-500/30 rounded-3xl space-y-4 shadow-lg text-left"
                >
                  {/* Header Badge */}
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                    <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-400" /> SP {subtopic.sp_code} — {subtopic.topic}
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-rose-950 text-rose-300 border border-rose-500/40">
                      {subtopic.fail_rate}
                    </span>
                  </div>

                  {/* Title & Misconception */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white">{subtopic.sp_title}</h4>
                    <p className="text-xs text-rose-200/90 leading-relaxed font-semibold">
                      💡 Mitos: "{subtopic.misconception}"
                    </p>
                  </div>

                  {/* Recommended Module */}
                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-[11px] space-y-1">
                    <span className="text-amber-400 font-bold block">📦 Modul Pemulihan Disyorkan:</span>
                    <p className="text-stone-300 font-medium">{subtopic.remediation_module}</p>
                  </div>

                  {/* Dispatch Button */}
                  <Button
                    onClick={() => handleDispatchRemediation(subtopic.sp_code, subtopic.sp_title, subtopic.affected_count)}
                    disabled={dispatchingSp === subtopic.sp_code || isDispatched}
                    className={`w-full h-12 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                      isDispatched
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                        : "bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-stone-950 border-b-4 border-rose-700 active:scale-[0.99]"
                    }`}
                  >
                    {dispatchingSp === subtopic.sp_code ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                        <span>Menghantar Modul...</span>
                      </>
                    ) : isDispatched ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Modul Pemulihan Dihantar ✓</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-stone-950" />
                        <span>⚡ Hantar Modul Ulangkaji ({subtopic.affected_count} Murid)</span>
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
