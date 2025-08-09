import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export default function Home() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/invoices');
        setInvoices(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h3>Historique des factures</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Numéro</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Date</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Fournisseur</th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>Montant TTC</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{inv.invoiceNumber}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{dayjs(inv.date).format('DD/MM/YYYY')}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{inv.supplier?.name}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>{inv.totals?.totalTTC?.toFixed(2)} MAD</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <a href={`${import.meta.env.VITE_API_URL}${inv.pdf?.url}`} target="_blank" rel="noreferrer">Visualiser</a>
                  {' | '}
                  <a href={`${import.meta.env.VITE_API_URL}/invoices/${inv._id}/pdf`} target="_blank" rel="noreferrer">Télécharger</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}