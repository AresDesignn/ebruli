import type { ChallengeDef, Pigment, StrokeTelemetry } from '../types/ebru';

export const PIGMENTS: Pigment[] = [
  { id: 'lacivert', nameTr: 'Lacivert', nameEn: 'Ottoman Indigo', hex: '#17306b', viscosity: 0.86 },
  { id: 'kirmizi', nameTr: 'Lale Kırmızısı', nameEn: 'Madder Crimson', hex: '#b3262e', viscosity: 0.56 },
  { id: 'hardal', nameTr: 'Hardal Sarısı', nameEn: 'Ochre Mustard', hex: '#d4a017', viscosity: 0.34 },
  { id: 'yesil', nameTr: 'Çam Yeşili', nameEn: 'Pine Viridian', hex: '#1f7a5c', viscosity: 0.64 },
  { id: 'turkuaz', nameTr: 'Turkuaz', nameEn: 'Iznik Turquoise', hex: '#1fa3b0', viscosity: 0.26 },
  { id: 'murdum', nameTr: 'Mürdüm', nameEn: 'Deep Plum', hex: '#6c2d5c', viscosity: 0.78 },
  { id: 'krem', nameTr: 'Üstübeç', nameEn: 'Warm Cream', hex: '#efe7d6', viscosity: 0.28 },
  { id: 'siyah', nameTr: 'İs Siyahı', nameEn: 'Lamp Black', hex: '#1a1a1e', viscosity: 0.92 },
];

export function getPigmentViscosity(hex: string): number {
  const found = PIGMENTS.find((p) => p.hex.toLowerCase() === hex.toLowerCase());
  return found ? found.viscosity : 0.55;
}

