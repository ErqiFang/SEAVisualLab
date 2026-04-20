const palettes = [
  ["#1d4ed8", "#bfdbfe", "#dbeafe"],
  ["#be123c", "#fecdd3", "#ffe4e6"],
  ["#0f766e", "#99f6e4", "#ccfbf1"],
  ["#7c3aed", "#ddd6fe", "#f3e8ff"],
  ["#a16207", "#fde68a", "#fef3c7"],
  ["#0f172a", "#cbd5e1", "#e2e8f0"]
];

function encodeSvg(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function buildMockImage(params: {
  title: string;
  subtitle: string;
  badge: string;
  ratio: "1:1" | "4:5" | "16:9";
  index?: number;
}) {
  const [primary, mid, soft] = palettes[(params.index ?? 0) % palettes.length];
  const sizeMap = {
    "1:1": [900, 900],
    "4:5": [960, 1200],
    "16:9": [1280, 720]
  } as const;
  const [width, height] = sizeMap[params.ratio];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${soft}" />
          <stop offset="55%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="${mid}" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="28" fill="url(#g)" />
      <circle cx="${width - 120}" cy="120" r="88" fill="${mid}" opacity="0.42" />
      <circle cx="120" cy="${height - 120}" r="96" fill="${soft}" opacity="0.85" />
      <rect x="56" y="58" width="${width - 112}" height="${height - 116}" rx="36" fill="#ffffff" opacity="0.9" />
      <rect x="${width * 0.11}" y="${height * 0.18}" width="${width * 0.3}" height="${height * 0.5}" rx="36" fill="${primary}" opacity="0.92" />
      <rect x="${width * 0.47}" y="${height * 0.22}" width="${width * 0.3}" height="${height * 0.42}" rx="30" fill="${mid}" opacity="0.75" />
      <rect x="${width * 0.47}" y="${height * 0.68}" width="${width * 0.21}" height="${height * 0.05}" rx="18" fill="${primary}" opacity="0.18" />
      <text x="82" y="116" font-size="${Math.max(24, width * 0.028)}" font-family="Arial, sans-serif" fill="${primary}" font-weight="700">${params.badge}</text>
      <text x="82" y="${height - 148}" font-size="${Math.max(42, width * 0.04)}" font-family="Arial, sans-serif" fill="#0f172a" font-weight="700">${params.title}</text>
      <text x="82" y="${height - 96}" font-size="${Math.max(22, width * 0.022)}" font-family="Arial, sans-serif" fill="#475569">${params.subtitle}</text>
    </svg>
  `;

  return encodeSvg(svg);
}
