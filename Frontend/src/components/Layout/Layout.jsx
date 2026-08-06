import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
