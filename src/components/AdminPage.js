import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const AdminPage = () => {
  const [medicineName, setMedicineName] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ status: '', medicines_count: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await axios.get(`${API_URL}/health`);
      setStats(response.data);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!medicineName.trim()) return;
    
    setIsLoading(true);
    setStatus({ type: 'info', message: 'Adding medicine...' });
    
    try {
      const response = await axios.post(`${API_URL}/add`, {
        medicine: medicineName.trim()
      });
      
      setStatus({
        type: response.data.status === 'success' ? 'success' : 
              response.data.status === 'exists' ? 'warning' : 'error',
        message: response.data.message
      });
      
      if (response.data.status === 'success') {
        setMedicineName('');
        loadStats(); // Refresh stats after successful addition
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Error adding medicine. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-md-12 mb-4">
          <h1 className="display-5">
            <i className="fas fa-cog text-primary me-2"></i>Admin Panel
          </h1>
          <p className="lead">Manage medicine database and view statistics.</p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-plus-circle me-2"></i>Add New Medicine
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="medicine-name" className="form-label">Medicine Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="medicine-name"
                    placeholder="Enter medicine name"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    required
                  />
                  <div className="form-text">Medicine names are stored in lowercase for better searching.</div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><i className="fas fa-spinner fa-spin me-2"></i>Adding...</>
                  ) : (
                    <><i className="fas fa-save me-2"></i>Add Medicine</>
                  )}
                </button>
              </form>
              
              {status.message && (
                <div className={`alert mt-3 alert-${status.type === 'success' ? 'success' :
                                                    status.type === 'warning' ? 'warning' :
                                                    status.type === 'info' ? 'info' : 'danger'}`}>
                  <i className={`fas me-2 ${status.type === 'success' ? 'fa-check-circle' :
                                            status.type === 'warning' ? 'fa-exclamation-circle' :
                                            status.type === 'info' ? 'fa-spinner fa-spin' : 'fa-times-circle'}`}></i>
                  {status.message}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-pie me-2"></i>Database Statistics
              </h5>
            </div>
            <div className="card-body">
              {isLoadingStats ? (
                <div id="stats-loading">
                  <i className="fas fa-spinner fa-spin me-2"></i>Loading statistics...
                </div>
              ) : (
                <div id="stats-content">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="card bg-primary text-white text-center p-3">
                        <h2 id="medicine-count">{stats.medicines_count}</h2>
                        <p className="mb-0">Total Medicines</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card bg-success text-white text-center p-3">
                        <h2 id="system-status">{stats.status}</h2>
                        <p className="mb-0">System Status</p>
                      </div>
                    </div>
                  </div>
                  <div id="stats-last-updated" className="text-muted small mt-3">
                    Last updated: <span id="stats-timestamp">{lastUpdated}</span>
                  </div>
                  <button
                    id="refresh-stats"
                    className="btn btn-outline-primary btn-sm mt-2"
                    onClick={loadStats}
                    disabled={isLoadingStats}
                  >
                    <i className="fas fa-sync me-1"></i>Refresh
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-cogs me-2"></i>API Information
              </h5>
            </div>
            <div className="card-body">
              <table className="table">
                <tbody>
                  <tr>
                    <th style={{ width: '30%' }}>Search Endpoint</th>
                    <td><code>/search?query=medicine_name</code></td>
                  </tr>
                  <tr>
                    <th>Add Medicine Endpoint</th>
                    <td><code>POST /add</code> with JSON body <code>{`{"medicine": "medicine_name"}`}</code></td>
                  </tr>
                  <tr>
                    <th>Health Check Endpoint</th>
                    <td><code>/health</code></td>
                  </tr>
                  <tr>
                    <th>Backend Implementation</th>
                    <td>C++ Trie data structure with pybind11 Python bindings</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 