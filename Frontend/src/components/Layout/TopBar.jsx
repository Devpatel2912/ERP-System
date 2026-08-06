import { Bell, User } from 'lucide-react';
import './TopBar.css';

const TopBar = () => {
  return (
    <header className="topbar">
      <div className="topbar-search">
        {/* Placeholder for search */}
      </div>
      
      <div className="topbar-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge"></span>
        </button>
        
        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">Admin</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
