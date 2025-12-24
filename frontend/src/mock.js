// Mock data untuk JATES9 Ecosystem

export const healthQuestions = [
  {
    id: 1,
    question: "Seberapa sering Anda mengalami masalah pencernaan?",
    options: [
      { value: "always", label: "Hampir setiap hari", score: 3 },
      { value: "often", label: "Beberapa kali seminggu", score: 2 },
      { value: "sometimes", label: "Kadang-kadang", score: 1 },
      { value: "rarely", label: "Jarang", score: 0 }
    ]
  },
  {
    id: 2,
    question: "Gejala apa yang paling sering Anda alami?",
    options: [
      { value: "constipation", label: "Sembelit/Susah BAB", type: "A" },
      { value: "bloating", label: "Kembung/Banyak Gas", type: "B" },
      { value: "gastric", label: "Nyeri Ulu Hati/Maag", type: "C" },
      { value: "multiple", label: "Kombinasi gejala di atas", type: "ABC" }
    ]
  },
  {
    id: 3,
    question: "Apakah Anda sering merasa tidak nyaman setelah makan?",
    options: [
      { value: "yes_always", label: "Ya, hampir selalu", score: 3 },
      { value: "yes_sometimes", label: "Ya, kadang-kadang", score: 2 },
      { value: "rarely", label: "Jarang", score: 1 },
      { value: "no", label: "Tidak", score: 0 }
    ]
  },
  {
    id: 4,
    question: "Berapa lama Anda sudah mengalami masalah ini?",
    options: [
      { value: "years", label: "Bertahun-tahun", score: 3 },
      { value: "months", label: "Beberapa bulan", score: 2 },
      { value: "weeks", label: "Beberapa minggu", score: 1 },
      { value: "recent", label: "Baru-baru ini", score: 0 }
    ]
  }
];

export const challengeDays = [
  {
    day: 1,
    title: "Mulai Dengan Air Putih",
    morning_task: "Minum 2 gelas air hangat saat bangun tidur",
    noon_task: "Kunyah makanan 20x sebelum menelan",
    evening_task: "Catat waktu makan & jenis makanan",
    education: "Air putih membantu melancarkan pencernaan dan membersihkan racun dalam tubuh. Minum air hangat di pagi hari akan membangunkan sistem pencernaan Anda.",
    status: "locked"
  },
  {
    day: 2,
    title: "Pola Makan Teratur",
    morning_task: "Sarapan sebelum jam 9 pagi",
    noon_task: "Makan siang tanpa gadget",
    evening_task: "Makan malam 3 jam sebelum tidur",
    education: "Pola makan yang teratur membantu tubuh mengatur ritme pencernaan dengan lebih baik.",
    status: "locked"
  },
  {
    day: 3,
    title: "Tambah Serat Alami",
    morning_task: "Konsumsi buah-buahan segar",
    noon_task: "Tambahkan sayuran di setiap makan",
    evening_task: "Hindari makanan olahan",
    education: "Serat membantu pergerakan usus dan mencegah sembelit. Serat alami dari buah dan sayur lebih baik diserap tubuh.",
    status: "locked"
  },
  {
    day: 7,
    title: "Evaluasi Minggu Pertama",
    morning_task: "Isi rapor mingguan",
    noon_task: "Review perubahan yang dirasakan",
    evening_task: "Rencanakan minggu depan",
    education: "Waktu evaluasi! Lihat progres Anda dan identifikasi area yang perlu ditingkatkan.",
    status: "locked",
    isEvaluation: true
  },
  {
    day: 14,
    title: "Evaluasi Minggu Kedua",
    morning_task: "Isi rapor mingguan",
    noon_task: "Bandingkan dengan minggu lalu",
    evening_task: "Identifikasi tantangan terbesar",
    education: "Di titik tengah program, kita perlu memastikan Anda masih on track untuk kesembuhan.",
    status: "locked",
    isEvaluation: true
  },
  {
    day: 21,
    title: "Evaluasi Minggu Ketiga",
    morning_task: "Isi rapor mingguan",
    noon_task: "Rayakan pencapaian kecil",
    evening_task: "Siapkan sprint terakhir",
    education: "Anda sudah sangat dekat dengan finish line! Mari pastikan momentum tetap terjaga.",
    status: "locked",
    isEvaluation: true
  },
  {
    day: 30,
    title: "Graduation Day!",
    morning_task: "Isi rapor akhir",
    noon_task: "Terima sertifikat digital",
    evening_task: "Rencana maintenance jangka panjang",
    education: "Selamat! Anda telah menyelesaikan 30 Day Challenge. Ini adalah awal dari gaya hidup sehat Anda.",
    status: "locked",
    isGraduation: true
  }
];

