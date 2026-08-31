import * as XLSX from 'xlsx';

function getVal(row, key) {
  const target = key.toLowerCase().replace(/\s+/g, '');
  const found = Object.keys(row).find(k => k.toLowerCase().replace(/\s+/g, '') === target);
  return found ? row[found] : undefined;
}

export function parseExcelDate(excelDate) {
  if (!excelDate) return null;
  
  if (typeof excelDate === 'number') {
    const utcDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
  }
  
  const str = String(excelDate).trim();
  if (str.includes('-')) {
    const parts = str.split(' ')[0].split('-');
    if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
  } else if (str.includes('/')) {
    const parts = str.split(' ')[0].split('/');
    if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  
  return new Date(excelDate);
}

export function getHour(timeVal) {
  if (timeVal === undefined || timeVal === null || timeVal === '') return 0;
  if (typeof timeVal === 'number') {
    const fraction = timeVal - Math.floor(timeVal);
    return Math.floor(fraction * 24);
  }
  if (typeof timeVal === 'string') {
    const parts = timeVal.split(':');
    if (parts.length >= 1) return parseInt(parts[0], 10);
  }
  return 0;
}

export function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  return Math.ceil((((date - yearStart) / 86400000) + 1)/7);
}

export function processUxcFile(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const mapping = {};
  rawRows.forEach(row => {
    const prod = String(getVal(row, 'Producto') || '').trim();
    const uxc = Number(getVal(row, 'Numerador'));
    const uma = String(getVal(row, 'UMA') || '').trim().toUpperCase();
    const umb = String(getVal(row, 'UMB') || '').trim().toUpperCase();
    if (prod && !isNaN(uxc)) {
      if (uma === 'CX' && umb === 'UN') mapping[prod] = uxc;
      else if (!mapping[prod] || uxc > mapping[prod]) mapping[prod] = uxc;
    }
  });
  return mapping;
}

export function processWmsFile(arrayBuffer, uxcMapping = {}) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = wb.SheetNames.find(s => s.toUpperCase() === 'DATA') || wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) throw new Error('El archivo no contiene registros.');

  const validDestinations = ["ADUANA_L1", "ADUANA_L1_URG", "ADUANA_L2", "ADUANA_L2_URG"];
  const validOrigins = ["1010", "1011", "1015", "1016", "1017"];
  const uniqueTasks = new Set();
  const processedRows = [];
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  rawRows.forEach((r, idx) => {
    const ubicDest = String(getVal(r, 'Ubic.dest.original') || '').trim();
    const tipoOrigen = String(getVal(r, 'Tipo almacén origen') || getVal(r, 'Tipo almacn origen') || '').trim();
    
    if (!validDestinations.includes(ubicDest) || !validOrigins.includes(tipoOrigen)) return;

    const tareaAlmacen = String(getVal(r, 'Tarea de almacén') || getVal(r, 'Tarea de almacn') || '');
    if (uniqueTasks.has(tareaAlmacen)) return;
    uniqueTasks.add(tareaAlmacen);

    const clProceso = String(getVal(r, 'Cl.proceso almacén') || getVal(r, 'Cl.proceso almacn') || '').trim();
    const ctdUMA = Number(getVal(r, 'Ctd.real dest.UMA')) || 0;
    
    let recursoPost = String(getVal(r, 'Recurso Posterior') || '').trim();
    if (!recursoPost) {
      if (clProceso === 'Z302') recursoPost = 'NO IDENTIFICADO';
      else recursoPost = 'TAREA DIRECTA';
    }

    const isRepl = clProceso === 'Z302';
    const replStr = isRepl ? 'SI' : 'NO';
    const difs = ctdUMA === 0 ? 1 : 0;

    const fechaOriginalStr = getVal(r, 'Fecha confirmación') || getVal(r, 'Fecha confirmacin') || getVal(r, 'Fecha de creación');
    const fechaConf = parseExcelDate(fechaOriginalStr);
    
    const timeVal = getVal(r, 'Hora de confirmación') || getVal(r, 'Hora de confirmacin') || getVal(r, 'Hora de creación');
    
    const hora = getHour(timeVal);
    let minutos = 0;
    if (typeof timeVal === 'number') {
      const fraction = timeVal - Math.floor(timeVal);
      minutos = Math.floor((fraction * 24 * 60) % 60);
    } else if (typeof timeVal === 'string' && timeVal.includes(':')) {
      minutos = parseInt(timeVal.split(':')[1], 10) || 0;
    }

    let fechaOperativa = new Date(fechaConf ? fechaConf.getTime() : Date.now());
    
    // REGLAS DE DÍA Y MADRUGADA
    const isLunes = fechaOperativa.getDay() === 1; // 1 = Lunes
    let esAmanecidaLunes = false;

    if (hora >= 0 && hora < 7) {
      if (isLunes) {
        // Excepción: Los lunes en la madrugada no retroceden al domingo
        esAmanecidaLunes = true;
      } else {
        // De Martes a Domingo: la madrugada se cobra a la noche del día anterior
        fechaOperativa.setDate(fechaOperativa.getDate() - 1);
      }
    }
    
    const y = fechaOperativa.getFullYear();
    const m = String(fechaOperativa.getMonth() + 1).padStart(2, '0');
    const d = String(fechaOperativa.getDate()).padStart(2, '0');
    const fechaOpStr = `${y}-${m}-${d}`;
    
    const nombreDia = diasSemana[fechaOperativa.getDay()];
    const isSabado = fechaOperativa.getDay() === 6;

    let turno = 'NOCHE';
    if (isSabado) {
      if (hora >= 8 && hora < 14) turno = 'AM';
      else if (hora >= 14 && hora < 20) turno = 'PM';
    } else {
      if (esAmanecidaLunes) {
        turno = 'AM'; // Todo lo que entró de 00:00 a 06:59 el Lunes, es Turno AM del Lunes
      } else if (hora >= 7 && hora < 15) {
        turno = 'AM';
      } else if (hora >= 15 && hora < 21) {
        turno = 'PM';
      } else if (hora === 21) {
        turno = minutos >= 30 ? 'NOCHE' : 'PM';
      }
    }

    const mes = fechaOperativa.getMonth() + 1;
    const semana = getWeekNumber(fechaOperativa);
    const proc = String(getVal(r, 'Ubic.procedencia') || '').trim();
    const nivel = proc.length > 0 ? proc.slice(-1) : '1';
    const area = (tipoOrigen === '1010' || tipoOrigen === '1011') ? 'WH' : 'BUNKER';

    const prodId = String(getVal(r, 'Producto') || '').trim();
    let cajas = 'revisar';
    const factor = uxcMapping[prodId];
    if (factor && typeof factor === 'number') cajas = Math.round(ctdUMA / factor);

    processedRows.push({
      id: idx + 1,
      fechaConf: fechaOperativa,
      fechaOpStr: fechaOpStr,
      nombreDia: nombreDia,
      autor: String(getVal(r, 'Autor') || '').trim(),
      confirmadoPor: String(getVal(r, 'Confirmado por') || '').trim(), 
      recursoOrigen: String(getVal(r, 'Recurso de origen') || '').trim(),
      tareaAlmacen, clProceso, producto: prodId, ctdUMA,
      tipoOrigen, ubicProcedencia: proc, ubicDestino: ubicDest,
      recursoPosterior: recursoPost,
      difs, repl: replStr, isRepl,
      semanaAno: semana, nivel, cajas, mes, hora, turno, area
    });
  });

  return { rows: processedRows };
}