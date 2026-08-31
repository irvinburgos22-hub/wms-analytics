import React, { useState } from 'react';
import { Settings, Search } from 'lucide-react';

export default function ConfigTab({ uxcMapping, handleUxcUpload, handleUpdateSingleUxc }) {
  const [searchProd, setSearchProd] = useState('');
  const [manualUxc, setManualUxc] = useState('');

  const onActualizar = () => {
    const val = Number(manualUxc);
    if (val > 0) {
      handleUpdateSingleUxc(searchProd, val);
      setManualUxc('');
    } else {
      alert("Por favor ingresa un factor numérico válido.");
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3"><Settings className="text-blue-500"/> Configuración UxC</h1>
      
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Search size={20} className="text-gray-400"/> Buscar / Modificar Factor UxC</h2>
        <div className="flex gap-4 mb-4">
          <input 
            type="text" 
            placeholder="Ej: 50481920" 
            value={searchProd}
            onChange={e => setSearchProd(e.target.value.trim())}
            className="bg-gray-900 border border-gray-600 rounded px-4 py-3 text-white w-full max-w-md outline-none focus:border-blue-500"
          />
        </div>
        
        {searchProd && uxcMapping[searchProd] ? (
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400">Factor actual para <span className="text-white font-bold">{searchProd}</span>:</p>
              <p className="text-4xl font-bold text-blue-400 mt-1">{uxcMapping[searchProd]}</p>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                placeholder="Nuevo factor"
                value={manualUxc}
                onChange={e => setManualUxc(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white w-40 outline-none focus:border-emerald-500"
              />
              <button onClick={onActualizar} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded text-white font-bold transition-colors">
                Actualizar
              </button>
            </div>
          </div>
        ) : searchProd ? (
          <p className="text-rose-400 mt-2">El producto {searchProd} no existe en tu base UxC actual.</p>
        ) : (
          <p className="text-gray-500 text-sm">Ingresa un código de producto para ver o modificar su valor.</p>
        )}
      </div>

       <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-blue-500 relative overflow-hidden group">
        <input type="file" onChange={handleUxcUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".xlsx, .xls" />
        <div className="text-center text-blue-400">
          <p className="text-xl">Arrastra el archivo maestro UxC completo aquí</p>
          <p className="text-sm text-gray-400 mt-2">Al subirlo, se recalcularán automáticamente las tareas pasadas.</p>
        </div>
      </div>
    </div>
  );
}