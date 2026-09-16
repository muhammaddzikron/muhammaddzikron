import { Song, GalleryItem, Achievement, StatItem, SkillItem, ComposerProfile } from "../types/song";

export const INITIAL_COMPOSER_PROFILE: ComposerProfile = {
  name: "Muhammad Dzikron",
  tagline: "Songwriter & Composer",
  headline: "Menenun Jiwa ke dalam Harmoni & Nada",
  photoUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
  bio: "Muhammad Dzikron adalah seorang pencipta lagu, komposer, dan penata musik asal Indonesia yang mendedikasikan karyanya untuk menyampaikan pesan kedamaian, cinta spiritual, dan keteguhan hati.",
  experience: "Dengan pengalaman dalam industri musik independen, beliau telah menggubah berbagai karya lagu lintas genre — dari Pop Indie yang syahdu, Balada Akustik yang menyentuh qolbu, hingga Komposisi Orkestra yang menginspirasi.",
  location: "Indonesia",
  activeSince: "Aktif Sejak 2016",
  collaborationStatus: "Terbuka untuk Kolaborasi",
  statSongs: 85,
  statAlbums: 12,
  statListeners: 1500000,
  statGenres: 8
};

// Koleksi Mahakarya Orisinal Muhammad Dzikron (Tersinkronisasi dengan Google Sheet - Urutan Terbaru di Atas)
export const INITIAL_SONGS: Song[] = [
  {
    id: "song-real-7",
    no: 7,
    title: "Allah Wants You To Be ..",
    singer: "Muhammad Dzikron",
    genre: "Pop Indie",
    year: 2026,
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    driveId: "https://drive.google.com/file/d/1bZAPxge-Ew-pFumNmzZmnNLmcH9ivOmZ/view?usp=sharing",
    youtubeUrl: "",
    audioUrl: "https://drive.google.com/file/d/1bZAPxge-Ew-pFumNmzZmnNLmcH9ivOmZ/view?usp=sharing",
    duration: "04:07",
    status: "Publish",
    order: 7,
    lyrics: "[Verse 1]\nDi sinilah Allah ingin kau berada\nMeski jalan belum jelas arah kita\nTak semua luka harus diterima\nPercayalah rencana Allah sempurna\n\n[Chorus]\nEngkau tepat di tempat yang Allah pinta\nJalani saja dengan hati percaya\nFa se ini bagian dari rencana\nTetap berharap pada Allah semata\n\n[Verse 2]\nYang terasa berat bukan akhir semua\nKadang kau dipindah menuju makna-Nya\nTak perlu tahu ke mana tujuan-Nya\nAllah menuntun setiap langkah kita\n\n[Chorus]\nEngkau tepat di tempat yang Allah pinta\nJalani saja dengan hati percaya\nFase ini bagian dari rencana\nTetap berharap pada Allah semata\n\n[Bridge]\nBila malam panjang menutup senjanya\nJangan anggap doamu tlah sia-sia\nYang belum terjadi belum tentu tiada\nAllah sedang menata indah waktunya\n\n[Chorus]\nEngkau tepat di tempat yang Allah pinta\nJalani saja dengan hati percaya\nFase ini bagian dari rencana\nTetap berharap pada Allah semata\n\n[Outro]\nTenanglah hati, kau tak sendiri juga\nPercaya pada-Nya sampai akhir masa\nYou’re exactly where Allah wants you to be\nKeep trusting Him and don’t lose hope."
  },
  {
    id: "song-real-6",
    no: 6,
    title: "Dua Garis Senja",
    singer: "Muhammad Dzikron",
    genre: "Pop Indie",
    year: 2026,
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    driveId: "https://drive.google.com/file/d/1rlY_2-paZ4OY56glBDVYQi5Xhta4BlP1/view?usp=drive_link",
    youtubeUrl: "",
    audioUrl: "https://drive.google.com/file/d/1rlY_2-paZ4OY56glBDVYQi5Xhta4BlP1/view?usp=drive_link",
    duration: "04:10",
    status: "Publish",
    order: 6,
    lyrics: "Verse 1\nKita dua sungai menuju muara\nNamun batu memecah arah alirnya\nKau seperti senja yang datang sementara\nAku seperti pagi menunggu cahaya\n\nChorus\nKita dua musim dalam satu cuaca\nSaling menghangatkan tanpa memilikinya\nKita dua pulau dibelah samudra\nDekat dalam peta jauh di nyatanya\n\nVerse 2\nKita seperti bulan menatap cakrawala\nSaling menyapa tanpa pernah berjumpa\nSeperti angin singgah di daun yang tua\nMeninggalkan suara tanpa membawa nama\n\nChorus\nKita dua musim dalam satu cuaca\nSaling menghangatkan tanpa memilikinya\nKita dua pulau dibelah samudra\nDekat dalam peta jauh di nyatanya\n\nBridge\nMungkin kita adalah dua garis senja\nBertemu sebentar lalu hilang arahnya\nSeperti burung pulang menuju sarangnya\nNamun langit kita berbeda warnanya\n\nChorus\nKita dua musim dalam satu cuaca\nSaling menghangatkan tanpa memilikinya\nKita dua pulau dibelah samudra\nDekat dalam peta jauh di nyatanya\n\nOutro\nJika cinta adalah arah sebuah pe ta\nNamamu tinggal di jalan yang tak sama"
  },
  {
    id: "song-real-5",
    no: 5,
    title: "Merona",
    singer: "Muhammad Dzikron",
    genre: "Pop Indie",
    year: 2026,
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    driveId: "https://drive.google.com/file/d/1eRJ0qWiRxHbunCZPP2y3Cxe0TYgN5d1h/view?usp=drive_link",
    youtubeUrl: "",
    audioUrl: "https://drive.google.com/file/d/1eRJ0qWiRxHbunCZPP2y3Cxe0TYgN5d1h/view?usp=drive_link",
    duration: "03:35",
    status: "Publish",
    order: 5,
    lyrics: "Intro \n\nVerse 1\nMerah pipimu malu bercerita\nLembut senyummu menepis resah\nTak perlu banyak ingin bicara\nTatap matamu sudah bermakna\n\nChorus\nCantikmu bukan sekadar rupa\nLembutmu tumbuh menjaganya\nBerpipi merah seindah indahnya\nBijaksana dalam langkahnya\n\nVerse 2\nSaat yang lain mengejar suara\nKau memilih diam yang berharga\nSaat yang lain ingin dipuja\nKau memilih tulus adanya\n\nChorus\nCantikmu bukan sekadar rupa\nLembutmu tumbuh menjaganya\nBerpipi merah seindah indahnya\nBijaksana dalam langkahnya\n\nBridge\nBukan bunga sebab warnanya\nBukan embun sebab beningnya\nKau cantik, kau cantik, kau cantik\nHatimu membuat indah semuanya\n\nChorus\nCantikmu bukan sekadar rupa\nLembutmu tumbuh menjaganya\nBerpipi merah seindah indahnya\nBijaksana dalam langkahnya\n\nOutro\nCantikmu bukan sekadar rupa\nLembutmu tumbuh menjaganya\nBerpipi merah seindah indahnya\nBijaksana sepanjang usia"
  },
  {
    id: "song-real-4",
    no: 4,
    title: "Tumbuh Tanpa Suara",
    singer: "Muhammad Dzikron",
    genre: "Pop Indie",
    year: 2026,
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    driveId: "https://drive.google.com/file/d/1vzqZgM7kk29azC-94Ik-XIxMUV7WmwB0/view?usp=sharing",
    youtubeUrl: "",
    audioUrl: "https://drive.google.com/file/d/1vzqZgM7kk29azC-94Ik-XIxMUV7WmwB0/view?usp=sharing",
    duration: "03:50",
    status: "Publish",
    order: 4,
    lyrics: "Verse 1\nTak kutahu awal cerita\nDatang perlahan tanpa suara\nDi antara sunyi dan doa\nNamamu tumbuh dalam jiwa\n\nChorus\nJika ini rahasia-Nya\nIzinkan hati ini tetap ada\nBukan memiliki semata\nmenjaganya dalam doa\n\nVerse 2\nSaat dunia ramai bicara\nHati mencari kenyamanan\nEntah mengapa kembali jua\nSelalu bermuara padamu saja\n\nChorus\nJika ini rahasia-Nya\nIzinkan hati ini tetap ada\nBukan memiliki semata\n menjaganya dalam doa\n\nCoda\nBila takdir belum menyapa\nAku tak akan memaksa-Nya\nCukup mencintai karena-Nya\nDan menunggu dalam ridhaNya\n\nChorus\nJika ini rahasia-Nya\nIzinkan hati ini tetap ada\nBukan memiliki semata\n menjaganya dalam doa\n\nOutro\nHingga kelak…\n kita dipertemukan-Nya"
  },
  {
    id: "song-real-3",
    no: 3,
    title: "PilihanMu Lebih Indah",
    singer: "Muhammad Dzikron",
    genre: "Pop Indie",
    year: 2026,
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    driveId: "https://drive.google.com/file/d/1_ZdY8CrLtWBYk_cb5NjP6j_ikQm6rqan/view?usp=sharing",
    youtubeUrl: "",
    audioUrl: "https://drive.google.com/file/d/1_ZdY8CrLtWBYk_cb5NjP6j_ikQm6rqan/view?usp=sharing",
    duration: "03:30",
    status: "Publish",
    order: 3,
    lyrics: "Intro\n\nVerse 1\nDi setiap malam ku meminta\nDengan air mata dan pengharapan sama\nKutitipkan mimpi di ujung doa\nBerharap semua menjadi nyata\n\nPre-Chorus\nNamun Engkau lebih tahu jalanku\nApa yang tersembunyi di depan hidupku\n\nChorus\nJika Kau kabulkan doaku\nHatiku bersujud penuh syukur\nNamun bila belum Kau beri waktu\nTetap kusebut nama-Mu\n\nPilihanku hatiku mungkin terbatas\nPilihan-Mu sungguh tak pernah salah\nApa yang hilang mungkin penjaga\nDari luka yang tak kusangka\n\nVerse 2\nSeringku kecewa pada jawaban-Mu\nKarena tak sama dengan mauku\nHingga kusadari di balik semua\nKasih-Mu bekerja tanpa bersuara\n\nPre-Chorus\nEngkau menunda bukan menolak\nEngkau memilih yang paling layak\n\nChorus\nJika Kau kabulkan doaku\nHatiku bersujud penuh syukur\nNamun bila belum Kau beri waktu\nTetap kusebut nama-Mu\n\nPilihanku hatiku mungkin terbatas\nPilihan-Mu sungguh tak pernah salah\nApa yang hilang mungkin penjaga\nDari luka yang tak kusangka\n\nBridge\nAjarkan aku percaya\nMeski mata belum melihatnya\nKarena setiap takdir-Mu\nSelalu membawa cerita baru\n\nChorus\nJika Kau kabulkan doaku\nHatiku bersujud penuh syukur\nNamun bila belum Kau beri waktu\nTetap kusebut nama-Mu\n\nSebab pilihan hatiku terbatas\nSedang pilihan-Mu tak pernah salah\nApa yang hilang mungkin penjaga\nDari luka yang tak kusangka\n\nOutro\nYang kupilih hanyalah harapan\nYang Kau pilih adalah keselamatan\nKini kupasrahkan seluruh hidupku\nDi dalam indahnya keputusan-Mu"
  },
  {
    id: "song-real-2",
    no: 2,
    title: "Rindu Tak Bermata",
    singer: "Muhammad Dzikron",
    genre: "Pop Indie",
    year: 2026,
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    driveId: "https://drive.google.com/file/d/15IwKX7tXFZogzHmTOvgnBy2QpmLHRxGR/view?usp=sharing",
    youtubeUrl: "",
    audioUrl: "https://drive.google.com/file/d/15IwKX7tXFZogzHmTOvgnBy2QpmLHRxGR/view?usp=sharing",
    duration: "04:15",
    status: "Publish",
    order: 2,
    lyrics: "VERSE 1\n(male)\nMalam menua di ujung jendela\nKubuka sunyi tanpa bertanya\n(female)\nAda yang tinggal tanpa bernama\nNamun tak pernah benar sirna\n\nCHORUS (duet)\nRindu barangkali tak bermata\nTetapi tahu ke mana singgahnya\nMeski tak pernah saling menyapa\nAda yang tetap saling menjaga\n\nVERSE 2\n(male)\nAngin berlalu membawa cerita\nTak satu pun sempat kubaca\n(female)\nHanya hati yang diam-diam percaya\nAda jejakmu di setiap doa\n\nCHORUS (duet)\nRindu barangkali tak bermata\nTetapi tahu ke mana singgahnya\nMeski tak pernah saling menyapa\nAda yang tetap saling menjaga\n\nINTERLUDE\n\nCODA (duet)\nBila esok tak lagi sama\nJangan hapus musim yang pernah ada\nSebab yang tinggal bukan siapa-siapa\nMelainkan rasa  pengharapan\n\nCHORUS (duet)\nRindu barangkali tak bermata\nTetapi tahu ke mana singgahnya\nMeski tak pernah saling menyapa\nAda yang tetap saling menjaga\n\nOUTRO\n(male)\nJika nanti waktu menutup cerita\n(female)\nBiarlah doa menjadi muara\n(duet)\nKarena cinta tak selalu bersama\nKadang cukup hidup di dalam jiwa"
  },
  {
    id: "song-real-1",
    no: 1,
    title: "Bumi Mina",
    singer: "Muhammad Dzikron",
    genre: "Pop Indie",
    year: 2026,
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    driveId: "https://drive.google.com/file/d/1X4957R-ggIIragOe8kcji_WqIikiDENa/view?usp=sharing",
    youtubeUrl: "",
    audioUrl: "https://drive.google.com/file/d/1X4957R-ggIIragOe8kcji_WqIikiDENa/view?usp=sharing",
    duration: "05:31",
    status: "Publish",
    order: 1,
    lyrics: "(Verse 1)\nTak kusangka langkah ini sampai di sini,\nDiatas bumi yang selama ini dalam mimpi.\nRibuan wajah datang dari arah yang berbeda,\nNamun semua membawa tujuan yang sama.\n\nDi antara debu dan terik mentari,\nKita belajar tentang sabar yang sejati.\nTentang hati yang perlahan luluh,\nMenyadari betapa kecilnya diri di hadapan-Nya\n\n(Chorus)\nBumi Mina…\nEngkau bukan sekedar persinggahan.\nEngkau adalah lembar kehidupan,\nMengajarkan arti kehilangan dan pertemuan.\n\nKami menadahkan tangan bersama,\nMenyebut nama yang kami cinta dalam doa.\nMemohon ampun atas segala dosa,\nPulang membawa kemuliaan.\n\n(Verse 2)\nAda tawa yang lahir dari kelelahan,\nAda ikatan tumbuh tanpa perkenalan.\nBerbagi kisah, cerita, berbagi harapan,\nSeolah telah saling mengenal sejak lama.\n\nWaktu begitu cepat meninggalkan jejak,\nNamun hati belum siap beranjak.\nsetiap sudutnya menyimpan kenangan,\nYang tak mampu diabadikan semuanya\n\n(Chorus)\nBumi Mina…\nEngkau bukan sekedar persinggahan.\nEngkau adalah lembar kehidupan,\nMengajarkan arti kehilangan dan pertemuan.\n\nKami menadahkan tangan bersama,\nMenyebut nama yang kami cinta dalam doa.\nMemohon ampun atas segala dosa,\nPulang membawa kemuliaan\n\n(Bridge)\nYa Alloh ..\nKabulkanlah doa yang terucap dengan air mata,.\nSembukan hati yang datang dengan luka,\nDekatkan ngkah yang masih jauh dari jalan-Mu.\nDan saat kami kembali dekatkan dengan-Mu\n\n(Outro)\nKelak saat Mina hanya tinggal cerita,\nSaat tenda telah lama ditinggalkan,\nSaat kembali di kehidupan yang biasa,\nAkan tetap ada hati di sana."
  }
];

