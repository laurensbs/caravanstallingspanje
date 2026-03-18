'use client';

import Script from 'next/script';

// Tawk.to live chat widget
// Set NEXT_PUBLIC_TAWK_PROPERTY_ID and NEXT_PUBLIC_TAWK_WIDGET_ID in env
// Get these from https://dashboard.tawk.to → Administration → Chat Widget
export default function LiveChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || 'default';

  if (!propertyId) return null;

  return (
    <Script
      id="tawk-to"
      strategy="lazyOnload"
    >{`
      var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
      (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/${propertyId}/${widgetId}';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
      })();
    `}</Script>
  );
}
