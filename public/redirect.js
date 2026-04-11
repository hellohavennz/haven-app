// Redirect to /uk if the app loads outside its basename.
// This handles the PWA Service Worker navigateFallback edge case where the SW
// serves index.html for the root URL but the browser path stays at /.
(function () {
  if (!window.location.pathname.startsWith('/uk')) {
    window.location.replace('/uk' + window.location.search + window.location.hash);
  }
})();
