// src/pages/QuizPage.jsx
// Quiz Evaluation Page — Powered strictly by getLearningPackage

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import QuizRunner from "@/components/quiz/QuizRunner";
import { ChevronLeft, Loader2, Compass } from "lucide-react";

/**
 * Safely parse questions from various formats (array, JSON string, or nested object).
 * Never throws an error.
 */
function parseQuestions(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
      return [];
    } catch {
      return [];
    }
  }
  if (typeof data === "object") {
    if (Array.isArray(data.questions)) return data.questions;
  }
  return [];
}

/**
 * Extract questions following strict precedence:
 * 1. assessments[0].questions
 * 2. packageData.quiz
 * 3. Quiz.questions_json / packageData.questions_json
 */
function extractQuestions(pkg) {
  if (!pkg) return [];

  // 1. Parse assessments[0].questions first
  const firstAssessment = pkg.assessments?.[0];
  if (firstAssessment) {
    const q1 = parseQuestions(firstAssessment.questions);
    if (q1.length > 0) return q1;

    const q1Json = parseQuestions(firstAssessment.questions_json);
    if (q1Json.length > 0) return q1Json;
  }

  // 2. Fallback to packageData.quiz
  if (pkg.quiz) {
    const q2 = parseQuestions(pkg.quiz);
    if (q2.length > 0) return q2;
  }

  // 3. Fallback parse Quiz.questions_json / packageData.questions_json
  if (pkg.questions_json) {
    const q3 = parseQuestions(pkg.questions_json);
    if (q3.length > 0) return q3;
  }

  if (pkg.payload) {
    const q4 = parseQuestions(pkg.payload);
    if (q4.length > 0) return q4;
  }

  return [];
}

export default function QuizPage() {
  const { quizId, assessmentId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const topicParam = searchParams.get("topic");
  const versionParam = searchParams.get("version");
  const targetAssessmentId = assessmentId || quizId;
  const navigate = useNavigate();

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadPackage = async () => {
      try {
        setLoading(true);
        setError(null);

        const primaryTopicId = topicParam || targetAssessmentId;
        const attempts = [
          { topic_id: primaryTopicId, ...(versionParam ? { lesson_version_id: versionParam } : {}) },
          { topic_id: targetAssessmentId },
          { assessment_id: targetAssessmentId },
          { lesson_version_id: targetAssessmentId }
        ];

        let resData = null;

        for (const params of attempts) {
          if (!params.topic_id && !params.assessment_id && !params.lesson_version_id) continue;
          try {
            const res = await base44.functions.invoke("getLearningPackage", params);
            const extracted = extractQuestions(res?.data);

            console.log("[QUIZ AUDIT]", {
              pathname: location.pathname,
              quizId: targetAssessmentId,
              topicId: primaryTopicId,
              searchParams: Object.fromEntries(searchParams.entries()),
              requestPayload: params,
              response: res?.data,
              extractedQuestionsCount: extracted.length
            });

            if (res?.data?.success && extracted.length > 0) {
              resData = res.data;
              break;
            } else if (res?.data?.success && !resData) {
              resData = res.data;
            }
          } catch (e) {
            console.warn("getLearningPackage attempt failed:", params, e);
          }
        }

        if (resData && extractQuestions(resData).length > 0 && isMounted) {
          setPackageData(resData);
          return;
        }

        // Direct Entity Fallback if getLearningPackage yielded no questions
        try {
          const quizList = await base44.entities.Quiz.filter({ id: targetAssessmentId }).catch(() => []);
          if (quizList.length > 0 && isMounted) {
            const q = quizList[0];
            let questions = parseQuestions(q.questions_json);
            if (!questions.length) {
              questions = parseQuestions(q.questions);
            }
            if (!questions.length) {
              questions = parseQuestions(q.payload);
            }
            if (!questions.length) {
              questions = parseQuestions(q.quiz);
            }

            setPackageData({
              success: true,
              assessments: [{
                id: q.id,
                title: q.title || q.topic_name || "Ujian Minda",
                questions: questions
              }]
            });
            return;
          }
        } catch (e3) {
          console.warn("Direct Quiz fetch error:", e3);
        }

        if (resData && isMounted) {
          setPackageData(resData);
          return;
        }

        if (isMounted) setError("Gagal memuatkan soalan ujian.");
      } catch (err) {
        if (isMounted) setError("Ralat rangkaian semasa memuatkan ujian.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (targetAssessmentId || topicParam) {
      loadPackage();
    } else {
      setLoading(false);
      setError("ID Penilaian tidak sah.");
    }

    return () => { isMounted = false; };
  }, [targetAssessmentId, topicParam, versionParam, location.pathname, searchParams]);

  const isAdaptive = searchParams.get("adaptive") === "true";
  const queueId = searchParams.get("queue_id") || "";

  const questions = extractQuestions(packageData);

  const activeAssessment = packageData ? {
    id: packageData.assessments?.[0]?.id || targetAssessmentId,
    title: packageData.assessments?.[0]?.title || packageData.lesson_title || (isAdaptive ? "Misi AI Personal: Pembelajaran Adaptif" : "Penilaian Minda"),
    questions: questions
  } : null;

  const studentName = packageData?.student_context?.display_name || "Pengembara";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 text-white p-4">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="mt-3 font-black text-stone-300 text-xs">Membuka Soalan Ujian...</p>
      </div>
    );
  }

  if (error || !activeAssessment || !questions.length) {
    return (
      <div className="min-h-screen bg-stone-950 text-white p-6 flex flex-col items-center justify-center text-center">
        <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl max-w-sm space-y-4">
          <p className="text-xs font-bold text-rose-300">{error || "Ujian tidak ditemui."}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-black rounded-xl border border-stone-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950/40 via-stone-950 to-stone-950 text-stone-100 px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* TOP HUD HEADER */}
        <div className="bg-stone-900/90 border-2 border-stone-700/80 rounded-3xl p-4 shadow-xl flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-2xl border border-stone-600 transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                {isAdaptive ? "Suku AI Tutor" : (packageData?.curriculum_context?.subject_name || "Ujian Minda")}
              </span>
              <h1 className="text-sm sm:text-base font-black text-white mt-1 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" /> {activeAssessment.title || "Penilaian Minda"}
              </h1>
            </div>
          </div>
        </div>

        {/* ADAPTIVE AI PERSONAL BANNER */}
        {isAdaptive && (
          <div className="p-4 bg-gradient-to-r from-purple-950/80 via-indigo-950 to-stone-900 border-2 border-purple-500/40 rounded-3xl shadow-xl flex items-start gap-3">
            <div className="text-3xl shrink-0">🧠</div>
            <div className="space-y-0.5">
              <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-wider rounded-full border border-purple-500/30">
                Misi AI Personal
              </span>
              <p className="text-xs sm:text-sm font-bold text-purple-100 leading-relaxed">
                "Suku menyediakan latihan khas berdasarkan kesilapan kamu sebelum ini."
              </p>
            </div>
          </div>
        )}

        {/* QUIZ RUNNER MODULE */}
        <QuizRunner
          assessment={activeAssessment}
          studentName={studentName}
          adaptiveQueueId={queueId}
          onFinish={() => navigate(-1)}
        />

      </div>
    </div>
  );
}
