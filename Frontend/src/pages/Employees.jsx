import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import api from '../api/axios';
import './Employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get('/employees/');
        setEmployees(response.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Unauthorized. Please login again.');
        } else {
          setError('Failed to fetch employees data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <div className="employees-container">
        <div className="loading-spinner">Loading employees...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employees-container">
        <div className="auth-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="employees-container">
      <div className="header-section">
        <div className="header-content">
          <h1>Employees Directory</h1>
          <p className="subtitle">Manage and view all company employees.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">
            <Plus size={18} /> Add Employee
          </button>
        </div>
      </div>

      <div className="glass-panel toolbar">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search employees..." />
        </div>
        <button className="btn btn-secondary">
          <Filter size={18} /> Filter
        </button>
      </div>

      <div className="glass-panel table-container">
        {employees.length === 0 ? (
          <p className="no-data">No employees found.</p>
        ) : (
          <div className="table-responsive">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Salary</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="emp-cell">
                        {emp.photo ? (
                          <img src={`http://127.0.0.1:8000${emp.photo}`} alt={emp.user?.username} className="emp-photo" />
                        ) : (
                          <div className="emp-photo-placeholder">
                            {emp.user?.first_name?.charAt(0) || emp.user?.username?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div className="emp-info">
                          <span className="emp-name">
                            {emp.user?.first_name} {emp.user?.last_name}
                            {!emp.user?.first_name && !emp.user?.last_name && emp.user?.username}
                          </span>
                          <span className="emp-email">{emp.user?.email || 'No email provided'}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className={`role-badge role-${emp.user?.role}`}>{emp.user?.role}</span></td>
                    <td>{emp.department_details?.name || 'Unassigned'}</td>
                    <td>{emp.designation_details?.name || 'Unassigned'}</td>
                    <td className="salary-col">${emp.salary || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;
