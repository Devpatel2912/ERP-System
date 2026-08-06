import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Employees from './pages/Employees';
import Inventory from './pages/Inventory';
import Leave from './pages/Leave';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Layout Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="attendance" element={<div style={{color: '#fff'}}>Attendance Page (To be implemented)</div>} />
          <Route path="timesheets" element={<div style={{color: '#fff'}}>Timesheets Page (To be implemented)</div>} />
          <Route path="tasks" element={<div style={{color: '#fff'}}>Tasks Page (To be implemented)</div>} />
          <Route path="leave" element={<Leave />} />
          <Route path="payroll" element={<div style={{color: '#fff'}}>Payroll Page (To be implemented)</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
