import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-cyan-400">Chiari Voices</Link>

          <nav className="hidden md:flex items-center space-x-6">
            <NavLink to="/" className={({isActive}) => isActive ? "text-cyan-400" : "hover:text-cyan-400 transition-colors"}>Home</NavLink>
            {user && (
              <NavLink to="/profile" className={({isActive}) => isActive ? "text-cyan-400" : "hover:text-cyan-400 transition-colors"}>Profile</NavLink>
            )}
             {user && user.role === 'admin' && (
              <NavLink to="/admin" className={({isActive}) => isActive ? "text-cyan-400" : "hover:text-cyan-400 transition-colors"}>Admin</NavLink>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <Button onClick={logout} variant="outline" size="sm">
                Logout
              </Button>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
