import React, { useState } from 'react';
import { Song } from '../../types/song';
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
  FileSpreadsheet
} from 'lucide-react';
import { getGoogleDriveAudioUrl, getGoogleDriveImageUrl } from '../../services/googleDrive';
import {
  saveSongToGoogleSheet,
  deleteSongFromGoogleSheet,
  syncAllSongsToGoogleSheet
} from '../../services/appsScript';

interface AdminViewProps {
  songs: Song[];
  onUpdateSongs: (newSongs: Song[]) => void;
  onLogout: () => void;
  onResetToDefault: () => void;
  isAdminLoggedIn: boolean;
  onOpenLoginModal: () => void;
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

export const AdminView: React.FC<AdminViewProps> = ({
  songs,
  onUpdateSongs,
  onLogout,
  onResetToDefault,
  isAdminLoggedIn,
  onOpenLoginModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'add' | 'export'>('list');
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_SONG_FORM);

  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSyncingGSheet, setIsSyncingGSheet] = useState(false);

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
      duration: song.duration || '03:30',
      lyrics: song.lyrics || '',
      status: song.status || 'Publish',
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

      updated.sort((a, b) => a.order - b.order);
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
        duration: formData.duration.trim(),
        lyrics: formData.lyrics.trim(),
        status: formData.status,
        order: Number(formData.order) || songs.length + 1,
        audioUrl: finalAudio
      };

      targetSongToSync = newSong;
      const updated = [...songs, newSong];
      updated.sort((a, b) => a.order - b.order);
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
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Admin</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
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
        </div>

        <button
          onClick={handleSyncAllToGoogleSheet}
          disabled={isSyncingGSheet}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Upload Semua ({songs.length} Lagu) ke Sheet</span>
        </button>
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
                          <div className="font-bold text-white text-sm">{song.title}</div>
                          <div className="text-[11px] text-slate-400">{song.singer}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                        {song.genre} ({song.year})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
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

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Link Lengkap Google Drive / ID Drive / URL MP3 *
              </label>
              <input
                type="text"
                value={formData.driveId}
                onChange={(e) => setFormData({ ...formData, driveId: e.target.value })}
                placeholder="https://drive.google.com/file/d/... atau ID File Drive"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-[#00ffc8]"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Bisa memasukkan link lengkap Google Drive maupun File ID. Pastikan file Drive diset ke <em>"Siapa saja yang memiliki link"</em>.
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

    </div>
  );
};
