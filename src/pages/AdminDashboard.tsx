import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext.tsx';
import { ShieldAlert, CheckCircle2, Play, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils.ts';

export function AdminDashboard() {
  const { user, dbUser, getToken } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);

  useEffect(() => {
    if (dbUser?.role !== 'ADMIN') {
      setLoading(false);
      return;
    }
    fetchQueue();
  }, [dbUser]);

  const fetchQueue = async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/queue', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch queue');
      const data = await res.json();
      setQueue(data.services);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: number) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/verify/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to verify');
      
      // Remove from queue
      setQueue(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const triggerDiscovery = async () => {
    setIsDiscovering(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/trigger-discovery', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to trigger');
      
      alert("Discovery Engine is scanning for new schemes in the background. Check back in a few moments!");
      
      // Poll queue after a few seconds
      setTimeout(fetchQueue, 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDiscovering(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center">Loading...</div>;
  }

  if (dbUser?.role !== 'ADMIN') {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Access Denied</h2>
        <p className="text-neutral-600">You do not have administrator privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-orange-600" />
            Verification Queue
          </h1>
          <p className="text-neutral-600 mt-1">
            Review automatically discovered schemes before they are published to citizens.
          </p>
        </div>

        <button 
          onClick={triggerDiscovery}
          disabled={isDiscovering}
          className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-neutral-800 transition-colors disabled:opacity-70 disabled:cursor-wait"
        >
          <Play className={cn("w-4 h-4", isDiscovering && "animate-pulse")} />
          {isDiscovering ? 'Scanning...' : 'Run Auto-Discovery Now'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200">
          {error}
        </div>
      )}

      {queue.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-neutral-900 mb-1">Queue is empty</h3>
          <p className="text-neutral-500">All automated discoveries have been verified.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {queue.map(service => (
            <div key={service.id} className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center transition-all hover:border-orange-200 hover:shadow-sm">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-sm border border-amber-200">
                    Draft / Unpublished
                  </span>
                  <span className="text-xs font-medium text-neutral-500">
                    {service.jurisdiction}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">{service.name}</h3>
                <p className="text-neutral-600 text-sm line-clamp-2">{service.description}</p>
              </div>
              <div className="shrink-0 w-full md:w-auto">
                <button 
                  onClick={() => handleVerify(service.id)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-orange-50 text-orange-700 border border-orange-200 px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 hover:text-white transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Publish & Verify
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-3xl p-6 text-blue-900 text-sm leading-relaxed">
        <strong>Data Trust Architecture:</strong> This engine uses a scheduled job to fetch external RSS feeds and parse unstructured news announcements using the Gemini API. To enforce SEVA's Data Trust rules (Never automatically mark new information as verified), extracted JSON records are held in this queue with <code>UNPUBLISHED</code> status until an authorized administrator verifies them.
      </div>
    </div>
  );
}
