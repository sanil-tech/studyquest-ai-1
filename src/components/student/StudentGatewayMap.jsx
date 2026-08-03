import React, { useState, useEffect } from 'react';
import { useBase44 } from '@base44/sdk/react';
import { Lock, Unlock, Award, PlayCircle } from 'lucide-react';

export default function StudentGatewayMap({ studentId, onSelectTopic }) {
  const base44 = useBase44();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGatewayData = async () => {
      try {
        setLoading(true);
        // Fetch all curriculum topics
        const allTopics = await base44.entities.Topic.findMany() || [];
        
        // Fetch mastery gates for student
        const gates = await base44.entities.StudentMastery.filter({
          student_id: studentId,
          is_topic_gate: true
        }) || [];

        const merged = allTopics.map(topic => {
          const gate = gates.find(g => g.topic_id === topic.id);
          // Default first topic to unlocked if no gate exists
          const isUnlocked = gate ? gate.is_unlocked : (topic.order_index === 1);
          return {
            ...topic,
            gate_status: gate ? gate.mastery_status : (isUnlocked ? "UNLOCKED" : "LOCKED"),
            is_unlocked: isUnlocked,
            score: gate ? gate.score_percentage : 0,
            tp_level: gate ? gate.max_tp_achieved : 0
          };
        }).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

        setTopics(merged);
      } catch (err) {
        console.error("Failed to load gateway map", err);
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchGatewayData();
  }, [studentId, base44]);

  if (loading) return <div className="text-center p-8 text-emerald-400 font-bold animate-pulse">Memuatkan Peta Pengembaraan...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          Peta Penguasaan Topik
        </h2>
        <p className="text-stone-400 text-sm md:text-base font-medium">
          Lepasi kuiz diagnostik untuk membuka tahap seterusnya!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {/* Connection Lines (Desktop only for simplicity) */}
        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-stone-800 -z-10 rounded-full"></div>
        
        {topics.map((topic, idx) => {
          const locked = !topic.is_unlocked;
          const mastered = topic.gate_status === "MASTERED";

          return (
            <div 
              key={topic.id} 
              className={`relative flex flex-col p-6 rounded-3xl border-2 transition-all duration-300 ${
                mastered ? "bg-amber-950/40 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : 
                locked ? "bg-stone-900 border-stone-800 opacity-60 grayscale" : 
                "bg-cyan-950/40 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:-translate-y-1 cursor-pointer"
              }`}
              onClick={() => !locked && onSelectTopic(topic)}
            >
              {/* Status Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full border-2 bg-stone-950">
                {mastered ? (
                  <Award className="w-5 h-5 text-amber-400" />
                ) : locked ? (
                  <Lock className="w-5 h-5 text-stone-500" />
                ) : (
                  <Unlock className="w-5 h-5 text-cyan-400" />
                )}
              </div>

              <div className="mt-4 text-center space-y-3 flex-1">
                <span className="px-3 py-1 bg-stone-800/50 text-[10px] uppercase font-black text-stone-300 rounded-full tracking-widest border border-stone-700/50">
                  Bab {topic.order_index || idx + 1}
                </span>
                <h3 className={`text-base font-black leading-tight ${locked ? "text-stone-500" : "text-stone-200"}`}>
                  {topic.title}
                </h3>
              </div>

              <div className="mt-6">
                {mastered ? (
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-black text-amber-400">{topic.score}%</div>
                    <div className="text-[10px] font-bold text-amber-500/80 uppercase">Tahap Penguasaan: TP{topic.tp_level}</div>
                  </div>
                ) : locked ? (
                  <div className="text-center text-[10px] font-bold text-stone-500">
                    Selesaikan Bab Sebelumnya
                  </div>
                ) : (
                  <button 
                    className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-black rounded-xl transition-all"
                  >
                    <PlayCircle className="w-5 h-5" /> Mula Cabaran
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
