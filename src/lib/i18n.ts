import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      title: "HandTrack Gaming Hub",
      subtitle: "Experience the future of gaming with MediaPipe hand tracking",
      devLabel: "Developed By",
      clubLabel: "Club",
      selectGame: "Select a Game",
      backToMenu: "Back to Menu",
      startGame: "Start Game",
      turnOnCamera: "Turn On Camera",
      loadingCamera: "Loading Camera...",
      cameraActive: "Camera Active",
      rules: "Rules",
      singlePlayer: "Single Player",
      multiPlayer: "Multiplayer",
      wins: "Wins",
      rematch: "Rematch",
      score: "Score",
      level: "Level",
      tactileInnovation: "Tactile Innovation",
      futureOf: "FUTURE OF",
      interaction: "INTERACTION",
      enterInterface: "Enter Interface",
      initiateSequence: "Initiate Sequence",
      selectEnvironment: "SELECT ENVIRONMENT",
      launchMode: "Launch Mode",
      noController: "No Controller",
      justVision: "Just Vision",
      visionDesc: "Our games utilize a sophisticated hand tracking engine that runs directly in your browser. No specialized hardware needed—just your webcam and your skill.",
      trackingPoints: "Tracking Points",
      fpsEngine: "FPS Engine",
      latency: "Latency",
      proTip: "Pro Tip",
      proTipDesc: "Keep your hand within the camera frame and avoid busy backgrounds for the best tracking performance.",
      abort: "Abort",
      systemExit: "System.Exit()",
      waiting: "Waiting...",
      createBox: "CREATE BOX",
      puzzleSolved: "PUZZLE SOLVED!",
      cyberConnect: {
        name: "Cyber Connect",
        desc: "Connect the dots 1 ➜ 2 ➜ 3 without breaking the line.",
        warning: "Warning: Don't cross your own line!",
        winMatch: "WINS THE MATCH!",
        winLevel: "WINS LEVEL",
        perfectScore: "PERFECT SCORE"
      },
      neonHockey: {
        name: "Neon Hand Hockey",
        desc: "Deflect the ball and score in the opponent's goal.",
        player1: "Player 1 (Right)",
        player2: "Player 2 (Left)"
      },
      facePuzzle: {
        name: "Your Face Puzzle",
        desc: "Take a snapshot of your face and solve the puzzle with hand gestures.",
        instruction: "Use your hands to create a box for the snapshot, then pinch to move pieces."
      }
    }
  },
  dz: {
    translation: {
      title: "HandTrack Gaming Hub",
      subtitle: "جرب مستقبل اللعب بتتبع اليد مع MediaPipe",
      devLabel: "تطوير",
      clubLabel: "النادي",
      selectGame: "خير لعبة",
      backToMenu: "رجع للمينيو",
      startGame: "بدا اللعب",
      turnOnCamera: "شعل الكاميرا",
      loadingCamera: "رانا نشعلو فالكاميرا...",
      cameraActive: "الكاميرا راهي تخدم",
      rules: "القوانين",
      singlePlayer: "لاعب واحد",
      multiPlayer: "زوج لاعبين",
      wins: "ربح",
      rematch: "عاود اللعبة",
      score: "السكور",
      level: "النيفو",
      tactileInnovation: "ابتكار لمسي",
      futureOf: "مستقبل",
      interaction: "التفاعل",
      enterInterface: "دخل للواجهة",
      initiateSequence: "بدا التسلسل",
      selectEnvironment: "خير البلاصة",
      launchMode: "مود التشغيل",
      noController: "بلا مانيت",
      justVision: "غير ببالشوف",
      visionDesc: "الألعاب نتاعنا يخدمو بتكنولوجيا تتبع اليد في المتصفح نتاعك. ما تحتاج والو غير الكاميرا وشطارتك.",
      trackingPoints: "نقاط التتبع",
      fpsEngine: "محرك الإطارات",
      latency: "تأخير الاستجابة",
      proTip: "نصيحة محترف",
      proTipDesc: "خلي يدك تبان فلكاميرا وبعد على لبلايص اللي فيهم حوايج بزاف باش تتبع اليد يكون مليح.",
      abort: "حبس",
      systemExit: "System.Exit()",
      waiting: "اصبر شوية...",
      createBox: "دير كادر",
      puzzleSolved: "تحل اللغز!",
      cyberConnect: {
        name: "سايبر كونكت",
        desc: "ربط النقاط 1 ➜ 2 ➜ 3 بلا ما تقطع السطر.",
        warning: "رد بالك: ما تقطعش السطر نتاعك!",
        winMatch: "ربح الماتش!",
        winLevel: "كمل النيفو",
        perfectScore: "سكور هبال"
      },
      neonHockey: {
        name: "هوكي النيون",
        desc: "رجع البالة وسجل في مرمى الخصم.",
        player1: "اللاعب 1 (يمين)",
        player2: "اللاعب 2 (يسار)"
      },
      facePuzzle: {
        name: "لغز وجهك",
        desc: "صور وجهك وحل اللغز بيديك.",
        instruction: "استعمل يديك باش دير كادر للتصوير، ومن بعد قرص باش تحرك لبياس."
      }
    }
  },
  ar: {
    translation: {
      title: "HandTrack Gaming Hub",
      subtitle: "استمتع بمستقبل الألعاب مع تقنية تتبع اليد MediaPipe",
      devLabel: "تطوير",
      clubLabel: "النادي",
      selectGame: "اختر لعبة",
      backToMenu: "العودة للقائمة",
      startGame: "ابدأ اللعب",
      turnOnCamera: "تشغيل الكاميرا",
      loadingCamera: "جاري تشغيل الكاميرا...",
      cameraActive: "الكاميرا تعمل",
      rules: "القواعد",
      singlePlayer: "لاعب واحد",
      multiPlayer: "لاعبين",
      wins: "فاز",
      rematch: "إعادة اللعب",
      score: "النتيجة",
      level: "المستوى",
      tactileInnovation: "ابتكار لمسي",
      futureOf: "مستقبل",
      interaction: "التفاعل",
      enterInterface: "دخول الواجهة",
      initiateSequence: "بدء التسلسل",
      selectEnvironment: "اختر البيئة",
      launchMode: "وضع التشغيل",
      noController: "بدون جهاز تحكم",
      justVision: "الرؤية فقط",
      visionDesc: "تستخدم ألعابنا محرك تتبع يدوي متطور يعمل مباشرة في متصفحك. لا حاجة لأجهزة متخصصة - فقط الكاميرا ومهارتك.",
      trackingPoints: "نقاط التتبع",
      fpsEngine: "محرك الإطارات",
      latency: "تأخير الاستجابة",
      proTip: "نصيحة محترف",
      proTipDesc: "أبقِ يدك داخل إطار الكاميرا وتجنب الخلفيات المزدحمة للحصول على أفضل أداء للتتبع.",
      abort: "إلغاء",
      systemExit: "System.Exit()",
      waiting: "انتظار...",
      createBox: "أنشئ إطاراً",
      puzzleSolved: "تم حل اللغز!",
      cyberConnect: {
        name: "سايبر كونكت",
        desc: "وصل بين النقاط 1 ➜ 2 ➜ 3 بدون قطع الخط.",
        warning: "تحذير: لا تقاطع خطك الخاص!",
        winMatch: "ربح المباراة!",
        winLevel: "أكمل المستوى",
        perfectScore: "نتيجة مثالية"
      },
      neonHockey: {
        name: "هوكي النيون",
        desc: "صد الكرة وسجل في مرمى الخصم.",
        player1: "اللاعب 1 (يمين)",
        player2: "اللاعب 2 (يسار)"
      },
      facePuzzle: {
        name: "لغز وجهك",
        desc: "التقط صورة لوجهك وحل اللغز باستخدام إيماءات اليد.",
        instruction: "استخدم يديك لإنشاء مربع للالتقاط، ثم اقرص لتحريك القطع."
      }
    }
  }
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      }
    });
}

export default i18n;
