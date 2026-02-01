import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Globe, LogOut, User, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <Globe className="h-6 w-6" />
            <span>LinguaWeb</span>
          </Link>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600">
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium">
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}