import { Song, GalleryItem, Achievement, StatItem, SkillItem, ComposerProfile } from '../types/song';

export const INITIAL_COMPOSER_PROFILE: ComposerProfile = {
  name: 'Muhammad Dzikron',
  tagline: 'Songwriter & Composer',
  headline: 'Menenun Jiwa ke dalam Harmoni & Nada',
  photoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  bio: 'Muhammad Dzikron adalah seorang pencipta lagu, komposer, dan penata musik asal Indonesia yang mendedikasikan karyanya untuk menyampaikan pesan kedamaian, cinta spiritual, dan keteguhan hati.',
  experience: 'Dengan pengalaman lebih dari 8 tahun dalam industri musik independen, beliau telah menggubah puluhan lagu lintas genre — dari Pop Religi yang menyentuh qolbu, Balada Akustik yang syahdu, hingga Komposisi Sinematik Orkestra untuk film pendek dan teater.',
  location: 'Indonesia',
  activeSince: 'Aktif Sejak 2016',
  collaborationStatus: 'Terbuka untuk Kolaborasi',
  statSongs: 85,
  statAlbums: 12,
  statListeners: 1500000,
  statGenres: 8
};

// Fallback high quality royalty-free MP3 streams for instant audio playback in preview
// along with authentic Google Drive stream URL format
export const INITIAL_SONGS: Song[] = [
  {
    id: 'song-1',
    no: 1,
    title: 'Cinta Dalam Doa',
    singer: 'Muhammad Dzikron ft. Nabila K.',
    genre: 'Pop Religi',
    year: 2024,
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    driveId: '',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=piano-moment-114471.mp3',
    duration: '04:12',
    status: 'Publish',
    order: 1,
    lyrics: `[Verse 1]
Di sepertiga malam ku bersujud
Menyebut namamu dalam bisikan syahdu
Mencintai tak selalu harus memiliki
Cukup kurangkul bayangmu dalam doa suci

[Reff]
Jika rindu ini adalah ujian
Biar air mata menjadi saksi keikhlasan
Ku titipkan rasa ini pada Sang Pencipta
Semoga kelak takdir menyatukan kita
Dalam ikatan halal cinta surga...

[Verse 2]
Setiap melodi yang ku gubah hari ini
Adalah resah hati yang tak terucap bibir
Langkah kaki mungkin terpisah jarak
Namun jiwa kita selalu dalam pelukan doa

[Bridge]
Tak perlu janji manis yang membuai
Hanya butuh ridho-Nya untuk melangkah
Tuhan, jika dia memang jodoh terbaikku
Dekatkanlah hatinya dengan hatiku...

[Outro]
Cinta dalam doa...
Abadi dalam dekapan Ilahi.`
  },
  {
    id: 'song-2',
    no: 2,
    title: 'Melodi Sunyi',
    singer: 'Muhammad Dzikron',
    genre: 'Acoustic Ballad',
    year: 2024,
    cover: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80',
    driveId: '',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=soft-piano-10781.mp3',
    duration: '03:45',
    status: 'Publish',
    order: 2,
    lyrics: `[Verse 1]
Malam makin larut di ruang senyap
Hanya senar gitar yang menari pelan
Menyuarakan rindu yang kian memuncak
Di antara jemari yang lelah memetik nada

[Reff]
Biarkan melodi sunyi ini mengalir
Membawa ketenangan di hati yang resah
Setiap denting nada adalah cerita
Tentang perjuangan dan pengharapan tanpa akhir

[Verse 2]
Langit membiru di balik jendela
Lilin kecil membiaskan cahaya redup
Aku ciptakan simfoni sederhana ini
Sebagai warisan rasa yang abadi

[Outro]
Sunyi tak lagi sepi
Ketika lagu ini mengisi kalbu...`
  },
  {
    id: 'song-3',
    no: 3,
    title: 'Langkah Kemenangan',
    singer: 'Dzikron Project & Ensemble',
    genre: 'Cinematic Orchestral',
    year: 2023,
    cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    driveId: '',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a85532.mp3?filename=inspiring-cinematic-ambient-116199.mp3',
    duration: '05:08',
    status: 'Publish',
    order: 3,
    lyrics: `[Instrumental Opening - String & Brass Epic]

[Verse 1]
Dengarlah deru angin di panggung kehidupan
Badai menghadang takkan memadamkan impian
Kuatkan jiwa, tatap masa depan terang
Setiap peluh adalah benih kejayaan

[Reff]
Bangkitlah! Jangan pernah menyerah!
Terbanglah tinggi menggapai bintang
Ini saatnya kita ukir sejarah
Langkah kemenangan telah membentang!

[Bridge]
Simfoni harapan bergema di angkasa
Mengobarkan semangat yang tak pernah padam
Kitalah pemenang sejati di garis akhir!

[Outro]
Terus melangkah...
Hingga sorak kemuliaan tercipta!`
  },
  {
    id: 'song-4',
    no: 4,
    title: 'Cahaya Ibu',
    singer: 'Rania Melodi (Prod. Muhammad Dzikron)',
    genre: 'Pop Religi',
    year: 2023,
    cover: 'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?auto=format&fit=crop&w=800&q=80',
    driveId: '',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92db1.mp3?filename=emotional-piano-115383.mp3',
    duration: '04:30',
    status: 'Publish',
    order: 4,
    lyrics: `[Verse 1]
Usapan lembut di kening saat ku kecil
Doa yang tak pernah putus di setiap sujudmu
Ibu, engkaulah penuntun di kegelapan
Pelita hidup yang tak pernah padam

[Reff]
Kasihmu seluas samudera tanpa batas
Senyummu menenangkan jiwa yang lara
Tuhan, berkahilah setiap langkah Ibu
Jadikanlah surga-Mu tempat peristirahatannya kelak...

[Verse 2]
Rambutmu kian memutih dimakan waktu
Namun cinta di matamu tetap hangat bagai surya
Maafkan anakmu yang belum bisa membalas
Segala pengorbanan yang tak terhitung nilainya

[Outro]
Terima kasih Ibu...
Engkau cahaya hidupku.`
  },
  {
    id: 'song-5',
    no: 5,
    title: 'Jejak Waktu',
    singer: 'Muhammad Dzikron',
    genre: 'Indie Pop',
    year: 2024,
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    driveId: '',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_993f3d350d.mp3?filename=lofi-study-112191.mp3',
    duration: '03:58',
    status: 'Publish',
    order: 5,
    lyrics: `[Verse 1]
Mengingat kembali detik yang telah berlalu
Di sudut kota tempat kita berjanji
Waktu terus berputar tanpa kompromi
Meninggalkan kenangan manis di dada

[Reff]
Setiap jejak waktu mengajarkan arti
Bahwa detik ini adalah anugerah terbesar
Jangan biarkan hari ini berlalu hampa
Ukir senyuman indah untuk besok hari

[Outro]
Terus melangkah bersama waktu...`
  },
  {
    id: 'song-6',
    no: 6,
    title: 'Harmoni Nusantara',
    singer: 'Orkestra Pemuda Nusantara',
    genre: 'World Fusion',
    year: 2022,
    cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=800&q=80',
    driveId: '',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6af38d8.mp3?filename=ambient-piano-10781.mp3',
    duration: '04:45',
    status: 'Publish',
    order: 6,
    lyrics: `[Verse 1]
Dari Sabang sampai Merauke terdengar nada
Alunan suling dan gending berpadu indah
Keberagaman budaya menjadi simfoni agung
Menyatukan ribuan perbedaan dalam harmoni

[Reff]
Indonesiaku, dalam lagu ini ku titipkan cinta
Bersatu dalam nada, sejahtera dalam rasa
Harmoni Nusantara abadi selamanya...`
  }
];