export const SKILLS: SkillItem[] = [
  { name: "Songwriting & Melody Making", percentage: 98, iconName: "Music", color: "#00ffc8" },
  { name: "Lyrics Writing & Storytelling", percentage: 95, iconName: "Feather", color: "#0099ff" },
  { name: "Composer & Orchestration", percentage: 92, iconName: "Sliders", color: "#a855f7" },
  { name: "Music Arrangement & Production", percentage: 90, iconName: "Radio", color: "#ec4899" },
  { name: "Mixing & Vocal Tuning Direction", percentage: 88, iconName: "Mic2", color: "#f59e0b" },
  { name: "Digital Content Creation", percentage: 94, iconName: "Sparkles", color: "#10b981" }
];

export const STATS: StatItem[] = [
  { id: "1", label: "Lagu Diciptakan", value: 85, suffix: "+", iconName: "Music", color: "#00ffc8" },
  { id: "2", label: "Album & EP", value: 12, suffix: " Rilis", iconName: "Disc", color: "#0099ff" },
  { id: "3", label: "Total Pendengar", value: 1500000, suffix: "+", iconName: "Users", color: "#a855f7" },
  { id: "4", label: "Genre Musik", value: 8, suffix: " Kombinasi", iconName: "Grid", color: "#f43f5e" }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach-1",
    year: "2026",
    title: "Rilis Karya Orisinal Pop Indie",
    category: "Album",
    description: "Peluncuran karya cipta orisinal lagu-lagu bertema kehidupan, cinta, dan keteguhan rasa ciptaan Muhammad Dzikron.",
    location: "Studio Musik Dzikron"
  },
  {
    id: "ach-2",
    year: "2024",
    title: "Penghargaan Pencipta Lagu Terbaik",
    category: "Penghargaan",
    description: "Apresiasi atas konsistensi karya musik bernuansa kedamaian dan makna mendalam.",
    location: "Music & Sound Showcase"
  },
  {
    id: "ach-3",
    year: "2023",
    title: "Best Musical Composition",
    category: "Festival",
    description: "Komposer musik pengiring karya seni dan film independen.",
    location: "Indie Sound Festival"
  },
  {
    id: "ach-4",
    year: "2022",
    title: "Kolaborasi Aransemen Musik Nusantara",
    category: "Kolaborasi",
    description: "Menggubah aransemen gabungan melodi orkestra dan sentuhan rasa yang khas.",
    location: "Panggung Seni Budaya"
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Sesi Rekaman Vokal & Piano Studio",
    category: "Studio",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
    date: "Maret 2026",
    description: "Proses composing lagu terbaru menggunakan grand piano dan synthesizer."
  },
  {
    id: "gal-2",
    title: "Konser Malam Simfoni & Doa",
    category: "Konser",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    date: "Januari 2026",
    description: "Penampilan live bersama orchestra di hadapan penonton pencinta musik orisinal."
  },
  {
    id: "gal-3",
    title: "Behind The Scene Penggubahan Lirik",
    category: "Behind The Scene",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    date: "Desember 2025",
    description: "Sesi penulisan lirik lagu dan penghayatan untaian melodi di studio."
  },
  {
    id: "gal-4",
    title: "Workshop Songwriting Pemuda",
    category: "Kegiatan",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    date: "November 2025",
    description: "Menjadi narasumber pembuatan melodi dan struktur lagu kreatif."
  },
  {
    id: "gal-5",
    title: "Sesi Mixing & Mastering Audio",
    category: "Studio",
    imageUrl: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=800&q=80",
    date: "Oktober 2025",
    description: "Final touch audio mixing console untuk rilis lagu orisinal."
  },
  {
    id: "gal-6",
    title: "Kolaborasi Bersama Musisi Kreatif",
    category: "Kegiatan",
    imageUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
    date: "Agustus 2025",
    description: "Sesi brain-storming aransemen musik akustik dan harmoni nada."
  }
];
