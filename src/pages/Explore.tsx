import { useEffect, useState } from 'react';
import { Search, MapPin, Loader2, FileText, Filter, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';

type Service = {
  id: number;
  name: string;
  description: string;
  jurisdiction: string;
  category: { name: string, icon: string } | null;
  state: { name: string } | null;
};

export function Explore() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Agriculture', 'Healthcare', 'Housing', 'Education', 'Finance', 'Welfare'];

  useEffect(() => {
    // Fetch from backend
    const fetchServices = async () => {
      setLoading(true);
      try {
        const query = search ? `?q=${encodeURIComponent(search)}` : '';
        const res = await fetch(`/api/services${query}`);
        if (!res.ok) throw new Error('Failed to fetch services');
        const data = await res.json();
        
        let filtered = data.services;
        if (activeCategory !== 'All') {
          filtered = filtered.filter((s: Service) => s.category?.name === activeCategory || s.category?.name?.includes(activeCategory));
        }
        setServices(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(fetchServices, 300);
    return () => clearTimeout(timeoutId);
  }, [search, activeCategory]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Sticky Top Section */}
      <div className="sticky top-16 z-40 bg-[#F4F4F5]/90 backdrop-blur-xl pt-2 pb-4 space-y-4">
        
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mt-2">Explore</h1>
        
        {/* Search Bar */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-11 pr-10 py-3.5 bg-white border border-neutral-200/60 shadow-sm rounded-2xl text-[15px] font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            placeholder="Search for schemes, services..."
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-4 flex items-center text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Category Pills */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 -mx-4 px-4 pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border",
                activeCategory === cat 
                  ? "bg-neutral-900 border-neutral-900 text-white shadow-sm" 
                  : "bg-white border-neutral-200/60 text-neutral-600 hover:bg-neutral-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Feed */}
      <div className="mt-2 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-neutral-200/50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-neutral-400" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1">No results found</h3>
            <p className="text-sm text-neutral-500">We couldn't find any schemes matching your search or filters.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link 
                    to={`/service/${service.id}`}
                    className="block bg-white border border-neutral-200/60 rounded-3xl p-5 shadow-sm active:scale-[0.98] transition-transform"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600">
                        {service.category?.name || 'General'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400">
                        <MapPin className="w-3 h-3" />
                        {service.jurisdiction === 'CENTRAL' ? 'Central' : service.state?.name || service.jurisdiction}
                      </span>
                    </div>
                    
                    <h3 className="text-[17px] font-bold text-neutral-900 leading-tight mb-2 pr-4">
                      {service.name}
                    </h3>
                    
                    <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed mb-4">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                      <span className="text-[13px] font-bold text-neutral-900">View Details</span>
                      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
                        <ChevronRight className="w-4 h-4 text-neutral-600" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
