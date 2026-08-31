import React, { useState, useEffect } from 'react';
import { Users, UserPlus, MonitorSmartphone } from 'lucide-react';

export default function UsuariosTab({ dbRows }) {
  const [selectedWeek, setSelectedWeek] = useState('');
  const availableWeeks = [...new Set(dbRows.filter(r => r.semanaAno).map(r => r.semanaAno))].sort((a,b)=>b-a);
  
  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeek) setSelectedWeek(availableWeeks[0]);
  }, [availableWeeks, selectedWeek]);

  const filas = selectedWeek ? dbRows.filter(r => r.semanaAno === Number(selectedWeek)) : [];

  const creadores = {};
  const confirmadores = {};
  const recursos = {};

  filas.forEach(r => {
    // 1. Clasificación estricta por Clase de Proceso 
    // (limpiamos espacios invisibles para que sea perfecto)
    const cl = String(r.clProceso).trim().toUpperCase();
    
    let tipo = 'otros';
    if (cl === 'Z302') tipo = 'repl';
    else if (cl === '3030') tipo = 'manual';
    else if (cl === '9999') tipo = 'directa';

    // 2. Lógica Creador (Autor)
    const autor = r.autor || 'SIN AUTOR';
    if (!creadores[autor]) creadores[autor] = { repl: 0, manual: 0, directa: 0, otros: 0 };
    creadores[autor][tipo]++;

    // 3. Lógica Confirmador
    const confirmador = r.confirmadoPor || 'SIN CONFIRMADOR';
    if (!confirmadores[confirmador]) confirmadores[confirmador] = { repl: 0, manual: 0, directa: 0, otros: 0 };
    confirmadores[confirmador][tipo]++;

    // 4. Lógica Recurso
    let recursoName = String(r.recursoPosterior || '').trim();
    // Si viene en blanco o con los textos de fallback, es PC/Escritorio
    if (!recursoName || recursoName === 'TAREA DIRECTA' || recursoName === 'NO IDENTIFICADO' || recursoName === 'SIN RECURSO (TAREA DIRECTA)') {
      recursoName = 'SIN RECURSO (PC / ESCRITORIO)';
    }
    
    if (!recursos[recursoName]) recursos[recursoName] = { repl: 0, manual: 0, directa: 0, otros: 0 };
    recursos[recursoName][tipo]++;
  });

  const sortFn = (a, b) => b[1].repl - a[1].repl;
  const sortedCreadores = Object.entries(creadores).sort(sortFn);
  const sortedConfirmadores = Object.entries(confirmadores).sort(sortFn);
  const sortedRecursos = Object.entries(recursos).sort(sortFn);

  const renderTable = (data, title, icon, color) => (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-h-[75vh] overflow-y-auto shadow-lg">
      <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${color}`}>{icon} {title}</h3>
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-900 text-gray-400 sticky top-0 z-10">
          <tr>
            <th className="p-3 border-b border-gray-700">Nombre</th>
            <th className="p-3 border-b border-gray-700 text-blue-400">REPL<br/><span className="text-xs text-gray-500">Z302</span></th>
            <th className="p-3 border-b border-gray-700 text-orange-400">Manual<br/><span className="text-xs text-gray-500">3030</span></th>
            <th className="p-3 border-b border-gray-700 text-rose-400">Directa<br/><span className="text-xs text-gray-500">9999</span></th>
            <th className="p-3 border-b border-gray-700 text-gray-500">Otros</th>
            <th className="p-3 border-b border-gray-700">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map(([name, metrics]) => {
            const total = metrics.repl + metrics.manual + metrics.directa + metrics.otros;
            return (
              <tr key={name} className="border-b border-gray-700/50 hover:bg-gray-750">
                <td className="p-3 font-bold text-white text-xs">{name}</td>
                <td className="p-3 text-blue-400 font-bold">{metrics.repl.toLocaleString()}</td>
                <td className="p-3 text-orange-400 font-bold">{metrics.manual.toLocaleString()}</td>
                <td className="p-3 text-rose-400 font-bold">{metrics.directa.toLocaleString()}</td>
                <td className="p-3 text-gray-500">{metrics.otros > 0 ? metrics.otros.toLocaleString() : '-'}</td>
                <td className="p-3 text-gray-300 font-bold">{total.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Users className="text-purple-400"/> Auditoría Extendida (Creador, Confirmador y Recurso)</h1>
        {availableWeeks.length > 0 && (
          <select value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))} className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg outline-none shadow-md">
            <option value="">Todas las semanas (Histórico Global)</option>
            {availableWeeks.map(w => <option key={w} value={w}>Semana {w}</option>)}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {renderTable(sortedCreadores, "1. Creador (Autor)", <UserPlus size={20}/>, "text-emerald-400")}
        {renderTable(sortedConfirmadores, "2. Confirmador (Ejecutor)", <Users size={20}/>, "text-blue-400")}
        {renderTable(sortedRecursos, "3. Máquina / RF", <MonitorSmartphone size={20}/>, "text-amber-400")}
      </div>
    </div>
  );
}