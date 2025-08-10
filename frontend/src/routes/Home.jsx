import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import Statistics from '../components/Statistics.jsx';
import SearchFilters from '../components/SearchFilters.jsx';
import ExportTools from '../components/ExportTools.jsx';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL
});

// Ajouter l'intercepteur pour inclure le token automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function Home() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({});

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters,
        sortBy,
        sortOrder
      });
      
      // Supprimer les paramètres vides
      Object.keys(filters).forEach(key => {
        if (!filters[key] || filters[key] === 'all') {
          params.delete(key);
        }
      });
      
      const { data } = await api.get(`/invoices?${params}`);
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [filters, sortBy, sortOrder]);

  if (loading) return <div className="loading">Chargement des factures</div>;

  const getStatusBadge = (status) => {
    const styles = {
      pending: { background: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' },
      resolved: { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
      not_resolved: { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }
    };
    
    const labels = {
      pending: 'En Attente',
      resolved: 'Résolue',
      not_resolved: 'Non Résolue'
    };

    return (
      <span style={{
        ...styles[status],
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        {labels[status]}
      </span>
    );
  };

  const updateStatus = async (invoiceId, newStatus) => {
    try {
      await api.patch(`/invoices/${invoiceId}/status`, { status: newStatus });
      setInvoices(prev => prev.map(inv => 
        inv._id === invoiceId ? { ...inv, status: newStatus } : inv
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return ' ↕️';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div>
      <Statistics />
      <h3>Historique des factures</h3>
      <SearchFilters onFiltersChange={setFilters} />
      <ExportTools currentFilters={filters} />
      {invoices.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>Aucune facture trouvée</p>
          <p>Commencez par créer votre première facture</p>
        </div>
      ) : (
        <>
        <div className="table-container">
          <table className="invoice-table">
            <thead>
              <tr>
                <th 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('number')}
                >
                  Numéro{getSortIcon('number')}
                </th>
                <th 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('date')}
                >
                  Date{getSortIcon('date')}
                </th>
                <th 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('client')}
                >
                  Fournisseur{getSortIcon('client')}
                </th>
                <th>Statut</th>
                <th 
                  style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('amount')}
                >
                  Montant TTC{getSortIcon('amount')}
                </th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td><strong>{inv.invoiceNumber}</strong></td>
                  <td>{dayjs(inv.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                  <td>{inv.supplier?.name}</td>
                  <td>
                    <select 
                      value={inv.status || 'pending'} 
                      onChange={(e) => updateStatus(inv._id, e.target.value)}
                      style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        border: '1px solid #e1e8ed',
                        fontSize: '12px',
                        backgroundColor: inv.status === 'pending' ? '#fff3cd' : 
                                       inv.status === 'resolved' ? '#d4edda' : 
                                       inv.status === 'not_resolved' ? '#f8d7da' : '#fff3cd',
                        color: inv.status === 'pending' ? '#856404' : 
                               inv.status === 'resolved' ? '#155724' : 
                               inv.status === 'not_resolved' ? '#721c24' : '#856404'
                      }}
                    >
                      <option value="pending">En Attente</option>
                      <option value="resolved">Résolue</option>
                      <option value="not_resolved">Non Résolue</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '600' }}>{inv.totals?.totalTTC?.toFixed(2)} MAD</td>
                  <td style={{ textAlign: 'center' }}>
                    <a href={`${import.meta.env.VITE_API_URL}${inv.pdf?.url}`} target="_blank" rel="noreferrer" className="action-link">Visualiser</a>
                    <span style={{ margin: '0 8px', color: '#dee2e6' }}>|</span>
                    <a href={`${import.meta.env.VITE_API_URL}/invoices/${inv._id}/pdf`} target="_blank" rel="noreferrer" className="action-link">Télécharger</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mobile-invoice-list">
          {invoices.map((inv) => (
            <div key={inv._id} className="mobile-invoice-card">
              <div className="mobile-invoice-header">
                <strong style={{ fontSize: '16px' }}>{inv.invoiceNumber}</strong>
                <span style={{ fontSize: '14px', color: '#6c757d' }}>
                  {dayjs(inv.createdAt).format('DD/MM HH:mm')}
                </span>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                  <strong>{inv.supplier?.name}</strong>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
                  {inv.totals?.totalTTC?.toFixed(2)} MAD
                </div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <select 
                  value={inv.status || 'pending'} 
                  onChange={(e) => updateStatus(inv._id, e.target.value)}
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: '6px', 
                    border: '1px solid #e1e8ed',
                    fontSize: '14px',
                    width: '100%',
                    backgroundColor: inv.status === 'pending' ? '#fff3cd' : 
                                   inv.status === 'resolved' ? '#d4edda' : 
                                   inv.status === 'not_resolved' ? '#f8d7da' : '#fff3cd',
                    color: inv.status === 'pending' ? '#856404' : 
                           inv.status === 'resolved' ? '#155724' : 
                           inv.status === 'not_resolved' ? '#721c24' : '#856404'
                  }}
                >
                  <option value="pending">En Attente</option>
                  <option value="resolved">Résolue</option>
                  <option value="not_resolved">Non Résolue</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <a 
                  href={`${import.meta.env.VITE_API_URL}${inv.pdf?.url}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-secondary"
                  style={{ flex: 1, textAlign: 'center', fontSize: '13px', padding: '8px' }}
                >
                  Visualiser
                </a>
                <a 
                  href={`${import.meta.env.VITE_API_URL}/invoices/${inv._id}/pdf`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-primary"
                  style={{ flex: 1, textAlign: 'center', fontSize: '13px', padding: '8px' }}
                >
                  Télécharger
                </a>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}