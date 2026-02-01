import { useState } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowRight, ExternalLink, Copy, Check } from 'lucide-react';

const TARGET_LANGUAGES = [
  "Spanish", "French", "German", "Italian", "Portuguese", 
  "Chinese (Simplified)", "Japanese", "Korean", "Russian", "Arabic"
];

export default function Home() {
  const { session } = useAuth();
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("Spanish");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = session?.access_token;
      // Call Backend API
      const data = await apiRequest("/translate", "POST", {
        url: url,
        target_language: language
      }, token);

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fullViewLink = result ? `${import.meta.env.VITE_BACKEND_URL}${result.view_link}` : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullViewLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Translate Any Website Instantly
        </h1>
        <p className="text-lg text-gray-600">
          Enter a URL, choose a language, and get a rendered translation in seconds.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <form onSubmit={handleTranslate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <input
              type="url"
              required
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              {TARGET_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Translating...
              </>
            ) : (
              <>
                Start Translation <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            Error: {error}
          </div>
        )}
      </div>

      {result && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Translation Ready!</h3>
          <p className="text-green-700 mb-4 text-sm">
            Expires on: {new Date(result.expires_at).toLocaleString()}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href={fullViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition"
            >
              Open Translated Page <ExternalLink className="h-4 w-4" />
            </a>
            
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-white border border-green-300 text-green-700 hover:bg-green-50 py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}