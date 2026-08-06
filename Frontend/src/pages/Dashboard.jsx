import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Clock, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState({
    total_employees: 0,
    total_sales: 0,
    today_attendance: 0,
    present_today: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/');
        setData(response.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Unauthorized. Please login again.');
        } else {
          setError('Failed to fetch dashboard data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="auth-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="header-section">
        <h1>Dashboard Overview</h1>
        <p className="subtitle">Welcome back! Here is your company overview for today.</p>
      </div>

      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <h3>Total Employees</h3>
            <div className="stat-icon"><Users size={24} /></div>
          </div>
          <p className="stat-value">{data.total_employees || 0}</p>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <h3>Total Sales</h3>
            <div className="stat-icon" style={{color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)'}}>
              <DollarSign size={24} />
            </div>
          </div>
          <p className="stat-value">${data.total_sales || 0}</p>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <h3>Today's Attendance</h3>
            <div className="stat-icon" style={{color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)'}}>
              <Clock size={24} />
            </div>
          </div>
          <p className="stat-value">{data.today_attendance || 0}</p>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <h3>Present Today</h3>
            <div className="stat-icon" style={{color: 'var(--secondary)', background: 'rgba(56, 189, 248, 0.1)'}}>
              <CheckCircle size={24} />
            </div>
          </div>
          <p className="stat-value">{data.present_today || 0}</p>
        </div>
      </div>

      <div className="charts-section">
        <div className="glass-panel chart-placeholder">
          <h3>Payroll Summary</h3>
          <div className="placeholder-content">
            Chart Area
          </div>
        </div>
        <div className="glass-panel chart-placeholder">
          <h3>Attendance Analytics</h3>
          <div className="placeholder-content">
            Chart Area
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
