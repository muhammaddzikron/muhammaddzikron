import React, { useState, useEffect, useRef } from 'react';
import { Song, Order, DownloadItem } from '../../types/song';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Save,
  Music,
  CheckCircle2,
  Eye,
  EyeOff,
  Copy,
  Check,
  LogOut,
  Sparkles,
  Download,
  Disc,
  Lock,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet,
  Inbox,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  User,
  Tag,
  DollarSign,
  Play,
  Pause,
  AlertCircle,
  ExternalLink,
  Volume2,
  CheckCheck,
  Youtube,
  Instagram,
  FileDown,
  HardDrive,
  X,
  Settings,
  Unlock,
  SlidersHorizontal
} from 'lucide-react';
import { getGoogleDriveAudioUrl, getGoogleDriveImageUrl, extractDriveId, getGoogleDriveDownloadUrl } from '../../services/googleDrive';
import { extractYouTubeId } from '../../utils/youtube';
import {
  saveSongToGoogleSheet,
  deleteSongFromGoogleSheet,
  syncAllSongsToGoogleSheet,
  fetchOrdersFromGoogleSheet,
  deleteOrderFromLocalAndSheet,
  clearAllOrdersFromLocal,
  INITIAL_SAMPLE_ORDERS
} from '../../services/appsScript';
import {
  getDownloadItems,
  saveDownloadItems,
  addDownloadItem,
  updateDownloadItem,
  deleteDownloadItem,
  resetDownloadItemsToDefault,
  resolveDownloadUrl,
  INSTAGRAM_PROFILE_URL,
  INSTAGRAM_USERNAME,
  getDownloadBannerConfig,
  saveDownloadBannerConfig,
  resetDownloadBannerConfig,
  DownloadBannerConfig
} from '../../services/downloadService';
import { formatSongDuration, formatSecondsToMinutes } from '../../utils/duration';

interface AdminViewProps {
  songs: Song[];
  onUpdateSongs: (newSongs: Song[]) => void;
  onLogout: () => void;
  onResetToDefault: () => void;
  isAdminLoggedIn: boolean;
  onOpenLoginModal: () => void;
  onOpenEditProfile?: () => void;
}

const EMPTY_SONG_FORM = {
  id: '',
  title: '',
  singer: 'Muhammad Dzikron',
  genre: 'Pop Religi',
  year: new Date().getFullYear().toString(),
  cover: '',
  driveId: '',
  youtubeUrl: '',
  duration: '03:45',
  lyrics: '',
  status: 'Publish',
  order: 1
};

