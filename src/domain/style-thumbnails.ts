// Curated sample artistic thumbnails for the Style Selector cards.
// Each SVG is carefully crafted to represent the essence and medium of that artist style.

import type { StyleId } from "./entities/types";

export const styleSampleThumbnails: Record<StyleId, string> = {
  // 1. Original: Clean natural landscape / camera motif
  original: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="60%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#fed7aa"/>
    </linearGradient>
    <linearGradient id="mount" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" fill="url(#sky)"/>
  <circle cx="85" cy="35" r="16" fill="#fef08a" opacity="0.9"/>
  <polygon points="10,120 45,65 75,120" fill="url(#mount)"/>
  <polygon points="50,120 85,50 125,120" fill="#334155"/>
  <polygon points="0,120 30,85 60,120" fill="#64748b" opacity="0.8"/>
  <rect y="105" width="120" height="15" fill="#15803d"/>
</svg>
`)}`,

  // 2. Van Gogh Impressionist: Swirling starry sky and golden impasto strokes
  impressionist: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="swirl" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="40%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
  </defs>
  <rect width="120" height="120" fill="#0f172a"/>
  <!-- Swirling strokes -->
  <path d="M 10 30 Q 60 10 90 40 T 120 30" fill="none" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
  <path d="M 0 50 Q 40 20 80 60 T 130 45" fill="none" stroke="#facc15" stroke-width="7" stroke-linecap="round"/>
  <path d="M 5 75 Q 50 45 95 85 T 125 70" fill="none" stroke="#2563eb" stroke-width="6" stroke-linecap="round"/>
  <circle cx="85" cy="30" r="14" fill="#fef08a"/>
  <circle cx="85" cy="30" r="20" fill="none" stroke="#eab308" stroke-width="3" stroke-dasharray="4,3"/>
  <!-- Cypress silhouette -->
  <path d="M 15 120 Q 30 50 35 15 Q 42 60 55 120 Z" fill="#064e3b"/>
  <path d="M 22 120 Q 33 60 37 30 Q 42 70 48 120 Z" fill="#022c22"/>
</svg>
`)}`,

  // 3. Da Vinci Watercolor / Sfumato: Delicate Renaissance study & parchment sepia
  watercolor: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="parchment" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="70%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#d97706"/>
    </radialGradient>
  </defs>
  <rect width="120" height="120" fill="url(#parchment)"/>
  <!-- Sepia sketch lines -->
  <circle cx="60" cy="50" r="28" fill="none" stroke="#78350f" stroke-width="1.8" opacity="0.6"/>
  <ellipse cx="60" cy="52" rx="18" ry="24" fill="#fde68a" fill-opacity="0.3" stroke="#92400e" stroke-width="1.2"/>
  <path d="M 45 48 Q 52 42 60 48 Q 68 42 75 48" fill="none" stroke="#78350f" stroke-width="1.5"/>
  <path d="M 60 48 L 58 64 L 64 64" fill="none" stroke="#78350f" stroke-width="1.4"/>
  <path d="M 52 74 Q 60 78 68 74" fill="none" stroke="#92400e" stroke-width="1.6"/>
  <!-- Sfumato watercolor wash -->
  <path d="M 20 85 Q 60 70 100 85 L 120 120 L 0 120 Z" fill="#b45309" fill-opacity="0.25"/>
  <line x1="15" y1="20" x2="35" y2="40" stroke="#78350f" stroke-width="0.8" opacity="0.4"/>
  <line x1="20" y1="20" x2="40" y2="40" stroke="#78350f" stroke-width="0.8" opacity="0.4"/>
</svg>
`)}`,

  // 4. Seurat Pointillist: Dense stippled multi-color dots
  pointillist: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <rect width="120" height="120" fill="#f8fafc"/>
  <defs>
    <pattern id="points" width="12" height="12" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="2.5" fill="#3b82f6"/>
      <circle cx="9" cy="3" r="2.8" fill="#eab308"/>
      <circle cx="3" cy="9" r="2.4" fill="#10b981"/>
      <circle cx="9" cy="9" r="2.6" fill="#ef4444"/>
      <circle cx="6" cy="6" r="2.2" fill="#a855f7"/>
    </pattern>
  </defs>
  <rect width="120" height="120" fill="url(#points)"/>
  <circle cx="60" cy="55" r="32" fill="#f59e0b" fill-opacity="0.35"/>
  <circle cx="60" cy="55" r="22" fill="#3b82f6" fill-opacity="0.3"/>
</svg>
`)}`,

  // 5. Andy Warhol Pop Art: High contrast silkscreen color blocking
  "pop-art": `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <!-- 4 pop color quadrants -->
  <rect x="0" y="0" width="60" height="60" fill="#ec4899"/>
  <rect x="60" y="0" width="60" height="60" fill="#facc15"/>
  <rect x="0" y="60" width="60" height="60" fill="#06b6d4"/>
  <rect x="60" y="60" width="60" height="60" fill="#8b5cf6"/>
  <!-- Pop portraits -->
  <circle cx="30" cy="30" r="16" fill="#1e1b4b"/>
  <circle cx="90" cy="30" r="16" fill="#be185d"/>
  <circle cx="30" cy="90" r="16" fill="#fbbf24"/>
  <circle cx="90" cy="90" r="16" fill="#14532d"/>
  <!-- Graphic lips / features -->
  <ellipse cx="30" cy="34" rx="8" ry="4" fill="#f43f5e"/>
  <ellipse cx="90" cy="34" rx="8" ry="4" fill="#06b6d4"/>
  <ellipse cx="30" cy="94" rx="8" ry="4" fill="#ec4899"/>
  <ellipse cx="90" cy="94" rx="8" ry="4" fill="#fef08a"/>
</svg>
`)}`,

  // 6. Picasso Abstract / Cubist: Geometric faceted planes and bold contours
  abstract: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <rect width="120" height="120" fill="#fef3c7"/>
  <polygon points="0,0 70,0 40,65 0,45" fill="#f97316"/>
  <polygon points="70,0 120,0 120,70 85,50" fill="#3b82f6"/>
  <polygon points="40,65 85,50 95,120 30,120" fill="#10b981"/>
  <polygon points="0,45 40,65 30,120 0,120" fill="#a855f7"/>
  <polygon points="85,50 120,70 120,120 95,120" fill="#f43f5e"/>
  <!-- Cubist eye and profile contour -->
  <path d="M 45 40 Q 60 25 75 40 Q 60 55 45 40 Z" fill="#ffffff" stroke="#18181b" stroke-width="3"/>
  <circle cx="60" cy="40" r="6" fill="#09090b"/>
  <path d="M 60 15 L 68 55 L 50 75 L 75 95" fill="none" stroke="#09090b" stroke-width="3.5" stroke-linecap="round"/>
</svg>
`)}`,

  // 7. 3D Cartoon: Pixar-inspired warm animated character styling with studio lighting
  "classic-cartoon": `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="cartoonBg" cx="40%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#f472b6"/>
      <stop offset="50%" stop-color="#9333ea"/>
      <stop offset="100%" stop-color="#312e81"/>
    </radialGradient>
    <radialGradient id="faceShine" cx="35%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#ffedd5"/>
      <stop offset="70%" stop-color="#fed7aa"/>
      <stop offset="100%" stop-color="#fb923c"/>
    </radialGradient>
  </defs>
  <rect width="120" height="120" fill="url(#cartoonBg)"/>
  <!-- Warm cute animated face -->
  <circle cx="60" cy="62" r="34" fill="url(#faceShine)"/>
  <!-- Big expressive glossy eyes -->
  <ellipse cx="48" cy="55" rx="8" ry="11" fill="#1e1b4b"/>
  <ellipse cx="72" cy="55" rx="8" ry="11" fill="#1e1b4b"/>
  <circle cx="46" cy="51" r="3.5" fill="#ffffff"/>
  <circle cx="70" cy="51" r="3.5" fill="#ffffff"/>
  <circle cx="50" cy="57" r="1.5" fill="#ffffff"/>
  <circle cx="74" cy="57" r="1.5" fill="#ffffff"/>
  <!-- Warm smile and blushing cheeks -->
  <circle cx="38" cy="68" r="5" fill="#f43f5e" opacity="0.6"/>
  <circle cx="82" cy="68" r="5" fill="#f43f5e" opacity="0.6"/>
  <path d="M 52 68 Q 60 78 68 68" fill="none" stroke="#9a3412" stroke-width="2.5" stroke-linecap="round"/>
