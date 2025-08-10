import { useState, useEffect } from 'react';
import axios from 'axios';

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

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const { data } = await api.get('/invoices/statistics');
        setStats(data);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <div className="loading">Chargement des statistiques</div>;

  return (
    <>
    <div className="stats-desktop" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        border: '1px solid #e9ecef',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#2c3e50', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Factures</h4>
        <div style={{ fontSize: '32px', fontWeight: '700', color: '#2c3e50' }}>{stats?.total || 0}</div>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        border: '1px solid #e9ecef',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#f39c12', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>En Attente</h4>
        <div style={{ fontSize: '32px', fontWeight: '700', color: '#f39c12' }}>{stats?.pending || 0}</div>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        border: '1px solid #e9ecef',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#27ae60', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Résolues</h4>
        <div style={{ fontSize: '32px', fontWeight: '700', color: '#27ae60' }}>{stats?.resolved || 0}</div>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        border: '1px solid #e9ecef',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#e74c3c', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Non Résolues</h4>
        <div style={{ fontSize: '32px', fontWeight: '700', color: '#e74c3c' }}>{stats?.notResolved || 0}</div>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        border: '1px solid #e9ecef',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#2c3e50', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Montant Total</h4>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c3e50' }}>{stats?.totalAmount?.toFixed(2) || '0.00'} MAD</div>
      </div>
    </div>
    
    <div className="stats-mobile">
      <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e9ecef', textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '12px', fontWeight: '600' }}>Total</h4>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c3e50' }}>{stats?.total || 0}</div>
      </div>
      <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e9ecef', textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#f39c12', fontSize: '12px', fontWeight: '600' }}>Attente</h4>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#f39c12' }}>{stats?.pending || 0}</div>
      </div>
      <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e9ecef', textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#27ae60', fontSize: '12px', fontWeight: '600' }}>Résolues</h4>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#27ae60' }}>{stats?.resolved || 0}</div>
      </div>
      <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e9ecef', textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#e74c3c', fontSize: '12px', fontWeight: '600' }}>Non Rés.</h4>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#e74c3c' }}>{stats?.notResolved || 0}</div>
      </div>
    </div>
    </>
  );
}