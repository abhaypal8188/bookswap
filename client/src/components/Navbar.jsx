import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, User, LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-card mx-4 mt-4 px-6 py-4 flex justify-between items-center rounded-2xl">
      <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white group">
        <BookOpen className="text-primary group-hover:rotate-12 transition-transform" />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          BookSwap
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/browse" className="text-gray-300 hover:text-white transition-colors">
          Browse
        </Link>
        
        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <LayoutDashboard size={18} />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
            
            <div className="h-8 w-px bg-glass-border"></div>
            
            <div className="flex items-center gap-3">
              <img 
                src={user.avatar} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border border-primary/50"
              />
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
