import React, { useState, useEffect } from 'react';
import { getCurriculumCoverage } from '../../services/lessonAuditService';
import { Layers, Check, X } from 'lucide-react';

const CurriculumCoverageMatrix = () => {
  const [coverage, setCoverage] = useState([]);

  useEffect(() => {
    getCurriculumCoverage().then(setCoverage);
  }, []);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
      <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
        <Layers className="w-5 h-5 text-indigo-400" /> Curriculum Coverage
      </h3>

      <div className="space-y-6">
        {coverage.map((topic, idx) => (
          <div key={idx} className="bg-stone-950 rounded-xl p-4 border border-stone-800">
            <h4 className="text-sm font-bold text-stone-300 mb-3">{topic.topicName}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topic.sps.map((sp) => (
                <div key={sp.code} className={`flex items-start gap-3 p-3 rounded-lg border ${
                  sp.status === 'Covered' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-rose-950/20 border-rose-900/50'
                }`}>
                  <div className="mt-0.5">
                    {sp.status === 'Covered' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <X className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${sp.status === 'Covered' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {sp.code}
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1 line-clamp-2">{sp.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurriculumCoverageMatrix;
