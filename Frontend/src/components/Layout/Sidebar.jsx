import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  FileText, 
  CheckSquare, 
  Calendar, 
  DollarSign,
  Package,
  LogOut,
  User,
  ShoppingCart
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const role = localStorage.getItem('role');

  const allNavItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'Employees', path: '/employees', icon: <Users size={20} /> },
    { name: 'Inventory', path: '/inventory', icon: <Package size={20} /> },
    { name: 'Attendance', path: '/attendance', icon: <Clock size={20} /> },
    { name: 'Timesheets', path: '/timesheets', icon: <FileText size={20} /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare size={20} /> },
    { name: 'Leave', path: '/leave', icon: <Calendar size={20} /> },
    { name: 'Payroll', path: '/payroll', icon: <DollarSign size={20} /> },
    { name: 'Sales', path: '/sales', icon: <ShoppingCart size={20} /> },
  ];

  const allowedForUser = ['Dashboard', 'Profile', 'Tasks', 'Timesheets', 'Attendance'];
  
  const navItems = role === 'admin' 
    ? allNavItems 
    : allNavItems.filter(item => allowedForUser.includes(item.name));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>ERP System</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-link logout-btn" onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
