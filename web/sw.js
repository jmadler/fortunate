'use strict';

var CACHE_VERSION = 1;
var CURRENT_CACHES = {
  appshell: 'fortunate-appshell-v' + CACHE_VERSION
};

self.addEventListener('install', function(event) {
  var appShell = [
    'index.html',
    'fortunate.js',
    '../fortunes/douglas-adams.fortune'
  ];

  event.waitUntil(
    caches.open('fortunate-appshell-v1').then(function(cache) {
      return cache.addAll(appShell);
    })
  );
});

self.addEventListener('activate', function(event) {
  // Delete all caches that aren't named in CURRENT_CACHES.
  // While there is only one cache in this example, the same logic will handle the case where
  // there are multiple versioned caches.
  let expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
    return CURRENT_CACHES[key];
  });

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (expectedCacheNames.indexOf(cacheName) === -1) {
            // If this cache name isn't present in the array of "expected" cache names,
            // then delete it.
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request, {ignoreSearch: true}).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
