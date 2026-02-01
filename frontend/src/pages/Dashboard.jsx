import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, Calendar, Clock } from 'lucide-react';

export default function Dashboard() {
  const { session } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Calling backend API, not Supabase directly
        const data = await apiRequest("/dashboard", "GET", null, session.access_token);
        setItems(data);
      } catch (err) {
        setError("Failed to load dashboard history.");
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchDashboard();
  }, [session]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading history...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Translation History</h2>
      
      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">You haven't translated any pages yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md">
                  {item.target_language}
                </span>
                <a 
                  href={`${import.meta.env.VITE_BACKEND_URL}${item.view_link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-600"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
              
              <h3 className="font-medium text-gray-900 truncate mb-4" title={item.original_url}>
                {item.original_url}
              </h3>

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-orange-600">
                  <Clock className="h-4 w-4" />
                  <span>Expires: {new Date(item.expires_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}