</svg>
`)}`,

  // 8. Storybook Watercolor: Nostalgic fairytale picture-book wash
  "storybook-watercolor": `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="fairytaleSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e0f2fe"/>
      <stop offset="50%" stop-color="#fdf4ff"/>
      <stop offset="100%" stop-color="#fef9c3"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" fill="url(#fairytaleSky)"/>
  <!-- Soft rolling watercolor hills -->
  <path d="M -10 90 Q 30 65 70 85 Q 100 100 130 80 L 130 130 L -10 130 Z" fill="#86efac" opacity="0.7"/>
  <path d="M -10 100 Q 40 85 80 105 Q 110 115 130 95 L 130 130 L -10 130 Z" fill="#4ade80" opacity="0.8"/>
  <!-- Fairytale cottage -->
  <rect x="45" y="65" width="30" height="24" fill="#ffedd5" stroke="#78350f" stroke-width="1.2"/>
  <polygon points="40,65 60,42 80,65" fill="#f87171" stroke="#991b1b" stroke-width="1.2"/>
  <rect x="56" y="74" width="8" height="15" fill="#78350f"/>
  <circle cx="95" cy="40" r="10" fill="#fef08a" opacity="0.85"/>
  <!-- Delicate watercolor floral dots -->
  <circle cx="20" cy="102" r="3" fill="#f472b6"/>
  <circle cx="28" cy="108" r="2.5" fill="#c084fc"/>
  <circle cx="102" cy="105" r="3" fill="#fbbf24"/>
</svg>
`)}`,

  // 9. Pop Oil: Modern vivid palette knife impasto
  "pop-oil": `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <rect width="120" height="120" fill="#18181b"/>
  <!-- Thick palette knife slabs -->
  <polygon points="10,20 85,10 75,45 5,40" fill="#06b6d4"/>
  <polygon points="30,35 110,25 105,65 25,60" fill="#f43f5e"/>
  <polygon points="15,55 95,50 85,85 10,80" fill="#eab308"/>
  <polygon points="40,75 115,70 105,110 30,105" fill="#8b5cf6"/>
  <!-- Thick 3D impasto light ridges -->
  <line x1="10" y1="20" x2="85" y2="10" stroke="#ffffff" stroke-width="2.5" opacity="0.7"/>
  <line x1="30" y1="35" x2="110" y2="25" stroke="#ffffff" stroke-width="2.5" opacity="0.6"/>
  <line x1="15" y1="55" x2="95" y2="50" stroke="#ffffff" stroke-width="2.5" opacity="0.7"/>
