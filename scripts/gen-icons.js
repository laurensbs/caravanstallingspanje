const fs = require('fs');
const path = require('path');

const icons = [
  { path: 'public/images/icon-192.svg', size: 192 },
  { path: 'public/images/icon-512.svg', size: 512 },
  { path: 'public/icons/icon-192x192.svg', size: 192 },
  { path: 'public/icons/icon-72x72.svg', size: 72 },
];

for (const icon of icons) {
  const s = icon.size;
  const rx = Math.round(s * 0.2);
  const fs2 = Math.round(s * 0.35);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${rx}" fill="#C4653A"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="${fs2}" fill="white">CS</text>
</svg>`;
  const outPath = path.join(__dirname, '..', icon.path);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, svg);
  console.log('Created:', icon.path);
}
