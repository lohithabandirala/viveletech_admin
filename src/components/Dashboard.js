import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const EVENTS = [
    { id: 'cipherville', name: 'Cipherville', icon: '🔐' },
    { id: 'dsa-master', name: 'DSA Master', icon: '💻' },
    { id: 'ethitech-mania', name: 'Ethitech Mania', icon: '🎯' }
];

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const statsDoc = await getDoc(doc(db, 'counters', 'stats'));
            if (statsDoc.exists()) {
                console.log("Stats fetched:", statsDoc.data());
                setStats(statsDoc.data());
            } else {
                console.log("No stats document found");
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h3>No statistics available</h3>
                <p>Statistics will appear here once registrations are recorded.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1>📊 Dashboard</h1>
                <p>Overview of all event registrations and statistics</p>
            </div>

            {/* Main Statistics */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Total Registrations</span>
                        <div className="stat-icon primary">📝</div>
                    </div>
                    <div className="stat-value">{stats.totalRegistrations || 0}</div>
                    <div className="stat-label">All event registrations</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Unique Participants</span>
                        <div className="stat-icon success">👥</div>
                    </div>
                    <div className="stat-value">{stats.uniqueRegistrations || 0}</div>
                    <div className="stat-label">Individual participants</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">CBIT Students</span>
                        <div className="stat-icon info">🎓</div>
                    </div>
                    <div className="stat-value">{stats.uniqueCbitCount || 0}</div>
                    <div className="stat-label">From CBIT college</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Other Colleges</span>
                        <div className="stat-icon warning">🏫</div>
                    </div>
                    <div className="stat-value">{stats.uniqueNonCbitCount || 0}</div>
                    <div className="stat-label">From other colleges</div>
                </div>
            </div>

            {/* Event-wise Statistics */}
            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Event-wise Registrations</h2>
                </div>
                <div className="card-body">
                    <div className="stats-grid">
                        {EVENTS.map(event => {
                            const count = stats.events ? (stats.events[event.id] || 0) : 0;
                            return (
                                <div key={event.id} className="stat-card">
                                    <div className="stat-header">
                                        <span className="stat-title">{event.name}</span>
                                        <div className="stat-icon primary">{event.icon}</div>
                                    </div>
                                    <div className="stat-value">{count}</div>
                                    <div className="stat-label">Registrations</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* College Distribution */}
            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">College Distribution</h2>
                </div>
                <div className="card-body">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-header">
                                <span className="stat-title">CBIT Percentage</span>
                                <div className="stat-icon success">📊</div>
                            </div>
                            <div className="stat-value">
                                {stats.uniqueRegistrations > 0
                                    ? Math.round((stats.uniqueCbitCount / stats.uniqueRegistrations) * 100)
                                    : 0}%
                            </div>
                            <div className="stat-label">
                                {stats.uniqueCbitCount} out of {stats.uniqueRegistrations}
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-header">
                                <span className="stat-title">Other Colleges %</span>
                                <div className="stat-icon warning">📊</div>
                            </div>
                            <div className="stat-value">
                                {stats.uniqueRegistrations > 0
                                    ? Math.round((stats.uniqueNonCbitCount / stats.uniqueRegistrations) * 100)
                                    : 0}%
                            </div>
                            <div className="stat-label">
                                {stats.uniqueNonCbitCount} out of {stats.uniqueRegistrations}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



export default Dashboard;
