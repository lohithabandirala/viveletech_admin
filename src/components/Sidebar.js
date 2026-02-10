import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Sidebar({ currentPage, onNavigate, userEmail }) {
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'participants', label: 'Participants', icon: '👥' },
        { id: 'events', label: 'Event Registrations', icon: '🎯' }
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>🎓 Vive Le Tech</h2>
                <p>Admin Panel</p>
            </div>

            <nav>
                <ul className="nav-menu">
                    {menuItems.map(item => (
                        <li key={item.id} className="nav-item">
                            <button
                                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                                onClick={() => onNavigate(item.id)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="logout-section">
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                }}>
                    <div style={{ marginBottom: '0.25rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                        Logged in as:
                    </div>
                    <div style={{ wordBreak: 'break-all' }}>
                        {userEmail}
                    </div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    <span>🚪</span>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
