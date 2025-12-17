import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User as UserIcon } from 'lucide-react';
import { Button, GlassPanel } from '../ui';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, logout, isAdmin, isModerator } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full p-4">
      <GlassPanel className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold font-display text-white tracking-wider">
            CHIARI<span className="text-accent">VOICES</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-accent ${isActive('/') ? 'text-accent' : 'text-surface'}`}
          >
            Home
          </Link>
          <Link 
            to="/blog" 
            className={`text-sm font-medium transition-colors hover:text-accent ${isActive('/blog') ? 'text-accent' : 'text-surface'}`}
          >
            Blog
          </Link>
          
          {(isAdmin || isModerator) && (
            <Link 
              to="/admin" 
              className={`text-sm font-medium transition-colors hover:text-accent ${isActive('/admin') ? 'text-accent' : 'text-surface'}`}
            >
              Admin
            </Link>
          )}
          
          {currentUser ? (
            <div className="flex items-center gap-4">
               <Link to="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <UserIcon size={16} />
                    Profile
                  </Button>
               </Link>
               <Button variant="secondary" size="sm" onClick={logout}>
                 Log Out
               </Button>
            </div>
          ) : (
             <Link to="/login">
              <Button size="sm">Log In</Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-surface"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </GlassPanel>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <GlassPanel className="md:hidden mt-2 flex flex-col gap-4 p-6 absolute w-[calc(100%-2rem)] left-4">
           <Link 
            to="/" 
            onClick={() => setIsMenuOpen(false)}
            className={`text-lg font-medium ${isActive('/') ? 'text-accent' : 'text-surface'}`}
          >
            Home
          </Link>
          <Link 
            to="/blog" 
            onClick={() => setIsMenuOpen(false)}
            className={`text-lg font-medium ${isActive('/blog') ? 'text-accent' : 'text-surface'}`}
          >
            Blog
          </Link>
          {(isAdmin || isModerator) && (
             <Link 
              to="/admin" 
              onClick={() => setIsMenuOpen(false)}
              className={`text-lg font-medium ${isActive('/admin') ? 'text-accent' : 'text-surface'}`}
            >
              Admin Dashboard
            </Link>
          )}
          
           {currentUser ? (
            <>
               <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                  <span className="text-lg font-medium text-surface">Profile</span>
               </Link>
               <Button variant="secondary" onClick={() => { logout(); setIsMenuOpen(false); }}>
                 Log Out
               </Button>
            </>
          ) : (
             <Link to="/login" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full">Log In</Button>
            </Link>
          )}
        </GlassPanel>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="w-full py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-surface/60 text-sm">
          © {new Date().getFullYear()} Chiari Voices. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
