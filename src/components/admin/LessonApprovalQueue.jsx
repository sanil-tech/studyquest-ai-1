import React, { useState, useEffect } from 'react';
import { getApprovalQueue, approveLesson } from '../../services/contentFactoryService';
import { CheckSquare, ShieldCheck, Loader2 } from 'lucide-react';

const LessonApprovalQueue = ({ onApproveComplete, triggerRefresh }) => {
  const [approvalQueue, setApprovalQueue] = useState([]);
  const [approvingId, setApprovingId] = useState(null);

  const fetchQueue = async () => {
    const data = await getApprovalQueue();
    setApprovalQueue(data);
  };

  useEffect(() => {
    fetchQueue();
  }, [triggerRefresh]);

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      await approveLesson(id);
      await fetchQueue();
      if (onApproveComplete) {
        onApproveComplete();
      }
    } catch (e) {
      console.error(e);
    }
    setApprovingId(null);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
      <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
        <CheckSquare className="w-5 h-5 text-emerald-400" /> QA Approval Queue
      </h3>

      <div className="space-y-3">
        {approvalQueue.length === 0 ? (
          <p className="text-stone-500 text-sm">No generated lessons pending review.</p>
        ) : (
          approvalQueue.map(lesson => (
            <div key={lesson.id} className="bg-stone-950 border border-stone-800 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      SP: {lesson.sp_code}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">{lesson.id}</span>
                  </div>
                  <div className="text-sm font-bold text-stone-200">{lesson.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-stone-400">Quality Scores</div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] bg-stone-900 px-1.5 py-0.5 rounded text-stone-300 border border-stone-800">
                      Align: {lesson.scores.alignment}
                    </span>
                    <span className="text-[10px] bg-stone-900 px-1.5 py-0.5 rounded text-stone-300 border border-stone-800">
                      Ped: {lesson.scores.pedagogy}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleApprove(lesson.id)}
                disabled={approvingId !== null}
                className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  approvingId === lesson.id
                    ? 'bg-emerald-600/50 text-white cursor-wait'
                    : approvingId !== null
                    ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                }`}
              >
                {approvingId === lesson.id ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Approving...</>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /> Approve to Library</>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LessonApprovalQueue;
