import React, { useState, useEffect } from 'react';
import {
  Download,
  Lock,
  Unlock,
  Instagram,
  CheckCircle2,
  FileText,
  Music,
  Archive,
  ExternalLink,
  Search,
  Sparkles,
  AlertCircle,
  FileDown,
  Info,
  Check,
  HardDrive
} from 'lucide-react';
import { DownloadItem } from '../../types/song';
import {
  getDownloadItems,
  getInstagramFollowStatus,
  setInstagramFollowStatus,
  incrementDownloadCount,
  resolveDownloadUrl,
  INSTAGRAM_PROFILE_URL,
  INSTAGRAM_USERNAME
} from '../../services/downloadService';

export const DownloadView: React.FC = () => {
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const [isFollowed, setIsFollowed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFollowModal, setShowFollowModal] = useState<boolean>(false);
  const [pendingDownloadItem, setPendingDownloadItem] = useState<DownloadItem | null>(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [hasClickedIgLink, setHasClickedIgLink] = useState<boolean>(false);

  useEffect(() => {
    setDownloadItems(getDownloadItems());
    setIsFollowed(getInstagramFollowStatus());

    const handleDownloadsUpdated = () => {
      setDownloadItems(getDownloadItems());
    };

    const handleFollowUpdated = () => {
      setIsFollowed(getInstagramFollowStatus());
    };

    window.addEventListener('dzikron_downloads_updated', handleDownloadsUpdated);
    window.addEventListener('dzikron_ig_follow_updated', handleFollowUpdated);

    return () => {
      window.removeEventListener('dzikron_downloads_updated', handleDownloadsUpdated);
      window.removeEventListener('dzikron_ig_follow_updated', handleFollowUpdated);
    };
  }, []);

  const showToast = (message: string) => {
    setDownloadSuccessToast(message);
    setTimeout(() => setDownloadSuccessToast(null), 4000);
  };

  const handleOpenInstagram = () => {
    setHasClickedIgLink(true);
    window.open(INSTAGRAM_PROFILE_URL, '_blank', 'noopener,noreferrer');
  };

  const handleConfirmFollow = () => {
    setInstagramFollowStatus(true);
    setIsFollowed(true);
    setShowFollowModal(false);
    showToast('Akses unduhan berhasil dibuka! Terima kasih telah mengikuti Instagram @muhammaddzikron.');

    if (pendingDownloadItem) {
      executeDownload(pendingDownloadItem);
      setPendingDownloadItem(null);
    }
  };

  const executeDownload = (item: DownloadItem) => {
    incrementDownloadCount(item.id);
    const downloadUrl = resolveDownloadUrl(item.fileUrl);

    showToast(`Memulai pengunduhan "${item.fileName}"...`);

    // Create a temporary anchor to trigger direct download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('download', item.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadClick = (item: DownloadItem) => {
    if (!isFollowed) {
      setPendingDownloadItem(item);
      setShowFollowModal(true);
      return;
    }
    executeDownload(item);
  };

  const categories = ['all', ...Array.from(new Set(downloadItems.map((d) => d.category)))];

  const filteredItems = downloadItems.filter((item) => {
    if (item.status === 'hidden') return false;
    const matchesSearch =
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFormatIcon = (format: string, category: string) => {
    const f = (format + ' ' + category).toLowerCase();
    if (f.includes('wav') || f.includes('mp3') || f.includes('audio') || f.includes('track')) {
      return <Music className="w-5 h-5 text-[#00ffc8]" />;
    }
    if (f.includes('zip') || f.includes('rar') || f.includes('stem')) {
      return <Archive className="w-5 h-5 text-amber-400" />;
    }
    return <FileText className="w-5 h-5 text-[#0099ff]" />;
  };

  return (
    <div className="min-h-full pb-28 px-4 sm:px-8 pt-6 max-w-7xl mx-auto space-y-8">
      
      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 shadow-2xl backdrop-blur-md animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadSuccessToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#0a1220] to-slate-900 border border-slate-800/80 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-[#00ffc8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-[#0099ff]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-semibold text-[#00ffc8]">
            <Download className="w-3.5 h-3.5 text-[#00ffc8]" />
            <span>Pusat Unduhan Resmi • Muhammad Dzikron</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-white tracking-tight">
            Unduh Master Audio & Materi Musik
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Dapatkan master audio original kualitas studio (WAV / MP3 320kbps), buku chord & notasi partitur resmi,
            panduan lirik, serta paket instrumentalia langsung dari tautan aman Google Drive.
          </p>
        </div>
      </div>

      {/* Instagram Follow Verification Gate Card */}
      <div className="relative overflow-hidden rounded-3xl border transition-all duration-300 shadow-xl bg-slate-900/80 backdrop-blur-md">
        {isFollowed ? (
          /* Unlocked State */
          <div className="p-6 sm:p-7 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-slate-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Unlock className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                    Akses Unduhan Terbuka
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Terverifikasi
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Terima kasih telah mengikuti Instagram {INSTAGRAM_USERNAME}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Semua tombol download file di bawah ini telah aktif dan dapat langsung Anda unduh secara gratis.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <a
                href={INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 transition cursor-pointer"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>Lihat Profil Instagram</span>
              </a>
              <button
                onClick={() => setInstagramFollowStatus(false)}
                className="px-3 py-2 rounded-xl text-[11px] text-slate-400 hover:text-slate-300 hover:bg-slate-800/40 transition cursor-pointer"
                title="Reset status verifikasi follow"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          /* Locked State Gate */
          <div className="p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900/90">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[1.5px] shrink-0 shadow-[0_0_20px_rgba(238,42,123,0.3)]">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Lock className="w-5 h-5 text-pink-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                      Syarat Unduh File
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      Follow Wajib
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Follow Instagram {INSTAGRAM_USERNAME} untuk Membuka Tombol Download
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    Sebagai bentuk apresiasi bagi karya seni komposer, ikuti akun Instagram resmi{' '}
                    <strong className="text-white">{INSTAGRAM_USERNAME}</strong>. Setelah follow, klik tombol verifikasi di samping untuk membuka kunci seluruh file.
                  </p>
                </div>
              </div>

              {/* Action Buttons for Follow Gate */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                <button
                  onClick={handleOpenInstagram}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(238,42,123,0.4)] hover:opacity-95 transition-all cursor-pointer"
                >
                  <Instagram className="w-4 h-4" />
                  <span>1. Buka Instagram & Follow</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleConfirmFollow}
                  className="px-5 py-3 rounded-2xl bg-[#00ffc8] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,200,0.3)] hover:brightness-110 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>2. Saya Sudah Follow (Buka Kunci)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#00ffc8] text-slate-950 font-bold shadow-[0_0_10px_rgba(0,255,200,0.2)]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'Semua File' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari file, lagu, partitur..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00ffc8]"
          />
        </div>
      </div>

      {/* Download Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
          <FileDown className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Tidak ada file ditemukan</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Coba kata kunci pencarian lain atau pilih kategori Semua File.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-3xl bg-slate-900/70 border border-slate-800/80 p-5 sm:p-6 hover:border-[#00ffc8]/40 transition-all duration-300 flex flex-col justify-between space-y-5 shadow-xl hover:shadow-[0_0_25px_rgba(0,255,200,0.08)]"
            >
              <div className="space-y-3.5">
                {/* Header row: Icon & Tag */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {getFormatIcon(item.format, item.category)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#00ffc8]">
                        {item.category}
                      </span>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Format: <span className="text-slate-300 font-medium">{item.format}</span>
                        {item.fileSize && ` • ${item.fileSize}`}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-lg border border-slate-700/40">
                    {item.downloadCount || 0}x diunduh
                  </span>
                </div>

                {/* File Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#00ffc8] transition-colors leading-snug">
                    {item.fileName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Google Drive Link Indicator */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                  <HardDrive className="w-3.5 h-3.5 text-[#0099ff] shrink-0" />
                  <span className="truncate">Tersimpan di Google Drive Resmi</span>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={() => handleDownloadClick(item)}
                  className={`w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isFollowed
                      ? 'bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 shadow-[0_0_20px_rgba(0,255,200,0.3)] hover:brightness-110 active:scale-[0.99]'
                      : 'bg-slate-800/90 text-slate-300 hover:text-white border border-amber-500/30 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                  }`}
                >
                  {isFollowed ? (
                    <>
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>Unduh File Sekarang</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Follow IG untuk Membuka Unduhan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Follow Prompt Modal (When user clicks a locked download button) */}
      {showFollowModal && (
        <div
          onClick={() => setShowFollowModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-[#090d16] border border-slate-800 p-6 sm:p-7 space-y-6 shadow-2xl relative"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[1.5px] shadow-[0_0_20px_rgba(238,42,123,0.35)] shrink-0">
                <div className="w-full h-full bg-[#050811] rounded-[14px] flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-pink-400" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400">
                  Syarat Unduh File
                </span>
                <h3 className="text-base font-bold text-white">
                  Follow Instagram Komposer
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <p>
                Untuk mengunduh file <strong className="text-white">"{pendingDownloadItem?.fileName}"</strong>,
                silakan ikuti akun Instagram resmi:
              </p>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-bold text-white font-mono">{INSTAGRAM_USERNAME}</span>
                </div>
                <span className="text-[10px] text-slate-400">Muhammad Dzikron</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Setelah Anda menekan tombol <strong>Follow</strong> di Instagram, klik tombol verifikasi di bawah ini untuk memulai proses unduh secara otomatis.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleOpenInstagram}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(238,42,123,0.4)] hover:brightness-105 transition-all cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
                <span>Langkah 1: Buka Instagram & Follow</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleConfirmFollow}
                className="w-full py-3.5 rounded-2xl bg-[#00ffc8] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,200,0.3)] hover:brightness-110 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Langkah 2: Saya Sudah Follow (Buka Unduhan)</span>
              </button>

              <button
                onClick={() => setShowFollowModal(false)}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
