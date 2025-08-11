'use client';

import { useState } from 'react';
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
function JobCard({ job, onClick }: { job: any; onClick?: () => void }) {
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
        if (jobId) {
          window.open(`/jobs/${jobId}`, '_blank');
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
function ResultCard({ result, type }: { result: any; type: Tab }) {
  switch (type) {
    case 'jobs':
      return <JobCard job={result} />;
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
  const [tab, setTab] = useState<Tab>('products');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('limit', '10');
    params.set('offset', String(page * 10));
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
          data = await api.search.jobs(params);
          break;
        case 'posts':
          data = await api.search.posts(params);
          break;
        case 'events':
          data = await api.events(params);
          break;
      }
      setResults(normalizeResults(data));
    } catch (e: any) {
      setError(e?.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Unified Search</h1>
      <div className="flex flex-wrap gap-2">
        {(['people','companies','products','jobs','posts','events'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded ${tab===t?'bg-blue-600 text-white':'bg-gray-200'}`}>{t}</button>
        ))}
      </div>
      <div className="flex gap-3">
        <input value={query} onChange={(e)=>setQuery(e.target.value)} className="border p-2 rounded flex-1" placeholder="Search query" />
        <button onClick={run} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading?'Searching...':'Search'}</button>
      </div>
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
          <ResultCard key={i} result={result} type={tab} />
        ))}
      </div>
      <div className="flex gap-2">
        <button disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))} className="px-3 py-1 bg-gray-200 rounded">Prev</button>
        <button onClick={()=>setPage(p=>p+1)} className="px-3 py-1 bg-gray-200 rounded">Next</button>
      </div>
    </main>
  );
}
