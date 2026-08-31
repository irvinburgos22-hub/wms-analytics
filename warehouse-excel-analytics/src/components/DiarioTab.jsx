import React, { useState, useEffect } from 'react';
import KpiCard from './KpiCard';
import { Package, Layers, TrendingUp, LayoutDashboard } from 'lucide-react';

export default function DiarioTab({ dbRows }) {
  const [selectedDate, setSelectedDate] = useState('');
  const availableDates = [...new Set(dbRows.filter(r => r.fechaOpStr).map(r => r.fechaOpStr))].sort().reverse();
  
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) setSelectedDate(availableDates[0]);
  }, [availableDates, selectedDate]);

  const filasDelDia = selectedDate ? dbRows.filter(r => r.fechaOpStr === selectedDate) : [];
  const nombreDia = filasDelDia[0]?.nombreDia || '';

  const validCajasRows = filasDelDia.filter(r => r.cajas !== 'revisar' && !isNaN(r.cajas));
  const totalCajas = validCajasRows.reduce((acc, r) => acc + Number(r.cajas), 0);
  const replCajas = validCajasRows.filter(r => r.isRepl).reduce((acc, r) => acc + Number(r.cajas), 0);
  const pctCajas = totalCajas ? ((replCajas/totalCajas)*100).toFixed(1) : 0;

  const totalUnidades = filasDelDia.reduce((acc, r) => acc + r.ctdUMA, 0);
  const replUnidades = filasDelDia.filter(r => r.isRepl).reduce((acc, r) => acc + r.ctdUMA, 0);
  const pctUnid = totalUnidades ? ((replUnidades/totalUnidades)*100).toFixed(1) : 0;

  const totalTareas = filasDelDia.length;
  const replTareas = filasDelDia.filter(r => r.isRepl).length;
  const pctTareas = totalTareas ? ((replTareas/totalTareas)*100).toFixed(1) : 0;

  const turnoMap = { AM: { cajas: 0, cajasRepl: 0 }, PM: { cajas: 0, cajasRepl: 0 }, NOCHE: { cajas: 0, cajasRepl: 0 } };
  validCajasRows.forEach(r => {
    if (turnoMap[r.turno]) {
      turnoMap[r.turno].cajas += Number(r.cajas);
      if (r.isRepl) turnoMap[r.turno].cajasRepl += Number(r.cajas);
    }
  });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3"><LayoutDashboard className="text-blue-500"/> Dashboard Diario</h1>
        {availableDates.length > 0 && (
          <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg outline-none">
            {availableDates.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
      </div>

      {filasDelDia.length === 0 ? <p className="text-gray-400">No hay datos para esta fecha o no se ha subido información.</p> : (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-blue-400">Día operativo: <span className="capitalize">{nombreDia}</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard title="Total Cajas" total={totalCajas} pctRepl={pctCajas} icon={Package} colorClass="text-blue-500" />
            <KpiCard title="Total Unidades" total={totalUnidades} pctRepl={pctUnid} icon={Layers} colorClass="text-emerald-500" />
            <KpiCard title="Total Tareas" total={totalTareas} pctRepl={pctTareas} icon={TrendingUp} colorClass="text-purple-500" />
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Rendimiento por Turno (Cajas)</h3>
            <div className="space-y-4">
              {['AM', 'PM', 'NOCHE'].map(turno => {
                const totalT = turnoMap[turno].cajas;
                const replT = turnoMap[turno].cajasRepl;
                const pct = totalT ? ((replT/totalT)*100).toFixed(1) : 0;
                return (
                  <div key={turno}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold">{turno}</span>
                      <span className="text-gray-400">{replT} / {totalT} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}