import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Clock, Sun, Moon, Sunset, Layers, Award } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsCharts({ turnoBreakdown, hourlyData, areaMap, topProducts, topOperators }) {
  if (!turnoBreakdown || !hourlyData) return null;

  // Chart 1: Turno Bar Chart
  const shiftChartData = {
    labels: ['MAÑANA (06-14h)', 'PM (14-22h)', 'NOCHE (22-06h)'],
    datasets: [
      {
        label: 'Cajas Movidas',
        data: [
          turnoBreakdown.MAÑANA?.cajas || 0,
          turnoBreakdown.PM?.cajas || 0,
          turnoBreakdown.NOCHE?.cajas || 0
        ],
        backgroundColor: ['rgba(56, 189, 248, 0.85)', 'rgba(99, 102, 241, 0.85)', 'rgba(168, 85, 247, 0.85)'],
        borderRadius: 8
      },
      {
        label: 'Tareas Realizadas',
        data: [
          turnoBreakdown.MAÑANA?.tareas || 0,
          turnoBreakdown.PM?.tareas || 0,
          turnoBreakdown.NOCHE?.tareas || 0
        ],
        backgroundColor: ['rgba(56, 189, 248, 0.3)', 'rgba(99, 102, 241, 0.3)', 'rgba(168, 85, 247, 0.3)'],
        borderRadius: 8
      }
    ]
  };

  // Chart 2: Hourly Productivity Line Chart
  const hourlyChartData = {
    labels: hourlyData.map(h => h.hora),
    datasets: [
      {
        label: 'Tareas por Hora',
        data: hourlyData.map(h => h.tareas),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#38bdf8'
      },
      {
        label: 'Cajas por Hora',
        data: hourlyData.map(h => h.cajas),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981'
      }
    ]
  };

  // Chart 3: Area Doughnut Chart
  const areaLabels = Object.keys(areaMap || {});
  const areaValues = Object.values(areaMap || {});
  const areaChartData = {
    labels: areaLabels.length > 0 ? areaLabels : ['WH'],
    datasets: [
      {
        data: areaValues.length > 0 ? areaValues : [100],
        backgroundColor: ['#38bdf8', '#6366f1', '#a855f7', '#10b981', '#f59e0b'],
        borderWidth: 0
      }
    ]
  };

  // Chart 4: Top 10 Products
  const topProdChartData = {
    labels: topProducts?.map(p => p.name.length > 25 ? p.name.substring(0, 25) + '...' : p.name) || [],
    datasets: [
      {
        label: 'Cajas Movidas',
        data: topProducts?.map(p => p.cajas) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } }
      }
    },
    scales: {
      x: {
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      y: {
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    }
  };

  return (
    <div className="charts-grid">
      {/* Productividad Horaria (Largo) */}
      <div className="glass-card chart-card-lg">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <Clock size={20} color="#38bdf8" />
          <h3 style={{ fontSize: '1.1rem' }}>Productividad Operativa por Hora (00h - 23h)</h3>
        </div>
        <div style={{ height: '300px' }}>
          <Line data={hourlyChartData} options={chartOptions} />
        </div>
      </div>

      {/* Distribución por Turno */}
      <div className="glass-card chart-card-sm">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <Sun size={20} color="#f59e0b" />
          <h3 style={{ fontSize: '1.1rem' }}>Distribución por Turno</h3>
        </div>
        <div style={{ height: '300px' }}>
          <Bar data={shiftChartData} options={chartOptions} />
        </div>
      </div>

      {/* Top Productos */}
      <div className="glass-card chart-card-lg">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <Award size={20} color="#a855f7" />
          <h3 style={{ fontSize: '1.1rem' }}>Top 10 Productos con Mayor Movimiento de Cajas</h3>
        </div>
        <div style={{ height: '300px' }}>
          <Bar data={topProdChartData} options={{ ...chartOptions, indexAxis: 'y' }} />
        </div>
      </div>

      {/* Distribución por Área */}
      <div className="glass-card chart-card-sm">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <Layers size={20} color="#10b981" />
          <h3 style={{ fontSize: '1.1rem' }}>Distribución de Cajas por Área</h3>
        </div>
        <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Doughnut data={areaChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } } }} />
        </div>
      </div>
    </div>
  );
}
