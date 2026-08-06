import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Check, X } from 'lucide-react';
import api from '../api/axios';
import './Leave.css';

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await api.get('/all-leaves/'); // Admin views all leaves
        setLeaves(response.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Unauthorized. Please login again.');
        } else {
          setError('Failed to fetch leave requests.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/approve-leave/${id}/`);
      setLeaves(leaves.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
    } catch (err) {
      alert("Failed to approve leave.");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/reject-leave/${id}/`);
      setLeaves(leaves.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));
    } catch (err) {
      alert("Failed to reject leave.");
    }
  };

  if (loading) {
    return (
      <div className="leave-container">
        <div className="loading-spinner">Loading leave requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leave-container">
        <div className="auth-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="leave-container">
      <div className="header-section">
        <div className="header-content">
          <h1>Leave Management</h1>
          <p className="subtitle">Manage and review employee leave requests.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">
            <Plus size={18} /> Apply Leave
          </button>
        </div>
      </div>

      <div className="glass-panel table-container">
        {leaves.length === 0 ? (
          <p className="no-data">No leave requests found.</p>
        ) : (
          <div className="table-responsive">
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td style={{fontWeight: 600}}>Employee #{leave.employee}</td>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)'}}>
                        <CalendarIcon size={16} />
                        {leave.start_date} to {leave.end_date}
                      </div>
                    </td>
                    <td style={{maxWidth: '250px', whiteSpace: 'normal', color: 'var(--text-muted)'}}>
                      {leave.reason}
                    </td>
                    <td>{new Date(leave.applied_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      {leave.status === 'Pending' && (
                        <div style={{display: 'flex', gap: '8px'}}>
                           <button onClick={() => handleApprove(leave.id)} className="icon-btn" style={{width: '32px', height: '32px', color: 'var(--success)', borderColor: 'var(--success)'}}>
                              <Check size={16} />
                           </button>
                           <button onClick={() => handleReject(leave.id)} className="icon-btn" style={{width: '32px', height: '32px', color: 'var(--danger)', borderColor: 'var(--danger)'}}>
                              <X size={16} />
                           </button>
                        </div>
                      )}
                    </td>
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

export default Leave;
