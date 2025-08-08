import app from '../../workers/src/index';

describe('Worker proxy', () => {
  it('returns 400 on invalid query', async () => {
    const req = new Request('http://localhost/api/search/people?limit=0');
    const kv = { get: async () => null, put: async () => {} } as any;
    const res = await app.fetch(req, { RAPIDAPI_HOST: 'x', RAPIDAPI_KEY: 'k', JWT_SECRET: 's', LINKEDIN_HUB_KV: kv });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('code');
    expect(body).toHaveProperty('message');
  });
});
