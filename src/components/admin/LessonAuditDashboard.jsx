import React, { useState, useEffect } from 'react';
import { runLibraryAudit } from '../../services/lessonAuditService';
import LessonHealthCard from './LessonHealthCard';
import CurriculumCoverageMatrix from './CurriculumCoverageMatrix';
import LessonRepairQueue from './LessonRepairQueue';
import { ShieldCheck, BookOpen, AlertTriangle, Layers, Zap } from 'lucide-react';

const LessonAuditDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  
  // For MVP UI, we're importing mock lessons directly since this isn't hooked to a real repo
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    runLibraryAudit().then(setMetrics);
    
    // Simulate fetching lessons for the UI cards
    import('../../services/lessonAuditService').then(module => {
      // In a real scenario, this would be an exported getter.
      // Here we simulate the return of all lessons based on the mock data logic.
      setLessons([
        { id: "L_101", title: "Mengenal Nombor 1-10", sp_code: "1.1.1", status: "Healthy", score: 92, missing_elements: [] },
        { id: "L_102", title: "Operasi Tambah Asas", sp_code: "2.1.1", status: "Repair Required", score: 45, missing_elements: ["assessment_questions", "interactive_widget"] },
        { id: "L_103", title: "Bentuk 3D", sp_code: "INVALID_CODE", status: "Repair Required", score: 30, missing_elements: ["mastery_link"] }
      ]);
    });
  }, []);

  if (!metrics) return null;

  return (
    <div className="min-h-screen bg-stone-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-500" /> Lesson Library Audit
          </h1>
          <p className="text-stone-400 mt-1">Pre-pilot validation of content completeness and DSKP alignment.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
            <BookOpen className="w-5 h-5 text-indigo-400 mb-2" />
            <div className="text-2xl font-black text-white">{metrics.totalLessons}</div>
            <div className="text-[10px] uppercase text-stone-500 font-bold mt-1">Total Lessons</div>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-2xl">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-2xl font-black text-emerald-400">{metrics.healthyCount}</div>
            <div className="text-[10px] uppercase text-emerald-500/70 font-bold mt-1">Healthy</div>
          </div>
          <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-rose-400 mb-2" />
            <div className="text-2xl font-black text-rose-400">{metrics.repairCount}</div>
            <div className="text-[10px] uppercase text-rose-500/70 font-bold mt-1">Needs Repair</div>
          </div>
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
            <Zap className="w-5 h-5 text-amber-400 mb-2" />
            <div className="text-2xl font-black text-white">{metrics.overallHealthScore}</div>
            <div className="text-[10px] uppercase text-stone-500 font-bold mt-1">Avg Health Score</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" /> Lesson Inventory
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {lessons.map(lesson => (
                  <LessonHealthCard 
                    key={lesson.id} 
                    lesson={lesson} 
                    onRepair={() => console.log('Repair', lesson.id)} 
                    onArchive={() => console.log('Archive', lesson.id)}
                  />
                ))}
              </div>
            </div>
            
            <CurriculumCoverageMatrix />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <LessonRepairQueue />
          </div>
        </div>

      </div>
    </div>
  );
};

export default LessonAuditDashboard;
