/* global self, caches, fetch */

const appCacheName = 'misterpwa'
const dataCacheName = 'misterpwa-data'
const filesToCache = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/styles/main.css',
  '/styles/spinner.css',
  '/images/logo.svg'
]

self.addEventListener('install', e => {
  console.log('[ServiceWorker] Install')
  e.waitUntil(
    caches.open(appCacheName).then(cache => {
      console.log('[ServiceWorker] Caching the app shell')
      return cache.addAll(filesToCache)
    })
  )
})

self.addEventListener('activate', e => {
  console.log('[ServiceWorker] Activated')
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== appCacheName && key !== dataCacheName) {
            console.log('[ServiceWorker] Removing old cache', key)
            return caches.delete(key)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  console.log('[ServiceWorker] Fetching... ', e.request.url)
  const url = 'https://engineers-id-backend-ybbwzovhnl.now.sh/api/videos'
  if (e.request.url.indexOf(url) > -1) {
    e.respondWith(
      caches.open(dataCacheName).then(cache => {
        return fetch(e.request, { mode: 'cors' })
          .then(networkResponse => {
            cache.put(e.request, networkResponse.clone())
            return networkResponse
          })
          .catch(() => {
            return caches.match(e.request)
          })
      })
    )
  } else {
    e.respondWith(
      caches.match(e.request).then(response => {
        return response || fetch(e.request)
      })
    )
  }
})