export const AdminView: React.FC<AdminViewProps> = ({
  songs,
  onUpdateSongs,
  onLogout,
  onResetToDefault,
  isAdminLoggedIn,
  onOpenLoginModal,
  onOpenEditProfile
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'add' | 'export' | 'orders' | 'downloads'>('list');
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_SONG_FORM);

  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSyncingGSheet, setIsSyncingGSheet] = useState(false);

  // Download Management State
  const [downloadList, setDownloadList] = useState<DownloadItem[]>([]);
  const [editingDownloadId, setEditingDownloadId] = useState<string | null>(null);
  const [showDownloadForm, setShowDownloadForm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DownloadItem | null>(null);
  const [showResetDownloadsModal, setShowResetDownloadsModal] = useState(false);
  const [showBannerConfigModal, setShowBannerConfigModal] = useState(false);
  const [bannerConfig, setBannerConfig] = useState<DownloadBannerConfig>(getDownloadBannerConfig());
  const [bannerFormData, setBannerFormData] = useState<DownloadBannerConfig>(getDownloadBannerConfig());

  const [downloadFormData, setDownloadFormData] = useState({
    fileName: '',
    description: '',
    fileUrl: '',
    fileSize: '',
    category: 'Master Audio HQ',
    format: 'WAV + MP3',
    status: 'active' as 'active' | 'hidden'
  });

  // Audio testing state for form
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [testAudioError, setTestAudioError] = useState<string | null>(null);
  const [testAudioSuccess, setTestAudioSuccess] = useState(false);
  const testAudioRef = useRef<HTMLAudioElement | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>(INITIAL_SAMPLE_ORDERS);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersLive, setOrdersLive] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadOrders();
      setDownloadList(getDownloadItems());
      setBannerConfig(getDownloadBannerConfig());
    }
  }, [isAdminLoggedIn]);

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    const res = await fetchOrdersFromGoogleSheet();
    setOrders(res.orders);
    setOrdersLive(res.isLive);
    setIsLoadingOrders(false);
  };

  const handleResetDownloadForm = () => {
    setEditingDownloadId(null);
    setDownloadFormData({
      fileName: '',
      description: '',
      fileUrl: '',
      fileSize: '',
      category: 'Master Audio HQ',
      format: 'WAV + MP3',
      status: 'active'
    });
    setShowDownloadForm(false);
  };

  const handleSaveDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadFormData.fileName.trim()) {
      showNotification('Harap masukkan nama file yang valid.');
      return;
    }
    if (!downloadFormData.fileUrl.trim()) {
      showNotification('Harap masukkan link URL atau Google Drive file.');
      return;
    }

    if (editingDownloadId) {
      const updated = updateDownloadItem(editingDownloadId, {
        fileName: downloadFormData.fileName.trim(),
        description: downloadFormData.description.trim(),
        fileUrl: downloadFormData.fileUrl.trim(),
        fileSize: downloadFormData.fileSize.trim() || undefined,
        category: downloadFormData.category,
        format: downloadFormData.format.trim() || 'File',
        status: downloadFormData.status
      });
      setDownloadList(updated);
      showNotification(`File "${downloadFormData.fileName}" berhasil diperbarui!`);
    } else {
      const added = addDownloadItem({
        fileName: downloadFormData.fileName.trim(),
        description: downloadFormData.description.trim(),
        fileUrl: downloadFormData.fileUrl.trim(),
        fileSize: downloadFormData.fileSize.trim() || undefined,
        category: downloadFormData.category,
        format: downloadFormData.format.trim() || 'File',
        status: downloadFormData.status
      });
      setDownloadList(getDownloadItems());
      showNotification(`File "${added.fileName}" berhasil ditambahkan ke Akses Unduhan Terbuka!`);
    }

    handleResetDownloadForm();
  };

  const handleEditDownload = (item: DownloadItem) => {
    setEditingDownloadId(item.id);
    setDownloadFormData({
      fileName: item.fileName,
      description: item.description,
      fileUrl: item.fileUrl,
      fileSize: item.fileSize || '',
      category: item.category,
      format: item.format,
      status: item.status
    });
    setShowDownloadForm(true);
    // Smooth scroll to top of download tab so user immediately sees the edit form
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const confirmDeleteDownload = () => {
    if (!itemToDelete) return;
    const targetName = itemToDelete.fileName;
    const targetId = itemToDelete.id;
    const updated = deleteDownloadItem(targetId);
    setDownloadList(updated);
    if (editingDownloadId === targetId) {
      handleResetDownloadForm();
    }
    setItemToDelete(null);
    showNotification(`File "${targetName}" berhasil dihapus dari Akses Unduhan Terbuka.`);
  };

  const confirmResetDownloads = () => {
    const res = resetDownloadItemsToDefault();
    setDownloadList(res);
    setShowResetDownloadsModal(false);
    showNotification('Daftar file Akses Unduhan Terbuka berhasil dikembalikan ke bawaan.');
  };

  const handleToggleDownloadStatus = (item: DownloadItem) => {
    const newStatus = item.status === 'active' ? 'hidden' : 'active';
    const updated = updateDownloadItem(item.id, { status: newStatus });
    setDownloadList(updated);
    showNotification(`Status file diubah menjadi ${newStatus === 'active' ? 'Tampil' : 'Disembunyikan'}.`);
  };

  const handleSaveBannerConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveDownloadBannerConfig(bannerFormData);
    setBannerConfig(updated);
    setShowBannerConfigModal(false);
    showNotification('Pengaturan teks Akses Unduhan Terbuka berhasil disimpan!');
  };

  const handleResetBannerConfig = () => {
    const res = resetDownloadBannerConfig();
    setBannerConfig(res);
    setBannerFormData(res);
    showNotification('Teks Akses Unduhan Terbuka dikembalikan ke pengaturan awal.');
  };

  const handleTestDriveAudio = () => {
    if (!formData.driveId.trim()) {
      setTestAudioError('Harap isi link atau ID Google Drive terlebih dahulu');
      return;
    }

    setTestAudioError(null);
    setTestAudioSuccess(false);
    setIsTestingAudio(true);

    const streamUrl = getGoogleDriveAudioUrl(formData.driveId.trim());

    if (testAudioRef.current) {
      if (isPlayingTest) {
        testAudioRef.current.pause();
        setIsPlayingTest(false);
        setIsTestingAudio(false);
        return;
      }

      testAudioRef.current.src = streamUrl;
      testAudioRef.current.load();
      testAudioRef.current
        .play()
        .then(() => {
          setIsTestingAudio(false);
          setIsPlayingTest(true);
          setTestAudioSuccess(true);
        })
        .catch((err) => {
          console.warn('Test audio error:', err);
          setIsTestingAudio(false);
          setIsPlayingTest(false);
          setTestAudioError(
            'Audio belum bisa diputar otomatis. Pastikan file di Google Drive diset: "Siapa saja yang memiliki link: Pelihat".'
          );
        });
    }
  };

  const handleReplyWhatsApp = (order: Order) => {
    const cleanPhone = order.phone.replace(/[^0-9]/g, '');
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }
    const text = encodeURIComponent(
      `Halo Kak ${order.name}, terima kasih telah menghubungi Muhammad Dzikron Studio mengenai permintaan "${order.service}". Kami siap membantu proyek musik Anda.`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
  };

  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const handleDeleteOrder = async (order: Order) => {
    if (!window.confirm(`Hapus pesanan dari klien "${order.name}"?`)) {
      return;
    }
    const orderKey = order.id || `${order.name}-${order.timestamp}`;
    setDeletingOrderId(orderKey);
    try {
      await deleteOrderFromLocalAndSheet(order);
      setOrders((prev) => prev.filter((o) => o.id !== order.id && o.timestamp !== order.timestamp));
      showNotification(`Pesanan dari "${order.name}" berhasil dihapus.`);
    } catch (err) {
      console.error('Error deleting order:', err);
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleClearAllOrders = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus SELURUH riwayat pesanan?')) {
      return;
    }
    await clearAllOrdersFromLocal();
    setOrders([]);
    showNotification('Seluruh riwayat pesanan berhasil dibersihkan.');
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#00ffc8] shadow-[0_0_25px_rgba(0,255,200,0.15)]">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white font-serif">
          Akses Portal Admin Terkunci
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Silakan masuk dengan akun administrator untuk mengelola playlist lagu, input karya baru, dan pengaturan rilis.
        </p>
        <button
          onClick={onOpenLoginModal}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition shadow-lg cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Buka Login Admin</span>
        </button>
      </div>
    );
  }

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleEditClick = (song: Song) => {
    setEditingSongId(song.id);
    setFormData({
      id: song.id,
      title: song.title,
      singer: song.singer,
      genre: song.genre,
      year: String(song.year),
      cover: song.cover || '',
      driveId: song.driveId || '',
      youtubeUrl: song.youtubeUrl || '',
      duration: song.duration || '03:30',
      lyrics: song.lyrics || '',
      status: song.status === 'Draft' ? 'Draft' : 'Publish',
      order: song.order || 1
    });
    setActiveSubTab('add');
  };

  const handleResetForm = () => {
    setEditingSongId(null);
    setFormData({
      ...EMPTY_SONG_FORM,
      order: songs.length + 1
    });
  };

  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const finalCover = formData.cover.trim()
      ? (formData.cover.includes('http') ? formData.cover : getGoogleDriveImageUrl(formData.cover))
      : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';

    const finalAudio = formData.driveId.trim()
      ? getGoogleDriveAudioUrl(formData.driveId)
      : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

    let targetSongToSync: Song;

    if (editingSongId) {
      const updated = songs.map((s) => {
        if (s.id === editingSongId) {
          const updatedSong: Song = {
            ...s,
            title: formData.title.trim(),
            singer: formData.singer.trim(),
            genre: formData.genre.trim(),
            year: formData.year,
            cover: finalCover,
            driveId: formData.driveId.trim(),
            youtubeUrl: formData.youtubeUrl.trim(),
            duration: formData.duration.trim(),
            lyrics: formData.lyrics.trim(),
            status: formData.status,
            order: Number(formData.order),
            audioUrl: finalAudio
          };
          targetSongToSync = updatedSong;
          return updatedSong;
        }
        return s;
      });

      updated.sort((a, b) => (b.order - a.order) || (b.no - a.no));
      onUpdateSongs(updated);
      showNotification(`Lagu "${formData.title}" diperbarui & dikirim ke Spreadsheet!`);
    } else {
      const newSong: Song = {
        id: `custom-${Date.now()}`,
        no: songs.length + 1,
        title: formData.title.trim(),
        singer: formData.singer.trim(),
        genre: formData.genre.trim(),
        year: formData.year,
        cover: finalCover,
        driveId: formData.driveId.trim(),
        youtubeUrl: formData.youtubeUrl.trim(),
        duration: formData.duration.trim(),
        lyrics: formData.lyrics.trim(),
        status: formData.status,
        order: Number(formData.order) || songs.length + 1,
        audioUrl: finalAudio
      };

      targetSongToSync = newSong;
      const updated = [...songs, newSong];
      updated.sort((a, b) => (b.order - a.order) || (b.no - a.no));
      onUpdateSongs(updated);
      showNotification(`Lagu "${formData.title}" ditambahkan & disimpan ke Spreadsheet!`);
    }

    if (targetSongToSync!) {
      saveSongToGoogleSheet(targetSongToSync);
    }

    handleResetForm();
    setActiveSubTab('list');
  };

  const handleToggleStatus = (songId: string) => {
    const updated = songs.map((s) => {
      if (s.id === songId) {
        const nextStatus = s.status === 'Publish' ? 'Draft' : 'Publish';
        const newS = { ...s, status: nextStatus };
        saveSongToGoogleSheet(newS);
        return newS;
      }
      return s;
    });
    onUpdateSongs(updated);
    showNotification('Status visibilitas lagu diperbarui di Website & Spreadsheet.');
  };

  const handleDeleteSong = (songId: string, title: string) => {
    if (window.confirm(`Hapus lagu "${title}" dari playlist website & Spreadsheet?`)) {
      const updated = songs.filter((s) => s.id !== songId);
      onUpdateSongs(updated);
      deleteSongFromGoogleSheet(title);
      showNotification(`Lagu "${title}" telah dihapus.`);
    }
  };

  const handleSyncAllToGoogleSheet = async () => {
    setIsSyncingGSheet(true);
    const res = await syncAllSongsToGoogleSheet(songs);
    setIsSyncingGSheet(false);
    showNotification(res.message);
  };

  const getBackupJSONData = () => {
    return JSON.stringify(songs, null, 2);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(getBackupJSONData());
    setCopiedStatus('json');
    setTimeout(() => setCopiedStatus(null), 2000);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 px-5 py-2.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-[#041a1f] border border-slate-800/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#0099ff]/20 to-[#00ffc8]/20 text-[#00ffc8] border border-[#00ffc8]/30">
            <Disc className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-white flex items-center gap-2">
              Studio Admin & CMS Playlist
            </h1>
            <p className="text-xs text-slate-400">
              Kelola katalog daftar lagu resmi, input lirik, dan sinkronkan dengan Google Spreadsheet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncAllToGoogleSheet}
            disabled={isSyncingGSheet}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Kirim semua daftar lagu ke Google Spreadsheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGSheet ? 'animate-spin' : ''}`} />
            <span>{isSyncingGSheet ? 'Menyinkronkan...' : 'Sinkron ke Spreadsheet'}</span>
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:scale-105"
            title="Keluar dari sesi Administrator"
          >
            <LogOut className="w-4 h-4 text-slate-950" />
            <span>Keluar / Logout Admin</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'list'
                ? 'bg-[#00ffc8] text-slate-950 shadow-[0_0_12px_rgba(0,255,200,0.3)]'
                : 'bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Daftar Lagu ({songs.length})</span>
          </button>

          <button
            onClick={() => {
              handleResetForm();
              setActiveSubTab('add');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'add'
                ? 'bg-[#00ffc8] text-slate-950 shadow-[0_0_12px_rgba(0,255,200,0.3)]'
                : 'bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingSongId ? 'Edit Lagu Terpilih' : 'Tambah Lagu Baru'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-[#00ffc8] text-slate-950 shadow-[0_0_12px_rgba(0,255,200,0.3)]'
                : 'bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Pesanan Masuk ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('downloads')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'downloads'
                ? 'bg-[#00ffc8] text-slate-950 shadow-[0_0_12px_rgba(0,255,200,0.3)]'
                : 'bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <Unlock className="w-4 h-4 text-emerald-400" />
            <span>Akses Unduhan Terbuka ({downloadList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('export')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'export'
                ? 'bg-[#00ffc8] text-slate-950 shadow-[0_0_12px_rgba(0,255,200,0.3)]'
                : 'bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Cadangkan Data</span>
          </button>

          {onOpenEditProfile && (
            <button
              onClick={onOpenEditProfile}
              className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer bg-slate-900 hover:bg-[#00ffc8]/20 text-[#00ffc8] border border-[#00ffc8]/30"
              title="Edit Data Profil Komposer & Simpan ke Spreadsheet"
            >
              <User className="w-4 h-4 text-[#00ffc8]" />
              <span>Edit Profil Komposer</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncAllToGoogleSheet}
            disabled={isSyncingGSheet}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Upload ke Sheet</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Keluar dari mode admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Sub Tab 1: Song List */}
      {activeSubTab === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <p>Klik tombol <strong>Edit</strong> untuk mengubah judul, penyanyi, audio link, atau lirik.</p>
            <button
              onClick={onResetToDefault}
              className="text-slate-400 hover:text-amber-300 underline"
            >
              Reset ke Data Bawaan
            </button>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 overflow-x-auto shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Urutan</th>
                  <th className="py-3.5 px-4">Lagu & Artis</th>
                  <th className="py-3.5 px-4">Genre / Tahun</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {songs.map((song, index) => (
                  <tr key={song.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      #{song.order || index + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={song.cover}
                          alt={song.title}
                          className="w-9 h-9 rounded-lg object-cover bg-slate-800 border border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{song.title}</span>
                            {song.youtubeUrl && (
                              <span className="px-1.5 py-0.5 rounded bg-red-600/20 border border-red-500/30 text-red-400 text-[9px] font-bold flex items-center gap-0.5" title="Video YouTube Terhubung">
                                <Youtube className="w-2.5 h-2.5" /> Video
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{song.singer}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                          {song.genre} ({song.year})
                        </span>
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-mono text-emerald-400 text-[10px]">
                          {formatSongDuration(song.duration)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(song.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
                          song.status === 'Draft'
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {song.status === 'Draft' ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{song.status === 'Draft' ? 'Draft' : 'Publish'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(song)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-[#00ffc8]/20 text-slate-300 hover:text-[#00ffc8] transition cursor-pointer"
                          title="Edit Lagu"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSong(song.id, song.title)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition cursor-pointer"
                          title="Hapus Lagu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Tab 2: Add / Edit Form */}
      {activeSubTab === 'add' && (
        <form onSubmit={handleSaveSong} className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00ffc8]" />
              <span>{editingSongId ? `Edit Lagu: ${formData.title}` : 'Input Lagu Playlist Baru'}</span>
            </h3>
            {editingSongId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-amber-300 hover:underline"
              >
                Batal Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Judul Lagu *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Cinta Dalam Doa"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Penyanyi / Komposer
              </label>
              <input
                type="text"
                required
                value={formData.singer}
                onChange={(e) => setFormData({ ...formData, singer: e.target.value })}
                placeholder="Muhammad Dzikron"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Genre Lagu
              </label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                placeholder="Pop Religi, Acoustic Ballad, etc."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Tahun Rilis
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-300 text-xs">
                  Link Google Drive / ID File Audio *
                </label>
                {formData.driveId.trim() && (
                  <span className="text-[11px] font-mono text-[#00ffc8]">
                    ID: {extractDriveId(formData.driveId) || 'URL Standar'}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.driveId}
                  onChange={(e) => {
                    setFormData({ ...formData, driveId: e.target.value });
                    setTestAudioError(null);
                    setTestAudioSuccess(false);
                    if (isPlayingTest && testAudioRef.current) {
                      testAudioRef.current.pause();
                      setIsPlayingTest(false);
                    }
                  }}
                  placeholder="https://drive.google.com/file/d/1A2B3C... atau 1A2B3C..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-[#00ffc8]"
                />

                <button
                  type="button"
                  onClick={handleTestDriveAudio}
                  disabled={!formData.driveId.trim() || isTestingAudio}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                    isPlayingTest
                      ? 'bg-rose-500 text-slate-950 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                      : testAudioSuccess
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 hover:bg-[#00ffc8] text-slate-200 hover:text-slate-950 border border-slate-700'
                  }`}
                  title="Tes Putar Audio dari Google Drive"
                >
                  {isTestingAudio ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : isPlayingTest ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{isPlayingTest ? 'Jeda Tes' : 'Tes Audio'}</span>
                </button>
              </div>

              {/* Hidden audio element for testing */}
              <audio
                ref={testAudioRef}
                onLoadedMetadata={() => {
                  if (
                    testAudioRef.current &&
                    testAudioRef.current.duration &&
                    !isNaN(testAudioRef.current.duration) &&
                    isFinite(testAudioRef.current.duration) &&
                    testAudioRef.current.duration > 0
                  ) {
                    const realDuration = formatSecondsToMinutes(testAudioRef.current.duration);
                    setFormData((prev) => ({
                      ...prev,
                      duration: realDuration
                    }));
                  }
                }}
                onEnded={() => setIsPlayingTest(false)}
                onError={() => {
                  setIsPlayingTest(false);
                  setIsTestingAudio(false);
                  setTestAudioError(
                    'Audio tidak dapat diputar. Pastikan link Google Drive diset "Siapa saja yang memiliki link" dan dapat diakses publik.'
                  );
                }}
              />

              {/* Status feedback */}
              {testAudioSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Audio berhasil dimuat dari Google Drive dan dapat diputar!</span>
                </div>
              )}

              {testAudioError && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Petunjuk Izin Google Drive:</span>
                  </div>
                  <p className="text-[10px] text-amber-200/90 leading-relaxed pl-5">
                    1. Buka Google Drive &gt; Klik kanan file MP3 &gt; <strong>Bagikan (Share)</strong>.<br />
                    2. Ubah Akses Umum menjadi: <strong>"Siapa saja yang memiliki link" (Anyone with the link)</strong>.<br />
                    3. Salin link dan tempelkan kembali di kolom ini.
                  </p>
                </div>
              )}

              <p className="text-[10px] text-slate-400">
                Mendukung URL penuh Google Drive, file ID drive, atau direct MP3 URL.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-300 flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  <span>Link Video YouTube (Opsional)</span>
                </label>
                {formData.youtubeUrl.trim() && extractYouTubeId(formData.youtubeUrl) && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ID: {extractYouTubeId(formData.youtubeUrl)}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Jika diisi, video musik siap putar otomatis tampil di detail lagu. Kosongkan jika belum memiliki link video.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Cover Album (URL Gambar)
              </label>
              <input
                type="text"
                value={formData.cover}
                onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Durasi Lagu (MM:SS)
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="04:12"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Urutan Putar
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Status Publikasi
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
                >
                  <option value="Publish">Publish</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1 text-xs">
              Lirik Lagu Lengkap
            </label>
            <textarea
              rows={6}
              value={formData.lyrics}
              onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
              placeholder="Tuliskan lirik lagu lengkap di sini..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs leading-relaxed focus:outline-none focus:border-[#00ffc8]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 font-bold text-xs flex items-center gap-2 hover:scale-105 transition cursor-pointer shadow-[0_0_15px_rgba(0,255,200,0.4)]"
            >
              <Save className="w-4 h-4" />
              <span>{editingSongId ? 'Simpan Perubahan' : 'Tambahkan Lagu Baru'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Sub Tab: Orders / Pesanan Masuk */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Inbox className="w-5 h-5 text-[#00ffc8]" />
                <span>Daftar Pesanan & Permintaan Klien Masuk</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Data pesanan yang masuk melalui formulir kontak dan tersimpan di Google Spreadsheet (Tab: <strong>Pesanan</strong>).
              </p>
            </div>

            <div className="flex items-center gap-2">
              {orders.length > 0 && (
                <button
                  onClick={handleClearAllOrders}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Hapus semua riwayat pesanan lokal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bersihkan Semua</span>
                </button>
              )}

              <button
                onClick={loadOrders}
                disabled={isLoadingOrders}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold flex items-center gap-2 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                <span>{isLoadingOrders ? 'Memuat...' : 'Segarkan Data'}</span>
              </button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-3">
              <Inbox className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">Belum ada pesanan masuk</p>
              <p className="text-xs text-slate-500">
                Formulir pesanan yang diisi klien akan otomatis muncul di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order, idx) => {
                const orderKey = order.id || `${order.name}-${order.timestamp}`;
                const isDeletingThis = deletingOrderId === orderKey;

                return (
                  <div
                    key={orderKey || idx}
                    className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-4 shadow-lg flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div>
                          <span className="px-2.5 py-1 rounded-lg bg-[#00ffc8]/10 text-[#00ffc8] text-[10px] font-bold uppercase tracking-wider border border-[#00ffc8]/20">
                            {order.service}
                          </span>
                          <h4 className="text-base font-bold text-white mt-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span>{order.name}</span>
                          </h4>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{order.timestamp}</span>
                          </div>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                            {order.status || 'Baru Masuk'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-white font-mono">{order.phone}</span>
                        </div>
                        {order.email && order.email !== '-' && (
                          <div className="flex items-center gap-1.5 text-slate-400 truncate">
                            <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span className="truncate">{order.email}</span>
                          </div>
                        )}
                        {order.genre && order.genre !== '-' && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{order.genre}</span>
                          </div>
                        )}
                        {order.budget && order.budget !== '-' && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{order.budget}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/60 text-xs text-slate-300 leading-relaxed">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                          Pesan & Kebutuhan Proyek:
                        </div>
                        <p className="italic">"{order.message}"</p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleReplyWhatsApp(order)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Balas via WA</span>
                      </button>

                      <button
                        onClick={() => handleDeleteOrder(order)}
                        disabled={isDeletingThis}
                        className="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        title="Hapus pesanan ini"
                      >
                        {isDeletingThis ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sub Tab: Download Management (Akses Unduhan Terbuka) */}
      {activeSubTab === 'downloads' && (
        <div className="space-y-6">
          {/* Header Info & Instagram Gate Notice */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Unlock className="w-5 h-5 text-emerald-400" />
                  <span>Kelola Isi & File Akses Unduhan Terbuka</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Kelola, edit, dan hapus seluruh isi file yang dapat diunduh (Audio Master WAV/MP3, Partitur Chord PDF, Lirik Panduan, dsb). Mendukung tautan Google Drive langsung.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    handleResetDownloadForm();
                    setShowDownloadForm(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#00ffc8] text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,200,0.3)] hover:brightness-110 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Tambah File Baru</span>
                </button>

                <button
                  onClick={() => {
                    setBannerFormData(bannerConfig);
                    setShowBannerConfigModal(true);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Edit Teks Kartu Akses Unduhan Terbuka"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" />
                  <span>Edit Teks Kartu</span>
                </button>

                <button
                  onClick={() => setShowResetDownloadsModal(true)}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  title="Kembalikan file ke daftar bawaan awal"
                >
                  Reset Bawaan
                </button>
              </div>
            </div>

            {/* Instagram Follow Requirement Information */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-950/20 via-slate-950 to-slate-950 border border-pink-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                <span>
                  <strong>Syarat Pengunjung:</strong> Tombol unduh terbuka setelah follow Instagram{' '}
                  <span className="text-[#00ffc8] font-bold">{bannerConfig.instagramUsername || INSTAGRAM_USERNAME}</span>.
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    setBannerFormData(bannerConfig);
                    setShowBannerConfigModal(true);
                  }}
                  className="text-[11px] text-pink-400 hover:text-pink-300 underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Ubah Target IG</span>
                  <Settings className="w-3 h-3" />
                </button>
                <a
                  href={bannerConfig.instagramUrl || INSTAGRAM_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Buka Profil</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Add / Edit Download Item Form Card */}
          {showDownloadForm && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-[#00ffc8]/30 shadow-2xl space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#00ffc8]/10 border border-[#00ffc8]/30 flex items-center justify-center">
                    {editingDownloadId ? <Edit2 className="w-4 h-4 text-[#00ffc8]" /> : <Plus className="w-4 h-4 text-[#00ffc8]" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {editingDownloadId ? 'Edit File Akses Unduhan Terbuka' : 'Tambah File Unduhan Baru'}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {editingDownloadId ? 'Perbarui nama, link Google Drive, atau deskripsi file ini' : 'Tambahkan materi audio atau dokumen baru ke area unduh'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResetDownloadForm}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Tutup Form"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDownload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nama File / Judul Karya <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={downloadFormData.fileName}
                      onChange={(e) => setDownloadFormData({ ...downloadFormData, fileName: e.target.value })}
                      placeholder="Contoh: The Miracle of Rain - Master Audio HQ (24-bit WAV)"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffc8]"
                    />
                  </div>

                  {/* File URL / Google Drive */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Link URL File / Google Drive <span className="text-rose-400">*</span></span>
                      {downloadFormData.fileUrl && extractDriveId(downloadFormData.fileUrl) && (
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <Check className="w-3 h-3" /> Link Google Drive Terdeteksi
                        </span>
                      )}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={downloadFormData.fileUrl}
                        onChange={(e) => setDownloadFormData({ ...downloadFormData, fileUrl: e.target.value })}
                        placeholder="Tempel link Google Drive (https://drive.google.com/file/d/...) atau URL file langsung"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffc8]"
                      />
                      {downloadFormData.fileUrl && (
                        <a
                          href={resolveDownloadUrl(downloadFormData.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                          title="Uji buka link download"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Uji Link</span>
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Mendukung format link sharing Google Drive biasa, link open/uc, maupun link file langsung (Dropbox, CDN, dsb).
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Kategori File
                    </label>
                    <select
                      value={downloadFormData.category}
                      onChange={(e) => setDownloadFormData({ ...downloadFormData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#00ffc8]"
                    >
                      <option value="Master Audio HQ">Master Audio HQ</option>
                      <option value="Partitur & Chord PDF">Partitur & Chord PDF</option>
                      <option value="Lirik & Panduan">Lirik & Panduan</option>
                      <option value="Backing Track / Stems">Backing Track / Stems</option>
                      <option value="Paket Bundle">Paket Bundle</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  {/* Format */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Format File
                    </label>
                    <input
                      type="text"
                      value={downloadFormData.format}
                      onChange={(e) => setDownloadFormData({ ...downloadFormData, format: e.target.value })}
                      placeholder="Contoh: WAV + MP3, PDF, ZIP"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffc8]"
                    />
                  </div>

                  {/* File Size */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Ukuran File (Opsional)
                    </label>
                    <input
                      type="text"
                      value={downloadFormData.fileSize}
                      onChange={(e) => setDownloadFormData({ ...downloadFormData, fileSize: e.target.value })}
                      placeholder="Contoh: 48.5 MB, 12.0 MB"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffc8]"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Status Tampilan
                    </label>
                    <select
                      value={downloadFormData.status}
                      onChange={(e) => setDownloadFormData({ ...downloadFormData, status: e.target.value as 'active' | 'hidden' })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#00ffc8]"
                    >
                      <option value="active">Aktif (Tampilkan di Akses Unduhan Terbuka)</option>
                      <option value="hidden">Disembunyikan (Hanya Draft Admin)</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Deskripsi / Catatan File
                    </label>
                    <textarea
                      rows={2}
                      value={downloadFormData.description}
                      onChange={(e) => setDownloadFormData({ ...downloadFormData, description: e.target.value })}
                      placeholder="Tuliskan keterangan isi file, kualitas audio, atau kegunaan partitur..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffc8]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,200,0.3)] hover:brightness-110 transition cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingDownloadId ? 'Simpan Perubahan' : 'Tambahkan File'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetDownloadForm}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>

                  {editingDownloadId && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = downloadList.find(d => d.id === editingDownloadId);
                        if (target) setItemToDelete(target);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus File Ini</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Downloads Table */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 overflow-x-auto shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Nama File & Deskripsi</th>
                  <th className="py-3.5 px-4">Kategori & Format</th>
                  <th className="py-3.5 px-4">Ukuran</th>
                  <th className="py-3.5 px-4 text-center">Unduhan</th>
                  <th className="py-3.5 px-4">Sumber Link</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center min-w-[140px]">Aksi Edit & Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {downloadList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Belum ada file di Akses Unduhan Terbuka. Klik "Tambah File Baru" di atas untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  downloadList.map((item, idx) => {
                    const isDrive = Boolean(extractDriveId(item.fileUrl));
                    const isEditingThis = editingDownloadId === item.id;
                    return (
                      <tr
                        key={item.id}
                        className={`transition ${isEditingThis ? 'bg-cyan-950/30 border-l-4 border-l-[#00ffc8]' : 'hover:bg-slate-800/40'}`}
                      >
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold text-white text-xs">{item.fileName}</div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">{item.description}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[#00ffc8] text-[10px] font-bold">
                            {item.category}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{item.format}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                          {item.fileSize || '-'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-300">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px]">
                            {item.downloadCount || 0}x
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isDrive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[10px] font-semibold">
                              <HardDrive className="w-3 h-3 text-[#0099ff]" />
                              Google Drive
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                              <ExternalLink className="w-3 h-3" />
                              Direct URL
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleDownloadStatus(item)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                              item.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {item.status === 'active' ? 'Aktif' : 'Disembunyikan'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {/* Tombol Edit */}
                            <button
                              onClick={() => handleEditDownload(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                              title="Edit isi file ini"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* Tombol Hapus */}
                            <button
                              onClick={() => setItemToDelete(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                              title="Hapus file ini dari Akses Unduhan Terbuka"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>

                            {/* Uji Download */}
                            <a
                              href={resolveDownloadUrl(item.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                              title="Uji buka link download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Tab 3: Export */}
      {activeSubTab === 'export' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-[#00ffc8]" />
                <span>Cadangkan Data Katalog Lagu (JSON)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Simpan atau salin data seluruh lagu dan lirik untuk backup.
              </p>
            </div>

            <button
              onClick={handleCopyJSON}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-[#00ffc8]/20 text-slate-200 hover:text-[#00ffc8] text-xs font-bold flex items-center gap-2 transition cursor-pointer border border-slate-700"
            >
              {copiedStatus === 'json' ? <Check className="w-4 h-4 text-[#00ffc8]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedStatus === 'json' ? 'Tersalin ke Clipboard!' : 'Salin JSON'}</span>
            </button>
          </div>

          <textarea
            readOnly
            rows={8}
            value={getBackupJSONData()}
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-[#00ffc8] leading-relaxed focus:outline-none"
          />
        </div>
      )}

      {/* Modal: Konfirmasi Hapus File dari Akses Unduhan Terbuka */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Hapus File dari Unduhan?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Apakah Anda yakin ingin menghapus file berikut dari <strong>Akses Unduhan Terbuka</strong>?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <p className="font-bold text-white leading-snug">{itemToDelete.fileName}</p>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                  {itemToDelete.category}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[#00ffc8] font-mono">
                  {itemToDelete.format}
                </span>
                {itemToDelete.fileSize && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {itemToDelete.fileSize}
                  </span>
                )}
              </div>
              {itemToDelete.description && (
                <p className="text-[11px] text-slate-400 italic line-clamp-2 pt-1 border-t border-slate-900">
                  "{itemToDelete.description}"
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteDownload}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:brightness-110 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus File Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Reset File ke Bawaan */}
      {showResetDownloadsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <RefreshCw className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Reset File Unduhan ke Bawaan?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Semua file di Akses Unduhan Terbuka akan dikembalikan ke daftar 4 materi bawaan awal (Audio Master HQ WAV/MP3, Buku Partitur PDF, Lirik Panduan, dan Multi-Track Stems).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetDownloadsModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmResetDownloads}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Ya, Reset ke Bawaan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Pengaturan Teks & Kartu Akses Unduhan Terbuka */}
      {showBannerConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Unlock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Edit Teks Akses Unduhan Terbuka</h4>
                  <p className="text-[11px] text-slate-400">Ubah teks kartu verifikasi dan informasi pada halaman unduhan</p>
                </div>
              </div>
              <button
                onClick={() => setShowBannerConfigModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBannerConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Judul Lencana Kartu
                </label>
                <input
                  type="text"
                  value={bannerFormData.badgeTitle}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, badgeTitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#00ffc8]"
                  placeholder="Akses Unduhan Terbuka"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pesan Ucapan / Terima Kasih Setelah Follow
                </label>
                <input
                  type="text"
                  value={bannerFormData.thankYouTitle}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, thankYouTitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#00ffc8]"
                  placeholder="Terima kasih telah mengikuti Instagram @muhammaddzikron"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Keterangan Akses Terbuka
                </label>
                <textarea
                  rows={2}
                  value={bannerFormData.description}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#00ffc8]"
                  placeholder="Semua tombol download file di bawah ini telah aktif..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username Instagram
                  </label>
                  <input
                    type="text"
                    value={bannerFormData.instagramUsername}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, instagramUsername: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#00ffc8]"
                    placeholder="@muhammaddzikron"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tautan Profil Instagram
                  </label>
                  <input
                    type="text"
                    value={bannerFormData.instagramUrl}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, instagramUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#00ffc8]"
                    placeholder="https://www.instagram.com/muhammaddzikron"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Judul Utama Halaman Unduhan
                </label>
                <input
                  type="text"
                  value={bannerFormData.pageHeaderTitle}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, pageHeaderTitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#00ffc8]"
                  placeholder="Unduh Master Audio & Materi Musik"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deskripsi Pengantar Halaman
                </label>
                <textarea
                  rows={2}
                  value={bannerFormData.pageHeaderDesc}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, pageHeaderDesc: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#00ffc8]"
                  placeholder="Dapatkan master audio original kualitas studio..."
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleResetBannerConfig}
                  className="text-xs text-slate-400 hover:text-slate-300 underline cursor-pointer"
                >
                  Kembalikan Teks Bawaan
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBannerConfigModal(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,200,0.3)] hover:brightness-110 transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Pengaturan</span>
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
