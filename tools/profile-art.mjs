// Draw the same projected ribbon at two scales so the byline stays legible on phones.
import { writeFile } from 'node:fs/promises';

function ribbon() {
  const strands = [];
  const tau = 2 * Math.PI;
  for (let i = 0; i <= 48; i++) {
    const v = (i / 48 - .5) * 1.18;
    const points = [];
    for (let j = 0; j <= 160; j++) {
      const t = tau * j / 160;
      const r = 1 + .30 * Math.cos(3 * t) + v * Math.cos(1.5 * t);
      const x = r * Math.cos(2 * t);
      const y = r * Math.sin(2 * t);
      const z = .68 * Math.sin(3 * t) + v * Math.sin(1.5 * t);
      points.push((112 * (x + .12 * z)).toFixed(1) + ',' + (84 * (.32 * y - .97 * z) - 20 * x).toFixed(1));
    }
    strands.push('<path d="M' + points.join(' ') + '"/>');
  }
  return strands.join('\n');
}

function header(mobile, lines) {
  const width = mobile ? 440 : 1200;
  const height = mobile ? 310 : 370;
  const field = mobile ? 'translate(367 76) scale(.57)' : 'translate(937 172) scale(1.38)';
  const title = mobile ? 63 : 103;
  const left = mobile ? 22 : 52;
  const top = mobile ? 133 : 168;
  const second = mobile ? 196 : 257;
  const foot = mobile ? 269 : 312;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="t d">
  <title id="t">Ihtisham Ahmad · Applied AI and software engineering</title>
  <desc id="d">An electric blue and mint ribbon folds into a three-dimensional knot alongside the developer's name.</desc>
  <defs>
    <linearGradient id="spectral" x1="0" y1="0" x2="1" y2=".36" gradientUnits="objectBoundingBox">
      <stop stop-color="#9c7bff"/><stop offset=".32" stop-color="#667cff"/><stop offset=".56" stop-color="#8cbcff"/><stop offset=".8" stop-color="#6df7e3"/><stop offset="1" stop-color="#e4ffd5"/>
    </linearGradient>
    <radialGradient id="bloom"><stop stop-color="#2b3b70" stop-opacity=".65"/><stop offset="1" stop-color="#111725" stop-opacity="0"/></radialGradient>
    <style>@media (prefers-reduced-motion:no-preference){.field{animation:develop 1.45s ease-out both}@keyframes develop{from{opacity:.2}to{opacity:1}}}</style>
  </defs>
  <rect width="100%" height="100%" fill="#111725"/>
  <g transform="${field}">
    <ellipse rx="208" ry="155" fill="url(#bloom)"/>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="url(#spectral)" stroke-width=".94" class="field">${lines}</g>
  </g>
  <g fill="#c8ffb9" font-family="Consolas,monospace" font-size="${mobile ? 12 : 15}" letter-spacing="1.5">
    <path d="M${left} ${mobile ? 38 : 55}h20" stroke="#c8ffb9" stroke-width="3"/>
    <text x="${left + 32}" y="${mobile ? 42 : 60}">ENGINEERING PORTFOLIO</text>
  </g>
  <g fill="#faf6ed" font-size="${title}" letter-spacing="-4">
    <text x="${left-3}" y="${top}" font-family="Arial,Helvetica,sans-serif" font-weight="700">Ihtisham</text>
    <text x="${left-2}" y="${second}" font-family="Georgia,'Times New Roman',serif" font-style="italic">Ahmad</text>
  </g>
  <path d="M${left} ${foot-25}h${mobile ? 390 : 530}" stroke="#41495b"/>
  <g fill="#cdd3e3" font-family="Arial,Helvetica,sans-serif" font-size="${mobile ? 18 : 22}">
    <text x="${left}" y="${foot+7}">Applied AI <tspan fill="#8a94aa">/</tspan> Software engineering</text>
  </g>
</svg>\n`;
}

const lines = ribbon();
for (const [mobile, name] of [[false, 'field'], [true, 'field-mobile']]) {
  await writeFile(new URL('../assets/folio/' + name + '.svg', import.meta.url), header(mobile, lines));
}
