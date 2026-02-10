import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Participants from './components/Participants';
import EventRegistrations from './components/EventRegistrations';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    // Auth state will be updated by onAuthStateChanged
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'participants':
        return <Participants />;
      case 'events':
        return <EventRegistrations />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        userEmail={user.email}
      />
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
