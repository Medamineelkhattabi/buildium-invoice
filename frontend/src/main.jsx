import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import axios from 'axios'
import './index.css'
import './App.css'
import App from './routes/App.jsx'
import Home from './routes/Home.jsx'
import NewInvoice from './routes/NewInvoice.jsx'
import ReportsPage from './routes/Reports.jsx'
import Login from './routes/Login.jsx'

function AuthApp() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  const router = createBrowserRouter([
    {
      path: '/',
      element: <App user={user} onLogout={handleLogout} />,
      children: [
        { index: true, element: <Home /> },
        { path: 'new', element: <NewInvoice /> },
        { path: 'reports', element: <ReportsPage /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthApp />
  </React.StrictMode>,
)
