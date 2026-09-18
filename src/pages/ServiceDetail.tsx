import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.tsx';
import { 
  CheckCircle2, AlertTriangle, ExternalLink, 
  MapPin, ShieldCheck, Clock, FileText, FileCheck2, ShieldAlert, ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { motion } from 'motion/react';

type ServiceDetailData = {
  service: any;
  officialLinks: any[];
  documents: any[];
  eligibilityRules: any;
  verificationRecords: any[];
};

export function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const [data, setData] = useState<ServiceDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`/api/services/${id}`);
        if (!res.ok) throw new Error('Service not found or error loading data');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const toggleChecklist = (docId: number) => {
    setChecklist(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Error loading service</h2>
        <p className="text-neutral-600">{error || 'Unknown error occurred'}</p>
        <button onClick={() => navigate(-1)} className="mt-6 text-sm font-semibold text-neutral-900 underline underline-offset-4">Go Back</button>
      </div>
    );
  }

  const { service, officialLinks, documents, eligibilityRules } = data;
  const isVerified = service.verificationStatus === 'VERIFIED';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 w-full pb-10 space-y-6"
    >
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 mb-2 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      {/* Header */}
      <div className="bg-white border border-neutral-200/60 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800">
              {service.category?.name || 'General'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-600 bg-white border border-neutral-200 px-2.5 py-1 rounded-full shadow-sm">
              <MapPin className="w-3 h-3" />
              {service.jurisdiction === 'CENTRAL' ? 'Central' : service.state?.name || service.jurisdiction}
            </span>
            <div className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              isVerified ? "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]" : "bg-[#FFF8E1] text-[#F57F17] border-[#FFECB3]"
            )}>
              {isVerified ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
              {isVerified ? 'Verified' : 'Needs Review'}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 leading-tight">
            {service.name}
          </h1>
        </div>
        
        <p className="text-[15px] text-neutral-600 leading-relaxed mb-5">
          {service.description}
        </p>

        {isVerified && service.lastVerifiedAt && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
            <Clock className="w-4 h-4" />
            Last verified: {new Date(service.lastVerifiedAt).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Eligibility Engine */}
          <section className="bg-white border border-neutral-200/60 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900 mb-5 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-neutral-900" />
              Eligibility
            </h2>
            
            {eligibilityRules ? (
              <ul className="space-y-4">
                {eligibilityRules.ageMin || eligibilityRules.ageMax ? (
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-neutral-900" />
                    <p className="text-[15px] text-neutral-700">
                      <span className="font-semibold text-neutral-900">Age:</span> {eligibilityRules.ageMin ? `Min ${eligibilityRules.ageMin} years` : ''} {eligibilityRules.ageMin && eligibilityRules.ageMax ? 'to' : ''} {eligibilityRules.ageMax ? `Max ${eligibilityRules.ageMax} years` : ''}
                    </p>
                  </li>
                ) : null}
                {eligibilityRules.incomeLimit ? (
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-neutral-900" />
                    <p className="text-[15px] text-neutral-700">
                      <span className="font-semibold text-neutral-900">Income Limit:</span> Up to ₹{eligibilityRules.incomeLimit.toLocaleString()} / year
                    </p>
                  </li>
                ) : null}
                {eligibilityRules.gender ? (
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-neutral-900" />
                    <p className="text-[15px] text-neutral-700">
                      <span className="font-semibold text-neutral-900">Gender:</span> {eligibilityRules.gender}
                    </p>
                  </li>
                ) : null}
                {eligibilityRules.specialConditions ? (
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-neutral-900" />
                    <p className="text-[15px] text-neutral-700">
                      <span className="font-semibold text-neutral-900">Special:</span> {eligibilityRules.specialConditions}
                    </p>
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="text-[15px] text-neutral-500 italic">No structured eligibility rules available. Please check the official source.</p>
            )}
            
            <div className="mt-6 p-4 bg-neutral-100 rounded-2xl text-[13px] font-medium text-neutral-500 leading-relaxed">
              <strong>Disclaimer:</strong> SEVA simplifies requirements but does not guarantee approval. Always confirm with the official source.
            </div>
          </section>

          {/* Document Checklist */}
          <section className="bg-white border border-neutral-200/60 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-neutral-900" />
                Required Documents
              </h2>
              {user && (
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                  {Object.values(checklist).filter(Boolean).length} / {documents.length}
                </span>
              )}
            </div>

            {documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <label 
                    key={doc.id}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group active:scale-[0.99]",
                      checklist[doc.id] 
                        ? "bg-[#F4F4F5] border-transparent" 
                        : "bg-white border-neutral-200/60 shadow-sm"
                    )}
                  >
                    <div className="relative flex items-center justify-center pt-0.5">
                      <input 
                        type="checkbox" 
                        className="peer h-5 w-5 rounded-md border-neutral-300 text-neutral-900 focus:ring-neutral-900 focus:ring-offset-0 transition-all cursor-pointer"
                        checked={!!checklist[doc.id]}
                        onChange={() => toggleChecklist(doc.id)}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={cn(
                          "font-semibold text-[15px] transition-colors",
                          checklist[doc.id] ? "text-neutral-400 line-through" : "text-neutral-900"
                        )}>
                          {doc.name}
                        </span>
                        {doc.isRequired && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-sm">
                            Required
                          </span>
                        )}
                      </div>
                      {doc.notes && (
                        <p className={cn(
                          "text-[13px] text-neutral-500",
                          checklist[doc.id] && "opacity-60"
                        )}>{doc.notes}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-[15px] italic">No specific documents listed.</p>
            )}

            {!user && documents.length > 0 && (
              <div className="mt-5 text-center text-xs font-medium text-neutral-500 bg-neutral-50 rounded-xl p-4">
                Sign in to save your checklist progress.
              </div>
            )}
          </section>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Official Source */}
          <div className="bg-neutral-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
            
            <h3 className="text-base font-bold mb-5 flex items-center gap-2 relative z-10">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              Official Links
            </h3>
            
            <div className="space-y-5 relative z-10">
              {officialLinks.length > 0 ? (
                officialLinks.map((link) => (
                  <div key={link.id} className="space-y-4">
                    <div>
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">{link.sourceType}</div>
                      <div className="font-semibold text-neutral-100 text-sm">{link.sourceName}</div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {link.applicationUrl && (
                        <a 
                          href={link.applicationUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-white text-neutral-900 text-[13px] font-bold transition-transform active:scale-95"
                        >
                          Apply Now
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <a 
                        href={link.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[13px] font-semibold transition-transform active:scale-95"
                      >
                        More Info
                        <ExternalLink className="w-4 h-4 opacity-70" />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-400 text-[13px]">No official links provided.</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
}
