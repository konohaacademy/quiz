// ちしきクエストのサービスワーカー（2026-10-21）。ホーム画面から開いたとき、電波が無くても遊べるようにする。
//  ⚠ いつもは ネットを先に見る（問題や画面を直したら、次に開いたときに新しいものが出る）。つながらないときだけ しまったものを出す。
//  ⚠ konohaacademy.github.io は まなびのテラス（/manabi/）と同じ場所。ここは /quiz/ の中だけを受け持ち、しまう名前も cq- で始める。
'use strict';
const CACHE = 'cq-v1';
const SHELL = ['./', './index.html', './bank.json', './manifest.json', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('cq-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.pathname.startsWith(new URL('./', self.registration.scope).pathname)) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
