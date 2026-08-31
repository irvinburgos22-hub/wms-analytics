import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Search, Download, Filter, Eye, ArrowLeft, ArrowRight } from 'lucide-react';

export default function DataTable({ rows, filename }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState('TODOS');
  const [viewMode, setViewMode] = useState('ENRICHED'); // ENRICHED vs RAW
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filteredRows = useMemo(() => {
    if (!rows) return [];
    return rows.filter(r => {
      const matchesShift = shiftFilter === 'TODOS' || r.turno === shiftFilter;
      const term = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        String(r.producto).toLowerCase().includes(term) ||
        r.descrProducto.toLowerCase().includes(term) ||
        r.autor.toLowerCase().includes(term) ||
        r.confirmadoPor.toLowerCase().includes(term) ||
        r.ubicProcedencia.toLowerCase().includes(term) ||
        r.ubicDestino.toLowerCase().includes(term);

      return matchesShift && matchesSearch;
    });
  }, [rows, searchTerm, shiftFilter]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page]);

  const exportExcel = () => {
    const exportData = filteredRows.map(r => ({
      'Tarea de almacén': r.tareaAlmacen,
      'Cl.proceso almacén': r.clProceso,
      'Descr.tipo proceso almacén': r.descrProceso,
      'Status de tarea de almacén': r.status,
      'Orden de almacén': r.ordenAlmacen,
      'Producto': r.producto,
      'Descripción producto': r.descrProducto,
      'Lote': r.lote,
      'FeCaduc/FePreferCons': r.feCaduc,
      'Ctd.real dest.UMA': r.ctdUMA,
      'Tipo almacén origen': r.tipoOrigen,
      'Ubic.procedencia': r.ubicProcedencia,
      'Tp.almacén destino': r.tipoDestino,
      'Ubic.dest.original': r.ubicDestino,
      'Autor': r.autor,
      'Confirmado por': r.confirmadoPor,
      'Fecha de creación': r.fechaCreacion,
      'Hora de creación': r.horaCreacion,
      'Fecha confirmación': r.fechaConfirmacion,
      'Hora de confirmación': r.horaConfirmacion,
      'Código de excepción': r.codigoExcepcion,
      'Recurso de origen': r.recursoOrigen,
      'Recurso posterior': r.recursoPosterior,
      // Enriched
      'Difs': r.difs,
      'Tarea': r.tarea,
      'REPL': r.repl,
      'Semana del año': r.semanaAno,
      'Nivel': r.nivel,
      'Cajas': r.cajas,
      'Mes': r.mes,
      'Hora': r.hora,
      'Turno': r.turno,
      'AREA': r.area
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DATA_PROCESADA');
    XLSX.writeFile(wb, `PROCESADO_${filename || 'REPORTE_WMS.xlsx'}`);
  };

  return (
    <div className="glass-card" style={{ marginBottom: '2rem' }}>
      <div className="table-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Buscar producto, autor, ubicación..." 
              value={searchTerm} 
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select 
              className="search-input" 
              style={{ width: '150px' }}
              value={shiftFilter} 
              onChange={e => { setShiftFilter(e.target.value); setPage(1); }}
            >
              <option value="TODOS">Todos los Turnos</option>
              <option value="MAÑANA">MAÑANA</option>
              <option value="PM">PM</option>
              <option value="NOCHE">NOCHE</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            className="btn-page" 
            onClick={() => setViewMode(v => v === 'ENRICHED' ? 'RAW' : 'ENRICHED')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Eye size={14} />
            {viewMode === 'ENRICHED' ? 'Vista 33 Cols (Calculado)' : 'Vista 23 Cols (SAP)'}
          </button>

          <button 
            className="preset-btn" 
            onClick={exportExcel}
            style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(56, 189, 248, 0.2))', borderColor: 'rgba(16, 185, 129, 0.4)' }}
          >
            <Download size={14} /> Descargar Excel (33 cols)
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tarea SAP</th>
              <th>Status</th>
              <th>Producto</th>
              <th>Descripción</th>
              <th>Ctd UMA</th>
              <th>Procedencia</th>
              <th>Destino</th>
              <th>Confirmado Por</th>
              {viewMode === 'ENRICHED' && (
                <>
                  <th style={{ color: '#38bdf8' }}>Hora</th>
                  <th style={{ color: '#38bdf8' }}>Turno</th>
                  <th style={{ color: '#38bdf8' }}>Cajas</th>
                  <th style={{ color: '#38bdf8' }}>Nivel</th>
                  <th style={{ color: '#38bdf8' }}>Área</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map(r => (
              <tr key={r.id}>
                <td style={{ color: 'var(--text-dim)' }}>{r.id}</td>
                <td style={{ fontWeight: 600, color: 'var(--primary-cyan)' }}>{r.tareaAlmacen}</td>
                <td>
                  <span className={`badge ${r.status === 'C' ? 'badge-emerald' : 'badge-amber'}`}>
                    {r.status}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace' }}>{r.producto}</td>
                <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.descrProducto}</td>
                <td style={{ fontWeight: 700 }}>{r.ctdUMA}</td>
                <td>{r.ubicProcedencia}</td>
                <td>{r.ubicDestino}</td>
                <td>{r.confirmadoPor || r.autor}</td>
                {viewMode === 'ENRICHED' && (
                  <>
                    <td style={{ color: '#38bdf8', fontWeight: 600 }}>{r.hora}:00</td>
                    <td>
                      <span className={`badge ${r.turno === 'MAÑANA' ? 'badge-amber' : r.turno === 'PM' ? 'badge-cyan' : 'badge-emerald'}`}>
                        {r.turno}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>{r.cajas}</td>
                    <td>{r.nivel}</td>
                    <td>{r.area}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-bar">
        <div>
          Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, filteredRows.length)} de {filteredRows.length} registros
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            className="btn-page" 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
          >
            <ArrowLeft size={14} /> Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button 
            className="btn-page" 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
          >
            Siguiente <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
