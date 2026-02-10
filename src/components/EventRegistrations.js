import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const EVENTS = [
    { id: 'cipherville', name: 'Cipherville', icon: '🔐' },
    { id: 'dsa-master', name: 'DSA Master', icon: '💻' },
    { id: 'ethitech-mania', name: 'Ethitech Mania', icon: '🎯' }
];

function EventRegistrations() {
    const [selectedEvent, setSelectedEvent] = useState('cipherville');
    const [registrations, setRegistrations] = useState([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [collegeFilter, setCollegeFilter] = useState('all');

    useEffect(() => {
        fetchRegistrations();
    }, [selectedEvent]);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, collegeFilter, registrations]);

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const registrationsSnapshot = await getDocs(collection(db, selectedEvent));
            const registrationsList = registrationsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRegistrations(registrationsList);
        } catch (error) {
            console.error('Error fetching registrations:', error);
            setRegistrations([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...registrations];

        // Apply college filter
        if (collegeFilter === 'cbit') {
            filtered = filtered.filter(r => r.college?.toUpperCase() === 'CBIT');
        } else if (collegeFilter === 'non-cbit') {
            filtered = filtered.filter(r => r.college?.toUpperCase() !== 'CBIT');
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(r =>
                r.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.phoneNumber?.includes(searchTerm) ||
                r.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredRegistrations(filtered);
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

    const currentEvent = EVENTS.find(e => e.id === selectedEvent);

    return (
        <div>
            <div className="page-header">
                <h1>🎯 Event Registrations</h1>
                <p>View registrations for each event</p>
            </div>

            {/* Event Selection */}
            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Select Event</h2>
                </div>
                <div className="card-body">
                    <div className="stats-grid">
                        {EVENTS.map(event => (
                            <div
                                key={event.id}
                                className={`stat-card ${selectedEvent === event.id ? 'active-event' : ''}`}
                                onClick={() => setSelectedEvent(event.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="stat-header">
                                    <span className="stat-title">{event.name}</span>
                                    <div className="stat-icon primary">{event.icon}</div>
                                </div>
                                <div className="stat-value">
                                    {selectedEvent === event.id ? registrations.length : '—'}
                                </div>
                                <div className="stat-label">
                                    {selectedEvent === event.id ? 'Registrations' : 'Click to view'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Statistics for Selected Event */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Total Registrations</span>
                        <div className="stat-icon primary">📝</div>
                    </div>
                    <div className="stat-value">{registrations.length}</div>
                    <div className="stat-label">For {currentEvent?.name}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">CBIT Students</span>
                        <div className="stat-icon success">🎓</div>
                    </div>
                    <div className="stat-value">
                        {registrations.filter(r => r.college?.toUpperCase() === 'CBIT').length}
                    </div>
                    <div className="stat-label">From CBIT</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Other Colleges</span>
                        <div className="stat-icon warning">🏫</div>
                    </div>
                    <div className="stat-value">
                        {registrations.filter(r => r.college?.toUpperCase() !== 'CBIT').length}
                    </div>
                    <div className="stat-label">External students</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Filtered Results</span>
                        <div className="stat-icon info">🔍</div>
                    </div>
                    <div className="stat-value">{filteredRegistrations.length}</div>
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
                                value={collegeFilter}
                                onChange={(e) => setCollegeFilter(e.target.value)}
                            >
                                <option value="all">All Colleges</option>
                                <option value="cbit">CBIT Only</option>
                                <option value="non-cbit">Other Colleges</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="search">Search</label>
                            <input
                                type="text"
                                id="search"
                                placeholder="Search by name, email, college, phone, or roll number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Registrations Table */}
            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">
                        {currentEvent?.icon} {currentEvent?.name} - Registrations
                    </h2>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : filteredRegistrations.length > 0 ? (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>College</th>
                                        <th>Branch</th>
                                        <th>Year</th>
                                        <th>Roll Number</th>
                                        <th>Source</th>
                                        <th>Registered At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRegistrations.map((registration, index) => (
                                        <tr key={registration.id}>
                                            <td>{index + 1}</td>
                                            <td>{registration.fullName}</td>
                                            <td>{registration.email}</td>
                                            <td>{registration.phoneNumber}</td>
                                            <td>
                                                <span className={`badge ${registration.college?.toUpperCase() === 'CBIT' ? 'success' : 'warning'}`}>
                                                    {registration.college}
                                                </span>
                                            </td>
                                            <td>{registration.branch || 'N/A'}</td>
                                            <td>{registration.year || 'N/A'}</td>
                                            <td>{registration.rollNumber || 'N/A'}</td>
                                            <td>{registration.registrationSource || 'N/A'}</td>
                                            <td>{formatDate(registration.registeredAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <h3>No registrations found</h3>
                            <p>
                                {searchTerm || collegeFilter !== 'all'
                                    ? 'Try adjusting your filters or search criteria.'
                                    : `No registrations yet for ${currentEvent?.name}.`}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EventRegistrations;
