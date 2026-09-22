import { Notice, useNotifications } from '../../components/Notifications';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageShell } from './Dashboard';
import '../../css/admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Reportes = () => {
  const { notify } = useNotifications();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const currentDay = today.toISOString().split('T')[0];

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
      if (!controller.signal.aborted) setReportData({ ...data, desde: fechaInicio, hasta: fechaFin });
    } catch (err) {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loading and error state belong to this API request.
    fetchReporte();
    return () => pendingRequest.current?.abort();
  }, [fetchReporte, token, navigate]);

  // ==========================================
  // EXPORTAR ARCHIVO XLSX
  // ==========================================
  const handleExportExcel = async () => {
    if (!reportData.filas || reportData.filas.length === 0) {
      return notify('No hay registros para exportar.', 'info');
    }

    try {
      const {default: writeExcelFile} = await import('write-excel-file/browser');
      const cells = [
        reportData.columnas.map(value => ({value, fontWeight: 'bold'})),
        ...reportData.filas.map(row => Object.entries(row).map(([key,value]) => ({
          value: key === 'monto' ? Number(value) : value ?? '',
          ...(key === 'monto' ? {format: '0.00'} : {}),
        }))),
      ];
      await writeExcelFile(cells, {sheet: 'Reporte', columns: reportData.columnas.map(() => ({width: 24}))})
        .toFile('Reporte_' + reportData.tipo + '_' + reportData.desde + '_' + reportData.hasta + '.xlsx');
    } catch(err){setError('No se pudo generar Excel: '+err.message);}
  };

  // ==========================================
  // GENERAR PDF PROFESIONAL
  // ==========================================
  const handleGeneratePDF = async () => {
    if(!reportData.filas.length)return setError('No hay datos para exportar.');
    try {
      const [{jsPDF},{autoTable}]=await Promise.all([import('jspdf'),import('jspdf-autotable')]);
      const doc=new jsPDF({orientation:'landscape'});
      doc.setFontSize(16);doc.text('Elder Dragon Fitness',14,16);
      doc.setFontSize(10);doc.text('Reporte: '+reportData.tipo+' | '+(reportData.tipo==='morosos'?'Estado actual':reportData.desde+' a '+reportData.hasta),14,24);
      autoTable(doc,{startY:30,head:[reportData.columnas],body:reportData.filas.map(row=>Object.values(row).map(v=>v??'')),styles:{fontSize:8},margin:{top:15,bottom:15}});
      doc.save('Reporte_'+reportData.tipo+'.pdf');
    } catch(err){setError('No se pudo generar PDF: '+err.message);}
  };

  return (
    <AdminPageShell>
      {/* ESTILOS DE IMPRESIÓN EXCLUSIVOS PARA EL PDF */}
      <style>{`
        @media print {
          body { background: #fff !important; color: #000 !important; }
          .admin-sidebar, .header-actions, .report-filters, .logout-btn-square { display: none !important; }
          .admin-content { padding: 0 !important; margin: 0 !important; }
          .panel { background: #fff !important; border: none !important; box-shadow: none !important; }
          .admin-table { width: 100% !important; border-collapse: collapse !important; }
          .admin-table th, .admin-table td { 
            color: #111 !important; 
            border: 1px solid #ddd !important; 
            padding: 8px !important;
            font-size: 11pt !important;
          }
          .admin-table th { background: #f0f0f0 !important; }
          .pdf-header { display: block !important; margin-bottom: 20px; }
        }
        @media screen {
          .pdf-header { display: none; }
        }
      `}</style>

      {/* ENCABEZADO FORMAL PARA EL PDF */}
      <div className="pdf-header">
        <h2 style={{ margin: 0, color: '#000' }}>Elder Dragón Fitness</h2>
        <p style={{ margin: '4px 0', color: '#555' }}>
          Reporte Oficial de {tipoReporte.toUpperCase()} | Rango: {fechaInicio} al {fechaFin}
        </p>
        <hr style={{ borderColor: '#ddd', margin: '15px 0' }} />
      </div>

      <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div>
          <h1>Módulo de Reportes</h1>
          <p>Auditoría contable, estados de membresía y nuevos registros.</p>
        </div>
        <div className="header-actions">
          <button className="admin-btn-secondary" disabled={loading || !!error || !reportData.filas.length} onClick={handleGeneratePDF}>📄 Generar PDF</button>
          <button className="btn-gradient" disabled={loading || !!error || !reportData.filas.length} onClick={handleExportExcel}>📊 Exportar Excel</button>
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
          <div className="panel" id="seccion-impresion">
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
                  {reportData.filas?.length > 0 ? (
                    reportData.filas.map((fila, fIndex) => (
                      <tr key={fIndex}>
                        {Object.values(fila).map((val, cIndex) => (
                          <td key={cIndex}>
                            {typeof val === 'number' && String(val).includes('.') ? `$${val.toFixed(2)}` : val}
                          </td>
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
