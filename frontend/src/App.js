import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DonorRegister from './pages/DonorRegister';
import RequestBlood from './pages/RequestBlood';
import DonorMap from './pages/DonorMap';
import MyRequests from './pages/MyRequests';
import About from './pages/About'; // 🩸 Added About Page
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { authAPI } = await import('./api/Api');
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />

        <Routes>
          {/* 🩸 Public Routes */}
          <Route path="/about" element={<About />} />
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />

          {/* 🩸 Protected Routes */}
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/donor/register" element={user ? <DonorRegister user={user} /> : <Navigate to="/login" />} />
          <Route path="/request/blood" element={user ? <RequestBlood user={user} /> : <Navigate to="/login" />} />
          <Route path="/donors/map" element={<DonorMap />} />
          <Route path="/my-requests" element={user ? <MyRequests user={user} /> : <Navigate to="/login" />} />

          {/* 🩸 Default route — set About page as homepage */}
          <Route path="/" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


