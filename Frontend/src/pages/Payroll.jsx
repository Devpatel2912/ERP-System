import { useState, useEffect } from 'react';
import './Payroll.css';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const role = localStorage.getItem('role');

  const fetchPayrolls = async () => {
    const url = role === 'admin' 
      ? 'http://127.0.0.1:8000/api/all-payrolls/'
      : 'http://127.0.0.1:8000/api/my-payroll/';

    try {
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setPayrolls(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/employees/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayrolls();
    if (role === 'admin') fetchEmployees();
  }, [role]);

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:8000/api/generate-payroll/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ employee: employeeId, month, year })
      });
      if (res.ok) {
        setEmployeeId('');
        setMonth('');
        fetchPayrolls();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="payroll-container page-transition">
      <div className="payroll-header">
        <h1>Payroll Management</h1>
      </div>

      {role === 'admin' && (
        <form className="payroll-form glass-panel" onSubmit={handleGeneratePayroll}>
          <h3>Generate Payroll</h3>
          <div className="form-group">
            <label>Employee</label>
            <select required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.user.first_name} {emp.user.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Month (1-12)</label>
            <input 
              type="number" 
              min="1" max="12"
              required 
              value={month} 
              onChange={(e) => setMonth(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Year</label>
            <input 
              type="number" 
              required 
              value={year} 
              onChange={(e) => setYear(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn-primary">Generate Payroll</button>
        </form>
      )}

      <div className="payroll-list glass-panel">
        <h3>{role === 'admin' ? 'All Generated Payrolls' : 'My Salary Slips'}</h3>
        <table className="payroll-table">
          <thead>
            <tr>
              {role === 'admin' && <th>Employee ID</th>}
              <th>Month / Year</th>
              <th>Total Days</th>
              <th>Present / Absent / Leave</th>
              <th>Base Salary</th>
              <th>Final Salary</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map(pr => (
              <tr key={pr.id}>
                {role === 'admin' && <td>{pr.employee}</td>}
                <td>{pr.month} / {pr.year}</td>
                <td>{pr.total_days}</td>
                <td>{pr.present_days} / {pr.absent_days} / {pr.leave_days}</td>
                <td>${pr.base_salary}</td>
                <td className="final-salary">${pr.final_salary}</td>
              </tr>
            ))}
            {payrolls.length === 0 && (
              <tr>
                <td colSpan={role === 'admin' ? 6 : 5} className="no-data">No payroll records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payroll;
