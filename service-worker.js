/* global self, caches, fetch */

const cacheName = 'misterpwa'
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
    caches.open(cacheName).then(cache => {
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
          if (key !== cacheName) {
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
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  )
})
