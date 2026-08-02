import React, { useState, useEffect } from 'react';
import { getContentInventory } from '../../services/contentProductionService';
import BatchGenerationRunner from './BatchGenerationRunner';
import { Factory, BookOpen, Layers, CheckSquare, AlertTriangle } from 'lucide-react';

const ContentProductionDashboard = () => {
  const [inventory, setInventory] = useState(null);

  const fetchInventory = async () => {
    const data = await getContentInventory();
    setInventory(data);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (!inventory) return null;

  return (
    <div className="min-h-screen bg-stone-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Factory className="w-8 h-8 text-indigo-500" /> Content Production
            </h1>
            <p className="text-stone-400 mt-1">Executing automated generation batches for the Resource Library.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-emerald-400">{inventory.coveragePercentage}%</div>
            <div className="text-[10px] uppercase font-bold text-stone-500">Curriculum Coverage</div>
          </div>
        </div>

        {/* Global Inventory Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
            <Layers className="w-4 h-4 text-stone-400 mb-2" />
            <div className="text-2xl font-black text-white">{inventory.totalSps}</div>
            <div className="text-[10px] uppercase text-stone-500 font-bold mt-1">Total SP</div>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl">
            <BookOpen className="w-4 h-4 text-emerald-500 mb-2" />
            <div className="text-2xl font-black text-emerald-400">{inventory.existingLessons}</div>
            <div className="text-[10px] uppercase text-emerald-500/70 font-bold mt-1">Live Lessons</div>
          </div>
          <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-rose-500 mb-2" />
            <div className="text-2xl font-black text-rose-400">{inventory.missingLessons}</div>
            <div className="text-[10px] uppercase text-rose-500/70 font-bold mt-1">Missing Lessons</div>
          </div>
          <div className="bg-indigo-950/20 border border-indigo-900/50 p-4 rounded-xl">
            <CheckSquare className="w-4 h-4 text-indigo-500 mb-2" />
            <div className="text-2xl font-black text-indigo-400">Strict</div>
            <div className="text-[10px] uppercase text-indigo-500/70 font-bold mt-1">Assessment Link Check</div>
          </div>
        </div>

        {/* Main Operational Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BatchGenerationRunner onBatchUpdate={fetchInventory} />
          </div>
          
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white mb-4">Production Rules</h3>
              <ul className="space-y-4 text-sm text-stone-400">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p>All generated lessons must include a structural mapping to an active <strong className="text-stone-200">quiz_id</strong>.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p>Quizzes must contain a minimum of 5 questions and a predefined <strong className="text-stone-200">mastery_threshold</strong>.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <p>Lessons that fail to link assessments during the `QUALITY_CHECK` stage will be immediately flagged as <strong className="text-rose-400">REJECTED</strong>.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContentProductionDashboard;
