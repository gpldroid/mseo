/* Google Analytics 4 — preserved from the previous site.
   Loads only when the visitor's existing consent choice is "accepted". */
(()=>{'use strict';
const GA_ID='G-BDHDY9739D';
let consent=null;try{consent=localStorage.getItem('mseo-consent-v1')}catch{}
if(consent!=='accepted'||window.__mseoAnalyticsLoaded)return;
window.__mseoAnalyticsLoaded=true;
window.dataLayer=window.dataLayer||[];
window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
window.gtag('js',new Date());
window.gtag('config',GA_ID);
const script=document.createElement('script');
script.async=true;
script.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;
document.head.appendChild(script);
})();