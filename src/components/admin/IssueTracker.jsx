import React, { useState, useEffect } from 'react';
import { getPilotIssues, createPilotIssue, updatePilotIssueStatus } from '../../services/pilotOperationsService';
import rules from '../../data/pilotOperationsRules.json';
import { ShieldAlert, Plus, CheckCircle2, Clock } from 'lucide-react';

const IssueTracker = () => {
  const [issues, setIssues] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState(rules.issue_categories[0]);
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    getPilotIssues().then(setIssues);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    const issue = await createPilotIssue({ category: newCategory, description: newDesc });
    setIssues([issue, ...issues]);
    setNewDesc('');
    setIsAdding(false);
  };

  const handleStatusUpdate = async (id, status) => {
    await updatePilotIssueStatus(id, status);
    getPilotIssues().then(setIssues);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'Investigating': return <Clock className="w-4 h-4 text-amber-400" />;
      case 'Resolved': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default: return null;
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" /> Issue Tracker
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-6 bg-stone-950 p-4 rounded-xl border border-stone-800">
          <div className="flex flex-col gap-3">
            <select 
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="bg-stone-900 border border-stone-800 rounded-lg p-2 text-sm text-white focus:outline-none"
            >
              {rules.issue_categories.map(cat => <option key={cat}>{cat}</option>)}
            </select>
            <input 
              type="text"
              placeholder="Deskripsi masalah..."
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="bg-stone-900 border border-stone-800 rounded-lg p-2 text-sm text-white focus:outline-none"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-sm">
              Simpan
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {issues.map(issue => (
          <div key={issue.id} className="bg-stone-950 border border-stone-800 p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                {issue.category}
              </span>
              <div className="flex items-center gap-2">
                {getStatusIcon(issue.status)}
                <select 
                  value={issue.status}
                  onChange={(e) => handleStatusUpdate(issue.id, e.target.value)}
                  className="bg-transparent text-xs font-bold text-stone-400 focus:outline-none cursor-pointer"
                >
                  {rules.issue_statuses.map(s => <option key={s} className="bg-stone-900">{s}</option>)}
                </select>
              </div>
            </div>
            <p className="text-sm text-stone-300">{issue.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueTracker;
