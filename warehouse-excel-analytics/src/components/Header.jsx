import React from 'react';
import { PackageCheck, FileSpreadsheet, RefreshCw, Layers } from 'lucide-react';

export default function Header({ fileInfo, onReset }) {
  return (
    <header className="glass-card navbar">
      <div className="brand">
        <div className="brand-icon">
          <PackageCheck size={28} />
        </div>
        <div className="brand-title">
          <h1>WMS Analytics Hub</h1>
          <p>Control de Operaciones y Movimientos de Almacén SAP</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {fileInfo && (
          <>
            <span className="badge badge-cyan">
              <FileSpreadsheet size={14} />
              {fileInfo.name}
            </span>
            <span className="badge badge-emerald">
              <Layers size={14} />
              {fileInfo.formatDetected}
            </span>
            <button className="preset-btn" onClick={onReset} title="Cargar otro archivo">
              <RefreshCw size={14} />
              Cambiar Archivo
            </button>
          </>
        )}
      </div>
    </header>
  );
}