export const SKILLS: SkillItem[] = [
  { name: 'Songwriting & Melody Making', percentage: 98, iconName: 'Music', color: '#00ffc8' },
  { name: 'Lyrics Writing & Storytelling', percentage: 95, iconName: 'Feather', color: '#0099ff' },
  { name: 'Composer & Orchestration', percentage: 92, iconName: 'Sliders', color: '#a855f7' },
  { name: 'Music Arrangement & Production', percentage: 90, iconName: 'Radio', color: '#ec4899' },
  { name: 'Mixing & Vocal Tuning Direction', percentage: 88, iconName: 'Mic2', color: '#f59e0b' },
  { name: 'Digital Content Creation', percentage: 94, iconName: 'Sparkles', color: '#10b981' }
];

export const STATS: StatItem[] = [
  { id: '1', label: 'Lagu Diciptakan', value: 85, suffix: '+', iconName: 'Music', color: '#00ffc8' },
  { id: '2', label: 'Album & EP', value: 12, suffix: ' Rilis', iconName: 'Disc', color: '#0099ff' },
  { id: '3', label: 'Total Pendengar', value: 1500000, suffix: '+', iconName: 'Users', color: '#a855f7' },
  { id: '4', label: 'Genre Musik', value: 8, suffix: ' Kombinasi', iconName: 'Grid', color: '#f43f5e' }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    year: '2024',
    title: 'Penghargaan Pencipta Lagu Religi Terbaik',
    category: 'Penghargaan',
    description: 'Raihan karya terbaik lewat single "Cinta Dalam Doa" dengan putaran audio lebih dari 1 juta kali di platform digital.',
    location: 'Jakarta Music Festival'
  },
  {
    id: 'ach-2',
    year: '2023',
    title: 'Rilis Album "Mahakarya Rasa"',
    category: 'Album',
    description: 'Album kompilasi 10 lagu ciptaan karya kolaborasi musisi independen Indonesia.',
    location: 'Studio Musik Dzikron Records'
  },
  {
    id: 'ach-3',
    year: '2023',
    title: 'Best Musical Composer for Short Film',
    category: 'Festival',
    description: 'Komposer musik pengiring film pendek independen bertema kemanusiaan.',
    location: 'Indie Film & Sound Festival'
  },
  {
    id: 'ach-4',
    year: '2022',
    title: 'Kolaborasi Orkestra Nusantara',
    category: 'Kolaborasi',
    description: 'Menggubah aransement gabungan alat musik tradisional gamelan dan piano klasik.',
    location: 'Taman Ismail Marzuki'
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Sesi Rekaman Vokal & Piano Studio',
    category: 'Studio',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
    date: 'Maret 2024',
    description: 'Proses composing lagu terbaru menggunakan grand piano dan synthesizer.'
  },
  {
    id: 'gal-2',
    title: 'Konser Malam Simfoni & Doa',
    category: 'Konser',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    date: 'Januari 2024',
    description: 'Penampilan live bersama orchestra di hadapan 2.000 penonton.'
  },
  {
    id: 'gal-3',
    title: 'Behind The Scene Penggubahan Lirik',
    category: 'Behind The Scene',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    date: 'Desember 2023',
    description: 'Sesi penulisan lirik lagu di studio malam hari.'
  },
  {
    id: 'gal-4',
    title: 'Workshop Songwriting Pemuda',
    category: 'Kegiatan',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    date: 'November 2023',
    description: 'Menjadi narasumber pembuatan melodi dan struktur lagu kreatif.'
  },
  {
    id: 'gal-5',
    title: 'Sesi Mixing & Mastering Audio',
    category: 'Studio',
    imageUrl: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=800&q=80',
    date: 'Oktober 2023',
    description: 'Final touch audio mixing console untuk rilis album.'
  },
  {
    id: 'gal-6',
    title: 'Kolaborasi Bersama Komposer Muda',
    category: 'Kegiatan',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    date: 'Agustus 2023',
    description: 'Sesi brain-storming aransement musik akustik dan string.'
  }
];
