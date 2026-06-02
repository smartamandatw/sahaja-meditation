const CACHE = 'sahaja-v3';

// ── 固定快取（App 核心檔案）──────────────────────────────────
const STATIC_ASSETS = [
  '/sahaja-meditation/',
  '/sahaja-meditation/index.html',
  '/sahaja-meditation/manifest.json',
];

// ── 音檔清單（每次更新音檔時，在這裡加入或修改）──────────────
// 格式：'/sahaja-meditation/images/檔名'
const AUDIO_ASSETS = [
  '/sahaja-meditation/images/day1.m4a',
  '/sahaja-meditation/images/day2.m4a',
  '/sahaja-meditation/images/day3.m4a',
  '/sahaja-meditation/images/day4.m4a',
  '/sahaja-meditation/images/day5.m4a',
  '/sahaja-meditation/images/day6.m4a',
  '/sahaja-meditation/images/day7.m4a',
];

// ── 安裝：快取核心檔案 ─────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ── 啟動：清除舊快取 ───────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── 攔截請求：快取優先，音檔網路優先 ──────────────────────────
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // 音檔：網路優先，失敗才用快取（確保能取得最新版）
  const isAudio = AUDIO_ASSETS.some(a => url.includes(a.split('/sahaja-meditation')[1]));
  if (isAudio) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          // 成功取得就存入快取
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request)) // 無網路就用快取
    );
    return;
  }

  // 其他資源：快取優先
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).catch(() => caches.match('/sahaja-meditation/'))
    )
  );
});
