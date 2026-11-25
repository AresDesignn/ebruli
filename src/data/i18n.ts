import type { Language } from '../types/ebru';

export const COPY: Record<
  Language,
  {
    brand: string;
    navStory: string;
    navChallenges: string;
    navStudio: string;
    navGallery: string;
    transferBtn: string;
    audioMute: string;
    audioUnmute: string;
    tools: {
      damla: { label: string; hint: string; lore: string };
      serpme: { label: string; hint: string; lore: string };
      biz: { label: string; hint: string; lore: string };
      gelgit: { label: string; hint: string; lore: string };
      tarak: { label: string; hint: string; lore: string };
    };
    dropSizes: {
      small: string;
      medium: string;
      large: string;
    };
    undo: string;
    clear: string;
    guideOn: string;
    guideOff: string;
    resetChallenge: string;
    selectChallenge: string;
    stepProgress: string;
    readyToTransfer: string;
    introPrompt: string;
    introCtaChallenge: string;
    introDismiss: string;
    webglErrorTitle: string;
    webglErrorBody: string;
    story: {
      modeSakin: string;
      modeUsta: string;
      modeSakinDesc: string;
      modeUstaDesc: string;
      blindMomentNote: string;
      blindMomentUnlocked: string;
      revealMemoryBtn: string;
      finalPrintPrompt: string;
      continueChapterBtn: string;
      readLetterBtn: string;
      letterShowChoice: string;
      letterKeepChoice: string;
      letterAcknowledge: string;
      memoryLabel: string;
      ustaNotebookCount: string;
      restartStory: string;
      epilogueFinishBtn: string;
      finale: {
        title: string;
        ustaReads: string;
        nurArrives: string;
        nurQuiet: string;
        apprenticeTruth: string;
        proceedEpilogue: string;
      };
      kitrePurr: string;
      kitreLabel: string;
      lockedToolHint: string;
    };
    ritual: {
      lowering: string;
      absorbing: string;
      lifting: string;
      completeTitle: string;
      challengeCompleteTitle: string;
      mirroredNote: string;
      titleLabel: string;
      defaultSandboxTitle: string;
      sealsEarned: string;
      saveToGallery: string;
      savedBadge: string;
      downloadPng: string;
      nextChallenge: string;
      returnToTray: string;
    };
    gallery: {
      heading: string;
      subheading: string;
      filterAll: string;
      filterStory: string;
      filterChallenges: string;
      filterSandbox: string;
      emptyTitle: string;
      emptyBody: string;
      goToStudio: string;
      download: string;
      deletePrint: string;
      close: string;
      storyTag: string;
      challengeTag: string;
      sandboxTag: string;
      sealCount: string;
    };
  }
