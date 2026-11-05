import React from 'react';
import { Document, Page, PDFDownloadLink, StyleSheet, Text, View } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingHorizontal: 36,
    paddingBottom: 42,
    color: '#111827',
    fontFamily: 'Helvetica',
    fontSize: 8
  },
  header: {
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomStyle: 'dashed',
    borderBottomColor: '#374151',
    paddingBottom: 10,
    marginBottom: 12
  },
  title: {
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: 0.6
  },
  subtitle: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: 700,
    color: '#374151'
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
    marginTop: 7,
    color: '#4b5563',
    fontSize: 7
  },
  summary: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 5,
    padding: 9,
    marginBottom: 13,
    backgroundColor: '#f9fafb'
  },
  summaryTitle: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
    marginBottom: 7
  },
  summaryGrid: {
    flexDirection: 'row'
  },
  summaryItem: {
    flexGrow: 1,
    flexBasis: 0,
    paddingHorizontal: 7,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    textAlign: 'center'
  },
  summaryLabel: {
    color: '#6b7280',
    fontSize: 7,
    textTransform: 'uppercase'
  },
  summaryValue: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: 700
  },
  balance: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    textAlign: 'right',
    fontSize: 9,
    fontWeight: 700
  },
  section: {
    marginBottom: 13
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    paddingBottom: 4,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#374151'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1.5,
    borderBottomColor: '#111827',
    minHeight: 21,
    alignItems: 'center'
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 20,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb'
  },
  tableFooter: {
    flexDirection: 'row',
    minHeight: 22,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderTopWidth: 1.5,
    borderTopColor: '#111827'
  },
  cell: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    color: '#374151'
  },
  headerCell: {
    paddingVertical: 5,
    paddingHorizontal: 4,
    color: '#111827',
    fontSize: 7,
    fontWeight: 700,
    textTransform: 'uppercase'
  },
  footerCell: {
    paddingVertical: 5,
    paddingHorizontal: 4,
    color: '#111827',
    fontWeight: 700
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 10
  },
  signature: {
    width: '38%',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 5,
    textAlign: 'center',
    fontSize: 7,
    color: '#4b5563'
  },
  pageNumber: {
    position: 'absolute',
    bottom: 18,
    right: 36,
    color: '#6b7280',
    fontSize: 7
  }
});

const TITLES = {
  general: 'BALANCE GENERAL Y REPORTE EJECUTIVO DE OPERACIONES',
  ventas: 'REPORTE AUDITADO DE VENTAS',
  compras: 'REPORTE DE COMPRAS Y GASTOS A PROVEEDORES',
  cortes: 'AUDITORÍA Y ARQUEOS DE CORTE DE CAJA'
};

const money = value => `$${(Number(value) || 0).toFixed(2)}`;
const text = value => (value === null || value === undefined || value === '' ? '—' : String(value));

function Table({ columns, rows, footer }) {
  return (
    <View>
      <View style={styles.tableHeader} fixed>
        {columns.map(column => (
          <Text
            key={column.key}
            style={[
              styles.headerCell,
              { width: column.width, textAlign: column.align || 'left' }
            ]}
          >
            {column.label}
          </Text>
        ))}
      </View>
      {rows.length ? rows.map((row, rowIndex) => (
        <View
          key={`${row.id || row.folio || rowIndex}`}
          style={[styles.tableRow, rowIndex % 2 === 1 ? { backgroundColor: '#f9fafb' } : {}]}
          wrap={false}
        >
          {columns.map(column => (
            <Text
              key={column.key}
              style={[
                styles.cell,
                { width: column.width, textAlign: column.align || 'left' },
                column.emphasize ? { fontWeight: 700, color: '#111827' } : {}
              ]}
            >
              {text(row[column.key])}
            </Text>
          ))}
        </View>
      )) : (
        <Text style={[styles.cell, { paddingVertical: 9, textAlign: 'center' }]}>
          No hay registros para los filtros seleccionados.
        </Text>
      )}
      {footer && (
        <View style={styles.tableFooter} wrap={false}>
          <Text style={[styles.footerCell, { width: footer.labelWidth }]}>
            {footer.label}
          </Text>
          <Text style={[styles.footerCell, { width: footer.valueWidth, textAlign: 'right' }]}>
            {footer.value}
          </Text>
        </View>
      )}
    </View>
  );
}

function ReportSection({ title, rows, columns, footer }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Table columns={columns} rows={rows} footer={footer} />
    </View>
  );
}

