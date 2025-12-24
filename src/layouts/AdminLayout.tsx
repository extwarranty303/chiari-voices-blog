import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';

const AdminLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <AdminHeader />
      <main className="flex-grow p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
