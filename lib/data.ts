export const TIKTOK = "https://www.tiktok.com/@bookswitharwa";
const INSTAGRAM = "https://www.instagram.com/bookswitharwa/";
const YOUTUBE = "https://www.youtube.com/@bookswitharwa";
const WHATSAPP = "https://www.whatsapp.com/@bookswitharwa";

export const navLinks = [
  { label: "الرئيسية", href: "#home" },
  { label: "عني", href: "#about" },
  { label: "الخدمات", href: "#services" },
  { label: "الأسعار", href: "#pricing" },
  { label: "التواصل", href: "#contact" },
];

export const siteSettings = {
  title: "BookToker Media Kit",
  description:
    "منصة متخصصة في مراجعات الكتب والتسويق على وسائل التواصل الاجتماعي",
  profileImage: {
    url: "/hero-image.jpeg",
    alt: "Profile Image",
  },
  socialLinks: [
    {
      platform: "TikTok",
      url: TIKTOK,
      icon: "/tiktok.svg",
    },
    {
      platform: "Instagram",
      url: INSTAGRAM,
      icon: "/instagram.svg",
    },
    {
      platform: "YouTube",
      url: YOUTUBE,
      icon: "/youtube.svg",
    },
  ],
};

export const hero = {
  title: "مراجِعة كتب وصانعة محتوى",
  subtitle: "المزيج المثالي بين التسويق الإبداعي وعمق المراجعة في عالم الكتب",
  ctaButtons: [
    { text: "تواصل معي", href: "#contact", variant: "default" as const },
    { text: "اعرف الأسعار", href: "#pricing", variant: "outline" as const },
  ],
  profileImage: {
    url: "/hero-image.jpeg",
    alt: "Profile Image",
  },
  socialLinks: [
    {
      platform: "TikTok",
      url: TIKTOK,
      icon: "/tiktok.svg",
    },
    {
      platform: "Instagram",
      url: INSTAGRAM,
      icon: "/instagram.svg",
    },
    {
      platform: "YouTube",
      url: YOUTUBE,
      icon: "/youtube.svg",
    },
  ],
};

export const about = {
  title: "عني",
  content: `
أنا أروى محمود، قارئة نَهِمة وصانعة محتوى أدبي. شغفي بالكتب بدأ من زمان جدًا، وخصوصًا الروايات اللي تقدر تشدّك من أول صفحة لآخر سطر.
المساحة دي بشارك فيها حبي للقراءة، وبقدّم مراجعات تساعد القارئ يختار الكتاب المناسب، وفي نفس الوقت تدّي الكاتب عرض محترم ومنصف لشغله.
كل مراجعة عندي مبنيّة على قراءة حقيقية:
تحليل، ملاحظات، نقاط قوة، ومناطق ممكن تتطوّر — وكل ده بروح داعمة وصادقة.`,

  highlights: [
    { title: "متابعين", value: "50K+" },
    { title: "معدل التفاعل", value: "8.5%" },
    { title: "التعاونات", value: "30+" },
  ],
  features: [
    "مراجعات كتب عميقة وجذابة",
    "محتوى تسويقي احترافي للمؤلفين والناشرين",
    "تعاونات استراتيجية مع العلامات التجارية",
    "استراتيجيات تسويق ثقافية مبتكرة",
  ],
  stats: [
    {
      title: "تيك توك",
      description: {
        followers: "6K+",
      },
    },
    {
      title: "انستاجرام",
      description: {
        followers: "3K+",
      },
    },
    {
      title: "بينتيرست",
      description: {
        followers: "350K+",
      },
    },
  ],
};

export const services = {
  title: "الخدمات",
  items: [
    {
      id: "1",
      name: "مراجعة الكتب",
      description:
        "مراجعات كتب احترافية وجذابة عبر الفيديو والصور، تركز على أهم المحتوى",
      icon: "book" as const,
    },
    {
      id: "2",
      name: "الترويج على وسائل التواصل",
      description:
        "محتوى تسويقي مخصص لتطبيقات TikTok و Instagram بصيغ جذابة وفعالة",
      icon: "sparkles" as const,
    },
    {
      id: "3",
      name: "تصوير Reels",
      description: "محتوى فيديو عالي الجودة مخصص للكتب والعلامات التجارية",
      icon: "camera" as const,
    },
    {
      id: "4",
      name: "التسويق الثقافي",
      description: "استراتيجيات تسويق متكاملة لتعزيز المحتوى الثقافي والكتب",
      icon: "trending" as const,
    },
  ],
};

export const portfolio = {
  title: "أعمالي السابقة",
  items: [
    {
      id: "1",
      title: `مراجعة رواية "لأنها كيارا"`,
      video: {
        url: "/videos/video1.mp4",
        alt: "Book review",
      },
      link: TIKTOK,
    },
    {
      id: "2",
      title: `مراجعة رواية "صديقي السيكوباتي"`,
      video: {
        url: "/videos/video2.mp4",
        alt: "Publishing collaboration",
      },
      link: TIKTOK,
    },
    {
      id: "3",
      title: `مراجعة رواية "جريمه علي لوح الشطرنج"`,
      video: {
        url: "/videos/video3.mp4",
        alt: "Viral reels",
      },
      link: TIKTOK,
    },
  ],
};

export const pricing = {
  title: "الأسعار",
  note: "الأسعار قابلة للتفاوض حسب طبيعة التعاون والمتطلبات الخاصة",
  packages: [
    {
      id: "1",
      name: "باقة التجربة المركزة",
      description: "مراجعة كتاب واحد احترافية",
      price: 500,
      features: ["إنستجرام: 1 ريلز", "إنستجرام: 1 ستوري", "تيك توك: 1 فيديو"],
      highlighted: false,
    },
    {
      id: "2",
      name: "باقة الانطلاق",
      description: "محتوى دوري ومستمر",
      price: 1000,
      features: ["إنستجرام: 2 ريلز", "إنستجرام: 3 ستوري", "تيك توك: 2 فيديو"],
      highlighted: true,
    },
    {
      id: "3",
      name: "باقة الانتشار الكامل",
      description: "حزمة متكاملة للناشرين",
      price: 1500,
      features: [
        "إنستجرام: 1 بوست",
        "إنستجرام: 3 ريلز",
        "إنستجرام: 6 ستوري",
        "تيك توك: 3 فيديوهات",
        "بينترست: 10 بينات (Aesthetic Pins)",
      ],
      highlighted: false,
    },
  ],
};