</svg>
`)}`,

  // 10. Vintage Noir: 1940s Hollywood cinema chiaroscuro with silver gelatin grain
  "noir-vintage": `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="spotlight" cx="60%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#a1a1aa"/>
      <stop offset="100%" stop-color="#09090b"/>
    </radialGradient>
  </defs>
  <rect width="120" height="120" fill="#09090b"/>
  <!-- Hollywood chiaroscuro portrait shadow -->
  <circle cx="65" cy="55" r="38" fill="url(#spotlight)"/>
  <!-- Venetian blind shadows -->
  <rect y="15" width="120" height="8" fill="#09090b" opacity="0.85"/>
  <rect y="35" width="120" height="9" fill="#09090b" opacity="0.85"/>
  <rect y="55" width="120" height="10" fill="#09090b" opacity="0.85"/>
  <rect y="75" width="120" height="11" fill="#09090b" opacity="0.85"/>
  <rect y="95" width="120" height="12" fill="#09090b" opacity="0.85"/>
  <!-- Classic noir silhouette silhouette -->
  <path d="M 45 120 C 45 80 52 65 65 65 C 78 65 85 80 85 120 Z" fill="#18181b"/>
  <circle cx="65" cy="50" r="14" fill="#27272a"/>
  <!-- Fedora hat slant -->
  <ellipse cx="65" cy="42" rx="20" ry="4" fill="#09090b"/>
  <polygon points="52,42 78,42 74,26 56,26" fill="#09090b"/>
</svg>
`)}`,
};
