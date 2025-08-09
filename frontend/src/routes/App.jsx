import { Link, Outlet, NavLink } from 'react-router-dom';

export default function App() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 20 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#111' }}>
          <h2>Buildium - Factures</h2>
        </Link>
        <nav style={{ display: 'flex', gap: 12 }}>
          <NavLink to="/" end>Historique</NavLink>
          <NavLink to="/new">Créer une facture</NavLink>
        </nav>
      </header>
      <main style={{ marginTop: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}