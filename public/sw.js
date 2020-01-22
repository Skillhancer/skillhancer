const cacheName = 'news-v1';
const staticAssets = [
  './',
  './index.ejs',
  './indexblue.ejs',
  './mainpage.ejs',
  './myprofile.ejs',
  './privacy_policy.ejs',
  './profile.ejs',
  './sharedProfile.ejs',
  './upload.ejs',
  './css/body.css',
  './css/index.css',
  './css/mainpage.css',
  './css/materialize.css',
  './css/materialize.min.css',
  './css/myprofile.css',
  './css/navbar.css',
  './css/profile.css',
  './css/searchbar.css'
];

self.addEventListener('install', async e => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
  return self.skipWaiting();
});

self.addEventListener('activate', e => {
  self.clients.claim();
});

self.addEventListener('fetch', async e => {
  const req = e.request;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    e.respondWith(cacheFirst(req));
  } else {
    e.respondWith(networkAndCache(req));
  }
});

async function cacheFirst(req) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  return cached || fetch(req);
}

async function networkAndCache(req) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);
    await cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(req);
    return cached;
  }
}