> = {
  tr: {
    brand: 'Ebru: Suyun İzi',
    navStory: 'Hikâye',
    navChallenges: 'Dersler',
    navStudio: 'Atölye',
    navGallery: 'Galeri',
    transferBtn: 'Kağıda Al',
    audioMute: 'Atölye sesini kapat',
    audioUnmute: 'Atölye sesini aç',
    tools: {
      damla: {
        label: 'Damla',
        hint: 'Suya dokun; boya önceki renkleri dışa iter.',
        lore: 'Öd katılmış boya kitreli su yüzeyinde batmadan açılır; her yeni damla önceki halkaları yana iterek sıkıştırır.',
      },
      serpme: {
        label: 'Serpme',
        hint: 'Sürükle veya dokun; battal zemini için ince taneler serp.',
        lore: 'Gül dalı ve at kılından yapılan fırçanın tekneye hafifçe vurulmasıyla Battal ve Somaki zeminleri kurulur.',
      },
      biz: {
        label: 'Biz',
        hint: 'Tek iğne ucuyla ince hatlar, çiçek ve helezonlar çek.',
        lore: 'İnce uçlu geleneksel çizim kalemi; Hatip çiçeği, lale ve Bülbül Yuvası helezonları bu uçla şekillenir.',
      },
      gelgit: {
        label: 'Gelgit',
        hint: 'Geniş dişli tarakla ileri geri düzenli dalgalar oluştur.',
        lore: 'Geniş aralıklı ahşap tarak tekne boyunca ileri geri çekilerek suyun akıntısını andıran Gelgit dalgalarını verir.',
      },
      tarak: {
        label: 'Tarama',
        hint: 'Sık dişli tarakla ince şal ve taraklı dokular çek.',
        lore: 'Sık dizilmiş ince dişleriyle Gelgit dalgalarını keserek Şal ve Taraklı ebrunun zarif dokusunu örer.',
      },
    },
    dropSizes: {
      small: 'İnce',
      medium: 'Orta',
      large: 'Büyük',
    },
    undo: 'Geri Al',
    clear: 'Temizle',
    guideOn: 'Rehber Açık',
    guideOff: 'Rehber Kapalı',
    resetChallenge: 'Dersi Sıfırla',
    selectChallenge: 'Desen Seç',
    stepProgress: 'Adım',
    readyToTransfer: 'Desen hazır — Kağıda Al ile baskıyı çıkar.',
    introPrompt:
      'Bir pigment seçip suya dokun: her damla önceki boyaları yana iterek halka oluşturur.',
    introCtaChallenge: '1. Derse Başla',
    introDismiss: 'Serbest Çiz',
    webglErrorTitle: 'WebGL2 Desteği Gerekli',
    webglErrorBody:
      'Bu tarayıcı kayan noktalı WebGL2 dokularını desteklemiyor. Güncel Chrome, Edge veya Safari ile deneyin.',
    story: {
      modeSakin: 'Sakin Mod',
      modeUsta: 'Usta Modu',
      modeSakinDesc: 'Hedef baskısı olmadan yalnızca su ve anılarla ak.',
      modeUstaDesc: 'Geleneksel desen kurallarını tamamla, Usta Defterini aç.',
      blindMomentNote:
        'Ustanın az önce çektiği çizgi hafifçe kaymış… Gelgit tarağıyla sessizce düzelt.',
      blindMomentUnlocked:
        'Çizgiyi düzelttiğinde anlıyorsun: Usta Emin Efendi artık göremiyor. Ertesi sabah tekneye senin rengini bırakıyor.',
      revealMemoryBtn: 'Suyun Anısını Gör',
      finalPrintPrompt: 'Son eser tekneye yayıldı. Kâğıda Al ile bu mevsimi mühürle.',
      continueChapterBtn: 'Sonraki Mevsime Geç',
      readLetterBtn: 'Mektubu Oku',
      letterShowChoice: 'Mektubu Ustaya Göster',
      letterKeepChoice: 'Mektubu Şimdilik Sakla',
      letterAcknowledge: 'Zarfı Kapat',
      memoryLabel: 'Suda Beliren Anı',
      ustaNotebookCount: 'Usta Defteri',
      restartStory: 'Hikâyeyi Başa Sar',
      epilogueFinishBtn: 'Atölyede Kal (Serbest)',
      finale: {
        title: 'Son Sayfa',
        ustaReads:
          'Usta Emin Efendi, nemli kâğıdın üstüne parmaklarını yavaşça koyar. Desenin kabartısını dokunarak okur.',
        nurArrives:
          'Kapı iki kez usulca çalınır. Eşikte Nur durmaktadır; gözleri ustanın kâğıttaki ellerine, sonra sana ilişir. Yıllar önce yarım bıraktığın bu odaya onu çağıran da sendin.',
        nurQuiet:
          'Dışarıda Boğaz rüzgârı diner; kapı çalmaz. Usta "Kâğıt kalır, su gider" diye fısıldar. Cebindeki eski ebru parçası, Nur’un sana yıllar önce bıraktığı o yarım selamdır.',
        apprenticeTruth:
          'Kitre, kurumaya serilen kâğıtların kenarında sessizce kıvrılıp uyur.',
        proceedEpilogue: 'Bahar Sabahına Uyan',
      },
      kitrePurr: 'mırr...',
      kitreLabel: 'Atölye kedisi Kitre',
      lockedToolHint: 'Bu araç ilerleyen mevsimlerde açılır',
    },
    ritual: {
      lowering: 'Aherli kağıt tekneye bırakılıyor...',
      absorbing: 'Boya kağıda işleniyor...',
      lifting: 'Kağıt tekneden sıyrılıyor...',
      completeTitle: 'Baskı Tamamlandı',
      challengeCompleteTitle: 'Ebru Ustalaşması',
      mirroredNote: 'Gerçek ebru baskısında olduğu gibi görüntü yatay aynalanarak kağıda aktarıldı.',
      titleLabel: 'Eser Başlığı',
      defaultSandboxTitle: 'Atölye Çalışması',
      sealsEarned: 'Usta Mührü',
      saveToGallery: 'Galeriye Kaydet',
      savedBadge: 'Galeriye Kaydedildi',
      downloadPng: 'PNG İndir',
      nextChallenge: 'Sonraki Ders',
      returnToTray: 'Tekneye Dön',
    },
    gallery: {
      heading: 'Atölye Galerisi',
      subheading: 'Tekneden kağıda aktardığın tüm ebru baskıları burada saklanır.',
      filterAll: 'Tümü',
      filterStory: 'Hikâye Baskıları',
      filterChallenges: 'Ders Baskıları',
      filterSandbox: 'Serbest Atölye',
      emptyTitle: 'Henüz kaydedilmiş baskı yok',
      emptyBody: 'Teknede bir desen oluşturup "Kağıda Al" düğmesine bastığında baskın buraya eklenir.',
      goToStudio: 'Tekneye Git',
      download: 'PNG İndir',
      deletePrint: 'Sil',
      close: 'Kapat',
      storyTag: 'Hikâye',
      challengeTag: 'Ders',
      sandboxTag: 'Serbest',
      sealCount: 'Mühür',
    },
  },
  en: {
    brand: 'Ebru: Suyun İzi',
    navStory: 'Story',
    navChallenges: 'Challenges',
    navStudio: 'Studio',
    navGallery: 'Gallery',
    transferBtn: 'Transfer to Paper',
    audioMute: 'Mute workshop soundscape',
    audioUnmute: 'Enable workshop soundscape',
    tools: {
      damla: {
        label: 'Drop (Damla)',
        hint: 'Tap water to drop pigment; each drop pushes prior rings outward.',
        lore: 'Ox-gall tempered pigment floats atop tragacanth water without sinking, pushing earlier rings outward.',
      },
      serpme: {
        label: 'Splatter (Serpme)',
        hint: 'Tap or drag to scatter fine pigment droplets across the bath.',
        lore: 'Flicked from a traditional rosewood-and-horsehair brush to lay the speckled bed for Battal and stone marbling.',
      },
      biz: {
        label: 'Awl (Biz)',
        hint: 'Draw delicate petals, spirals, and fine lines with a single stylus.',
        lore: 'A slender brass or steel stylus used to coax floating rings into Hatip rosettes, tulips, and spirals.',
      },
      gelgit: {
        label: 'Wide Comb (Gelgit)',
        hint: 'Sweep back and forth with wide tines for rhythmic waves.',
        lore: 'A wide-toothed wooden comb swept in alternating passes to echo the rhythmic ebb and flow of water.',
      },
      tarak: {
        label: 'Fine Comb (Tarama)',
        hint: 'Pull dense fine tines across waves for intricate shawl patterns.',
        lore: 'Closely spaced fine needles pulled across waves to weave the delicate arcs of traditional Shawl (Şal) marbling.',
      },
    },
    dropSizes: {
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
    },
    undo: 'Undo',
    clear: 'Clear',
    guideOn: 'Guide On',
    guideOff: 'Guide Off',
    resetChallenge: 'Reset Level',
    selectChallenge: 'Select Motif',
    stepProgress: 'Step',
    readyToTransfer: 'Pattern ready — press Transfer to Paper to lift your print.',
    introPrompt:
      'Pick a pigment and tap the bath: each drop displaces earlier paint outward into crisp rings.',
    introCtaChallenge: 'Start Challenge 1',
    introDismiss: 'Keep Exploring',
    webglErrorTitle: 'WebGL2 Float Textures Required',
    webglErrorBody:
      'Your browser does not support WebGL2 floating-point framebuffers. Please open in a modern Chrome, Edge, or Safari browser.',
    story: {
      modeSakin: 'Calm Mode',
      modeUsta: 'Master Mode',
      modeSakinDesc: 'Paint freely without target rules—memories surface gently.',
      modeUstaDesc: 'Follow traditional motif discipline to fill the Master Notebook.',
      blindMomentNote:
        'The master’s recent comb line drifted slightly… Gently straighten it with Wide Comb (Gelgit).',
      blindMomentUnlocked:
        'As you align the wave, you realize Usta Emin Efendi can no longer see. Next morning, he leaves your own pigment by the tray.',
      revealMemoryBtn: 'Surface Memory',
      finalPrintPrompt: 'The final composition rests on the bath. Transfer to Paper to seal this year.',
      continueChapterBtn: 'Enter Next Season',
      readLetterBtn: 'Read Letter',
      letterShowChoice: 'Show Letter to Usta',
      letterKeepChoice: 'Keep Hidden for Now',
      letterAcknowledge: 'Fold Envelope',
      memoryLabel: 'Memory on Water',
      ustaNotebookCount: 'Master Notebook',
      restartStory: 'Restart Story',
      epilogueFinishBtn: 'Stay in Free Studio',
      finale: {
        title: 'The Final Sheet',
        ustaReads:
          'Usta Emin Efendi rests his fingertips gently upon the damp paper, reading the raised ridges of pigment by touch.',
        nurArrives:
          'Two quiet knocks sound at the door. Nur stands on the threshold, eyes moving from the master’s hands to yours—you were the one who brought them back to this room.',
        nurQuiet:
          'Outside, the Bosphorus wind settles into stillness; the door stays shut. Usta whispers, "Paper stays, water passes," as the old marbled scrap in your pocket answers why you came.',
        apprenticeTruth:
          'Kitre curls quietly beside the drying sheets.',
        proceedEpilogue: 'Wake to Spring Morning',
      },
      kitrePurr: 'purr...',
      kitreLabel: 'Workshop cat Kitre',
      lockedToolHint: 'Unlocks in a later season',
    },
    ritual: {
      lowering: 'Lowering prepared paper onto the bath...',
      absorbing: 'Pigments transferring to cotton fibers...',
      lifting: 'Lifting the marbled sheet...',
      completeTitle: 'Print Captured',
      challengeCompleteTitle: 'Pattern Mastered',
      mirroredNote: 'Just like traditional Ebru, the print is mirrored horizontally as it lifts from the tray.',
      titleLabel: 'Print Title',
      defaultSandboxTitle: 'Studio Study',
      sealsEarned: 'Master Seals',
      saveToGallery: 'Save to Gallery',
      savedBadge: 'Saved to Gallery',
      downloadPng: 'Download PNG',
      nextChallenge: 'Next Challenge',
      returnToTray: 'Return to Tray',
    },
    gallery: {
      heading: 'Atelier Gallery',
      subheading: 'Every print lifted from your marbling tray is preserved locally here.',
      filterAll: 'All',
      filterStory: 'Story Prints',
      filterChallenges: 'Challenges',
      filterSandbox: 'Free Studio',
      emptyTitle: 'No saved prints yet',
      emptyBody: 'Marble a pattern on the bath and choose "Transfer to Paper" to archive your first print.',
      goToStudio: 'Go to Tray',
      download: 'Download PNG',
      deletePrint: 'Delete',
      close: 'Close',
      storyTag: 'Story',
      challengeTag: 'Challenge',
      sandboxTag: 'Studio',
      sealCount: 'Seals',
    },
  },
};
