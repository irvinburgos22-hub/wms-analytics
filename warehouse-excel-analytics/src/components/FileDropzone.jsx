import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Sparkles, CheckCircle2 } from 'lucide-react';

export default function FileDropzone({ onFileLoaded, isLoading }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onFileLoaded(e.target.result, file.name);
    };
    reader.readAsArrayBuffer(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
      <div 
        className={`dropzone ${isDragOver ? 'active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('excel-file-input').click()}
      >
        <input 
          id="excel-file-input" 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={onFileChange} 
          style={{ display: 'none' }} 
        />
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', marginBottom: '1rem', color: '#38bdf8' }}>
          <UploadCloud size={40} />
        </div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Arrastra y suelta tu archivo de Excel aquí
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Soporta el formato de **descarga diaria de SAP (23 columnas)** o el **reporte procesado (33 columnas)**
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan">
            <FileSpreadsheet size={14} /> .XLSX / .XLS
          </span>
          <span className="badge badge-emerald">
            <Sparkles size={14} /> Detección Inteligente de Turnos y Cajas
          </span>
        </div>
      </div>
    </div>
  );
}