export function ReportePDF({
  modo = 'general',
  loggedUser,
  fechaInicio,
  fechaFin,
  metricas,
  ventas,
  compras,
  cortes
}) {
  const fechaEmision = new Date().toLocaleString('es-MX');
  const periodo = `${fechaInicio || 'Inicio'} al ${fechaFin || 'Hoy'}`;
  const emisor = [loggedUser?.nombre, loggedUser?.apellido].filter(Boolean).join(' ') || 'Administrador';
  const mostrarVentas = modo === 'general' || modo === 'ventas';
  const mostrarCompras = modo === 'general' || modo === 'compras';
  const mostrarCortes = modo === 'general' || modo === 'cortes';

  const ventaColumns = [
    { key: 'folio', label: 'Folio', width: '9%' },
    { key: 'fecha', label: 'Fecha', width: '12%' },
    { key: 'cliente', label: 'Cliente', width: '15%' },
    { key: 'tipo', label: 'Tipo', width: '9%' },
    { key: 'concepto', label: 'Concepto / Artículos', width: '19%' },
    { key: 'metodo', label: 'Método', width: '10%' },
    { key: 'subtotal', label: 'Subtotal', width: '9%', align: 'right' },
    { key: 'descuento', label: 'Descuento', width: '8%', align: 'right' },
    { key: 'total', label: 'Total', width: '9%', align: 'right', emphasize: true }
  ];
  const compraColumns = [
    { key: 'folio', label: 'Orden', width: '10%' },
    { key: 'fecha', label: 'Fecha', width: '13%' },
    { key: 'proveedor', label: 'Proveedor', width: '18%' },
    { key: 'articulo', label: 'Artículo / Suplemento', width: '23%' },
    { key: 'cantidad', label: 'Unidades', width: '10%', align: 'right' },
    { key: 'costo', label: 'Costo unitario', width: '13%', align: 'right' },
    { key: 'total', label: 'Inversión', width: '13%', align: 'right', emphasize: true }
  ];
  const corteColumns = [
    { key: 'folio', label: 'Corte', width: '8%' },
    { key: 'cajero', label: 'Cajero', width: '15%' },
    { key: 'apertura', label: 'Apertura', width: '14%' },
    { key: 'cierre', label: 'Cierre', width: '14%' },
    { key: 'fondo', label: 'Fondo', width: '10%', align: 'right' },
    { key: 'ventas', label: 'Ventas', width: '12%', align: 'right' },
    { key: 'fisico', label: 'Efectivo físico', width: '13%', align: 'right' },
    { key: 'diferencia', label: 'Diferencia', width: '14%', align: 'right', emphasize: true }
  ];

  return (
    <Document title={TITLES[modo] || TITLES.general} author="GYMTON FITNESS CLUB">
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>GYMTON FITNESS CLUB</Text>
          <Text style={styles.subtitle}>{TITLES[modo] || TITLES.general}</Text>
          <View style={styles.metadata}>
            <Text>Fecha de emisión: {fechaEmision}</Text>
            <Text>Período: {periodo}</Text>
            <Text>Emitido por: {emisor}</Text>
          </View>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen financiero y balance de caja</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Ingresos ventas</Text>
              <Text style={styles.summaryValue}>{money(metricas.totalVentas)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Efectivo ({metricas.pctEfectivo}%)</Text>
              <Text style={styles.summaryValue}>{money(metricas.ventasEfectivo)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Tarjeta ({metricas.pctTarjeta}%)</Text>
              <Text style={styles.summaryValue}>{money(metricas.ventasTarjeta)}</Text>
            </View>
            <View style={[styles.summaryItem, { borderRightWidth: 0 }]}>
              <Text style={styles.summaryLabel}>Egresos compras</Text>
              <Text style={styles.summaryValue}>{money(metricas.totalCompras)}</Text>
            </View>
          </View>
          <Text style={styles.balance}>
            BALANCE NETO: {money(metricas.balanceNeto)} MXN
          </Text>
        </View>

        {mostrarVentas && (
          <ReportSection
            title={`Desglose de ventas (${ventas.length} operaciones)`}
            rows={ventas}
            columns={ventaColumns}
            footer={{
              label: 'TOTAL VENTAS',
              value: money(metricas.totalVentas),
              labelWidth: '91%',
              valueWidth: '9%'
            }}
          />
        )}

        {mostrarCompras && (
          <ReportSection
            title={`Desglose de compras y suministros (${compras.length} registros)`}
            rows={compras}
            columns={compraColumns}
            footer={{
              label: 'TOTAL COMPRAS',
              value: money(metricas.totalCompras),
              labelWidth: '87%',
              valueWidth: '13%'
            }}
          />
        )}

        {mostrarCortes && (
          <ReportSection
            title={`Auditoría de cortes y arqueos de caja (${cortes.length} turnos)`}
            rows={cortes}
            columns={corteColumns}
          />
        )}

        <View style={styles.signatures} wrap={false}>
          <Text style={styles.signature}>Firma del cajero / responsable</Text>
          <Text style={styles.signature}>Firma de auditoría / gerencia</Text>
        </View>
        <Text
          style={styles.pageNumber}
          fixed
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
        />
      </Page>
    </Document>
  );
}

export function DescargarReportePDF({ documento, nombreArchivo, className, children }) {
  return (
    <PDFDownloadLink document={documento} fileName={nombreArchivo} className={className}>
      {({ loading, error }) => (
        <span>
          {error ? 'Error al generar PDF' : loading ? 'Generando PDF...' : children}
        </span>
      )}
    </PDFDownloadLink>
  );
}
