import { Link, NavLink } from 'react-router-dom';
import { Button } from './ui';
import { useAuth } from '../context/AuthContext';

const AdminHeader = () => {
  const { logout } = useAuth();

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link to="/admin">Chiari Voices Admin</Link>
      </div>
      <nav className="flex items-center space-x-4">
        <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? "text-cyan-400" : "hover:text-cyan-400 transition-colors"}>Dashboard</NavLink>
        <NavLink to="/admin/posts" className={({isActive}) => isActive ? "text-cyan-400" : "hover:text-cyan-400 transition-colors"}>Posts</NavLink>
        <Button onClick={logout} variant="outline" size="sm">Logout</Button>
      </nav>
    </header>
  );
};

export default AdminHeader;
