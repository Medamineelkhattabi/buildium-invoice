import { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: 20, maxWidth: 900, width: '90%', maxHeight: '90%', overflow: 'auto' }}>
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
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 6 }}>Réf</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 6 }}>Désignation</th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 6 }}>Qté</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 6 }}>Unité</th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 6 }}>PU HT</th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 6 }}>TVA %</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, idx) => (
              <tr key={idx}>
                <td style={{ padding: 6 }}>{l.reference}</td>
                <td style={{ padding: 6 }}>{l.designation}</td>
                <td style={{ padding: 6, textAlign: 'right' }}>{l.quantity}</td>
                <td style={{ padding: 6 }}>{l.unit}</td>
                <td style={{ padding: 6, textAlign: 'right' }}>{Number(l.unitPriceHT).toFixed(2)}</td>
                <td style={{ padding: 6, textAlign: 'right' }}>{l.tva}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <div><strong>Total HT:</strong> {totals.totalHT.toFixed(2)} MAD</div>
          <div><strong>TVA:</strong> {totals.totalTVA.toFixed(2)} MAD</div>
          <div><strong>Total TTC:</strong> {totals.totalTTC.toFixed(2)} MAD</div>
        </div>
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <button onClick={onClose}>Fermer</button>
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
      <h3>Créer une facture</h3>
      <form onSubmit={handleSubmit}>
        <fieldset style={{ border: '1px solid #eee', padding: 12, marginBottom: 16 }}>
          <legend>Fournisseur</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input placeholder="Nom" value={supplier.name} onChange={(e) => setSupplier({ ...supplier, name: e.target.value })} required />
            <input placeholder="Interlocuteur" value={supplier.contact} onChange={(e) => setSupplier({ ...supplier, contact: e.target.value })} required />
            <input placeholder="Adresse" value={supplier.address} onChange={(e) => setSupplier({ ...supplier, address: e.target.value })} required />
            <input placeholder="ICE" value={supplier.ice} onChange={(e) => setSupplier({ ...supplier, ice: e.target.value })} required />
            <input placeholder="Téléphone" value={supplier.phone} onChange={(e) => setSupplier({ ...supplier, phone: e.target.value })} required />
            <input placeholder="Email" type="email" value={supplier.email} onChange={(e) => setSupplier({ ...supplier, email: e.target.value })} required />
          </div>
        </fieldset>

        <div style={{ marginBottom: 16 }}>
          <label>Date: </label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <fieldset style={{ border: '1px solid #eee', padding: 12 }}>
          <legend>Lignes de commande</legend>
          {lines.map((l, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 0.7fr 0.7fr 1fr 0.7fr auto', gap: 8, marginBottom: 8 }}>
              <input placeholder="Référence" value={l.reference} onChange={(e) => updateLine(idx, 'reference', e.target.value)} required />
              <input placeholder="Désignation" value={l.designation} onChange={(e) => updateLine(idx, 'designation', e.target.value)} required />
              <input type="number" min="0" step="1" placeholder="Qté" value={l.quantity} onChange={(e) => updateLine(idx, 'quantity', e.target.value)} required />
              <input placeholder="Unité" value={l.unit} onChange={(e) => updateLine(idx, 'unit', e.target.value)} required />
              <input type="number" min="0" step="0.01" placeholder="PU HT" value={l.unitPriceHT} onChange={(e) => updateLine(idx, 'unitPriceHT', e.target.value)} required />
              <input type="number" min="0" step="1" placeholder="TVA %" value={l.tva} onChange={(e) => updateLine(idx, 'tva', e.target.value)} required />
              <button type="button" onClick={() => removeLine(idx)}>Supprimer</button>
            </div>
          ))}
          <div>
            <button type="button" onClick={addLine}>+ Ajouter une ligne</button>
          </div>
        </fieldset>

        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button type="button" onClick={() => setShowPreview(true)}>Aperçu</button>
          <button type="submit" disabled={submitting}>{submitting ? 'Génération...' : 'Générer la facture'}</button>
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