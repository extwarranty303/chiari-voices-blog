import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User as UserIcon, ExternalLink } from 'lucide-react';
import { Button, GlassPanel } from '../ui';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/Dropdown';
import { useAuth } from '../../context/AuthContext';

const UserMenu = () => {
  const { logout } = useAuth();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <UserIcon size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link to="/profile"><DropdownMenuItem>Profile</DropdownMenuItem></Link>
        <Link to="/journal"><DropdownMenuItem>Journal</DropdownMenuItem></Link>
        <DropdownMenuItem onClick={logout}>Log Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin, isModerator } = useAuth();

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
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/"
            className={`text-sm font-medium transition-colors hover:text-accent ${isActive('/') ? 'text-accent' : 'text-surface'}`}
          >
            Home
          </Link>
          <Link 
            to="/posts" 
            className={`text-sm font-medium transition-colors hover:text-accent ${isActive('/posts') ? 'text-accent' : 'text-surface'}`}
          >
            Posts
          </Link>
          <a 
            href="https://chiarivoices.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium transition-colors text-surface hover:text-accent"
          >
            Main Site <ExternalLink size={14} />
          </a>
          
          {(isAdmin || isModerator) && (
            <Link 
              to="/admin" 
              className={`text-sm font-medium transition-colors hover:text-accent ${isActive('/admin') ? 'text-accent' : 'text-surface'}`}
            >
              Admin
            </Link>
          )}

          {user ? (
            <UserMenu />
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
            to="/posts" 
            onClick={() => setIsMenuOpen(false)}
            className={`text-lg font-medium ${isActive('/posts') ? 'text-accent' : 'text-surface'}`}
          >
            Posts
          </Link>
          <a 
            href="https://chiarivoices.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-lg font-medium text-surface"
            onClick={() => setIsMenuOpen(false)}
          >
            Main Site <ExternalLink size={18} />
          </a>
          {user && (
            <>
              <Link
                to="/journal"
                onClick={() => setIsMenuOpen(false)}
                className={`text-lg font-medium ${isActive('/journal') ? 'text-accent' : 'text-surface'}`}
              >
                Journal
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className={`text-lg font-medium ${isActive('/profile') ? 'text-accent' : 'text-surface'}`}
              >
                Profile
              </Link>
            </>
          )}
          {(isAdmin || isModerator) && (
             <Link 
              to="/admin" 
              onClick={() => setIsMenuOpen(false)}
              className={`text-lg font--medium ${isActive('/admin') ? 'text-accent' : 'text-surface'}`}
            >
              Admin Dashboard
            </Link>
          )}

          <div className="border-t border-surface/20 my-4" />
          
           {user ? (
              <Button variant="secondary" onClick={() => { logout(); setIsMenuOpen(false); }}>
                Log Out
              </Button>
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
