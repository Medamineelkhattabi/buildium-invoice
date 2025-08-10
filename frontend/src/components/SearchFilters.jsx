import { useState } from 'react';

export default function SearchFilters({ onFiltersChange }) {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Barre de recherche principale */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <input
            className="form-input"
            type="text"
            placeholder="Rechercher par numéro de facture ou nom du client..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            style={{ margin: 0 }}
          />
        </div>
        
        <select
          className="form-input"
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          style={{ width: '150px', margin: 0 }}
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En Attente</option>
          <option value="resolved">Résolues</option>
          <option value="not_resolved">Non Résolues</option>
        </select>

        <button
          className="btn btn-secondary"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ whiteSpace: 'nowrap' }}
        >
          {showAdvanced ? 'Masquer' : 'Filtres avancés'}
        </button>
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #e9ecef' 
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label className="form-label">Date de début</label>
              <input
                className="form-input"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleChange('dateFrom', e.target.value)}
              />
            </div>
            
            <div>
              <label className="form-label">Date de fin</label>
              <input
                className="form-input"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleChange('dateTo', e.target.value)}
              />
            </div>
            
            <div>
              <label className="form-label">Montant minimum (MAD)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={filters.minAmount}
                onChange={(e) => handleChange('minAmount', e.target.value)}
              />
            </div>
            
            <div>
              <label className="form-label">Montant maximum (MAD)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={filters.maxAmount}
                onChange={(e) => handleChange('maxAmount', e.target.value)}
              />
            </div>
          </div>
          
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Effacer tous les filtres
            </button>
          </div>
        </div>
      )}
    </div>
  );
}