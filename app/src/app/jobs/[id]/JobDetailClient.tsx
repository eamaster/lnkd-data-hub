'use client';
import { useState, useEffect, Suspense } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface JobDetailClientProps {
  id: string;
}

function JobDetailContent({ id }: JobDetailClientProps) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '';

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const apiResponse = await api.jobs.details(id) as any;
        setJob(apiResponse?.extractedData || apiResponse);
      } catch (err: any) {
        setError(err?.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            href={from ? (from as any) : '/search'} 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Job not found</div>
          <Link 
            href={from ? (from as any) : '/search'} 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href={from ? (from as any) : '/search'} 
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Back to {from ? 'Search' : 'Jobs'}
            </Link>
            <div className="text-sm text-gray-500">
              Job ID: {id}
            </div>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {job.title || 'Job Title'}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Company</h3>
              <p className="text-gray-600">{job.companyName || 'N/A'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
              <p className="text-gray-600">{job.location || 'N/A'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Job Type</h3>
              <p className="text-gray-600">{job.jobType || 'N/A'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Experience Level</h3>
              <p className="text-gray-600">{job.experienceLevel || 'N/A'}</p>
            </div>
          </div>

          {job.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <div className="text-gray-600 whitespace-pre-wrap">
                {job.description}
              </div>
            </div>
          )}

          {job.requirements && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Requirements</h3>
              <div className="text-gray-600 whitespace-pre-wrap">
                {job.requirements}
              </div>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: string, index: number) => (
                  <span 
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-700 mb-2">Raw Data</h3>
            <details className="text-sm">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                View raw job data
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto text-xs">
                {JSON.stringify(job, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobDetailClient({ id }: JobDetailClientProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>}>
      <JobDetailContent id={id} />
    </Suspense>
  );
}
