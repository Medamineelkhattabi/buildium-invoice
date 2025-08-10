import { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

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

const emptyLine = { reference: '', designation: '', quantity: 1, unit: 'u', unitPriceHT: 0, tva: 20 };

function Preview({ data, onClose }) {
  if (!data) return null;
  const { supplier, date, lines } = data;
  const totals = lines.reduce((acc, l) => {
    const ht = l.quantity * l.unitPriceHT;
    const tva = (ht * l.tva) / 100;
    acc.totalHT += ht;
    acc.totalTVA += tva;
    acc.totalTTC += ht + tva;
    return acc;
  }, { totalHT: 0, totalTVA: 0, totalTTC: 0 });

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 style={{ marginTop: 0 }}>Aperçu de la facture</h3>
        <p><strong>Date:</strong> {dayjs(date).format('DD/MM/YYYY')}</p>
        <h4>Destinataire</h4>
        <div>
          <div><strong>{supplier.name}</strong></div>
          <div>{supplier.address}</div>
          <div>ICE: {supplier.ice}</div>
          <div>Tél: {supplier.phone} | Email: {supplier.email}</div>
          <div>Interlocuteur: {supplier.contact}</div>
        </div>
        <h4>Lignes</h4>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Réf</th>
              <th>Désignation</th>
              <th style={{ textAlign: 'right' }}>Qté</th>
              <th>Unité</th>
              <th style={{ textAlign: 'right' }}>PU HT</th>
              <th style={{ textAlign: 'right' }}>TVA %</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, idx) => (
              <tr key={idx}>
                <td>{l.reference}</td>
                <td>{l.designation}</td>
                <td style={{ textAlign: 'right' }}>{l.quantity}</td>
                <td>{l.unit}</td>
                <td style={{ textAlign: 'right' }}>{Number(l.unitPriceHT).toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>{l.tva}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 20, textAlign: 'right', background: '#f7fafc', padding: '16px', borderRadius: '8px' }}>
          <div style={{ marginBottom: '8px' }}><strong>Total HT:</strong> {totals.totalHT.toFixed(2)} MAD</div>
          <div style={{ marginBottom: '8px' }}><strong>TVA:</strong> {totals.totalTVA.toFixed(2)} MAD</div>
          <div style={{ fontSize: '18px', color: '#667eea' }}><strong>Total TTC:</strong> {totals.totalTTC.toFixed(2)} MAD</div>
        </div>
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default function NewInvoice() {
  const [supplier, setSupplier] = useState({ name: '', address: '', ice: '', phone: '', email: '', contact: '' });
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [lines, setLines] = useState([{ ...emptyLine }]);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  function updateLine(idx, key, value) {
    setLines((prev) => prev.map((l, i) => i === idx ? { ...l, [key]: value } : l));
  }

  function addLine() {
    setLines((prev) => [...prev, { ...emptyLine }]);
  }

  function removeLine(idx) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { supplier, date, lines: lines.map((l) => ({ ...l, quantity: Number(l.quantity), unitPriceHT: Number(l.unitPriceHT), tva: Number(l.tva) })) };
      const { data } = await api.post('/invoices', payload);
      window.location.href = `${import.meta.env.VITE_API_URL}${data.pdf.url}`;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h3>Créer une nouvelle facture</h3>
      <form onSubmit={handleSubmit}>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Informations Fournisseur</legend>
          <div className="form-grid">
            <input className="form-input" placeholder="Nom de l'entreprise" value={supplier.name} onChange={(e) => setSupplier({ ...supplier, name: e.target.value })} required />
            <input className="form-input" placeholder="Interlocuteur" value={supplier.contact} onChange={(e) => setSupplier({ ...supplier, contact: e.target.value })} required />
            <input className="form-input" placeholder="Adresse complète" value={supplier.address} onChange={(e) => setSupplier({ ...supplier, address: e.target.value })} required />
            <input className="form-input" placeholder="Numéro ICE" value={supplier.ice} onChange={(e) => setSupplier({ ...supplier, ice: e.target.value })} required />
            <input className="form-input" placeholder="Téléphone" value={supplier.phone} onChange={(e) => setSupplier({ ...supplier, phone: e.target.value })} required />
            <input className="form-input" placeholder="Adresse email" type="email" value={supplier.email} onChange={(e) => setSupplier({ ...supplier, email: e.target.value })} required />
          </div>
        </fieldset>

        <div className="form-group">
          <label className="form-label">Date de la facture:</label>
          <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ maxWidth: '200px' }} />
        </div>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Lignes de commande</legend>
          <div className="column-headers">
            <div>Référence</div>
            <div>Désignation</div>
            <div>Quantité</div>
            <div>Unité</div>
            <div>Prix HT</div>
            <div>TVA %</div>
            <div>Action</div>
          </div>
          {lines.map((l, idx) => (
            <div key={idx} className="line-item">
              <input className="form-input" placeholder="Référence" value={l.reference} onChange={(e) => updateLine(idx, 'reference', e.target.value)} required />
              <input className="form-input" placeholder="Désignation" value={l.designation} onChange={(e) => updateLine(idx, 'designation', e.target.value)} required />
              <input className="form-input" type="number" min="0" step="1" placeholder="Qté" value={l.quantity} onChange={(e) => updateLine(idx, 'quantity', e.target.value)} required />
              <input className="form-input" placeholder="Unité" value={l.unit} onChange={(e) => updateLine(idx, 'unit', e.target.value)} required />
              <input className="form-input" type="number" min="0" step="0.01" placeholder="PU HT" value={l.unitPriceHT} onChange={(e) => updateLine(idx, 'unitPriceHT', e.target.value)} required />
              <input className="form-input" type="number" min="0" step="1" placeholder="TVA %" value={l.tva} onChange={(e) => updateLine(idx, 'tva', e.target.value)} required />
              <button className="btn btn-danger" type="button" onClick={() => removeLine(idx)} disabled={lines.length === 1}>Supprimer</button>
            </div>
          ))}
          <div style={{ marginTop: '16px' }}>
            <button className="btn btn-secondary" type="button" onClick={addLine}>+ Ajouter une ligne</button>
          </div>
        </fieldset>

        <div className="btn-group">
          <button className="btn btn-secondary" type="button" onClick={() => setShowPreview(true)}>Aperçu</button>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Génération en cours...' : 'Générer la facture'}
          </button>
        </div>
      </form>

      {showPreview && (
        <Preview
          data={{ supplier, date, lines: lines.map((l) => ({ ...l, quantity: Number(l.quantity), unitPriceHT: Number(l.unitPriceHT), tva: Number(l.tva) })) }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}