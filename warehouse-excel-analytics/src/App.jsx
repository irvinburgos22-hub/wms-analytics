import React, { useState, useEffect } from 'react';
import { CalendarDays, CalendarRange, Settings, Database, AlertTriangle, Users, Table as TableIcon, Trash2, Cloud } from 'lucide-react';
import { processWmsFile, processUxcFile } from './utils/sapProcessor';
import { saveWmsRows, getAllWmsRows, saveUxcMapping, getUxcMapping, clearAllWmsData } from './utils/db';

import DiarioTab from './components/DiarioTab';
import SemanalTab from './components/SemanalTab';
import UsuariosTab from './components/UsuariosTab';
import TablaHistoricaTab from './components/TablaHistoricaTab';
import FaltantesTab from './components/FaltantesTab';
import ConfigTab from './components/ConfigTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('data');
  const [dbRows, setDbRows] = useState([]);
  const [uxcMapping, setUxcMapping] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDatabase() {
      setUxcMapping(await getUxcMapping());
      setDbRows(await getAllWmsRows());
      setLoading(false);
    }
    loadDatabase();
  }, []);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setLoading(true);
    let totalSaved = 0;
    try {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const result = processWmsFile(arrayBuffer, uxcMapping);
        await saveWmsRows(result.rows);
        totalSaved += result.rows.length;
      }
      setDbRows(await getAllWmsRows());
      alert(`¡Éxito! Se sincronizaron ${totalSaved} tareas a la nube de Google.`);
    } catch (error) {
      alert("Error procesando los archivos: " + error.message);
    }
    setLoading(false);
  };

  const handleReprocessAllMissing = async (currentMapping) => {
    setLoading(true);
    let updatedCount = 0;
    const rowsToSave = [];
    
    const newDbRows = dbRows.map(r => {
      if (r.cajas === 'revisar' && currentMapping[r.producto]) {
        r.cajas = Math.round(r.ctdUMA / currentMapping[r.producto]);
        rowsToSave.push(r);
        updatedCount++;
      }
      return r;
    });

    if (updatedCount > 0) {
      await saveWmsRows(rowsToSave);
      setDbRows(newDbRows);
      alert(`¡Listo! Se recalcularon las cajas para ${updatedCount} tareas y se guardó en la nube.`);
    } else {
      alert("Todo está al día. No hay tareas que necesiten recálculo.");
    }
    setLoading(false);
  };

  const handleUxcUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const newMapping = processUxcFile(arrayBuffer);
      await saveUxcMapping(newMapping);
      setUxcMapping(newMapping);
      
      if (dbRows.some(r => r.cajas === 'revisar')) {
        await handleReprocessAllMissing(newMapping);
      } else {
        alert("¡Base de datos UxC sincronizada en la nube correctamente!");
      }
    } catch (error) {
      alert("Error procesando UxC: " + error.message);
    }
    setLoading(false);
  };

  const handleUpdateSingleUxc = async (producto, factor) => {
    const newMapping = { ...uxcMapping, [producto]: factor };
    await saveUxcMapping(newMapping);
    setUxcMapping(newMapping);

    const rowsToUpdate = dbRows.filter(r => r.producto === producto);
    rowsToUpdate.forEach(r => {
      r.cajas = Math.round(r.ctdUMA / factor);
    });
    
    if (rowsToUpdate.length > 0) await saveWmsRows(rowsToUpdate);
    setDbRows([...dbRows]); 
    alert(`¡Éxito! Factor actualizado a ${factor} para el código ${producto}. Guardado en la nube.`);
  };

  const handleClearDB = async () => {
    if (window.confirm("⚠️ ADVERTENCIA: ¿Seguro que quieres borrar TODO el historial de la NUBE? Esto borrará los datos para todos en la empresa.")) {
      setLoading(true);
      await clearAllWmsData();
      setDbRows([]);
      setLoading(false);
      alert("¡Historial borrado con éxito de la nube!");
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center text-2xl gap-4"><Cloud className="animate-bounce text-blue-500" size={48} /> Sincronizando con la nube...</div>;

  const missingProducts = [...new Set(dbRows.filter(r => r.cajas === 'revisar').map(r => r.producto))];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex font-sans">
      
      {/* MENÚ LATERAL */}
      <div className="w-64 bg-gray-900 p-4 border-r border-gray-800 flex flex-col gap-2">
        <div className="text-xl font-bold text-blue-400 mb-6 px-2 border-b border-gray-800 pb-4 flex items-center gap-2">
          <Cloud size={24}/> REPL Cloud
        </div>
        
        <button onClick={() => setActiveTab('diario')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'diario' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
          <CalendarDays size={20} /> Vista Diario
        </button>
        <button onClick={() => setActiveTab('semana')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'semana' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
          <CalendarRange size={20} /> Resumen Semanal
        </button>
        <button onClick={() => setActiveTab('usuarios')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'usuarios' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
          <Users size={20} /> Auditoría Usuarios
        </button>
        <button onClick={() => setActiveTab('tabla')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'tabla' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
          <TableIcon size={20} /> Tabla Histórica
        </button>
        
        <button onClick={() => setActiveTab('data')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'data' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
          <Database size={20} /> Base de Datos Nube
        </button>
        
        <div className="mt-auto pt-4 border-t border-gray-800 flex flex-col gap-2">
          <button onClick={() => setActiveTab('missing')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors w-full ${activeTab === 'missing' ? 'bg-rose-900/50 text-rose-300' : 'hover:bg-gray-800'}`}>
            <AlertTriangle size={20} className={missingProducts.length > 0 ? "text-rose-400" : "text-gray-500"}/> 
            Faltantes UxC {missingProducts.length > 0 && <span className="bg-rose-600 text-white px-2 py-0.5 rounded-full text-xs">{missingProducts.length}</span>}
          </button>
          
          <button onClick={() => setActiveTab('config')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors w-full ${activeTab === 'config' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}>
            <Settings size={20} /> Configuración UxC
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto bg-gray-950">
        {activeTab === 'diario' && <DiarioTab dbRows={dbRows} />}
        {activeTab === 'semana' && <SemanalTab dbRows={dbRows} />}
        {activeTab === 'usuarios' && <UsuariosTab dbRows={dbRows} />}
        {activeTab === 'tabla' && <TablaHistoricaTab dbRows={dbRows} />}
        
        {activeTab === 'data' && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  Base de Datos Cloud <span className="text-sm bg-blue-600 px-3 py-1 rounded-full text-white">Sincronizado</span>
                </h1>
                <button onClick={handleClearDB} className="flex items-center gap-2 bg-red-900/30 text-red-400 border border-red-800 px-4 py-2 rounded-lg hover:bg-red-900/50 transition-colors">
                  <Trash2 size={18} /> Limpiar Nube
                </button>
             </div>
             <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8 relative overflow-hidden group hover:border-blue-500 transition-colors">
              <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".xlsx, .xls" />
              <div className="text-center group-hover:text-blue-400 transition-colors">
                <p className="text-xl mb-2">➕ Subir datos a la nube</p>
                <p className="text-gray-400">Arrastra aquí uno o múltiples archivos de SAP. Estarán disponibles instantáneamente para toda la empresa.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'missing' && <FaltantesTab missingProducts={missingProducts} dbRows={dbRows} uxcMapping={uxcMapping} handleUpdateSingleUxc={handleUpdateSingleUxc} handleReprocessAllMissing={handleReprocessAllMissing} />}
        
        {activeTab === 'config' && <ConfigTab uxcMapping={uxcMapping} handleUxcUpload={handleUxcUpload} handleUpdateSingleUxc={handleUpdateSingleUxc} />}
      </div>
    </div>
  );
}
