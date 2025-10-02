import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to search page as the main landing page
  redirect('/search');
}
