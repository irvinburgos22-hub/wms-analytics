import React from 'react';

export default function KpiCard({ title, total, pctRepl, icon: Icon, colorClass }) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-400 text-sm uppercase font-bold">{title}</p>
          <h3 className="text-4xl font-bold text-white mt-2">{total.toLocaleString()}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClass} bg-opacity-20`}>
          <Icon className={colorClass} size={28} />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-400 text-sm">Participación REPL</span>
          <span className="text-white font-bold">{pctRepl}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className={`h-2 rounded-full ${colorClass.replace('text-', 'bg-')}`} style={{ width: `${pctRepl}%` }}></div>
        </div>
      </div>
    </div>
  );
}