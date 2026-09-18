import { useEffect, useState } from 'react';
import { Bookmark, Loader2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.tsx';

export function Saved() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a full app, we would fetch saved items from the backend using the user token
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [user]);

  if (!user) {
    return (
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
        <Bookmark className="w-16 h-16 text-neutral-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Sign in to save services</h2>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto">Create a profile to bookmark relevant government services, track application checklists, and receive deadline reminders.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <Bookmark className="w-8 h-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Saved Services</h1>
          <p className="text-neutral-600 mt-1">Your bookmarked schemes and ongoing applications.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : (
        <div className="bg-neutral-50 border border-neutral-200 border-dashed rounded-3xl p-12 text-center flex flex-col items-center">
          <Bookmark className="w-12 h-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-1">No saved services yet</h3>
          <p className="text-neutral-500 mb-6">Explore the catalog and bookmark services you want to track.</p>
          <Link to="/explore" className="px-6 py-2.5 bg-orange-600 text-white font-medium rounded-full hover:bg-orange-700 transition-colors shadow-sm">
            Explore Catalog
          </Link>
        </div>
      )}
    </div>
  );
}
