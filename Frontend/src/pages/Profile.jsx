import React, { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Calendar, DollarSign, Camera } from 'lucide-react';
import api from '../api/axios';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile/');
        setProfile(response.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Unauthorized. Please login again.');
        } else {
          setError('Failed to load profile data.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="auth-error">{error}</div>
      </div>
    );
  }

  if (!profile) return null;

  const user = profile.user || {};

  return (
    <div className="profile-container">
      <div className="header-section">
        <div className="header-content">
          <h1>My Profile</h1>
          <p className="subtitle">View your personal and professional details.</p>
        </div>
      </div>

      <div className="profile-content glass-panel">
        <div className="profile-sidebar">
          <div className="profile-photo-container">
            {profile.photo ? (
              <img src={`http://127.0.0.1:8000${profile.photo}`} alt={user.username} className="profile-photo-large" />
            ) : (
              <div className="profile-photo-large-placeholder">
                <User size={64} />
              </div>
            )}
          </div>
          <h2 className="profile-name">
            {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
          </h2>
          <span className={`role-badge role-${user.role}`}>{user.role}</span>
        </div>

        <div className="profile-details">
          <h3>Contact Information</h3>
          <div className="details-grid">
            <div className="detail-item">
              <Mail className="detail-icon" size={20} />
              <div className="detail-text">
                <span className="label">Email</span>
                <span className="value">{user.email || 'Not provided'}</span>
              </div>
            </div>
            <div className="detail-item">
              <User className="detail-icon" size={20} />
              <div className="detail-text">
                <span className="label">Username</span>
                <span className="value">{user.username}</span>
              </div>
            </div>
          </div>

          <h3>Employment Details</h3>
          <div className="details-grid">
            <div className="detail-item">
              <Briefcase className="detail-icon" size={20} />
              <div className="detail-text">
                <span className="label">Department</span>
                <span className="value">{profile.department_details?.name || 'Unassigned'}</span>
              </div>
            </div>
            <div className="detail-item">
              <Briefcase className="detail-icon" size={20} />
              <div className="detail-text">
                <span className="label">Designation</span>
                <span className="value">{profile.designation_details?.name || 'Unassigned'}</span>
              </div>
            </div>
            <div className="detail-item">
              <Calendar className="detail-icon" size={20} />
              <div className="detail-text">
                <span className="label">Join Date</span>
                <span className="value">{profile.join_date || 'N/A'}</span>
              </div>
            </div>
            <div className="detail-item">
              <DollarSign className="detail-icon" size={20} />
              <div className="detail-text">
                <span className="label">Salary</span>
                <span className="value">${profile.salary || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
