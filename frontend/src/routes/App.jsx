import { Link, Outlet, NavLink } from 'react-router-dom';

export default function App({ user, onLogout }) {
  return (
    <div className="app-container">
      <header className="header">
        <Link to="/" className="logo-title">
          Buildium - Factures
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <nav className="nav">
            <NavLink to="/" end className="nav-link">Historique</NavLink>
            <NavLink to="/new" className="nav-link">Créer</NavLink>
            <NavLink to="/reports" className="nav-link">Rapports</NavLink>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: '#6c757d' }}>{user?.name}</span>
            <button className="btn btn-secondary" onClick={onLogout} style={{ padding: '6px 12px', fontSize: '12px' }}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}