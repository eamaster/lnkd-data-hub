import axios from 'axios';

const RAPIDAPI_HOST = 'linkedin-api-data.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY as string; // in Cloudflare Workers use env binding

export async function productSearch({ query, limit = 10, offsite = 1 }: { query: string; limit?: number; offsite?: number; }) {
  const url = `https://${RAPIDAPI_HOST}/product/search`;
  const resp = await axios.get(url, {
    params: { offsite, limit, query },
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    timeout: 10000
  });
  return resp.data;
}
