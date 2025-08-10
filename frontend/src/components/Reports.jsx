import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const loadReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period, year: year.toString() });
      const { data } = await api.get(`/invoices/reports/revenue?${params}`);
      setReportData(data);
    } catch (error) {
      console.error('Erreur lors du chargement du rapport:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [period, year]);

  if (loading) return <div className="loading">Chargement du rapport</div>;

  const revenueChartData = {
    labels: reportData?.data.map(item => {
      if (period === 'monthly') {
        const [year, month] = item.period.split('-');
        return `${month}/${year}`;
      }
      return item.period;
    }) || [],
    datasets: [
      {
        label: 'Chiffre d\'affaires TTC (MAD)',
        data: reportData?.data.map(item => item.totalTTC) || [],
        backgroundColor: 'rgba(44, 62, 80, 0.8)',
        borderColor: 'rgba(44, 62, 80, 1)',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'Montant HT (MAD)',
        data: reportData?.data.map(item => item.totalHT) || [],
        backgroundColor: 'rgba(52, 152, 219, 0.6)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 2,
        fill: false,
      }
    ],
  };

  const statusData = {
    labels: ['En Attente', 'Résolues', 'Non Résolues'],
    datasets: [{
      data: [
        reportData?.analytics.paymentAnalysis.pending.count || 0,
        reportData?.analytics.paymentAnalysis.resolved.count || 0,
        reportData?.analytics.paymentAnalysis.notResolved.count || 0,
      ],
      backgroundColor: [
        'rgba(243, 156, 18, 0.8)',
        'rgba(39, 174, 96, 0.8)',
        'rgba(231, 76, 60, 0.8)',
      ],
      borderColor: [
        'rgba(243, 156, 18, 1)',
        'rgba(39, 174, 96, 1)',
        'rgba(231, 76, 60, 1)',
      ],
      borderWidth: 2,
    }],
  };

  const clientsChartData = {
    labels: reportData?.analytics.topClients.slice(0, 5).map(client => client.name) || [],
    datasets: [{
      label: 'Chiffre d\'affaires par client (MAD)',
      data: reportData?.analytics.topClients.slice(0, 5).map(client => client.totalAmount) || [],
      backgroundColor: [
        'rgba(155, 89, 182, 0.8)',
        'rgba(52, 152, 219, 0.8)',
        'rgba(46, 204, 113, 0.8)',
        'rgba(241, 196, 15, 0.8)',
        'rgba(230, 126, 34, 0.8)',
      ],
      borderWidth: 2,
    }],
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'revenue', label: 'Revenus', icon: '💰' },
    { id: 'clients', label: 'Clients', icon: '👥' },
    { id: 'trends', label: 'Tendances', icon: '📈' },
  ];

  return (
    <div>
      {/* En-tête avec contrôles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3>Rapports et Analyses Avancées</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            className="form-input"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ width: '120px', margin: 0 }}
          >
            <option value="monthly">Mensuel</option>
            <option value="yearly">Annuel</option>
          </select>
          <select
            className="form-input"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            style={{ width: '100px', margin: 0 }}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ 
        display: 'flex', 
        gap: '4px', 
        marginBottom: '24px',
        borderBottom: '1px solid #e9ecef'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === tab.id ? '#2c3e50' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6c757d',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div>
          {/* KPIs principaux */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px', 
            marginBottom: '32px' 
          }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '14px' }}>Total Factures</h4>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50' }}>
                {reportData?.summary.totalInvoices || 0}
              </div>
            </div>
            
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#27ae60', fontSize: '14px' }}>Chiffre d'Affaires</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                {reportData?.summary.totalRevenue?.toFixed(2) || '0.00'} MAD
              </div>
            </div>
            
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#3498db', fontSize: '14px' }}>Montant Moyen</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
                {reportData?.analytics.trends.avgInvoiceValue?.toFixed(2) || '0.00'} MAD
              </div>
            </div>
            
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 8px 0', color: reportData?.analytics.trends.growthRate >= 0 ? '#27ae60' : '#e74c3c', fontSize: '14px' }}>Croissance</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: reportData?.analytics.trends.growthRate >= 0 ? '#27ae60' : '#e74c3c' }}>
                {reportData?.analytics.trends.growthRate >= 0 ? '+' : ''}{reportData?.analytics.trends.growthRate?.toFixed(1) || '0.0'}%
              </div>
            </div>
          </div>

          {/* Graphiques principaux */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
              <Line 
                data={revenueChartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Évolution du Chiffre d\'Affaires' }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { callback: function(value) { return value.toLocaleString() + ' MAD'; } }
                    }
                  }
                }} 
              />
            </div>
            
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
              <Doughnut 
                data={statusData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Répartition par Statut' }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e9ecef', marginBottom: '24px' }}>
            <Bar 
              data={revenueChartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Analyse Détaillée des Revenus' }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: function(value) { return value.toLocaleString() + ' MAD'; } }
                  }
                }
              }} 
            />
          </div>

          {/* Tableau détaillé */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e9ecef', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>Période</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', fontSize: '13px' }}>Factures</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', fontSize: '13px' }}>CA HT</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', fontSize: '13px' }}>TVA</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', fontSize: '13px' }}>CA TTC</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', fontSize: '13px' }}>Clients</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.data.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f3f4' }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>{item.period}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>{item.count}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>{item.totalHT.toFixed(2)} MAD</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>{item.totalTVA.toFixed(2)} MAD</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>{item.totalTTC.toFixed(2)} MAD</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>{item.uniqueClients}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
              <Bar 
                data={clientsChartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Top 5 Clients par CA' }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { callback: function(value) { return value.toLocaleString() + ' MAD'; } }
                    }
                  }
                }} 
              />
            </div>

            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Analyse des Paiements</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#fff3cd', borderRadius: '8px' }}>
                  <span style={{ fontWeight: '500' }}>En Attente</span>
                  <span style={{ fontWeight: '600' }}>{reportData?.analytics.paymentAnalysis.pending.amount.toFixed(2)} MAD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#d4edda', borderRadius: '8px' }}>
                  <span style={{ fontWeight: '500' }}>Résolues</span>
                  <span style={{ fontWeight: '600' }}>{reportData?.analytics.paymentAnalysis.resolved.amount.toFixed(2)} MAD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8d7da', borderRadius: '8px' }}>
                  <span style={{ fontWeight: '500' }}>Non Résolues</span>
                  <span style={{ fontWeight: '600' }}>{reportData?.analytics.paymentAnalysis.notResolved.amount.toFixed(2)} MAD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top clients détaillé */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e9ecef', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e9ecef' }}>
              <h4 style={{ margin: 0, fontSize: '16px' }}>Top 10 Clients</h4>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>Rang</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>Client</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', fontSize: '13px' }}>Factures</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', fontSize: '13px' }}>CA Total</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', fontSize: '13px' }}>CA Moyen</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.analytics.topClients.map((client, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f3f4' }}>
                    <td style={{ padding: '16px', fontWeight: '600', color: '#2c3e50' }}>#{index + 1}</td>
                    <td style={{ padding: '16px', fontWeight: '500' }}>{client.name}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>{client.invoiceCount}</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>{client.totalAmount.toFixed(2)} MAD</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>{client.avgAmount.toFixed(2)} MAD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e9ecef', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#2c3e50', fontSize: '14px' }}>Taux de Croissance</h4>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: reportData?.analytics.trends.growthRate >= 0 ? '#27ae60' : '#e74c3c' 
              }}>
                {reportData?.analytics.trends.growthRate >= 0 ? '+' : ''}{reportData?.analytics.trends.growthRate?.toFixed(1) || '0.0'}%
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
                6 derniers mois vs 6 mois précédents
              </p>
            </div>

            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e9ecef', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#3498db', fontSize: '14px' }}>Facture Moyenne</h4>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3498db' }}>
                {reportData?.analytics.trends.avgInvoiceValue?.toFixed(2) || '0.00'} MAD
              </div>
            </div>

            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e9ecef', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#9b59b6', fontSize: '14px' }}>Clients Actifs</h4>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9b59b6' }}>
                {reportData?.analytics.topClients.length || 0}
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
            <Line 
              data={{
                labels: reportData?.data.map(item => item.period) || [],
                datasets: [
                  {
                    label: 'Nombre de factures',
                    data: reportData?.data.map(item => item.count) || [],
                    borderColor: 'rgba(52, 152, 219, 1)',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    yAxisID: 'y',
                  },
                  {
                    label: 'Montant moyen (MAD)',
                    data: reportData?.data.map(item => item.avgAmount) || [],
                    borderColor: 'rgba(155, 89, 182, 1)',
                    backgroundColor: 'rgba(155, 89, 182, 0.1)',
                    yAxisID: 'y1',
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Évolution du Volume et du Montant Moyen' }
                },
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Nombre de factures' }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Montant moyen (MAD)' },
                    grid: { drawOnChartArea: false }
                  }
                }
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}