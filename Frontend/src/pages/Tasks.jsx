import { useState, useEffect } from 'react';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const role = localStorage.getItem('role');

  const fetchTasks = async () => {
    const url = role === 'admin' 
      ? 'http://127.0.0.1:8000/api/all-tasks/'
      : 'http://127.0.0.1:8000/api/my-tasks/';

    try {
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setTasks(data);
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
    fetchTasks();
    if (role === 'admin') fetchEmployees();
  }, [role]);

  const handleAssignTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:8000/api/assign-task/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ employee: employeeId, title, description })
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        setEmployeeId('');
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/complete-task/${taskId}/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="tasks-container page-transition">
      <div className="tasks-header">
        <h1>Task Management</h1>
      </div>

      {role === 'admin' && (
        <form className="task-form glass-panel" onSubmit={handleAssignTask}>
          <h3>Assign New Task</h3>
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
            <label>Title</label>
            <input 
              type="text" 
              required 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              required 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            ></textarea>
          </div>
          <button type="submit" className="btn-primary">Assign Task</button>
        </form>
      )}

      <div className="task-list glass-panel">
        <h3>{role === 'admin' ? 'All Assigned Tasks' : 'My Tasks'}</h3>
        <table className="task-table">
          <thead>
            <tr>
              {role === 'admin' && <th>Employee ID</th>}
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                {role === 'admin' && <td>{task.employee}</td>}
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>
                  <span className={`status-badge ${task.status.toLowerCase()}`}>
                    {task.status}
                  </span>
                </td>
                <td>
                  {role !== 'admin' && task.status !== 'Completed' && (
                    <button 
                      className="btn-success btn-sm" 
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      Mark Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={role === 'admin' ? 5 : 4} className="no-data">No tasks found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tasks;
