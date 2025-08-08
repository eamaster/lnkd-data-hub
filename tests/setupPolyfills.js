if (typeof global.Request === 'undefined') {
  // Use undici if available
  try {
    const undici = require('undici');
    global.fetch = undici.fetch;
    global.Headers = undici.Headers;
    global.Request = undici.Request;
    global.Response = undici.Response;
    global.URL = URL;
  } catch {}
}
