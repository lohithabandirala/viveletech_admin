import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function Participants() {
    const [participants, setParticipants] = useState([]);
    const [filteredParticipants, setFilteredParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, cbit, non-cbit
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchParticipants();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filter, searchTerm, participants]);

    const fetchParticipants = async () => {
        try {
            const participantsSnapshot = await getDocs(collection(db, 'participants'));
            const participantsList = participantsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setParticipants(participantsList);
        } catch (error) {
            console.error('Error fetching participants:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...participants];

        // Apply college filter
        if (filter === 'cbit') {
            filtered = filtered.filter(p => p.isCBIT === true);
        } else if (filter === 'non-cbit') {
            filtered = filtered.filter(p => p.isCBIT === false);
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.college?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredParticipants(filtered);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1>👥 Participants</h1>
                <p>Manage and view all registered participants</p>
            </div>

            {/* Statistics */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Total Participants</span>
                        <div className="stat-icon primary">👥</div>
                    </div>
                    <div className="stat-value">{participants.length}</div>
                    <div className="stat-label">Unique participants</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">CBIT Students</span>
                        <div className="stat-icon success">🎓</div>
                    </div>
                    <div className="stat-value">
                        {participants.filter(p => p.isCBIT).length}
                    </div>
                    <div className="stat-label">From CBIT</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Other Colleges</span>
                        <div className="stat-icon warning">🏫</div>
                    </div>
                    <div className="stat-value">
                        {participants.filter(p => !p.isCBIT).length}
                    </div>
                    <div className="stat-label">External students</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Filtered Results</span>
                        <div className="stat-icon info">🔍</div>
                    </div>
                    <div className="stat-value">{filteredParticipants.length}</div>
                    <div className="stat-label">Matching criteria</div>
                </div>
            </div>

            {/* Filters */}
            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Filters</h2>
                </div>
                <div className="card-body">
                    <div className="filters">
                        <div className="filter-group">
                            <label htmlFor="college-filter">College Type</label>
                            <select
                                id="college-filter"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Participants</option>
                                <option value="cbit">CBIT Only</option>
                                <option value="non-cbit">Other Colleges</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="search">Search</label>
                            <input
                                type="text"
                                id="search"
                                placeholder="Search by email or college..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Participants Table */}
            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Participant List</h2>
                </div>
                <div className="card-body">
                    {filteredParticipants.length > 0 ? (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Email</th>
                                        <th>College</th>
                                        <th>Type</th>
                                        <th>First Registered</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredParticipants.map((participant, index) => (
                                        <tr key={participant.id}>
                                            <td>{index + 1}</td>
                                            <td>{participant.email}</td>
                                            <td>{participant.college || 'N/A'}</td>
                                            <td>
                                                <span className={`badge ${participant.isCBIT ? 'success' : 'warning'}`}>
                                                    {participant.isCBIT ? 'CBIT' : 'External'}
                                                </span>
                                            </td>
                                            <td>{formatDate(participant.firstRegisteredAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <h3>No participants found</h3>
                            <p>Try adjusting your filters or search criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Participants;
