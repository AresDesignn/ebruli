import type { LetterChoice, StoryChapterDef } from '../types/ebru';

export const STORY_CHAPTERS: StoryChapterDef[] = [
  {
    id: 'prolog',
    index: 0,
    season: 'winter_late',
    seasonTr: 'Prolog · Kış Sonu',
    seasonEn: 'Prologue · Late Winter',
    titleTr: 'Sessiz Su',
    titleEn: 'Still Water',
    ustaLineTr: '“Bekle. Önce suyun nasıl nefes aldığını gör.”',
    ustaLineEn: '“Wait. First see how the water breathes.”',
    sakinGoalTr: 'Boş tekneye ilk boya damlasını bırak ve halkaların açılışını izle.',
    sakinGoalEn: 'Drop your first pigment onto the empty bath and watch the rings open.',
    ustaGoalTr: 'En az 3 farklı damla bırakarak kıvamlı suyun dengesini kur.',
    ustaGoalEn: 'Place at least 3 drops to test the tension of the prepared bath.',
    waterLightHex: '#cfd8d6',
    waterDarkHex: '#18202b',
    unlockedTools: ['damla'],
    defaultTool: 'damla',
    paletteIds: ['lacivert', 'hardal', 'kirmizi', 'krem'],
    sakinComplete: (t) => t.drops >= 1,
    ustaComplete: (t) => t.drops >= 3 && t.distinctColors.length >= 2,
    memoryId: 'mem-prolog',
    memoryCaptionTr: 'Genç bir ustanın elleri, kıpırtısız bir teknenin üstünde ilk damlayı tutar.',
    memoryCaptionEn: 'A young master’s hands hover above a still tray, holding the very first drop.',
  },
  {
    id: 'bolum-1-ilkbahar',
    index: 1,
    season: 'spring',
    seasonTr: 'Bölüm I · İlkbahar',
    seasonEn: 'Chapter I · Spring',
    titleTr: 'Battal',
    titleEn: 'Battal',
    ustaLineTr: '“Boya suyu iterse, halka kendiliğinden konuşur.”',
    ustaLineEn: '“When pigment pushes water, the ring speaks on its own.”',
    sakinGoalTr: 'Serpme ve biz açıldı. Dilediğin gibi bir bahar deseni kur.',
    sakinGoalEn: 'Splatter and Awl are now open. Marble a spring surface at your own pace.',
    ustaGoalTr: 'Serpme ile zemin at, en az 4 damla bırak ve Biz ile suya bir iz çiz.',
    ustaGoalEn: 'Scatter base droplets, place 4 drops, and draw a gentle line with the Awl.',
    waterLightHex: '#d7e2dc',
    waterDarkHex: '#1a252b',
    unlockedTools: ['damla', 'serpme', 'biz'],
    defaultTool: 'serpme',
    paletteIds: ['yesil', 'hardal', 'krem', 'lacivert'],
    sakinComplete: (t) => t.drops + t.speckles >= 6,
    ustaComplete: (t) =>
      t.speckles >= 10 && t.drops >= 4 && t.bizDistance >= 0.25 && t.distinctColors.length >= 2,
    memoryId: 'mem-spring',
    memoryCaptionTr:
      'Usta ve Nur, güneşli bir bahar sabahında aynı tekneye ilk kez yan yana eğilir.',
    memoryCaptionEn:
      'Usta and young Nur lean over the same tray side by side on a sunlit spring morning.',
    letter: {
      id: 'letter-1',
      senderTr: 'Kenardaki Zarf · Nur',
      senderEn: 'Envelope by the Tray · Nur',
      hasChoice: false,
      paragraphsTr: [
        'Ustam, Boğaz’a bakan o üst katta sabahları hâlâ kitre kokuyor mu?',
        'Yeni şehirde ellerim başka işlere değiyor ama ne zaman su sesi duysam tekne başında durduğumuz ilk günü hatırlıyorum.',
        'İyi olmanızı dilerim. Bir gün dönersem, yine sessizce kapıda beklerim.',
      ],
      paragraphsEn: [
        'Master, does the upstairs room overlooking the Bosphorus still smell of tragacanth in the mornings?',
        'In this new city my hands turn to other trades, yet whenever I hear water lap I remember our very first day at the tray.',
        'I hope you are well. If I ever return, I will wait quietly by the threshold again.',
      ],
    },
  },
  {
    id: 'bolum-2-yaz',
    index: 2,
    season: 'summer',
    seasonTr: 'Bölüm II · Yaz',
    seasonEn: 'Chapter II · Summer',
    titleTr: 'Gelgit',
    titleEn: 'Ebb & Flow',
    ustaLineTr: '“Bazen çizgi şaşar; su yargılamaz.”',
    ustaLineEn: '“Sometimes a line wavers; water never judges.”',
    sakinGoalTr: 'Gelgit tarağı açıldı. Ustanın bıraktığı çizginin yanından dalgaları sürdür.',
    sakinGoalEn: 'Wide Comb (Gelgit) is open. Pull waves beside the master’s drifting line.',
    ustaGoalTr: 'Gelgit tarağı ile tekne boyunca en az 3 düzenli geçiş yapıp dalgayı topla.',
    ustaGoalEn: 'Sweep at least 3 steady Wide Comb passes across the tray to align the waves.',
    waterLightHex: '#cfe0df',
    waterDarkHex: '#18262e',
    unlockedTools: ['damla', 'serpme', 'biz', 'gelgit'],
    defaultTool: 'gelgit',
    paletteIds: ['turkuaz', 'lacivert', 'krem', 'kirmizi'],
    seedBlindStroke: true,
    sakinComplete: (t) => t.gelgitPasses >= 1 || t.drops + t.bizDistance >= 1,
    ustaComplete: (t) => t.gelgitPasses >= 3,
    memoryId: 'mem-summer',
    memoryCaptionTr:
      'Sıcak bir yaz ikindisi: Nur’un kırgın sesi yükselir, ustanın cevabı ise yarım kalır.',
    memoryCaptionEn:
      'A warm summer afternoon: Nur’s hurt voice rises, while the master’s reply remains unfinished.',
  },
  {
    id: 'bolum-3-sonbahar',
    index: 3,
    season: 'autumn',
    seasonTr: 'Bölüm III · Sonbahar',
    seasonEn: 'Chapter III · Autumn',
    titleTr: 'Hatıra',
    titleEn: 'Remembrance',
    ustaLineTr: '“Her yaprak merkezden dışa değil, kalpten suya açılır.”',
    ustaLineEn: '“Each petal opens not from center outward, but from heart to water.”',
    sakinGoalTr: 'Tarama tarağı da artık senin. Dilediğin bir sonbahar çiçeği kur.',
    sakinGoalEn: 'Fine Comb (Tarama) is now yours. Compose an autumn bloom as you wish.',
    ustaGoalTr: 'Merkeze en az 4 iç içe damla bırak, Tarama veya Biz ile hatip deseni aç.',
    ustaGoalEn: 'Drop 4 concentric pigments near center and shape petals with Awl or Fine Comb.',
    waterLightHex: '#ddd7cc',
    waterDarkHex: '#201e24',
    unlockedTools: ['damla', 'serpme', 'biz', 'gelgit', 'tarak'],
    defaultTool: 'damla',
    paletteIds: ['kirmizi', 'hardal', 'murdum', 'lacivert', 'krem'],
    sakinComplete: (t) => t.drops >= 3 && (t.bizDistance >= 0.2 || t.tarakPasses >= 1),
    ustaComplete: (t) =>
      t.centerDrops >= 4 &&
      t.distinctColors.length >= 3 &&
      (t.bizDistance >= 0.65 || t.tarakPasses >= 1),
    memoryId: 'mem-autumn',
    memoryCaptionTr:
      'Yağmurlu bir sonbahar günü Nur önlüğünü katlayıp masaya bırakır; usta tek söz söylemez.',
    memoryCaptionEn:
      'On a rainy autumn morning Nur folds her apron onto the bench; the master stays silent.',
    letter: {
      id: 'letter-2',
      senderTr: 'İkinci Mektup · Nur',
      senderEn: 'Second Letter · Nur',
      hasChoice: true,
      paragraphsTr: [
        'Bu hafta İstanbul’a dönüyorum. Eski sokağımızdan geçecek cesareti bulabilecek miyim bilmiyorum.',
        'Usta hâlâ benim bıraktığım yerdeki gibi kızgın mı? Yoksa tekne başında bir misafire yer var mı?',
        'Cevap gelmezse sessizce uzaktan geçer giderim.',
      ],
      paragraphsEn: [
        'I am returning to Istanbul this week. I do not know if I have the courage to walk down our old street.',
        'Is the master still hurt where I left things? Or is there room by the tray for an old apprentice?',
        'If no word comes, I will pass by quietly from afar.',
      ],
    },
  },
  {
    id: 'bolum-4-kis',
    index: 4,
    season: 'winter',
    seasonTr: 'Bölüm IV · Kış',
    seasonEn: 'Chapter IV · Winter',
    titleTr: 'Kâğıda Almak',
    titleEn: 'Transfer to Paper',
    ustaLineTr: '“Son tekne hazır. Bu kez kâğıt bir daha değişmeyecek.”',
    ustaLineEn: '“The final bath is ready. This time the paper will never change again.”',
    sakinGoalTr: 'Tüm mevsimlerin renkleriyle son eseri kur ve “Kağıda Al” ile sabitle.',
    sakinGoalEn: 'Compose the final work with every season’s hues, then Transfer to Paper.',
    ustaGoalTr: 'En az 3 renk, bir tarak veya biz dokunuşuyla deseni kur ve Kağıda Al.',
    ustaGoalEn: 'Layer at least 3 pigments with comb or awl work, then Transfer to Paper.',
    waterLightHex: '#d3dad9',
    waterDarkHex: '#19212c',
    unlockedTools: ['damla', 'serpme', 'biz', 'gelgit', 'tarak'],
    defaultTool: 'damla',
    paletteIds: ['lacivert', 'kirmizi', 'hardal', 'turkuaz', 'krem'],
    isFinalPrintChapter: true,
    sakinComplete: () => false, // Completes via Paper Transfer ritual
    ustaComplete: () => false, // Completes via Paper Transfer ritual
    memoryId: 'mem-winter',
    memoryCaptionTr: 'Parmak uçları kâğıdın üstündeki boya kabartısında durur.',
    memoryCaptionEn: 'Fingertips come to rest upon the raised pigment ridges of the paper.',
  },
  {
    id: 'epilog-bahar',
    index: 5,
    season: 'epilogue',
    seasonTr: 'Epilog · Bahar',
    seasonEn: 'Epilogue · Spring',
    titleTr: 'Boş Tekne',
    titleEn: 'Empty Tray',
    ustaLineTr: '“Başla.”',
    ustaLineEn: '“Begin.”',
    sakinGoalTr: 'Aynı sabah, aynı tekne, yeni bir sayfa. İlk damla artık senin.',
    sakinGoalEn: 'Same morning, same tray, a fresh page. The first drop is yours.',
    ustaGoalTr: 'Atölyenin yeni mevsimini ilk damlayla başlat.',
    ustaGoalEn: 'Open the workshop’s new season with your first drop.',
    waterLightHex: '#d8e3dd',
    waterDarkHex: '#1a242c',
    unlockedTools: ['damla', 'serpme', 'biz', 'gelgit', 'tarak'],
    defaultTool: 'damla',
    paletteIds: ['turkuaz', 'hardal', 'kirmizi', 'yesil', 'lacivert', 'krem'],
    isEpilogue: true,
    sakinComplete: (t) => t.drops >= 1,
    ustaComplete: (t) => t.drops >= 1,
    memoryId: 'mem-epilog',
    memoryCaptionTr: 'Atölyenin penceresinden taze bir bahar ışığı suya düşer.',
    memoryCaptionEn: 'Fresh spring light falls across the quiet surface of the tray.',
  },
];

export function getChapterPalette(chapter: StoryChapterDef, letterChoice: LetterChoice): string[] {
  if (chapter.id === 'bolum-4-kis') {
    if (letterChoice === 'shown') {
      // Warm reconciliation palette (gold, madder crimson, turquoise, warm cream, indigo)
      return ['hardal', 'kirmizi', 'turkuaz', 'krem', 'lacivert'];
    }
    if (letterChoice === 'hidden') {
      // Quiet twilight palette (indigo, plum, cream, lamp black, viridian)
      return ['lacivert', 'murdum', 'krem', 'siyah', 'yesil'];
    }
  }
  return chapter.paletteIds;
}
