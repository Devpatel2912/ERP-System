import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, X } from 'lucide-react';
import api from '../api/axios';
import './Employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    role: 'employee',
    department: '',
    designation: '',
    salary: '',
    join_date: new Date().toISOString().split('T')[0],
  });

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
    }
  };

  const fetchDepsAndDesigs = async () => {
    try {
      const [depsRes, desigsRes] = await Promise.all([
        api.get('/departments/'),
        api.get('/designations/')
      ]);
      setDepartments(depsRes.data);
      setDesignations(desigsRes.data);
    } catch (err) {
      console.error("Failed to load departments or designations", err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchEmployees();
      await fetchDepsAndDesigs();
      setLoading(false);
    };
    initData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.post('/add-employee/', formData);
      setShowModal(false);
      // Reset form
      setFormData({
        username: '', password: '', first_name: '', last_name: '', email: '',
        role: 'employee', department: '', designation: '', salary: '', 
        join_date: new Date().toISOString().split('T')[0]
      });
      // Refresh list
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert('Failed to add employee. Check console for details.');
    }
  };

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
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
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

      {/* Add Employee Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Employee</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddEmployee}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} />
                </div>
                <div className="form-group full-width">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={formData.role} onChange={handleInputChange}>
                    <option value="admin">Admin</option>
                    <option value="hr">HR</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                    <option value="sales">Sales</option>
                    <option value="inventory">Inventory</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select name="department" value={formData.department} onChange={handleInputChange}>
                    <option value="">Select Department...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <select name="designation" value={formData.designation} onChange={handleInputChange}>
                    <option value="">Select Designation...</option>
                    {designations.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Salary</label>
                  <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Join Date</label>
                  <input type="date" name="join_date" value={formData.join_date} onChange={handleInputChange} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
