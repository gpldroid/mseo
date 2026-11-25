# MSEO — Tracking and verification codes

This file preserves the tracking/verification identifiers found in the existing site before the rebuild.

## Google Search Console

Existing HTML verification meta tag (found in the previous root index.html):

```html
<meta name="google-site-verification" content="2-SUpcRCe1x54zAb_F3oJvBtUvMzUCZkKhUuNQd_UPQ" />
```

## Google Analytics 4

Existing GA4 Measurement ID: `G-BDHDY9739D`

Existing implementation:

```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-BDHDY9739D');
  (function(){
    var loaded = false;
    function loadAnalytics(){
      if (loaded) return;
      loaded = true;
      var script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-BDHDY9739D';
      script.async = true;
      document.head.appendChild(script);
    }
    if ('requestIdleCallback' in window) {
      window.addEventListener('load', function(){ window.requestIdleCallback(loadAnalytics, {timeout: 2000}); }, {once:true});
    } else {
      window.addEventListener('load', loadAnalytics, {once:true});
    }
  })();
</script>
```

## Google AdSense

The existing `ads.txt` file is retained at the repository root:

```text
google.com, pub-1849282438800062, DIRECT, f08c47fec0942fa0
```

No AdSense JavaScript loader (`adsbygoogle.js`) was found in the previous root homepage during this inspection, so no loader snippet was available to preserve. The publisher record above is retained unchanged.
