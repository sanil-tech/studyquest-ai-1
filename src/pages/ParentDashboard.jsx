import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Users, Award, BookOpen, ChevronRight, Activity } from "lucide-react";
import ParentActionCard from "@/components/parent/ParentActionCard";
import { useViewMode } from "@/lib/ViewModeContext";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { enterChildMode } = useViewMode();
  
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [masteryData, setMasteryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch children and their overall mastery data in one go
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const me = await base44.auth.me();
        
        // Mock or actual fetch for children linked to parent
        const linkedChildren = await base44.entities.User.filter({ parent_id: me.id }).catch(() => [
          { id: "stu_123", name: "Ahmad" } // Mock fallback for display
        ]);
        
        setChildren(linkedChildren);
        if (linkedChildren.length > 0) {
          setSelectedChild(linkedChildren[0]);
        }
      } catch (err) {
        console.error("Failed to load parent dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchChildMastery = async () => {
      if (!selectedChild) return;
      try {
        const mastery = await base44.entities.StudentMastery.filter({ student_id: selectedChild.id }).catch(() => []);
        setMasteryData(mastery);
      } catch (err) {
        console.error("Failed to load mastery data", err);
      }
    };
    fetchChildMastery();
  }, [selectedChild]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse font-medium">Memuatkan Papan Pemuka...</div>;
  }

  // Derive weak subjects/topics from mastery data
  const weakMastery = masteryData.filter(m => m.mastery_status === "REMEDIATION_REQUIRED" || (m.max_tp_achieved && m.max_tp_achieved <= 2));
  
  return (
    <div className="w-full max-w-lg mx-auto bg-slate-50 min-h-screen pb-20 font-sans">
      
      {/* Mobile-First Header */}
      <div className="bg-white px-4 pt-8 pb-4 shadow-sm border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Papan Pemuka</h1>
          <p className="text-sm font-medium text-slate-500">Pantau perkembangan anak anda</p>
        </div>
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
          <Users className="w-5 h-5 text-indigo-600" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Child Switcher Component (Consolidated) */}
        {children.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pelajar Semasa</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {children.map(child => (
                <button 
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                    selectedChild?.id === child.id 
                      ? "bg-indigo-600 text-white shadow-md" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {child.name}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => enterChildMode(selectedChild?.id)}
              className="mt-4 w-full py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800"
            >
              Lihat Skrin {selectedChild?.name} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Parent Action Card / Bimbingan Ibubapa */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 px-1">Tindakan Disyorkan</h3>
          {weakMastery.length > 0 ? (
            weakMastery.map((weak, idx) => (
              <ParentActionCard 
                key={idx}
                childName={selectedChild?.name}
                weakSubtopic={weak.subtopic_id || "Konsep Asas"}
                tpLevel={weak.max_tp_achieved || 1}
                remediationHint="Bantu anak anda melengkapkan kuiz ulangkaji yang disediakan di Peta Pengembaraan."
              />
            ))
          ) : (
            <ParentActionCard 
              childName={selectedChild?.name}
            />
          )}
        </div>

        {/* High-Level Overview Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-500 rounded-2xl p-4 text-white shadow-sm relative overflow-hidden">
            <Award className="w-8 h-8 opacity-20 absolute -right-2 -bottom-2" />
            <div className="text-2xl font-black">{masteryData.filter(m => m.max_tp_achieved >= 5).length}</div>
            <div className="text-xs font-bold mt-1 opacity-90">Topik Dikuasai (TP5-6)</div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <Activity className="w-8 h-8 text-slate-100 absolute -right-2 -bottom-2" />
            <div className="text-2xl font-black text-slate-800">{masteryData.length}</div>
            <div className="text-xs font-bold mt-1 text-slate-500">Aktiviti Disiapkan</div>
          </div>
        </div>

        {/* Deep Dive Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50">
          <button onClick={() => navigate('/parent/report')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><BookOpen className="w-4 h-4" /></div>
              <div className="text-left"><p className="text-sm font-bold text-slate-800">Laporan Akademik Terperinci</p></div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          <button onClick={() => navigate('/parent/billing')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center"><Award className="w-4 h-4" /></div>
              <div className="text-left"><p className="text-sm font-bold text-slate-800">Urus Ganjaran (Rewards)</p></div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

      </div>
    </div>
  );
}