import React, { useState } from 'react';
import { Song } from '../types/song';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Save,
  Database,
  Music,
  CheckCircle2,
  Eye,
  EyeOff,
  Copy,
  Check,
  LogOut,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  ListOrdered,
  Disc
} from 'lucide-react';
import { getGoogleDriveAudioUrl, getGoogleDriveImageUrl } from '../services/googleDrive';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  onUpdateSongs: (newSongs: Song[]) => void;
  onLogout: () => void;
  isLiveSheet: boolean;
  onOpenSheetConfig: () => void;
  onResetToDefault: () => void;
}

const EMPTY_SONG_FORM = {
  id: '',
  title: '',
  singer: 'Muhammad Dzikron',
  genre: 'Pop Religi',
  year: new Date().getFullYear().toString(),
  cover: '',
  driveId: '',
  duration: '03:45',
  lyrics: '',
  status: 'Publish',
  order: 1
};

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  songs,
  onUpdateSongs,
  onLogout,
  isLiveSheet,
  onOpenSheetConfig,
  onResetToDefault
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'export'>('list');
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_SONG_FORM);

  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Start Editing
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
      duration: song.duration || '03:30',
      lyrics: song.lyrics || '',
      status: song.status || 'Publish',
      order: song.order || 1
    });
    setActiveTab('add');
  };

  // Cancel Editing / Reset Form
  const handleResetForm = () => {
    setEditingSongId(null);
    setFormData({
      ...EMPTY_SONG_FORM,
      order: songs.length + 1
    });
  };

  // Save Add or Edit
  const handleSaveSong = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    // Resolve cover & audio URLs
    const finalCover = formData.cover.trim()
      ? (formData.cover.includes('http') ? formData.cover : getGoogleDriveImageUrl(formData.cover))
      : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';

    const finalAudio = formData.driveId.trim()
      ? getGoogleDriveAudioUrl(formData.driveId)
      : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

    if (editingSongId) {
      // Update existing
      const updated = songs.map((s) => {
        if (s.id === editingSongId) {
          return {
            ...s,
            title: formData.title.trim(),
            singer: formData.singer.trim(),
            genre: formData.genre.trim(),
            year: formData.year,
            cover: finalCover,
            driveId: formData.driveId.trim(),
            duration: formData.duration.trim(),
            lyrics: formData.lyrics.trim(),
            status: formData.status,
            order: Number(formData.order),
            audioUrl: finalAudio
          };
        }
        return s;
      });

      updated.sort((a, b) => a.order - b.order);
      onUpdateSongs(updated);
      showNotification(`Lagu "${formData.title}" berhasil diperbarui!`);
    } else {
      // Create new
      const newSong: Song = {
        id: `custom-${Date.now()}`,
        no: songs.length + 1,
        title: formData.title.trim(),
        singer: formData.singer.trim(),
        genre: formData.genre.trim(),
        year: formData.year,
        cover: finalCover,
        driveId: formData.driveId.trim(),
        duration: formData.duration.trim(),
        lyrics: formData.lyrics.trim(),
        status: formData.status,
        order: Number(formData.order) || songs.length + 1,
        audioUrl: finalAudio
      };

      const updated = [...songs, newSong];
      updated.sort((a, b) => a.order - b.order);
      onUpdateSongs(updated);
      showNotification(`Lagu "${formData.title}" berhasil ditambahkan ke playlist!`);
    }

    handleResetForm();
    setActiveTab('list');
  };

  // Toggle Publish/Draft status
  const handleToggleStatus = (songId: string) => {
    const updated = songs.map((s) => {
      if (s.id === songId) {
        const nextStatus = s.status === 'Publish' ? 'Draft' : 'Publish';
        return { ...s, status: nextStatus };
      }
      return s;
    });
    onUpdateSongs(updated);
    showNotification('Status lagu diperbarui.');
  };

  // Delete Song
  const handleDeleteSong = (songId: string, title: string) => {
    if (window.confirm(`Hapus lagu "${title}" dari playlist website?`)) {
      const updated = songs.filter((s) => s.id !== songId);
      onUpdateSongs(updated);
      showNotification(`Lagu "${title}" telah dihapus.`);
    }
  };

  // Export to TSV / Google Spreadsheet Table format
  const getSpreadsheetTSVData = () => {
    const headers = [
      'No',
      'Judul Lagu',
      'Penyanyi',
      'Genre',
      'Tahun',
      'Cover',
      'Google Drive File ID',
      'Durasi',
      'Lirik',
      'Status',
      'Urutan'
    ];

    const rows = songs.map((s, idx) => [
      idx + 1,
      s.title,
      s.singer,
      s.genre,
      s.year,
      s.cover,
      s.driveId || '',
      s.duration,
      s.lyrics.replace(/\n/g, ' '),
      s.status,
      s.order
    ]);

    return [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
  };

  const handleCopyTSV = () => {
    navigator.clipboard.writeText(getSpreadsheetTSVData());
    setCopiedStatus('tsv');
    setTimeout(() => setCopiedStatus(null), 2000);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(songs, null, 2));
    setCopiedStatus('json');
    setTimeout(() => setCopiedStatus(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col glass-panel rounded-3xl border border-slate-700/80 shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Toast Notification */}
        {successToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xl animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#0099ff]/20 to-[#00ffc8]/20 text-[#00ffc8] border border-[#00ffc8]/30">
              <Disc className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                Kelola Playlist & CMS Music
              </h3>
              <p className="text-xs text-slate-400">
                Dashboard Admin M. Dzikron — Tambah, edit, dan kelola lagu secara instan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Admin</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between gap-4 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 border-transparent shadow-[0_0_15px_rgba(0,255,200,0.3)]'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Semua Lagu ({songs.length})</span>
            </button>

            <button
              onClick={() => {
                handleResetForm();
                setActiveTab('add');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
                activeTab === 'add'
                  ? 'bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 border-transparent shadow-[0_0_15px_rgba(0,255,200,0.3)]'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{editingSongId ? 'Edit Lagu Selected' : 'Tambah Lagu Baru'}</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
                activeTab === 'export'
                  ? 'bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 border-transparent shadow-[0_0_15px_rgba(0,255,200,0.3)]'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor ke Spreadsheet</span>
            </button>
          </div>

          <button
            onClick={onOpenSheetConfig}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 border transition shrink-0 ${
              isLiveSheet
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isLiveSheet ? 'Apps Script Sync On' : 'Setup Spreadsheet'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: LIST OF SONGS */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <p>Klik <strong>Edit</strong> untuk mengubah detail lagu, lirik, atau ID Google Drive.</p>
                <button
                  onClick={onResetToDefault}
                  className="text-slate-400 hover:text-amber-300 underline text-xs"
                >
                  Reset ke Playlist Default
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Urutan</th>
                      <th className="py-3 px-4">Lagu & Artis</th>
                      <th className="py-3 px-4">Genre / Tahun</th>
                      <th className="py-3 px-4">Durasi</th>
                      <th className="py-3 px-4">Drive ID</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {songs.map((song, index) => (
                      <tr key={song.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono text-slate-400 font-bold">
                          #{song.order || index + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={song.cover}
                              alt={song.title}
                              className="w-9 h-9 rounded-lg object-cover bg-slate-800 border border-slate-700"
                            />
                            <div>
                              <div className="font-bold text-white text-sm">{song.title}</div>
                              <div className="text-[11px] text-slate-400">{song.singer}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                            {song.genre} ({song.year})
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {song.duration}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#00ffc8] truncate max-w-[120px]">
                          {song.driveId || 'URL Eksternal'}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(song.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition ${
                              song.status === 'Publish'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {song.status === 'Publish' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{song.status || 'Publish'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
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

          {/* TAB 2: ADD / EDIT SONG FORM */}
          {activeTab === 'add' && (
            <form onSubmit={handleSaveSong} className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00ffc8]" />
                  {editingSongId ? `Edit Lagu: ${formData.title}` : 'Input Lagu Playlist Baru'}
                </h4>
                {editingSongId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-xs text-amber-300 hover:underline"
                  >
                    Batal Edit (Buat Baru)
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
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
                    placeholder="Pop Religi, Acoustic, Cinematic, etc."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Google Drive Audio File ID / Audio Stream URL
                  </label>
                  <input
                    type="text"
                    value={formData.driveId}
                    onChange={(e) => setFormData({ ...formData, driveId: e.target.value })}
                    placeholder="Contoh: 1a2b3c4d5e6f... (ID dari tautan Google Drive)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-[#00ffc8]"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Dapatkan dari link Google Drive &rarr; Share &rarr; Copy Link (ID adalah deretan acak di pertengahan URL).
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Cover Album (URL Gambar / Drive ID)
                  </label>
                  <input
                    type="text"
                    value={formData.cover}
                    onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                    placeholder="https://... atau ID Gambar Google Drive"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Durasi Lagu
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="04:12"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Status Publikasi
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
                    >
                      <option value="Publish">Publish</option>
                      <option value="Draft">Draft (Tersembunyi)</option>
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
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs leading-relaxed focus:outline-none focus:border-[#00ffc8]"
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

          {/* TAB 3: EXPORT TO SPREADSHEET */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#00ffc8]" />
                  Sinkronisasi ke Google Spreadsheet Anda
                </h4>
                <p>
                  Anda dapat menyalin data playlist berikut dalam bentuk tabel (TSV) atau JSON untuk langsung ditempelkan ke Google Spreadsheet atau Google Drive CMS.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Format Tabel Baris Spreadsheet (TSV - Siap Paste ke Excel/Google Sheet)
                  </span>
                  <button
                    onClick={handleCopyTSV}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-[#00ffc8]/20 text-slate-200 hover:text-[#00ffc8] text-xs font-bold flex items-center gap-2 transition cursor-pointer border border-slate-700"
                  >
                    {copiedStatus === 'tsv' ? <Check className="w-4 h-4 text-[#00ffc8]" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedStatus === 'tsv' ? 'Tersalin ke Clipboard!' : 'Salin Data Spreadsheet (TSV)'}</span>
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={8}
                  value={getSpreadsheetTSVData()}
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-[#00ffc8] leading-relaxed focus:outline-none"
                />
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Format Data JSON
                  </span>
                  <button
                    onClick={handleCopyJSON}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer border border-slate-700"
                  >
                    {copiedStatus === 'json' ? <Check className="w-4 h-4 text-[#00ffc8]" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedStatus === 'json' ? 'Tersalin!' : 'Salin Backup JSON'}</span>
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={6}
                  value={JSON.stringify(songs, null, 2)}
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed focus:outline-none"
                />
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
