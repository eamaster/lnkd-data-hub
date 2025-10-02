'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface JobDetailPageProps {
  params: { id: string };
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, try to get full job details from API
        const apiResponse = await api.jobs.details(params.id) as any;
        
        // Check if we got actual job description from the API
        if (apiResponse?.extractedData?.hasFullDescription) {
          const extractedData = apiResponse.extractedData;
          
          // Get basic info from search params if available
          let searchData: any = {};
          const dataParam = searchParams.get('data');
          if (dataParam) {
            try {
              searchData = JSON.parse(decodeURIComponent(dataParam));
            } catch (e) {
              console.warn('Failed to parse job data from URL params:', e);
            }
          }
          
          // Combine search data (for basic info) with API data (for full description)
          const combinedJob = {
            fromAPI: true,
            fromSearch: !!searchData.title,
            id: params.id,
            title: searchData.title || `Job Position`,
            company: searchData.company || 'Company Information Available',
            location: searchData.location || 'See job description',
            logoUrl: searchData.logoUrl,
            isPromoted: searchData.isPromoted || false,
            hasEasyApply: searchData.hasEasyApply || false,
            description: extractedData.jobDescription,
            postedDate: extractedData.postedDate,
            apiData: apiResponse,
            hasFullDescription: true
          };
          setJob(combinedJob);
          setLoading(false);
          return;
        }
        
        // Fallback: if no API data, check if we have job data passed from search results
        const dataParam = searchParams.get('data');
        if (dataParam) {
          try {
            const jobData = JSON.parse(decodeURIComponent(dataParam));
            // Use the data from search results (fallback when API fails)
            setJob({ fromSearch: true, ...jobData });
            setLoading(false);
            return;
          } catch (e) {
            console.warn('Failed to parse job data from URL params:', e);
          }
        }
        
        // Final fallback: create a minimal job object
        const minimalJob = {
          fromAPI: false,
          id: params.id,
          title: `Job ID: ${params.id}`,
          company: 'Unknown Company',
          location: '',
          description: 'Job details could not be loaded. Please try the "Apply on LinkedIn" button to view full details.',
          hasFullDescription: false
        };
        setJob(minimalJob);
      } catch (err: any) {
        setError(err?.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchJobDetails();
    }
  }, [params.id, searchParams]);

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

  // Extract job data - handle multiple response formats
  let jobData: any = {};
  let title = 'Job Details';
  let company = 'Unknown Company';
  let location = '';
  let description = 'No description available.';
  let skills: string[] = [];
  let logoUrl: string | null = null;
  let isPromoted = false;
  let hasEasyApply = false;
  
  if (job?.fromAPI && job?.hasFullDescription) {
    // API data with full job description (priority)
    title = job.title || 'Job Position';
    company = job.company || 'Company Information Available';
    location = job.location || 'See job description';
    logoUrl = job.logoUrl;
    isPromoted = job.isPromoted || false;
    hasEasyApply = job.hasEasyApply || false;
    description = job.description || 'No description available.';
    
    jobData = job;
  } else if (job?.fromSearch) {
    // Data passed from search results (fallback)
    title = job.title || 'Job Details';
    company = job.company || 'Unknown Company';
    location = job.location || '';
    logoUrl = job.logoUrl;
    isPromoted = job.isPromoted || false;
    hasEasyApply = job.hasEasyApply || false;
    
    // Enhanced description with call-to-action
    description = `
**Position:** ${title}
**Company:** ${company}
${location ? `**Location:** ${location}` : ''}

**About This Opportunity:**
This is an active job listing on LinkedIn. To view the complete job description, requirements, benefits, and application details, please click the "Apply Now" button below.

**Key Information:**
• Position: ${title}
• Company: ${company}
${location ? `• Location: ${location}` : ''}
${isPromoted ? '• Featured/Promoted listing' : ''}
${hasEasyApply ? '• Easy Apply available' : ''}

**Next Steps:**
1. Click "Apply Now" to view full job details on LinkedIn
2. Review complete job requirements and responsibilities  
3. Submit your application directly through LinkedIn

*Note: Complete job descriptions, salary information, and detailed requirements are available on the LinkedIn job posting.*
    `.trim();
    
    jobData = job;
  } else if (job?.jobCard?.jobPostingCard) {
    // Format from search results
    const card = job.jobCard.jobPostingCard;
    title = card.jobPostingTitle || 'Job Details';
    company = card.primaryDescription?.text || 'Unknown Company';
    location = card.secondaryDescription?.text || '';
    description = card.description || 'No description available.';
    jobData = card;

  } else if (job?.data?.elements?.[0]?.jobPostingDetailSection) {
    // Qualification data format - extract what we can
    const section = job.data.elements[0].jobPostingDetailSection[0];
    
    if (section?.howYouMatchCard) {
      const matchCard = section.howYouMatchCard;
      
      // Extract job title and company from the skills or context
      title = `Job ID: ${params.id}`;
      
      // Extract skills from the qualification data
      const skillsSection = matchCard.howYouMatchSection?.find((s: any) => 
        s.itemsMatchSection?.groups?.[0]?.header?.includes('Skills')
      );
      
      if (skillsSection) {
        const skillsItem = skillsSection.itemsMatchSection.groups[0].items?.[0];
        if (skillsItem?.subtitle) {
          skills = skillsItem.subtitle.split(', ').map((s: string) => s.trim());
          description = `Required Skills: ${skillsItem.subtitle}\n\nLocation restrictions: ${matchCard.headerContent || 'Not specified'}`;
        }
      }
      
      // Try to infer location from the header content
      if (matchCard.headerContent?.includes('location')) {
        location = 'Location requirements not met';
      }
    }
    
    jobData = job.data;
  } else {
    // Fallback for other formats
    jobData = job?.job || job;
    title = jobData?.jobPostingTitle || jobData?.title || `Job ID: ${params.id}`;
    company = jobData?.primaryDescription?.text || jobData?.company || 'Unknown Company';
    location = jobData?.secondaryDescription?.text || jobData?.location || '';
    description = jobData?.description || jobData?.jobDescription || 'No description available.';
  }
  
  // Logo handling (if not already set from search data)
  if (!logoUrl) {
    const logoData = jobData?.companyLogo?.attributes?.[0]?.detailData?.companyLogo?.logoResolutionResult?.vectorImage;
    const rootUrl = logoData?.rootUrl;
    const artifact = logoData?.artifacts?.find((a: any) => a.width === 200) || logoData?.artifacts?.[0];
    logoUrl = rootUrl && artifact ? `${rootUrl}${artifact.fileIdentifyingUrlPathSegment}` : null;
  }

  // Additional details
  const requirements = jobData?.requirements || [];
  const benefits = jobData?.benefits || [];
  const salary = jobData?.salary || jobData?.salaryRange || '';
  const postedDate = job?.postedDate || jobData?.postedDate || jobData?.listedAt || '';
  
  // Only check footer items if not already set from search data
  if (!job?.fromSearch) {
    isPromoted = jobData?.footerItems?.some((item: any) => item.type === 'PROMOTED') || false;
    hasEasyApply = jobData?.footerItems?.some((item: any) => item.type === 'EASY_APPLY_TEXT') || false;
  }

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
                <a 
                  href={`https://www.linkedin.com/jobs/view/${params.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
                >
                  Apply on LinkedIn →
                </a>
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Save Job
                </button>
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `${title} at ${company}`,
                        url: window.location.href,
                        text: `Check out this job: ${title} at ${company}`
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Job link copied to clipboard!');
                    }
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
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
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: description
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold formatting
                      .replace(/\n/g, '<br>') // Line breaks
                      .replace(/^• /gm, '&bull; ') // Bullet points
                  }} 
                />
              ) : (
                <p>No description available for this position.</p>
              )}
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

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
            <a 
              href={`https://www.linkedin.com/jobs/view/${params.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-3 block text-center"
            >
              Apply on LinkedIn
            </a>
            <p className="text-sm text-gray-600 text-center">
              View full job details and apply directly on LinkedIn
            </p>
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