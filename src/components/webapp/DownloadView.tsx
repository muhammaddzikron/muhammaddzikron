import React, { useState, useEffect } from 'react';
import {
  Download,
  Lock,
  Unlock,
  Instagram,
  FileText,
  Music,
  Archive,
  ExternalLink,
  Search,
  Sparkles,
  FileDown,
  Check,
  HardDrive,
  Edit2,
  Trash2,
  ShieldCheck,
  Settings,
  X,
  Save
} from 'lucide-react';
import { DownloadItem } from '../../types/song';
import {
  getDownloadItems,
  syncDownloadsFromServer,
  getInstagramFollowStatus,
  setInstagramFollowStatus,
  incrementDownloadCount,
  resolveDownloadUrl,
  deleteDownloadItem,
  updateDownloadItem,
  getDownloadBannerConfig,
  DownloadBannerConfig,
  INSTAGRAM_PROFILE_URL,
  INSTAGRAM_USERNAME
} from '../../services/downloadService';
import {
  saveDownloadToGoogleSheet,
  deleteDownloadFromGoogleSheet,
  fetchDownloadsFromGoogleSheet
} from '../../services/appsScript';
import { extractDriveId } from '../../services/googleDrive';

interface DownloadViewProps {
  isAdminLoggedIn?: boolean;
  onNavigateToAdmin?: () => void;
}

