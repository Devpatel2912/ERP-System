import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import api from '../api/axios';
import './Timesheets.css';

const Timesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const currentUserRole = localStorage.getItem('role');

  const [formData, setFormData] = useState({
    employee: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    task: ''
  });

  const fetchTimesheets = async () => {
    try {
      const endpoint = currentUserRole === 'admin' ? '/all-timesheets/' : '/my-timesheet/';
      const response = await api.get(endpoint);
      setTimesheets(response.data);
    } catch (err) {
      setError('Failed to fetch timesheets');
    }
  };

  const fetchEmployees = async () => {
    if (currentUserRole !== 'admin') return;
    try {
      const response = await api.get('/employees/');
      setEmployees(response.data);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchTimesheets();
      await fetchEmployees();
      setLoading(false);
    };
    initData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTimesheet = async (e) => {
    e.preventDefault();
    try {
      await api.post('/add-timesheet/', formData);
      setShowModal(false);
      setFormData({
        employee: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        task: ''
      });
      fetchTimesheets();
    } catch (err) {
      alert('Failed to add timesheet');
    }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner">Loading...</div></div>;
  if (error) return <div className="page-container"><div className="auth-error">{error}</div></div>;

  return (
    <div className="page-container">
      <div className="header-section">
        <div className="header-content">
          <h1>Timesheets</h1>
          <p className="subtitle">Track and log your work hours.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Add Timesheet
          </button>
        </div>
      </div>

      <div className="glass-panel table-container">
        {timesheets.length === 0 ? (
          <p className="no-data">No timesheets logged.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  {currentUserRole === 'admin' && <th>Employee</th>}
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Task Details</th>
                </tr>
              </thead>
              <tbody>
                {timesheets.map((ts) => (
                  <tr key={ts.id}>
                    {currentUserRole === 'admin' && (
                      <td>{ts.employee_details?.user?.username || `Employee #${ts.employee}`}</td>
                    )}
                    <td>{ts.date}</td>
                    <td>{ts.hours} hrs</td>
                    <td className="task-cell">{ts.task}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Timesheet</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddTimesheet}>
              <div className="form-grid">
                {currentUserRole === 'admin' && (
                  <div className="form-group full-width">
                    <label>Employee</label>
                    <select name="employee" value={formData.employee} onChange={handleInputChange} required>
                      <option value="">Select Employee...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.user?.first_name} {emp.user?.last_name} ({emp.user?.username})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Hours Logged</label>
                  <input type="number" step="0.5" min="0" name="hours" value={formData.hours} onChange={handleInputChange} required />
                </div>
                <div className="form-group full-width">
                  <label>Task Details</label>
                  <textarea name="task" value={formData.task} onChange={handleInputChange} rows="3" required placeholder="Describe what you worked on..." />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Timesheet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timesheets;
