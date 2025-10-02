'use client';

import { useRef, useState } from 'react';
import { api } from '@/lib/api';

type Tab = 'people' | 'companies' | 'products' | 'jobs' | 'posts' | 'events';

type AnyJson = any;

function pickArray(value: AnyJson): any[] | null {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  return null;
}

function normalizeResults(payload: AnyJson): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  // Common API shapes
  const topLevelCandidates = [payload.results, payload.items, payload.list, payload.elements];
  for (const c of topLevelCandidates) {
    const arr = pickArray(c);
    if (arr) return arr;
  }

  // Nested under data
  const data = payload.data;
  if (data) {
    const nestedCandidates = [data.results, data.items, data.list, data.elements, data.data];
    for (const c of nestedCandidates) {
      const arr = pickArray(c);
      if (arr) return arr;
    }
  }

  // Fallback: wrap whole object for visibility
  return [payload];
}

// Job Card Component
function JobCard({ job, onClick, onJobClick }: { job: any; onClick?: () => void; onJobClick?: (jobData: any) => void }) {
  const card = job?.jobCard?.jobPostingCard;
  if (!card) return <div className="text-gray-500">Invalid job data</div>;

  const title = card.jobPostingTitle || card.jobPosting?.title || 'Unknown Position';
  const company = card.primaryDescription?.text || 'Unknown Company';
  const location = card.secondaryDescription?.text || '';
  
  // Fix logo URL construction
  const logoData = card.companyLogo?.attributes?.[0]?.detailData?.companyLogo?.logoResolutionResult?.vectorImage;
  const rootUrl = logoData?.rootUrl;
  const artifact = logoData?.artifacts?.find((a: any) => a.width === 100) || logoData?.artifacts?.[0];
  const logoUrl = rootUrl && artifact ? `${rootUrl}${artifact.fileIdentifyingUrlPathSegment}` : null;
  
  const isPromoted = card.footerItems?.some((item: any) => item.type === 'PROMOTED');
  const hasEasyApply = card.footerItems?.some((item: any) => item.type === 'EASY_APPLY_TEXT');
  
  // Extract job ID for navigation
  const jobId = card.jobPosting?.entityUrn?.split(':').pop() || card.preDashNormalizedJobPostingUrn?.split(':').pop();

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-300"
        onClick={onClick || (() => {
    if (jobId && onJobClick) {
      // Show job details in modal
      const jobData = {
        id: jobId,
        title,
        company,
        location,
        isPromoted,
        hasEasyApply,
        logoUrl,
        fullData: card
      };
      onJobClick(jobData);
    }
  })}
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={`${company} logo`}
              className="w-full h-full rounded-lg object-cover"
              onError={(e) => {
                // Fallback to company initial if image fails
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="w-full h-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold rounded-lg">${company.charAt(0).toUpperCase()}</div>`;
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold rounded-lg">
              {company.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">{title}</h3>
            {isPromoted && (
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full flex-shrink-0">
                Promoted
              </span>
            )}
          </div>
          <p className="text-blue-600 font-medium mt-1">{company}</p>
          {location && <p className="text-gray-600 text-sm mt-1">{location}</p>}
          
          <div className="flex items-center gap-3 mt-3">
            {hasEasyApply && (
              <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                Easy Apply
              </span>
            )}
            {card.relevanceInsight?.text?.text && (
              <span className="text-sm text-gray-600">
                • {card.relevanceInsight.text.text}
              </span>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-blue-600 font-medium">Click to view full job details →</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Company Card Component  
function CompanyCard({ company }: { company: any }) {
  const name = company?.name || company?.companyName || 'Unknown Company';
  const industry = company?.industry || '';
  const location = company?.location || '';
  const employees = company?.employeeCount || company?.size || '';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
      {industry && <p className="text-blue-600 mt-1">{industry}</p>}
      {location && <p className="text-gray-600 text-sm mt-1">{location}</p>}
      {employees && <p className="text-gray-600 text-sm mt-1">{employees} employees</p>}
    </div>
  );
}

// Product Card Component
function ProductCard({ product }: { product: any }) {
  const name = product?.name || product?.title || 'Unknown Product';
  const description = product?.description || product?.summary || '';
  const company = product?.company || product?.companyName || '';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
      {company && <p className="text-blue-600 mt-1">{company}</p>}
      {description && <p className="text-gray-600 text-sm mt-2 line-clamp-3">{description}</p>}
    </div>
  );
}

// Person Card Component
function PersonCard({ person }: { person: any }) {
  const name = person?.name || person?.fullName || 'Unknown Person';
  const title = person?.title || person?.headline || '';
  const company = person?.company || person?.currentCompany || '';
  const location = person?.location || '';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
      {title && <p className="text-blue-600 mt-1">{title}</p>}
      {company && <p className="text-gray-600 text-sm mt-1">{company}</p>}
      {location && <p className="text-gray-600 text-sm mt-1">{location}</p>}
    </div>
  );
}

// Post Card Component
function PostCard({ post }: { post: any }) {
  const content = post?.content || post?.text || 'No content available';
  const author = post?.author || post?.authorName || 'Unknown Author';
  const timestamp = post?.timestamp || post?.date || '';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-gray-900">{author}</h3>
        {timestamp && <span className="text-gray-500 text-sm">• {timestamp}</span>}
      </div>
      <p className="text-gray-700 text-sm line-clamp-4">{content}</p>
    </div>
  );
}

// Event Card Component
function EventCard({ event }: { event: any }) {
  const name = event?.name || event?.title || 'Unknown Event';
  const date = event?.date || event?.startDate || '';
  const location = event?.location || '';
  const description = event?.description || '';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
      {date && <p className="text-blue-600 mt-1">{date}</p>}
      {location && <p className="text-gray-600 text-sm mt-1">{location}</p>}
      {description && <p className="text-gray-600 text-sm mt-2 line-clamp-3">{description}</p>}
    </div>
  );
}

// Result Card Component
function ResultCard({ result, type, onJobClick }: { result: any; type: Tab; onJobClick?: (jobData: any) => void }) {
  switch (type) {
    case 'jobs':
      return <JobCard job={result} onJobClick={onJobClick} />;
    case 'companies':
      return <CompanyCard company={result} />;
    case 'products':
      return <ProductCard product={result} />;
    case 'people':
      return <PersonCard person={result} />;
    case 'posts':
      return <PostCard post={result} />;
    case 'events':
      return <EventCard event={result} />;
    default:
      return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      );
  }
}

export default function SearchPage() {
  const [tab, setTab] = useState<Tab>('jobs');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  
  // Enhanced search filters (primarily for jobs)
  const [location, setLocation] = useState('');
  const [jobFunction, setJobFunction] = useState('');
  const [industry, setIndustry] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Suggestions for filters (simple, native datalist)
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [jobFunctionOptions, setJobFunctionOptions] = useState<string[]>([]);
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);
  // Keep raw suggestion objects so we can map labels to ids (e.g., geo)
  const locationRawRef = useRef<any[]>([]);
  const jobFunctionRawRef = useRef<any[]>([]);
  const industryRawRef = useRef<any[]>([]);

  const PAGE_SIZE = 10;
  const [lastBatchCount, setLastBatchCount] = useState(0);
  const canLoadMore = lastBatchCount === PAGE_SIZE;
  const seenKeysRef = useRef<Set<string>>(new Set());

  function getItemKey(item: any, type: Tab): string {
    try {
      if (type === 'jobs') {
        const card = item?.jobCard?.jobPostingCard;
        const urn = card?.entityUrn || card?.jobPosting?.entityUrn || card?.preDashNormalizedJobPostingUrn;
        if (urn) return String(urn);
      }
      if (type === 'companies') {
        return String(item?.entityUrn || item?.company?.entityUrn || JSON.stringify(item).slice(0, 120));
      }
      return String(item?.id || item?.entityUrn || JSON.stringify(item).slice(0, 120));
    } catch {
      return Math.random().toString(36).slice(2);
    }
  }

  const run = async (loadMore: boolean = false) => {
    setLoading(true);
    setError(null);
    console.log('🔍 Search params:', { query, location, jobFunction, industry, tab, loadMore, page });
    const params = new URLSearchParams();
    let effectiveQuery = query;
    if (jobFunction) effectiveQuery = `${effectiveQuery} ${jobFunction}`.trim();
    if (industry) effectiveQuery = `${effectiveQuery} ${industry}`.trim();
    if (effectiveQuery) params.set('q', effectiveQuery);
    params.set('limit', String(PAGE_SIZE));
    const nextPage = loadMore ? page + 1 : 0;
    params.set('offset', String(nextPage * PAGE_SIZE));
    try {
      let data: any = {};
      switch (tab) {
        case 'people':
          data = await api.search.people(params);
          break;
        case 'companies':
          data = await api.search.companies(params);
          break;
        case 'products':
          params.set('offsite', '1');
          data = await api.search.products(params);
          break;
        case 'jobs':
          if (location) {
            params.set('location', location);
            // Try to map to geo id from suggestions
            const match = locationRawRef.current.find((o) => {
              const label = o?.name || o?.text || o?.label || '';
              return String(label).toLowerCase() === location.toLowerCase();
            }) || locationRawRef.current[0];
            const geo = match?.geo || match?.id || match?.entityUrn?.split(':').pop();
            console.log('🌍 Location mapping:', { location, match, geo });
            if (geo) params.set('geo', String(geo));
          }
          // Add parameters to try to get more diverse results
          params.set('offsite', '1'); // Try to get non-promoted results
          if (!params.has('limit')) params.set('limit', '20'); // Get more results
          console.log('🎯 Final job search params:', params.toString());
          data = await api.search.jobs(params);
          console.log('📊 API response data:', data);
          break;
        case 'posts':
          data = await api.search.posts(params);
          break;
        case 'events':
          data = await api.events(params);
          break;
      }
      const rawBatch = normalizeResults(data);
      // Deduplicate
      const batch: any[] = [];
      const seen = loadMore ? seenKeysRef.current : new Set<string>();
      for (const item of rawBatch) {
        const key = getItemKey(item, tab);
        if (!seen.has(key)) {
          seen.add(key);
          batch.push(item);
        }
      }
      seenKeysRef.current = seen;
      setLastBatchCount(batch.length);
      console.log('📈 Batch info:', { batchLength: batch.length, PAGE_SIZE, canLoadMore: batch.length === PAGE_SIZE, loadMore, nextPage });
      if (loadMore) {
        setResults((prev) => [...prev, ...batch]);
        setPage(nextPage);
      } else {
        setResults(batch);
        setPage(0);
        // Reset dedupe set for fresh search
        seenKeysRef.current = seen;
      }
    } catch (e: any) {
      setError(e?.message || 'Search failed');
      if (!loadMore) setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Unified Search</h1>
      <div className="flex flex-wrap items-center gap-2">
        {(['people','companies','products','jobs','posts','events'] as Tab[]).map((t) => (
          <button type="button" key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded ${tab===t?'bg-blue-600 text-white':'bg-gray-200'}`}>{t}</button>
        ))}
      </div>
      {/* Layout: for jobs show a two-column layout on desktop */}
      {tab === 'jobs' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 md:gap-6">
          <form
            className="flex gap-3 items-center md:col-span-8"
            onSubmit={(e) => { e.preventDefault(); run(false); }}
          >
            <input value={query} onChange={(e)=>setQuery(e.target.value)} className="border p-2 rounded flex-1" placeholder="Search query" />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading?'Searching...':'Search'}</button>
          </form>
          <div className="bg-gray-50 p-4 rounded-lg md:col-span-4 mt-3 md:mt-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Job Filters</h3>
              <button type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                {showAdvancedFilters ? 'Hide Filters' : 'Show More Filters'}
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  list="location-suggestions"
                  value={location} 
                  onChange={async (e) => {
                    const v = e.target.value;
                    setLocation(v);
                    if (v && v.length >= 2) {
                      try {
                        const res: any = await api.searchLocation(v, 11, 0);
                        const elems = res?.data?.elements || res?.elements || [];
                        locationRawRef.current = elems;
                        const labels = elems
                          .map((o: any) => o?.name || o?.text || o?.label)
                          .filter(Boolean);
                        setLocationOptions(labels);
                      } catch {
                        // ignore suggestion errors
                      }
                    }
                    // Auto-trigger search when location changes and we have results
                    if (results.length > 0) {
                      setTimeout(() => run(false), 500); // Debounce
                    }
                  }} 
                  className="w-full border p-2 rounded" 
                  placeholder="e.g., New York, Remote, San Francisco" 
                />
                <datalist id="location-suggestions">
                  {locationOptions.map((opt) => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </div>
              
              {showAdvancedFilters && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Function</label>
                    <input 
                      list="jobfunction-suggestions"
                      value={jobFunction} 
                      onChange={async (e) => {
                        const v = e.target.value;
                        setJobFunction(v);
                        if (v && v.length >= 2) {
                          try {
                            const res: any = await api.searchJobFunction(v, 21, 0);
                            const elems = res?.data?.elements || res?.elements || [];
                            jobFunctionRawRef.current = elems;
                            const labels = elems
                              .map((o: any) => o?.name || o?.text || o?.label)
                              .filter(Boolean);
                            setJobFunctionOptions(labels);
                          } catch {}
                        }
                      }} 
                      className="w-full border p-2 rounded" 
                      placeholder="e.g., Engineering, Marketing, Sales" 
                    />
                    <datalist id="jobfunction-suggestions">
                      {jobFunctionOptions.map((opt) => (
                        <option key={opt} value={opt} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <input 
                      list="industry-suggestions"
                      value={industry} 
                      onChange={async (e) => {
                        const v = e.target.value;
                        setIndustry(v);
                        if (v && v.length >= 2) {
                          try {
                            const res: any = await api.searchIndustry(v, 10, 0);
                            const elems = res?.data?.elements || res?.elements || [];
                            industryRawRef.current = elems;
                            const labels = elems
                              .map((o: any) => o?.name || o?.text || o?.label)
                              .filter(Boolean);
                            setIndustryOptions(labels);
                          } catch {}
                        }
                      }} 
                      className="w-full border p-2 rounded" 
                      placeholder="e.g., Technology, Finance, Healthcare" 
                    />
                    <datalist id="industry-suggestions">
                      {industryOptions.map((opt) => (
                        <option key={opt} value={opt} />
                      ))}
                    </datalist>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-3 space-y-2">
              {(location || jobFunction || industry) && (
                <div className="flex flex-wrap gap-2">
                  {location && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      Location: {location}
                    <button type="button" onClick={() => setLocation('')} className="ml-2 hover:text-blue-600">×</button>
                    </span>
                  )}
                  {jobFunction && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Function: {jobFunction}
                      <button type="button" onClick={() => setJobFunction('')} className="ml-2 hover:text-green-600">×</button>
                    </span>
                  )}
                  {industry && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      Industry: {industry}
                      <button type="button" onClick={() => setIndustry('')} className="ml-2 hover:text-purple-600">×</button>
                    </span>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => run(false)} 
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  disabled={loading}
                >
                  Apply Filters
                </button>
                {(location || jobFunction || industry) && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setLocation('');
                      setJobFunction('');
                      setIndustry('');
                      run(false);
                    }} 
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <form
            className="flex gap-3 items-center"
            onSubmit={(e) => { e.preventDefault(); run(false); }}
          >
            <input value={query} onChange={(e)=>setQuery(e.target.value)} className="border p-2 rounded flex-1" placeholder="Search query" />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading?'Searching...':'Search'}</button>
          </form>
        </div>
      )}
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid gap-4">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Searching...</p>
          </div>
        )}
        {!loading && results.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {query ? 'No results found' : 'Enter a search query to get started'}
          </div>
        )}
        {!loading && results.map((result, i) => (
          <ResultCard 
            key={i} 
            result={result} 
            type={tab} 
            onJobClick={(jobData) => {
              setSelectedJob(jobData);
              setShowJobModal(true);
            }}
          />
        ))}
      </div>
      {results.length > 0 && (
        <div className="flex justify-center mt-4">
          <button type="button"
            onClick={() => run(true)} 
            disabled={loading || !canLoadMore}
            className={`px-4 py-2 rounded ${canLoadMore ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            {loading ? 'Loading...' : (canLoadMore ? 'Load More' : 'No more results')}
          </button>
        </div>
      )}
      
      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                <button
                  onClick={() => setShowJobModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {selectedJob.logoUrl && (
                    <img 
                      src={selectedJob.logoUrl} 
                      alt={`${selectedJob.company} logo`}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedJob.company}</h3>
                    <p className="text-gray-600">{selectedJob.location}</p>
                    {selectedJob.isPromoted && (
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1">
                        Promoted
                      </span>
                    )}
                  </div>
                </div>
                
                {selectedJob.hasEasyApply && (
                  <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg">
                    ✓ Easy Apply Available
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Full Job Data:</h4>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-60">
                    {JSON.stringify(selectedJob.fullData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