export const DownloadView: React.FC<DownloadViewProps> = ({
  isAdminLoggedIn = false,
  onNavigateToAdmin
}) => {
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const [isFollowed, setIsFollowed] = useState<boolean>(false);
  const [bannerConfig, setBannerConfig] = useState<DownloadBannerConfig>(getDownloadBannerConfig());
  const [itemToDelete, setItemToDelete] = useState<DownloadItem | null>(null);
  const [editingItemModal, setEditingItemModal] = useState<DownloadItem | null>(null);
  const [editingModalOriginalName, setEditingModalOriginalName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFollowModal, setShowFollowModal] = useState<boolean>(false);
  const [pendingDownloadItem, setPendingDownloadItem] = useState<DownloadItem | null>(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [hasClickedIgLink, setHasClickedIgLink] = useState<boolean>(false);

  useEffect(() => {
    setDownloadItems(getDownloadItems());
    setIsFollowed(getInstagramFollowStatus());
    setBannerConfig(getDownloadBannerConfig());

    // Fetch from persistent server store
    syncDownloadsFromServer().then((items) => {
      if (items && items.length > 0) {
        setDownloadItems(items);
      }
    });

    // Fetch latest downloads from spreadsheet if configured
    fetchDownloadsFromGoogleSheet().then((res) => {
      if (res.isLive && res.downloads.length > 0) {
        setDownloadItems(res.downloads);
      }
    });

    const handleDownloadsUpdated = () => {
      setDownloadItems(getDownloadItems());
    };

    const handleFollowUpdated = () => {
      setIsFollowed(getInstagramFollowStatus());
    };

    const handleBannerUpdated = () => {
      setBannerConfig(getDownloadBannerConfig());
    };

    window.addEventListener('dzikron_downloads_updated', handleDownloadsUpdated);
    window.addEventListener('dzikron_ig_follow_updated', handleFollowUpdated);
    window.addEventListener('dzikron_download_banner_updated', handleBannerUpdated);

    return () => {
      window.removeEventListener('dzikron_downloads_updated', handleDownloadsUpdated);
      window.removeEventListener('dzikron_ig_follow_updated', handleFollowUpdated);
      window.removeEventListener('dzikron_download_banner_updated', handleBannerUpdated);
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
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadClick = (item: DownloadItem) => {
    if (isFollowed) {
      executeDownload(item);
    } else {
      setPendingDownloadItem(item);
      setHasClickedIgLink(false);
      setShowFollowModal(true);
    }
  };

  const confirmDeleteInView = () => {
    if (!itemToDelete) return;
    const targetName = itemToDelete.fileName;
    const targetId = itemToDelete.id;

    deleteDownloadItem(targetId);
    setDownloadItems(getDownloadItems());
    setItemToDelete(null);
    showToast(`File "${targetName}" berhasil dihapus dari website.`);

    deleteDownloadFromGoogleSheet(targetName, targetId).then((res) => {
      if (res.success) {
        showToast(`File "${targetName}" berhasil dihapus dari Google Spreadsheet!`);
      }
    });
  };

  const handleSaveEditModalInView = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemModal) return;

    const originalName = editingModalOriginalName;
    const updated = updateDownloadItem(editingItemModal.id, {
      fileName: editingItemModal.fileName,
      fileUrl: editingItemModal.fileUrl,
      category: editingItemModal.category,
      format: editingItemModal.format,
      fileSize: editingItemModal.fileSize,
      description: editingItemModal.description
    });

    setDownloadItems(getDownloadItems());
    setEditingItemModal(null);
    showToast(`Perubahan file "${editingItemModal.fileName}" berhasil disimpan di website!`);

    saveDownloadToGoogleSheet(editingItemModal, originalName).then((res) => {
      if (res.needsNewDeploymentVersion) {
        showToast(
          'Perhatian: Perubahan tersimpan di website, namun Google Apps Script masih versi lama (belum mengenali Tab Unduhan). Silakan lakukan Deploy versi baru di Apps Script.'
        );
      } else if (res.success) {
        showToast(`File "${editingItemModal.fileName}" tersimpan di Google Spreadsheet (Tab "Unduhan")!`);
      }
    });
  };

  const categories = ['all', 'Master Audio HQ', 'Partitur & Chord PDF', 'Lirik & Panduan', 'Backing Track / Stems', 'Dokumen / Karya Lain'];

  const filteredItems = downloadItems.filter((item) => {
    if (item.status === 'hidden') return false;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      item.fileName.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.format.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const getFormatIcon = (format: string, category: string) => {
    const f = format.toLowerCase();
    const c = category.toLowerCase();
    if (f.includes('mp3') || f.includes('wav') || f.includes('audio') || c.includes('audio') || c.includes('track')) {
      return <Music className="w-5 h-5 text-emerald-600" />;
    }
    if (f.includes('pdf') || c.includes('partitur') || c.includes('lirik') || f.includes('doc')) {
      return <FileText className="w-5 h-5 text-rose-600" />;
    }
    if (f.includes('zip') || f.includes('rar') || c.includes('stem')) {
      return <Archive className="w-5 h-5 text-sky-600" />;
    }
    return <FileDown className="w-5 h-5 text-amber-600" />;
  };

  const getCategoryBadgeClass = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('audio') || c.includes('track')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (c.includes('partitur') || c.includes('pdf')) {
      return 'bg-rose-50 text-rose-800 border-rose-200';
    }
    if (c.includes('stem') || c.includes('backing')) {
      return 'bg-sky-50 text-sky-800 border-sky-200';
    }
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div className="fixed bottom-24 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{downloadSuccessToast}</span>
        </div>
      )}

      {/* Admin Mode Quick Action Bar */}
      {isAdminLoggedIn && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-950">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>
              <strong>Mode Admin Aktif:</strong> Anda dapat menambah, mengedit link Google Drive, atau menghapus file Download Area dari Dasbor Admin.
            </span>
          </div>
          {onNavigateToAdmin && (
            <button
              onClick={onNavigateToAdmin}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition cursor-pointer shrink-0"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Buka Dasbor Admin</span>
            </button>
          )}
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-[0_4px_25px_rgba(15,23,42,0.04)]">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-sky-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-sky-900">
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>{bannerConfig.pageHeaderBadge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-slate-900 tracking-tight">
            Download Area
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            {bannerConfig.pageHeaderDesc}
          </p>
        </div>
      </div>

      {/* Instagram Follow Verification Gate Card */}
      <div className="relative overflow-hidden rounded-3xl border transition-all duration-300 shadow-[0_4px_25px_rgba(15,23,42,0.04)] bg-white">
        {isFollowed ? (
          /* Unlocked State */
          <div className="p-6 sm:p-7 border border-emerald-200 bg-emerald-50/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
                <Unlock className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    {bannerConfig.badgeTitle}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    {bannerConfig.verifiedBadge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {bannerConfig.thankYouTitle}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {bannerConfig.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <a
                href={bannerConfig.instagramUrl || INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Lihat Profil Instagram</span>
              </a>
              <button
                onClick={() => setInstagramFollowStatus(false)}
                className="px-3 py-2 rounded-xl text-[11px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Reset status verifikasi follow"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          /* Locked State Gate */
          <div className="p-6 sm:p-8 border border-amber-200 bg-amber-50/40">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px] shrink-0 shadow-md">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                    <Lock className="w-5 h-5 text-pink-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Syarat Unduh File
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                      Follow Wajib
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Follow Instagram {bannerConfig.instagramUsername || INSTAGRAM_USERNAME} untuk Membuka Tombol Download
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    Sebagai bentuk apresiasi bagi karya seni komposer, ikuti akun Instagram resmi{' '}
                    <strong className="text-slate-900">{bannerConfig.instagramUsername || INSTAGRAM_USERNAME}</strong>. Setelah follow, klik tombol verifikasi di samping untuk membuka kunci seluruh file.
                  </p>
                </div>
              </div>

              {/* Action Buttons for Follow Gate */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                <button
                  onClick={handleOpenInstagram}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all cursor-pointer"
                >
                  <Instagram className="w-4 h-4" />
                  <span>1. Buka Instagram & Follow</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleConfirmFollow}
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition-all cursor-pointer"
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shadow-xs ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white border border-sky-600 shadow-sm shadow-sky-200'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
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
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-xs"
          />
        </div>
      </div>

      {/* Download Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_rgba(15,23,42,0.04)] space-y-3">
          <FileDown className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Tidak ada file ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba kata kunci pencarian lain atau pilih kategori Semua File.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 hover:border-sky-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-5 shadow-[0_4px_25px_rgba(15,23,42,0.04)]"
            >
              <div className="space-y-3.5">
                {/* Header row: Icon & Tag */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      {getFormatIcon(item.format, item.category)}
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(item.category)}`}>
                        {item.category}
                      </span>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">
                        Format: <span className="text-slate-800 font-semibold">{item.format}</span>
                        {item.fileSize && ` • ${item.fileSize}`}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                    {item.downloadCount || 0}x diunduh
                  </span>
                </div>

                {/* File Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug">
                    {item.fileName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Google Drive Link Indicator */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <HardDrive className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate font-medium">Tersimpan di Google Drive Resmi</span>
                </div>
              </div>

              {/* Action Button & Admin Controls */}
              <div className="space-y-2">
                <button
                  onClick={() => handleDownloadClick(item)}
                  className={`w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isFollowed
                      ? 'bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white shadow-md shadow-sky-200 active:scale-[0.99]'
                      : 'bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-900 border border-amber-300 shadow-xs'
                  }`}
                >
                  {isFollowed ? (
                    <>
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>Unduh File Sekarang</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span>Follow IG untuk Membuka Unduhan</span>
                    </>
                  )}
                </button>

                {isAdminLoggedIn && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEditingItemModal({ ...item });
                        setEditingModalOriginalName(item.fileName);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      title="Edit file ini"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-sky-600" />
                      <span>Edit File</span>
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      title="Hapus file ini"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hapus File</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Follow Prompt Modal (When user clicks a locked download button) */}
      {showFollowModal && (
        <div
          onClick={() => setShowFollowModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 space-y-6 shadow-2xl relative text-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px] shadow-md shrink-0">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-pink-600" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600">
                  Syarat Unduh File
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Follow Instagram Komposer
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p>
                Untuk mengunduh file <strong className="text-slate-900">"{pendingDownloadItem?.fileName}"</strong>,
                silakan ikuti akun Instagram resmi:
              </p>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-slate-900 font-mono">{INSTAGRAM_USERNAME}</span>
                </div>
                <span className="text-[10px] text-slate-500">Muhammad Dzikron</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Setelah Anda menekan tombol <strong>Follow</strong> di Instagram, klik tombol verifikasi di bawah ini untuk memulai proses unduh secara otomatis.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleOpenInstagram}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
                <span>Langkah 1: Buka Instagram & Follow</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleConfirmFollow}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Langkah 2: Saya Sudah Follow (Buka Unduhan)</span>
              </button>

              <button
                onClick={() => setShowFollowModal(false)}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus File */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">Hapus File dari Unduhan?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus file berikut? File akan dihapus dari Website dan Google Spreadsheet (Tab Unduhan).
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <p className="font-bold text-slate-900 leading-snug">{itemToDelete.fileName}</p>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 pt-1">
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                  {itemToDelete.category}
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-indigo-700 font-mono">
                  {itemToDelete.format}
                </span>
                {itemToDelete.fileSize && (
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 font-mono">
                    {itemToDelete.fileSize}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteInView}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-200 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit File Unduhan */}
      {editingItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Edit File Unduhan</h4>
                  <p className="text-[11px] text-slate-500">
                    Perubahan langsung disinkronkan ke Google Spreadsheet (Tab Unduhan)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingItemModal(null)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditModalInView} className="space-y-4">
              {/* Nama File */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama File / Judul Karya <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingItemModal.fileName}
                  onChange={(e) => setEditingItemModal({ ...editingItemModal, fileName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                  placeholder="Contoh: The Miracle of Rain - Master Audio HQ"
                />
              </div>

              {/* Link URL / Google Drive */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Link URL File / Google Drive <span className="text-rose-500">*</span></span>
                  {editingItemModal.fileUrl && extractDriveId(editingItemModal.fileUrl) && (
                    <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-1 font-bold">
                      <Check className="w-3 h-3" /> Link Google Drive Valid
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={editingItemModal.fileUrl}
                  onChange={(e) => setEditingItemModal({ ...editingItemModal, fileUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                  placeholder="https://drive.google.com/file/d/.../view"
                />
              </div>

              {/* Kategori, Format, Ukuran */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori File
                  </label>
                  <select
                    value={editingItemModal.category}
                    onChange={(e) => setEditingItemModal({ ...editingItemModal, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
                  >
                    <option value="Master Audio HQ">Master Audio HQ</option>
                    <option value="Partitur & Chord PDF">Partitur & Chord PDF</option>
                    <option value="Lirik & Panduan">Lirik & Panduan</option>
                    <option value="Backing Track / Stems">Backing Track / Stems</option>
                    <option value="Dokumen / Karya Lain">Dokumen / Karya Lain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Format File
                  </label>
                  <input
                    type="text"
                    value={editingItemModal.format}
                    onChange={(e) => setEditingItemModal({ ...editingItemModal, format: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                    placeholder="WAV + MP3 / PDF"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ukuran File
                  </label>
                  <input
                    type="text"
                    value={editingItemModal.fileSize || ''}
                    onChange={(e) => setEditingItemModal({ ...editingItemModal, fileSize: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                    placeholder="Misal: 48.5 MB"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Keterangan File
                </label>
                <textarea
                  rows={2}
                  value={editingItemModal.description}
                  onChange={(e) => setEditingItemModal({ ...editingItemModal, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                  placeholder="Keterangan singkat tentang file yang diunduh..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const toDel = editingItemModal;
                    setEditingItemModal(null);
                    setItemToDelete(toDel);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Hapus File Ini</span>
                </button>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItemModal(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-200 transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan ke Website & Spreadsheet</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