export const CHALLENGES: ChallengeDef[] = [
  {
    id: 'battal',
    level: 1,
    titleTr: 'Battal Ebru',
    titleEn: 'Battal Stone Marbling',
    subtitleTr: 'Tarak veya biz değmeden, yalnızca damla ve serpmenin suyu itişiyle oluşan temel ebru.',
    subtitleEn: 'Foundational stone marbling shaped solely by radial drop displacement and splatter.',
    paletteIds: ['lacivert', 'hardal', 'kirmizi', 'krem'],
    recommendedTool: 'serpme',
    guideType: 'battal',
    steps: [
      {
        id: 'battal-speckle',
        textTr: 'Serpme ile en az 2 renk kullanarak zemin boyaları serpin',
        textEn: 'Scatter base droplets across the tray using Splatter in at least 2 colors',
        isComplete: (t) => t.speckles >= 14 && t.distinctColors.length >= 2,
      },
      {
        id: 'battal-drops',
        textTr: 'Damla aracıyla 5 büyük veya orta damla bırakıp halkaları itin',
        textEn: 'Place 5 drops to radially push the speckled bed into organic stones',
        isComplete: (t) => t.drops >= 5 && t.distinctColors.length >= 3,
      },
    ],
  },
  {
    id: 'gelgit',
    level: 2,
    titleTr: 'Gelgit',
    titleEn: 'Gelgit (Ebb & Flow)',
    subtitleTr: 'Geniş dişli tarakla ileri geri ritmik çekişlerle oluşan karşılıklı dalga deseni.',
    subtitleEn: 'Rhythmic alternating waves pulled across a rich pigment bed with the wide comb.',
    paletteIds: ['lacivert', 'turkuaz', 'krem', 'kirmizi'],
    recommendedTool: 'damla',
    guideType: 'gelgit',
    steps: [
      {
        id: 'gelgit-base',
        textTr: 'En az 3 farklı renkte 6 damla veya serpme ile tekneyi doldurun',
        textEn: 'Populate the bath with at least 6 drops or splatters across 3 colors',
        isComplete: (t) => t.drops + t.speckles >= 10 && t.distinctColors.length >= 3,
      },
      {
        id: 'gelgit-passes',
        textTr: 'Gelgit tarağını seçip tekne boyunca en az 3 düzenli geçiş yapın',
        textEn: 'Select Wide Comb (Gelgit) and sweep at least 3 passes across the bath',
        isComplete: (t) => t.gelgitPasses >= 3,
      },
    ],
  },
  {
    id: 'tarama',
    level: 3,
    titleTr: 'Tarama & Şal',
    titleEn: 'Tarama & Shawl',
    subtitleTr: 'Gelgit dalgalarının üzerine sık dişli tarak ve biz ile dokunan geleneksel şal deseni.',
    subtitleEn: 'Layered wide-comb waves combed finely at a cross angle into intricate shawl arcs.',
    paletteIds: ['kirmizi', 'hardal', 'lacivert', 'krem'],
    recommendedTool: 'gelgit',
    guideType: 'tarama',
    steps: [
      {
        id: 'tarama-bed',
        textTr: 'En az 3 renkte damlalarla zengin bir zemin kurun',
        textEn: 'Build a multi-color base using at least 3 pigments',
        isComplete: (t) => t.drops + t.speckles >= 8 && t.distinctColors.length >= 3,
      },
      {
        id: 'tarama-gelgit',
        textTr: 'Önce Gelgit tarağı ile 2 ana dalga geçişi yapın',
        textEn: 'Sweep 2 initial wave passes with the Wide Comb (Gelgit)',
        isComplete: (t) => t.gelgitPasses >= 2,
      },
      {
        id: 'tarama-fine',
        textTr: 'Tarama tarağı ile dikey veya çapraz yönde 2 ince çekiş yapın',
        textEn: 'Cross-comb with Fine Comb (Tarama) for at least 2 passes',
        isComplete: (t) => t.tarakPasses >= 2,
      },
    ],
  },
  {
    id: 'hatip',
    level: 4,
    titleTr: 'Hatip Çiçeği',
    titleEn: 'Hatip Rosette',
    subtitleTr: 'İç içe damlatılan halkaların biz ucuyla içeri ve dışarı çekilmesiyle açılan çiçek motifi.',
    subtitleEn: 'Concentric pigment rings pulled inward and outward with the awl to bloom a rosette.',
    paletteIds: ['turkuaz', 'lacivert', 'kirmizi', 'hardal', 'krem'],
    recommendedTool: 'damla',
    guideType: 'hatip',
    steps: [
      {
        id: 'hatip-rings',
        textTr: 'Merkeze yakın en az 5 iç içe damla bırakarak halka oluşturun',
        textEn: 'Drop at least 5 concentric pigments near the center target',
        isComplete: (t) => t.centerDrops >= 5 && t.distinctColors.length >= 3,
      },
      {
        id: 'hatip-petals',
        textTr: 'Biz aracını seçip halkaları merkezden dışa ve içe çekerek taç yapraklar açın',
        textEn: 'Use the Awl (Biz) to pull alternating spokes through the rings',
        isComplete: (t) => t.bizDistance >= 0.9,
      },
    ],
  },
  {
    id: 'bulbul',
    level: 5,
    titleTr: 'Bülbül Yuvası',
    titleEn: 'Nightingale’s Nest',
    subtitleTr: 'Çarpıcı helezonların biz ile içten dışa kıvrıldığı klasik ustalık deseni.',
    subtitleEn: 'Classic master motif featuring tight spiral whorls wound outward with the awl.',
    paletteIds: ['yesil', 'lacivert', 'hardal', 'kirmizi', 'krem'],
    recommendedTool: 'damla',
    guideType: 'bulbul',
    steps: [
      {
        id: 'bulbul-prep',
        textTr: 'Serpme ve damlalarla en az 4 renkli çok katmanlı zemin hazırlayın',
        textEn: 'Layer at least 4 colors across the bath with drops and splatter',
        isComplete: (t) => t.drops + t.speckles >= 10 && t.distinctColors.length >= 4,
      },
      {
        id: 'bulbul-comb',
        textTr: 'Gelgit veya Tarama tarağıyla deseni şeritlere ayırın',
        textEn: 'Pass a Wide or Fine Comb across the bath to align pigment bands',
        isComplete: (t) => t.gelgitPasses + t.tarakPasses >= 2,
      },
      {
        id: 'bulbul-spiral',
        textTr: 'Biz ile tekne içinde dairesel helezonlar kıvırın',
        textEn: 'Draw spiraling whorls across the bands with the Awl (Biz)',
        isComplete: (t) => t.bizDistance >= 1.2,
      },
    ],
  },
];

export function evaluateChallengeSeals(
  challenge: ChallengeDef,
  telemetry: StrokeTelemetry
): number {
  const completedCount = challenge.steps.filter((s) => s.isComplete(telemetry)).length;
  if (completedCount === 0) return 1;
  if (completedCount < challenge.steps.length) return 2;
  // Bonus check for rich color variety
  return telemetry.distinctColors.length >= Math.min(3, challenge.paletteIds.length) ? 3 : 2;
}
