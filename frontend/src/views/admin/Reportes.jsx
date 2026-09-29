import { Notice, useNotifications } from '../../components/Notifications';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageShell } from './Dashboard';
import '../../css/admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ==========================================
// HELPERS (fuera del componente)
// ==========================================
const VACIO = '-';

// "Fecha de Pago" -> "fechadepago", "fecha_pago" -> "fechapago"
const normalizar = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

// Convierte { cliente: { nombre: 'Ana' } } en { 'cliente.nombre': 'Ana' }
const aplanar = (obj, prefijo = '', salida = {}) => {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return salida;
  Object.entries(obj).forEach(([k, v]) => {
    const ruta = prefijo ? `${prefijo}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
      aplanar(v, ruta, salida);
    } else {
      salida[ruta] = v;
    }
  });
  return salida;
};

// Busca el valor real de una columna dentro de una fila
const obtenerValor = (fila, col, colIdx) => {
  if (fila === null || fila === undefined) return undefined;
  if (Array.isArray(fila)) return fila[colIdx];
  if (fila[col] !== undefined) return fila[col];
  if (fila[String(col).toLowerCase()] !== undefined) return fila[String(col).toLowerCase()];

  const plano = aplanar(fila);
  const mapa = {};
  Object.entries(plano).forEach(([ruta, v]) => {
    const completo = normalizar(ruta);
    const hoja = normalizar(ruta.split('.').pop());
    if (!(completo in mapa)) mapa[completo] = v;
    if (!(hoja in mapa)) mapa[hoja] = v;
  });

  const n = normalizar(col);
  if (n in mapa) return mapa[n];

  // Coincidencia parcial (ej. columna "Cliente" -> llave "nombre_cliente")
  const clave = Object.keys(mapa).find(
    (k) => k.length >= 3 && n.length >= 3 && (k.includes(n) || n.includes(k))
  );
  return clave !== undefined ? mapa[clave] : undefined;
};

const PALABRAS_DINERO = ['monto', 'precio', 'ingreso', 'total', 'costo', 'saldo', 'deuda'];
const esDinero = (col) => PALABRAS_DINERO.some((kw) => normalizar(col).includes(kw));

const esNumerico = (v) => v !== null && v !== undefined && v !== '' && !isNaN(Number(v));

const formatearDinero = (n) =>
  `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Texto final que se muestra en pantalla, PDF y Excel
const formatear = (col, val) => {
  if (val === null || val === undefined || val === '') return VACIO;
  if (typeof val === 'boolean') return val ? 'Sí' : 'No';
  if (esDinero(col) && esNumerico(val)) return formatearDinero(val);
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
    const [y, m, d] = val.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }
  if (typeof val === 'object') return val.nombre ?? val.name ?? JSON.stringify(val);
  return String(val);
};

// Fecha local en formato YYYY-MM-DD (evita el desfase de toISOString por zona horaria)
const fechaLocal = (d) => d.toLocaleDateString('en-CA');

const Reportes = () => {
  const { notify } = useNotifications();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date();
  const firstDay = fechaLocal(new Date(today.getFullYear(), today.getMonth(), 1));
  const currentDay = fechaLocal(today);

  const [fechaInicio, setFechaInicio] = useState(firstDay);
  const [fechaFin, setFechaFin] = useState(currentDay);
  const [tipoReporte, setTipoReporte] = useState('ingresos');

  const [reportData, setReportData] = useState({
    tipo: 'ingresos',
    kpis: [],
    columnas: [],
    filas: []
  });

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const pendingRequest = useRef(null);

  const fetchReporte = useCallback(async () => {
    pendingRequest.current?.abort();
    const controller = new AbortController();
    pendingRequest.current = controller;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_URL}/admin/reportes?tipo=${tipoReporte}&desde=${fechaInicio}&hasta=${fechaFin}`,
        { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }
      );

      if (!response.ok) throw new Error('Error al generar el reporte desde el servidor.');

      const data = await response.json();

      // DIAGNÓSTICO: revisa en consola cómo llegan las columnas y la primera fila (puedes borrarlo luego)
      console.log('Reporte recibido -> columnas:', data.columnas, '| primera fila:', data.filas?.[0]);

      if (!controller.signal.aborted) setReportData({ ...data, desde: fechaInicio, hasta: fechaFin });
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (!controller.signal.aborted) setError(err.message || 'No se pudo cargar el reporte.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [tipoReporte, fechaInicio, fechaFin, token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchReporte();
    return () => pendingRequest.current?.abort();
  }, [fetchReporte, token, navigate]);

  // Matriz con los valores reales de la BD, alineados a las columnas
  const tabla = useMemo(() => {
    const columnas = reportData.columnas || [];
    return (reportData.filas || []).map((fila) =>
      columnas.map((col, i) => obtenerValor(fila, col, i))
    );
  }, [reportData]);

  // ==========================================
  // EXPORTAR EXCEL PERSONALIZADO (ExcelJS)
  // ==========================================
  const handleExportExcel = async () => {
    if (!tabla.length) return notify('No hay registros para exportar.', 'info');

    try {
      notify('Diseñando hoja de cálculo...', 'info');

      const mod = await import('exceljs');
      const ExcelJS = mod.default || mod;

      const wb = new ExcelJS.Workbook();
      wb.creator = 'Elder Dragón Fitness';
      wb.created = new Date();
      const ws = wb.addWorksheet('Reporte', { views: [{ showGridLines: false }] });

      const columnas = reportData.columnas;
      const numCols = Math.max(columnas.length, 2);

      // Paleta idéntica al PDF
      const AZUL = 'FF0B1626';
      const VERDE = 'FF00FF88';
      const PIZARRA = 'FF1E2D3D';
      const ZEBRA = 'FFF5F8FA';
      const BLANCO = 'FFFFFFFF';
      const relleno = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
      const lado = { style: 'thin', color: { argb: 'FFD5DDE5' } };
      const bordes = { top: lado, left: lado, bottom: lado, right: lado };

      const unir = (fila, c1, c2) => {
        if (c2 > c1) ws.mergeCells(fila, c1, fila, c2);
      };
      const pintarFila = (fila, argb) => {
        for (let c = 1; c <= numCols; c++) ws.getCell(fila, c).fill = relleno(argb);
      };

      let r = 1;

      // 1. Banner principal
      unir(r, 1, numCols);
      pintarFila(r, AZUL);
      const titulo = ws.getCell(r, 1);
      titulo.value = 'ELDER DRAGÓN FITNESS';
      titulo.font = { name: 'Calibri', size: 20, bold: true, color: { argb: VERDE } };
      titulo.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      ws.getRow(r).height = 36;
      r++;

      // 2. Tipo de reporte + período
      const mitad = Math.max(1, Math.floor(numCols / 2));
      unir(r, 1, mitad);
      unir(r, mitad + 1, numCols);
      pintarFila(r, AZUL);
      const cTipo = ws.getCell(r, 1);
      cTipo.value = `REPORTE: ${String(reportData.tipo || tipoReporte).toUpperCase()}`;
      cTipo.font = { size: 10, bold: true, color: { argb: BLANCO } };
      cTipo.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      const cPeriodo = ws.getCell(r, mitad + 1);
      cPeriodo.value = `PERÍODO: ${reportData.desde} al ${reportData.hasta}`;
      cPeriodo.font = { size: 10, color: { argb: BLANCO } };
      cPeriodo.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 };
      ws.getRow(r).height = 22;
      r++;

      // 3. Espacio
      r++;

      // 4. Resumen ejecutivo
      if (reportData.kpis && reportData.kpis.length > 0) {
        unir(r, 1, numCols);
        const cRes = ws.getCell(r, 1);
        cRes.value = 'RESUMEN EJECUTIVO';
        cRes.font = { size: 12, bold: true, color: { argb: PIZARRA } };
        cRes.alignment = { vertical: 'middle' };
        ws.getRow(r).height = 22;
        r++;

        for (let i = 0; i < reportData.kpis.length; i += numCols) {
          const grupo = reportData.kpis.slice(i, i + numCols);
          grupo.forEach((kpi, j) => {
            const cEt = ws.getCell(r, j + 1);
            cEt.value = String(kpi.label).toUpperCase();
            cEt.font = { size: 9, bold: true, color: { argb: 'FF6B7A89' } };
            cEt.fill = relleno(ZEBRA);
            cEt.border = bordes;
            cEt.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

            const cVal = ws.getCell(r + 1, j + 1);
            cVal.value = String(kpi.value);
            cVal.font = { size: 14, bold: true, color: { argb: PIZARRA } };
            cVal.fill = relleno(ZEBRA);
            cVal.border = bordes;
            cVal.alignment = { horizontal: 'center', vertical: 'middle' };
          });
          ws.getRow(r).height = 20;
          ws.getRow(r + 1).height = 26;
          r += 2;
        }
        r++; // espacio
      }

      // 5. Cabecera de tabla
      const filaCabecera = r;
      columnas.forEach((col, i) => {
        const c = ws.getCell(r, i + 1);
        c.value = String(col).toUpperCase();
        c.font = { size: 10, bold: true, color: { argb: VERDE } };
        c.fill = relleno(AZUL);
        c.border = bordes;
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
      ws.getRow(r).height = 26;
      r++;

      // 6. Datos reales con filas alternas
      tabla.forEach((fila, idx) => {
        columnas.forEach((col, i) => {
          const val = fila[i];
          const c = ws.getCell(r, i + 1);

          if (esDinero(col) && esNumerico(val)) {
            c.value = Number(val);
            c.numFmt = '"$"#,##0.00';
            c.alignment = { horizontal: 'right', vertical: 'middle' };
          } else {
            c.value = formatear(col, val);
            c.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          }
          c.font = { size: 10, color: { argb: 'FF282828' } };
          c.fill = relleno(idx % 2 === 1 ? ZEBRA : BLANCO);
          c.border = bordes;
        });
        ws.getRow(r).height = 20;
        r++;
      });

      // 7. Pie de página
      r++;
      unir(r, 1, numCols);
      const pie = ws.getCell(r, 1);
      pie.value = `Generado el ${new Date().toLocaleString()} - Elder Dragón Fitness`;
      pie.font = { size: 8, italic: true, color: { argb: 'FF969696' } };
      pie.alignment = { horizontal: 'center' };

      // Anchos automáticos según contenido
      for (let i = 0; i < numCols; i++) {
        const col = columnas[i];
        if (col === undefined) {
          ws.getColumn(i + 1).width = 18;
          continue;
        }
        const maxLen = Math.max(
          String(col).length,
          ...tabla.map((f) => formatear(col, f[i]).length)
        );
        ws.getColumn(i + 1).width = Math.min(Math.max(maxLen + 4, 16), 45);
      }

      // Cabecera fija y filtros
      ws.views = [{ state: 'frozen', ySplit: filaCabecera, showGridLines: false }];
      ws.autoFilter = {
        from: { row: filaCabecera, column: 1 },
        to: { row: filaCabecera, column: columnas.length }
      };

      // Descarga
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ElderDragon_${String(reportData.tipo || tipoReporte).toUpperCase()}_${reportData.desde}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      notify('Excel exportado correctamente.', 'success');
    } catch (err) {
      console.error('Error de Excel:', err);
      setError('No se pudo generar Excel: ' + err.message);
    }
  };

  // ==========================================
  // GENERAR PDF PROFESIONAL
  // ==========================================
  const handleGeneratePDF = async () => {
    if (!tabla.length) return setError('No hay datos para exportar.');

    try {
      notify('Diseñando documento PDF...', 'info');
      const jsPDFModule = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
      const autoTable = autoTableModule.default;

      const doc = new jsPDF({ orientation: 'landscape' });
      const pageWidth = doc.internal.pageSize.width;

      // Banner
      doc.setFillColor(11, 22, 38);
      doc.rect(0, 0, pageWidth, 35, 'F');

      doc.setTextColor(0, 255, 136);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('ELDER DRAGÓN FITNESS', 14, 20);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`REPORTE: ${String(reportData.tipo).toUpperCase()}`, 14, 28);
      doc.text(`PERÍODO: ${reportData.desde} al ${reportData.hasta}`, pageWidth - 14, 28, { align: 'right' });

      let currentY = 45;

      // Resumen ejecutivo
      if (reportData.kpis && reportData.kpis.length > 0) {
        doc.setTextColor(30, 45, 61);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMEN EJECUTIVO', 14, currentY);
        currentY += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        reportData.kpis.forEach((kpi, idx) => {
          doc.text(`• ${kpi.label}: ${kpi.value}`, 14 + idx * 65, currentY);
        });
        currentY += 15;
      }

      // Tabla
      autoTable(doc, {
        startY: currentY,
        head: [reportData.columnas.map((c) => String(c).toUpperCase())],
        body: tabla.map((fila) => fila.map((v, i) => formatear(reportData.columnas[i], v))),
        theme: 'grid',
        headStyles: {
          fillColor: [11, 22, 38],
          textColor: [0, 255, 136],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center'
        },
        alternateRowStyles: { fillColor: [245, 248, 250] },
        styles: { fontSize: 8, cellPadding: 4, textColor: [40, 40, 40] },
        margin: { left: 14, right: 14 }
      });

      // Pie con paginación
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Generado el ${new Date().toLocaleString()} - Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      doc.save(`ElderDragon_${reportData.tipo}.pdf`);
      notify('PDF generado correctamente.', 'success');
    } catch (err) {
      console.error(err);
      setError('No se pudo generar PDF: ' + err.message);
    }
  };

  return (
    <AdminPageShell>
      <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div>
          <h1>Módulo de Reportes</h1>
          <p>Auditoría contable, estados de membresía y nuevos registros.</p>
        </div>
        <div className="header-actions">
          <button className="admin-btn-secondary" disabled={loading || !!error || !tabla.length} onClick={handleGeneratePDF}>📄 Descargar PDF</button>
          <button className="btn-gradient" disabled={loading || !!error || !tabla.length} onClick={handleExportExcel}>📊 Descargar Excel</button>
        </div>
      </header>

      {/* FILTROS */}
      <div className="report-filters" style={{ display: 'flex', gap: '20px', marginBottom: '30px', background: 'var(--admin-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--admin-border)' }}>
        <div className="filter-group" style={{ flex: 1 }}>
          <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>TIPO DE REPORTE</label>
          <select
            className="admin-input"
            value={tipoReporte}
            onChange={(e) => setTipoReporte(e.target.value)}
          >
            <option value="ingresos">Ingresos Financieros</option>
            <option value="morosos">Clientes Morosos / Vencidos</option>
            <option value="nuevos">Nuevas Altas / Registros</option>
          </select>
        </div>

        {tipoReporte !== 'morosos' && (
          <>
            <div className="filter-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>FECHA INICIO</label>
              <input
                type="date"
                className="admin-input"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="filter-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>FECHA FIN</label>
              <input
                type="date"
                className="admin-input"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      <Notice message={error} onClose={() => setError('')} />

      {loading ? (
        <div className="loader-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#00ff88' }}>
          <div className="spinner"></div>
          <p>Consultando base de datos...</p>
        </div>
      ) : (
        <>
          {/* TARJETAS RESUMEN DINÁMICAS */}
          <section className="stats-grid" style={{ marginBottom: '30px' }}>
            {reportData.kpis?.map((kpi, index) => (
              <div key={index} className={`stat-card tone-${kpi.tone}`}>
                <div className="stat-head"><span>{kpi.label}</span></div>
                <p className="stat-value">{kpi.value}</p>
              </div>
            ))}
          </section>

          {/* TABLA DINÁMICA */}
          <div className="panel">
            <div className="panel-head">
              <h3>Desglose Detallado</h3>
            </div>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    {reportData.columnas?.map((col, idx) => (
                      <th key={idx}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tabla.length > 0 ? (
                    tabla.map((fila, fIndex) => (
                      <tr key={fIndex}>
                        {fila.map((val, cIndex) => (
                          <td key={cIndex}>{formatear(reportData.columnas[cIndex], val)}</td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={reportData.columnas?.length || 5} style={{ textAlign: 'center', padding: '30px', color: '#8e9ba8' }}>
                        No se encontraron registros en el período seleccionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminPageShell>
  );
};

export default Reportes;