export const productInfo = {
  name: "Jates9 - Superfood Enzim Buah",
  tagline: "Accelerator Kesembuhan Pencernaan Anda",
  description: "Jates9 adalah superfood alami yang mengandung 9 enzim buah pilihan untuk membantu mempercepat penyembuhan masalah pencernaan Anda.",
  benefits: [
    {
      icon: "Leaf",
      title: "100% Alami",
      description: "Terbuat dari 9 buah pilihan tanpa bahan kimia"
    },
    {
      icon: "Zap",
      title: "Enzim Aktif",
      description: "Membantu memecah makanan dan meningkatkan penyerapan nutrisi"
    },
    {
      icon: "Heart",
      title: "Serat Tinggi",
      description: "Melancarkan BAB dan mencegah sembelit"
    },
    {
      icon: "Shield",
      title: "Antioksidan Kuat",
      description: "Melindungi dan memperbaiki lapisan lambung"
    }
  ],
  variants: [
    {
      id: "basic",
      name: "Paket Basic",
      duration: "7 hari",
      price: 125000,
      originalPrice: 175000,
      discount: 29,
      recommended: false
    },
    {
      id: "premium",
      name: "Paket Premium",
      duration: "30 hari",
      price: 450000,
      originalPrice: 700000,
      discount: 36,
      recommended: true
    },
    {
      id: "family",
      name: "Paket Keluarga",
      duration: "90 hari",
      price: 1200000,
      originalPrice: 2100000,
      discount: 43,
      recommended: false
    }
  ],
  testimonials: [
    {
      name: "Ibu Siti",
      age: 42,
      problem: "Maag kronis 5 tahun",
      result: "Sembuh total dalam 3 minggu",
      quote: "Saya sudah coba berbagai obat, tapi baru kali ini benar-benar sembuh. Program 30 hari + Jates9 benar-benar mengubah hidup saya!"
    },
    {
      name: "Pak Budi",
      age: 38,
      problem: "Sering kembung & sendawa",
      result: "Kembung hilang di minggu pertama",
      quote: "Awalnya skeptis, tapi setelah ikuti challenge dan konsumsi Jates9, perut saya jadi nyaman banget. Terima kasih Coach!"
    },
    {
      name: "Mbak Rina",
      age: 35,
      problem: "Sembelit parah",
      result: "BAB lancar setiap hari",
      quote: "Dulu harus minum obat pencahar terus. Sekarang dengan Jates9 dan pola makan yang benar, BAB saya lancar alami!"
    }
  ]
};

export const aiChatMock = [
  {
    role: "assistant",
    content: "Halo! Saya Doktor AI, asisten kesehatan virtual Anda. Saya di sini untuk membantu menjawab pertanyaan seputar kesehatan pencernaan Anda. Ada yang bisa saya bantu?"
  }
];

export const userProfileMock = {
  name: "Pengguna Demo",
  phone: "081234567890",
  health_type: "B",
  health_score: 8,
  challenge_day: 1,
  challenges_completed: 0,
  streak_days: 0
};