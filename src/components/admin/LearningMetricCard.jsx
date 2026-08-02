import React from 'react';

const LearningMetricCard = ({ title, value, icon: Icon, trend, trendLabel, colorClass = "text-amber-400" }) => {
  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-stone-400 font-bold text-xs uppercase tracking-wider">{title}</h3>
        {Icon && <Icon className={`w-5 h-5 ${colorClass}`} />}
      </div>
      <div>
        <div className="text-3xl font-black text-white">{value}</div>
        {trend && (
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend}
            </span>
            <span className="text-[10px] text-stone-500">{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningMetricCard;
