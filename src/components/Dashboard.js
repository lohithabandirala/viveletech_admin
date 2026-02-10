import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

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
                setStats(statsDoc.data());
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
                    {stats.events ? (
                        <div className="stats-grid">
                            {Object.entries(stats.events).map(([eventName, count]) => (
                                <div key={eventName} className="stat-card">
                                    <div className="stat-header">
                                        <span className="stat-title">{formatEventName(eventName)}</span>
                                        <div className="stat-icon primary">🎯</div>
                                    </div>
                                    <div className="stat-value">{count}</div>
                                    <div className="stat-label">Registrations</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No event data available</p>
                        </div>
                    )}
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

// Helper function to format event names
function formatEventName(eventName) {
    return eventName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default Dashboard;
