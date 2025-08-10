import { useState } from 'react';
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

export default function ExportTools({ currentFilters }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        ...currentFilters,
        format
      });

      // Supprimer les paramètres vides
      Object.keys(currentFilters).forEach(key => {
        if (!currentFilters[key] || currentFilters[key] === 'all') {
          params.delete(key);
        }
      });

      const { data } = await api.get(`/invoices/export?${params}`);
      
      // Télécharger le fichier
      const link = document.createElement('a');
      link.href = `${import.meta.env.VITE_API_URL}${data.downloadUrl}`;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`Export ${format.toUpperCase()} généré avec succès ! ${data.count} factures exportées.`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export. Veuillez réessayer.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '12px', 
      alignItems: 'center',
      padding: '16px',
      background: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef',
      marginBottom: '24px'
    }}>
      <span style={{ fontSize: '14px', fontWeight: '500', color: '#495057' }}>
        Exporter les factures :
      </span>
      
      <button
        className="btn btn-secondary"
        onClick={() => handleExport('xlsx')}
        disabled={exporting}
        style={{ fontSize: '13px', padding: '8px 16px' }}
      >
        📊 Excel (.xlsx)
      </button>
      
      <button
        className="btn btn-secondary"
        onClick={() => handleExport('csv')}
        disabled={exporting}
        style={{ fontSize: '13px', padding: '8px 16px' }}
      >
        📄 CSV (.csv)
      </button>

      {exporting && (
        <span style={{ fontSize: '13px', color: '#6c757d', fontStyle: 'italic' }}>
          Export en cours...
        </span>
      )}
    </div>
  );
}