import React from 'react';
import { Package, Boxes, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';

export default function MetricCards({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      title: 'Total Tareas',
      value: summary.totalRegistros.toLocaleString(),
      sub: 'Registros de almacén',
      icon: Package,
      accent: '#38bdf8'
    },
    {
      title: 'Total Cajas',
      value: summary.totalCajas.toLocaleString(),
      sub: 'Cajas movidas / procesadas',
      icon: Boxes,
      accent: '#6366f1'
    },
    {
      title: 'Cumplimiento',
      value: `${summary.pctConfirmadas}%`,
      sub: `${summary.confirmadas.toLocaleString()} Tareas Confirmadas ('C')`,
      icon: CheckCircle,
      accent: '#10b981'
    },
    {
      title: 'Promedio Cajas/Tarea',
      value: summary.promedioCajasPorTarea,
      sub: 'Densidad por movimiento',
      icon: TrendingUp,
      accent: '#a855f7'
    },
    {
      title: 'Excepciones',
      value: summary.excepciones.toLocaleString(),
      sub: 'Código de excepción registrado',
      icon: AlertTriangle,
      accent: summary.excepciones > 0 ? '#f43f5e' : '#10b981'
    }
  ];

  return (
    <div className="grid-kpi">
      {cards.map((card, idx) => {
        const IconComp = card.icon;
        return (
          <div key={idx} className="glass-card kpi-card" style={{ '--kpi-accent': card.accent }}>
            <div className="kpi-label">
              <span>{card.title}</span>
              <IconComp size={20} style={{ color: card.accent }} />
            </div>
            <div className="kpi-value">{card.value}</div>
            <div className="kpi-sub">{card.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
