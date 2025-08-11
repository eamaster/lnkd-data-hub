'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface JobDetailPageProps {
  params: { id: string };
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.jobs.details(params.id);
        setJob(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchJobDetails();
    }
  }, [params.id]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading job details...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/search" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Search
          </Link>
        </div>
      </main>
    );
  }

  // Extract job data - the structure might vary
  const jobData = job?.jobCard?.jobPostingCard || job?.job || job;
  const title = jobData?.jobPostingTitle || jobData?.title || 'Job Details';
  const company = jobData?.primaryDescription?.text || jobData?.company || 'Unknown Company';
  const location = jobData?.secondaryDescription?.text || jobData?.location || '';
  const description = jobData?.description || jobData?.jobDescription || 'No description available.';
  
  // Logo handling
  const logoData = jobData?.companyLogo?.attributes?.[0]?.detailData?.companyLogo?.logoResolutionResult?.vectorImage;
  const rootUrl = logoData?.rootUrl;
  const artifact = logoData?.artifacts?.find((a: any) => a.width === 200) || logoData?.artifacts?.[0];
  const logoUrl = rootUrl && artifact ? `${rootUrl}${artifact.fileIdentifyingUrlPathSegment}` : null;

  // Additional details
  const requirements = jobData?.requirements || [];
  const benefits = jobData?.benefits || [];
  const salary = jobData?.salary || jobData?.salaryRange || '';
  const postedDate = jobData?.postedDate || jobData?.listedAt || '';
  const isPromoted = jobData?.footerItems?.some((item: any) => item.type === 'PROMOTED');
  const hasEasyApply = jobData?.footerItems?.some((item: any) => item.type === 'EASY_APPLY_TEXT');

  return (
    <main className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/search" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Search
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <div className="flex items-start gap-6">
            {/* Company Logo */}
            <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${company} logo`}
                  className="w-full h-full rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-full h-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold rounded-lg">${company.charAt(0).toUpperCase()}</div>`;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold rounded-lg">
                  {company.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Job Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                  <h2 className="text-xl text-blue-600 font-semibold mb-1">{company}</h2>
                  {location && <p className="text-gray-600">{location}</p>}
                  {salary && <p className="text-green-600 font-semibold mt-2">{salary}</p>}
                </div>
                
                {/* Badges */}
                <div className="flex flex-col gap-2">
                  {isPromoted && (
                    <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
                      Promoted
                    </span>
                  )}
                  {hasEasyApply && (
                    <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                      Easy Apply
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Apply Now
                </button>
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Save Job
                </button>
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Share
                </button>
              </div>

              {postedDate && (
                <p className="text-sm text-gray-500 mt-4">Posted: {postedDate}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Job Description */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h3>
            <div className="prose max-w-none text-gray-700">
              {typeof description === 'string' ? (
                <div dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br>') }} />
              ) : (
                <p>No description available for this position.</p>
              )}
            </div>
          </div>

          {/* Requirements */}
          {requirements.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
              <ul className="space-y-2">
                {requirements.map((req: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-2">•</span>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {benefits.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h3>
              <ul className="space-y-2">
                {benefits.map((benefit: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-2">✓</span>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Apply */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Apply</h3>
            <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-3">
              Apply with LinkedIn
            </button>
            <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Upload Resume
            </button>
          </div>

          {/* Company Info */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About {company}</h3>
            <p className="text-gray-600 text-sm mb-4">
              Learn more about this company and explore other opportunities.
            </p>
            <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              View Company Page
            </button>
          </div>

          {/* Job Stats */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Job ID:</span>
                <span className="text-gray-900">{params.id}</span>
              </div>
              {location && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="text-gray-900">{location}</span>
                </div>
              )}
              {postedDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Posted:</span>
                  <span className="text-gray-900">{postedDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Raw Data (Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <details>
            <summary className="cursor-pointer text-sm text-gray-600 mb-2">Debug: Raw Job Data</summary>
            <pre className="text-xs bg-white p-4 rounded border overflow-auto">
              {JSON.stringify(job, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </main>
  );
}