import React, { useState } from 'react';
import CurriculumGapReport from './CurriculumGapReport';
import LessonGenerationQueue from './LessonGenerationQueue';
import LessonApprovalQueue from './LessonApprovalQueue';
import { Factory } from 'lucide-react';

const ContentFactoryDashboard = () => {
  const [triggerUpdate, setTriggerUpdate] = useState(0);
  const [refreshMetricsFn, setRefreshMetricsFn] = useState(null);

  const handlePipelineAction = () => {
    // When a generation or approval finishes, we need to refresh the sibling components
    setTriggerUpdate(prev => prev + 1);
    if (refreshMetricsFn) refreshMetricsFn();
  };

  return (
    <div className="min-h-screen bg-stone-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Factory className="w-8 h-8 text-indigo-500" /> Content Factory Pipeline
          </h1>
          <p className="text-stone-400 mt-1">Automated curriculum generation, quality control, and publishing workflow.</p>
        </div>

        {/* Top: Gap Analysis (Updates automatically when queues change) */}
        <CurriculumGapReport onUpdate={(fn) => setRefreshMetricsFn(() => fn)} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: AI Generation Queue */}
          <LessonGenerationQueue onGenerateComplete={handlePipelineAction} />

          {/* Right: Human Approval Queue */}
          <LessonApprovalQueue onApproveComplete={handlePipelineAction} triggerRefresh={triggerUpdate} />
          
        </div>

      </div>
    </div>
  );
};

export default ContentFactoryDashboard;
