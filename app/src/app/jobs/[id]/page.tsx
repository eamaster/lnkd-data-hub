// Generate static params for static export
export async function generateStaticParams() {
  // Generate more static params for common job IDs
  const staticIds = [];
  for (let i = 1; i <= 20; i++) {
    staticIds.push({ id: i.toString() });
  }
  return staticIds;
}

import JobDetailClient from './JobDetailClient';

interface JobDetailPageProps {
  params: { id: string };
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  return <JobDetailClient id={params.id} />;
}