import React from 'react';

export default function TablaHistoricaTab({ dbRows }) {
  // Agrupar filas por día
  const groupedByDate = {};
  
  dbRows.forEach(r => {
    const d = r.fechaOpStr;
    if (!d) return; // Si no tiene fecha, lo saltamos
    
    if (!groupedByDate[d]) {
      groupedByDate[d] = {
        fecha: d, mes: r.mes, semana: r.semanaAno, dia: r.nombreDia,
        cajasTotal: 0, cajasRepl: 0, unidTotal: 0, unidRepl: 0, tareasTotal: 0, tareasRepl: 0,
        niveles: { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0 } // Alturas
      };
    }
    
    const isCajaValid = r.cajas !== 'revisar' && !isNaN(r.cajas);
    groupedByDate[d].tareasTotal++;
    if (r.isRepl) groupedByDate[d].tareasRepl++;
    
    groupedByDate[d].unidTotal += r.ctdUMA;
    if (r.isRepl) groupedByDate[d].unidRepl += r.ctdUMA;
    
    if (isCajaValid) {
      groupedByDate[d].cajasTotal += Number(r.cajas);
      if (r.isRepl) groupedByDate[d].cajasRepl += Number(r.cajas);
    }

    if (r.nivel && groupedByDate[d].niveles[r.nivel] !== undefined) {
      groupedByDate[d].niveles[r.nivel]++;
    }
  });

  // Convertir a un arreglo ordenado por fecha de más reciente a más antigua
  const rows = Object.values(groupedByDate).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-emerald-400">Tabla Histórica (Estilo Excel)</h1>
      
      <div className="overflow-x-auto rounded-xl border border-gray-700 max-h-[75vh]">
        <table className="w-full text-xs text-center bg-gray-800 whitespace-nowrap">
          <thead className="bg-gray-900 text-gray-300 sticky top-0 z-10 shadow-md">
            <tr>
              <th className="p-3 border-r border-gray-700 bg-gray-900" colSpan="4">CALENDARIO</th>
              <th className="p-3 border-r border-gray-700 bg-blue-900/30" colSpan="3">CAJAS</th>
              <th className="p-3 border-r border-gray-700 bg-emerald-900/30" colSpan="3">UNIDADES</th>
              <th className="p-3 border-r border-gray-700 bg-purple-900/30" colSpan="3">TAREAS</th>
              <th className="p-3 bg-amber-900/30" colSpan="6">ALTURAS (NIVELES)</th>
            </tr>
            <tr className="border-b border-gray-700">
              <th className="p-2 border-r border-gray-700">Mes</th>
              <th className="p-2 border-r border-gray-700">Semana</th>
              <th className="p-2 border-r border-gray-700">Fecha</th>
              <th className="p-2 border-r border-gray-700">Día</th>
              
              <th className="p-2 bg-blue-900/10">TOTAL</th>
              <th className="p-2 bg-blue-900/10">REPL</th>
              <th className="p-2 border-r border-gray-700 bg-blue-900/10">%</th>
              
              <th className="p-2 bg-emerald-900/10">TOTAL</th>
              <th className="p-2 bg-emerald-900/10">REPL</th>
              <th className="p-2 border-r border-gray-700 bg-emerald-900/10">%</th>
              
              <th className="p-2 bg-purple-900/10">TOTAL</th>
              <th className="p-2 bg-purple-900/10">REPL</th>
              <th className="p-2 border-r border-gray-700 bg-purple-900/10">%</th>
              
              <th className="p-2 bg-amber-900/10">N1</th>
              <th className="p-2 bg-amber-900/10">N2</th>
              <th className="p-2 bg-amber-900/10">N3</th>
              <th className="p-2 bg-amber-900/10">N4</th>
              <th className="p-2 bg-amber-900/10">N5</th>
              <th className="p-2 bg-amber-900/10">N6</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const pctCajas = r.cajasTotal ? ((r.cajasRepl / r.cajasTotal)*100).toFixed(1) : '0.0';
              const pctUnid = r.unidTotal ? ((r.unidRepl / r.unidTotal)*100).toFixed(1) : '0.0';
              const pctTareas = r.tareasTotal ? ((r.tareasRepl / r.tareasTotal)*100).toFixed(1) : '0.0';
              
              return (
                <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-750">
                  <td className="p-2 border-r border-gray-700 font-bold">{r.mes}</td>
                  <td className="p-2 border-r border-gray-700">{r.semana}</td>
                  <td className="p-2 border-r border-gray-700">{r.fecha}</td>
                  <td className="p-2 border-r border-gray-700 capitalize">{r.dia}</td>
                  
                  <td className="p-2">{r.cajasTotal.toLocaleString()}</td>
                  <td className="p-2">{r.cajasRepl.toLocaleString()}</td>
                  <td className="p-2 border-r border-gray-700 text-blue-400 font-bold">{pctCajas}%</td>
                  
                  <td className="p-2">{r.unidTotal.toLocaleString()}</td>
                  <td className="p-2">{r.unidRepl.toLocaleString()}</td>
                  <td className="p-2 border-r border-gray-700 text-emerald-400 font-bold">{pctUnid}%</td>
                  
                  <td className="p-2">{r.tareasTotal.toLocaleString()}</td>
                  <td className="p-2">{r.tareasRepl.toLocaleString()}</td>
                  <td className="p-2 border-r border-gray-700 text-purple-400 font-bold">{pctTareas}%</td>
                  
                  <td className="p-2">{r.niveles[1]}</td>
                  <td className="p-2">{r.niveles[2]}</td>
                  <td className="p-2">{r.niveles[3]}</td>
                  <td className="p-2">{r.niveles[4]}</td>
                  <td className="p-2">{r.niveles[5]}</td>
                  <td className="p-2">{r.niveles[6]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}