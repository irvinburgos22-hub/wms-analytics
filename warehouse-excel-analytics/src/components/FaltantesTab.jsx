import React, { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function FaltantesTab({ missingProducts, dbRows, uxcMapping, handleUpdateSingleUxc, handleReprocessAllMissing }) {
  const [manualUxc, setManualUxc] = useState({});

  const onGuardar = (prod) => {
    const val = Number(manualUxc[prod]);
    if (val > 0) {
      handleUpdateSingleUxc(prod, val);
      setManualUxc({...manualUxc, [prod]: ''});
    } else {
      alert("Por favor ingresa un factor numérico válido.");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-rose-400">
          <AlertTriangle size={32}/> Productos Faltantes ({missingProducts.length})
        </h1>
        <button onClick={() => handleReprocessAllMissing(uxcMapping)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors font-bold shadow-lg">
          <RefreshCw size={18} /> Recalcular Todo
        </button>
      </div>
      
      {missingProducts.length === 0 ? (
        <div className="bg-gray-800 p-12 rounded-xl border border-gray-700 text-center">
          <h2 className="text-2xl text-emerald-400 font-bold">¡Felicidades! 🎉</h2>
          <p className="text-gray-400 mt-2">Todos los productos en tu historial SAP tienen su factor UxC asignado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700 max-h-[70vh]">
          <table className="w-full text-left bg-gray-800">
            <thead className="bg-gray-900 text-gray-400 border-b border-gray-700 sticky top-0 z-10">
              <tr>
                <th className="p-4">Código Producto</th>
                <th className="p-4">Tareas Afectadas</th>
                <th className="p-4">Ingresar Factor UxC</th>
                <th className="p-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {missingProducts.map(prod => {
                const tareasCount = dbRows.filter(r => r.producto === prod && r.cajas === 'revisar').length;
                return (
                  <tr key={prod} className="border-b border-gray-700/50 hover:bg-gray-750">
                    <td className="p-4 font-bold text-white">{prod}</td>
                    <td className="p-4 text-rose-300">{tareasCount} registros en 0</td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white w-32 outline-none focus:border-blue-500"
                        placeholder="Ej: 12"
                        value={manualUxc[prod] || ''}
                        onChange={e => setManualUxc({...manualUxc, [prod]: e.target.value})}
                      />
                    </td>
                    <td className="p-4">
                      <button onClick={() => onGuardar(prod)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white font-bold transition-colors">
                        Guardar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}