// Generate static params for static export
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

import ProductClient from './ProductClient';

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductClient id={params.id} />;
}