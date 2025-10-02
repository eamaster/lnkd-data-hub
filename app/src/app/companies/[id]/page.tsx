// Generate static params for static export
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

import CompanyClient from './CompanyClient';

export default function CompanyPage({ params }: { params: { id: string } }) {
  return <CompanyClient id={params.id} />;
}
