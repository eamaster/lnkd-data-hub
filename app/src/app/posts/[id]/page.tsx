// Generate static params for static export
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

import PostClient from './PostClient';

export default function PostPage({ params }: { params: { id: string } }) {
  return <PostClient id={params.id} />;
}