import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EVENTS = [
    { id: 'cipherville', name: 'Cipherville', icon: '🔐' },
    { id: 'dsa-master', name: 'DSA Master', icon: '💻' },
    { id: 'ethitech-mania', name: 'Ethitech Mania', icon: '🎯' }
];

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

function EventRegistrations() {
    const [selectedEvent, setSelectedEvent] = useState('all');
    const [allRegistrations, setAllRegistrations] = useState({});
    const [displayedRegistrations, setDisplayedRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [collegeFilter, setCollegeFilter] = useState('all');
    const [branchFilter, setBranchFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [eventCounts, setEventCounts] = useState({});
    const [branches, setBranches] = useState([]);
    const [years, setYears] = useState([]);

    useEffect(() => {
        fetchEventCounts();
        fetchAllRegistrations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        applyFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEvent, searchTerm, collegeFilter, branchFilter, yearFilter, allRegistrations]);

    const fetchEventCounts = async () => {
        try {
            const statsDoc = await getDoc(doc(db, 'counters', 'stats'));
            if (statsDoc.exists()) {
                const stats = statsDoc.data();
                setEventCounts(stats.events || {});
            }
        } catch (error) {
            console.error('Error fetching event counts:', error);
        }
    };

    const fetchAllRegistrations = async () => {
        setLoading(true);
        try {
            const allRegs = {};
            let allBranches = new Set();
            let allYears = new Set();

            for (const event of EVENTS) {
                const registrationsSnapshot = await getDocs(collection(db, event.id));
                const registrationsList = registrationsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    eventId: event.id,
                    eventName: event.name,
                    ...doc.data()
                }));
                allRegs[event.id] = registrationsList;

                // Collect unique branches and years
                registrationsList.forEach(reg => {
                    if (reg.branch) allBranches.add(reg.branch);
                    if (reg.year) allYears.add(reg.year);
                });
            }

            setAllRegistrations(allRegs);
            setBranches(Array.from(allBranches).sort());
            setYears(Array.from(allYears).sort());
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [];

        // Get registrations based on selected event
        if (selectedEvent === 'all') {
            // Combine all events
            filtered = Object.values(allRegistrations).flat();
        } else {
            filtered = allRegistrations[selectedEvent] || [];
        }

        // Apply college filter
        if (collegeFilter === 'cbit') {
            filtered = filtered.filter(r => r.college?.toUpperCase() === 'CBIT');
        } else if (collegeFilter === 'non-cbit') {
            filtered = filtered.filter(r => r.college?.toUpperCase() !== 'CBIT');
        }

        // Apply branch filter
        if (branchFilter !== 'all') {
            filtered = filtered.filter(r => r.branch === branchFilter);
        }

        // Apply year filter
        if (yearFilter !== 'all') {
            filtered = filtered.filter(r => r.year === yearFilter);
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

        // Sort by name (ascending order)
        filtered.sort((a, b) => {
            const nameA = a.fullName?.toLowerCase() || '';
            const nameB = b.fullName?.toLowerCase() || '';
            return nameA.localeCompare(nameB);
        });

        setDisplayedRegistrations(filtered);
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

    // Export to Excel
    const exportToExcel = (eventId = null) => {
        let dataToExport = [];
        let fileName = '';

        if (eventId) {
            // Export specific event
            dataToExport = allRegistrations[eventId] || [];
            const event = EVENTS.find(e => e.id === eventId);
            fileName = `${event?.name || eventId}_registrations.xlsx`;
        } else {
            // Export all events combined
            dataToExport = Object.values(allRegistrations).flat();
            fileName = 'all_events_registrations.xlsx';
        }

        // Prepare data for Excel
        const excelData = dataToExport.map((reg, index) => ({
            '#': index + 1,
            'Event': reg.eventName,
            'Full Name': reg.fullName,
            'Email': reg.email,
            'Phone': reg.phoneNumber,
            'College': reg.college,
            'Branch': reg.branch || 'N/A',
            'Year': reg.year || 'N/A',
            'Roll Number': reg.rollNumber || 'N/A',
            'Source': reg.registrationSource || 'N/A',
            'Registered At': formatDate(reg.registeredAt)
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, fileName);
    };

    // Export to CSV
    const exportToCSV = (eventId = null) => {
        let dataToExport = [];
        let fileName = '';

        if (eventId) {
            dataToExport = allRegistrations[eventId] || [];
            const event = EVENTS.find(e => e.id === eventId);
            fileName = `${event?.name || eventId}_registrations.csv`;
        } else {
            dataToExport = Object.values(allRegistrations).flat();
            fileName = 'all_events_registrations.csv';
        }

        const csvData = dataToExport.map((reg, index) => ({
            '#': index + 1,
            'Event': reg.eventName,
            'Full Name': reg.fullName,
            'Email': reg.email,
            'Phone': reg.phoneNumber,
            'College': reg.college,
            'Branch': reg.branch || 'N/A',
            'Year': reg.year || 'N/A',
            'Roll Number': reg.rollNumber || 'N/A',
            'Source': reg.registrationSource || 'N/A',
            'Registered At': formatDate(reg.registeredAt)
        }));

        const ws = XLSX.utils.json_to_sheet(csvData);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, fileName);
    };

    // Calculate branch-wise data for charts
    const getBranchWiseData = () => {
        const branchCounts = {};
        displayedRegistrations.forEach(reg => {
            const branch = reg.branch || 'Not Specified';
            branchCounts[branch] = (branchCounts[branch] || 0) + 1;
        });
        return Object.entries(branchCounts).map(([name, value]) => ({ name, value }));
    };

    // Calculate year-wise data for charts
    const getYearWiseData = () => {
        const yearCounts = {};
        displayedRegistrations.forEach(reg => {
            const year = reg.year || 'Not Specified';
            yearCounts[year] = (yearCounts[year] || 0) + 1;
        });
        return Object.entries(yearCounts).map(([name, value]) => ({ name, value }));
    };

    const currentEvent = selectedEvent === 'all'
        ? { name: 'All Events', icon: '🎯' }
        : EVENTS.find(e => e.id === selectedEvent);

    const getTotalCount = () => {
        if (selectedEvent === 'all') {
            return Object.values(allRegistrations).flat().length;
        }
        return allRegistrations[selectedEvent]?.length || 0;
    };

    return (
        <div>
            <div className="page-header">
                <h1>🎯 Event Registrations</h1>
                <p>View and manage registrations for all events</p>
            </div>

            {/* Event Selection */}
            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Select Event</h2>
                </div>
                <div className="card-body">
                    <div className="stats-grid">
                        {/* All Events Option */}
                        <div
                            className={`stat-card ${selectedEvent === 'all' ? 'active-event' : ''}`}
                            onClick={() => setSelectedEvent('all')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="stat-header">
                                <span className="stat-title">All Events</span>
                                <div className="stat-icon primary">🎯</div>
                            </div>
                            <div className="stat-value">
                                {Object.values(allRegistrations).flat().length}
                            </div>
                            <div className="stat-label">
                                {selectedEvent === 'all' ? 'Combined View (Selected)' : 'Combined View'}
                            </div>
                        </div>

                        {/* Individual Events */}
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
                                    {eventCounts[event.id] || 0}
                                </div>
                                <div className="stat-label">
                                    {selectedEvent === event.id ? 'Registrations (Selected)' : 'Registrations'}
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
                    <div className="stat-value">{getTotalCount()}</div>
                    <div className="stat-label">For {currentEvent?.name}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">CBIT Students</span>
                        <div className="stat-icon success">🎓</div>
                    </div>
                    <div className="stat-value">
                        {displayedRegistrations.filter(r => r.college?.toUpperCase() === 'CBIT').length}
                    </div>
                    <div className="stat-label">From CBIT</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Other Colleges</span>
                        <div className="stat-icon warning">🏫</div>
                    </div>
                    <div className="stat-value">
                        {displayedRegistrations.filter(r => r.college?.toUpperCase() !== 'CBIT').length}
                    </div>
                    <div className="stat-label">External students</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Filtered Results</span>
                        <div className="stat-icon info">🔍</div>
                    </div>
                    <div className="stat-value">{displayedRegistrations.length}</div>
                    <div className="stat-label">Matching criteria</div>
                </div>
            </div>

            {/* Filters */}
            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Filters & Search</h2>
                </div>
                <div className="card-body">
                    <div className="filters">
                        <div className="filter-group">
                            <label htmlFor="search">🔍 Search</label>
                            <input
                                type="text"
                                id="search"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="college-filter">🏫 College Type</label>
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
                            <label htmlFor="branch-filter">📚 Branch</label>
                            <select
                                id="branch-filter"
                                value={branchFilter}
                                onChange={(e) => setBranchFilter(e.target.value)}
                            >
                                <option value="all">All Branches</option>
                                {branches.map(branch => (
                                    <option key={branch} value={branch}>{branch}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="year-filter">📅 Year</label>
                            <select
                                id="year-filter"
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                            >
                                <option value="all">All Years</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Options */}
            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">📥 Export Data</h2>
                </div>
                <div className="card-body">
                    <div className="export-buttons">
                        <div className="export-section">
                            <h3>Export All Events</h3>
                            <div className="button-group">
                                <button className="btn btn-success" onClick={() => exportToExcel()}>
                                    📊 Export All to Excel
                                </button>
                                <button className="btn btn-primary" onClick={() => exportToCSV()}>
                                    📄 Export All to CSV
                                </button>
                            </div>
                        </div>

                        <div className="export-section">
                            <h3>Export Individual Events</h3>
                            <div className="event-export-grid">
                                {EVENTS.map(event => (
                                    <div key={event.id} className="event-export-item">
                                        <span>{event.icon} {event.name}</span>
                                        <div className="button-group">
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => exportToExcel(event.id)}
                                            >
                                                Excel
                                            </button>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => exportToCSV(event.id)}
                                            >
                                                CSV
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Visualization */}
            {displayedRegistrations.length > 0 && (
                <div className="content-card">
                    <div className="card-header">
                        <h2 className="card-title">📊 Data Visualization</h2>
                    </div>
                    <div className="card-body">
                        <div className="charts-grid">
                            {/* Branch-wise Chart */}
                            <div className="chart-container">
                                <h3>Branch-wise Participation</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={getBranchWiseData()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" fill="#6366f1" name="Participants" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Year-wise Chart */}
                            <div className="chart-container">
                                <h3>Year-wise Participation</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={getYearWiseData()}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {getYearWiseData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                    ) : displayedRegistrations.length > 0 ? (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        {selectedEvent === 'all' && <th>Event</th>}
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
                                    {displayedRegistrations.map((registration, index) => (
                                        <tr key={`${registration.eventId}-${registration.id}`}>
                                            <td>{index + 1}</td>
                                            {selectedEvent === 'all' && (
                                                <td>
                                                    <span className="badge info">{registration.eventName}</span>
                                                </td>
                                            )}
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
                                {searchTerm || collegeFilter !== 'all' || branchFilter !== 'all' || yearFilter !== 'all'
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
