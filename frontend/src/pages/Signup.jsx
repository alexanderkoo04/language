import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Check if email confirmation is required by Supabase settings
      if (data?.user && !data?.session) {
        setSuccessMsg("Registration successful! Please check your email to confirm your account.");
      } else {
        // If auto-confirm is on, redirect immediately
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Create an Account</h2>
        
        {successMsg ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
              {successMsg}
            </div>
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        )}
        
        {!successMsg && (
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
          </p>
        )}
      </div>
    </div>
  );
}