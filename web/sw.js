var CACHE_VERSION = 1;
var CURRENT_CACHES = {
  appshell: 'fortunate-appshell-v' + CACHE_VERSION 
};

self.addEventListener('install', function(event) {
  var app_shell = [
    'index.html',
    'fortunate.js',
    '../fortunes/douglas-adams.fortune'
  ];

  event.waitUntil(
    caches.open('fortunate-appshell-v1').then(function(cache) {
      return cache.addAll(app_shell);
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
