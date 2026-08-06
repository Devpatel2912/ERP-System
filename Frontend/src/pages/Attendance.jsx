import React, { useState, useEffect } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import api from '../api/axios';
import './Attendance.css';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const currentUserRole = localStorage.getItem('role');

  const fetchAttendance = async () => {
    try {
      const endpoint = currentUserRole === 'admin' ? '/all-attendance/' : '/my-attendance/';
      const response = await api.get(endpoint);
      setAttendance(response.data);
    } catch (err) {
      setError('Failed to fetch attendance records');
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchAttendance();
      setLoading(false);
    };
    initData();
  }, []);

  const handleCheckIn = async () => {
    try {
      const res = await api.post('/mark-attendance/');
      alert(res.data.message);
      fetchAttendance();
    } catch (err) {
      alert('Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await api.post('/checkout/');
      alert(res.data.message);
      fetchAttendance();
    } catch (err) {
      alert('Failed to check out');
    }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner">Loading...</div></div>;
  if (error) return <div className="page-container"><div className="auth-error">{error}</div></div>;

  return (
    <div className="page-container">
      <div className="header-section">
        <div className="header-content">
          <h1>Attendance</h1>
          <p className="subtitle">View and manage your attendance.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" style={{marginRight: '12px'}} onClick={handleCheckIn}>
            <LogIn size={18} /> Check In
          </button>
          <button className="btn btn-secondary" onClick={handleCheckOut}>
            <LogOut size={18} /> Check Out
          </button>
        </div>
      </div>

      <div className="glass-panel table-container">
        {attendance.length === 0 ? (
          <p className="no-data">No attendance records found.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  {currentUserRole === 'admin' && <th>Employee</th>}
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Hours Worked</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((rec) => (
                  <tr key={rec.id}>
                    {currentUserRole === 'admin' && (
                      <td>{rec.employee_details?.user?.username || `Employee #${rec.employee}`}</td>
                    )}
                    <td>{rec.date}</td>
                    <td>{rec.check_in || '-'}</td>
                    <td>{rec.check_out || '-'}</td>
                    <td><span className={`status-badge status-${rec.status?.toLowerCase()}`}>{rec.status}</span></td>
                    <td>{rec.working_hours ? `${rec.working_hours} hrs` : '-'}</td>
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

export default Attendance;
