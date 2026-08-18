import React, { useState } from 'react';
import {
  X,
  User,
  Save,
  Image,
  Sparkles,
  MapPin,
  Calendar,
  HeartHandshake,
  FileSpreadsheet,
  Check,
  AlertCircle,
  RefreshCw,
  Sliders,
  Music,
  Disc,
  Users,
  Grid
} from 'lucide-react';
import { ComposerProfile } from '../types/song';
import { getGoogleDriveImageUrl } from '../services/googleDrive';
import { saveProfileToGoogleSheet } from '../services/appsScript';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ComposerProfile;
  onSaveProfile: (updatedProfile: ComposerProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile
}) => {
  const [formData, setFormData] = useState<ComposerProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync state if initial prop changes
  React.useEffect(() => {
    setFormData(profile);
  }, [profile]);

  if (!isOpen) return null;

  const handleChange = (field: keyof ComposerProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      // 1. Save to state & local cache
      onSaveProfile(formData);

      // 2. Sync to Google Apps Script
      const res = await saveProfileToGoogleSheet(formData);
      setStatusMessage(res.message);
      setSaveSuccess(true);

      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Gagal menyimpan profil:', err);
      setIsSaving(false);
      setStatusMessage(`Gagal sinkron: ${err.message || 'Periksa koneksi spreadsheet'}`);
    }
  };

  // Preview computed photo URL
  const previewPhoto = formData.photoUrl ? getGoogleDriveImageUrl(formData.photoUrl) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-[#090e1a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#0099ff]/20 to-[#00ffc8]/20 border border-[#00ffc8]/30 text-[#00ffc8]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-white tracking-tight">
                Edit Profil Komposer
              </h2>
              <p className="text-xs text-slate-400">
                Ubah informasi biografi dan sinkronkan otomatis ke tab <strong>"Profil"</strong> Google Spreadsheet.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* 1. Profile Preview & Photo Link */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00ffc8] flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5" />
                <span>Foto Profil & Identitas Visual</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Photo Preview Avatar */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-[#00ffc8]/40 shrink-0 shadow-lg bg-slate-900 flex items-center justify-center">
                {previewPhoto ? (
                  <img
                    src={previewPhoto}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                ) : (
                  <User className="w-10 h-10 text-slate-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                  <span className="text-[10px] text-white font-medium truncate">{formData.name || 'Pratinjau'}</span>
                </div>
              </div>

              {/* Photo URL Inputs */}
              <div className="flex-1 w-full space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Link Foto Profil (Direct URL / Google Drive Link / ID):
                  </label>
                  <input
                    type="text"
                    value={formData.photoUrl}
                    onChange={(e) => handleChange('photoUrl', e.target.value)}
                    placeholder="https://images.unsplash.com/... atau ID/Link Google Drive"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffc8]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Dapat berupa URL gambar langsung atau link file Google Drive yang disetel publik.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nama Lengkap:
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Muhammad Dzikron"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffc8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Sub-Judul / Tagline:
                    </label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => handleChange('tagline', e.target.value)}
                      placeholder="Songwriter & Composer"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffc8]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Headline & Biografi */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Headline / Slogan Utama Biografi:
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => handleChange('headline', e.target.value)}
                placeholder="Menenun Jiwa ke dalam Harmoni & Nada"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffc8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Biografi Utama (Paragraf 1):
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tuliskan perkenalan singkat tentang komposer..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffc8] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pengalaman & Perjalanan Musik (Paragraf 2):
              </label>
              <textarea
                rows={3}
                value={formData.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                placeholder="Tuliskan pengalaman bertahun-tahun, genre, pencapaian..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffc8] leading-relaxed"
              />
            </div>
          </div>

          {/* 3. Status & Informasi Tambahan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#00ffc8]" />
                <span>Lokasi / Asal:</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Indonesia"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffc8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#0099ff]" />
                <span>Tahun Aktif:</span>
              </label>
              <input
                type="text"
                value={formData.activeSince}
                onChange={(e) => handleChange('activeSince', e.target.value)}
                placeholder="Aktif Sejak 2016"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffc8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
                <span>Status Kolaborasi:</span>
              </label>
              <input
                type="text"
                value={formData.collaborationStatus}
                onChange={(e) => handleChange('collaborationStatus', e.target.value)}
                placeholder="Terbuka untuk Kolaborasi"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffc8]"
              />
            </div>
          </div>

          {/* 4. Statistik Prestasi */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#00ffc8]" />
              <span>Statistik & Pencapaian di Halaman Profil</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Total Lagu:
                </label>
                <input
                  type="text"
                  value={formData.statSongs}
                  onChange={(e) => handleChange('statSongs', e.target.value)}
                  placeholder="85"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white text-center font-bold focus:outline-none focus:border-[#00ffc8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Album & EP:
                </label>
                <input
                  type="text"
                  value={formData.statAlbums}
                  onChange={(e) => handleChange('statAlbums', e.target.value)}
                  placeholder="12"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white text-center font-bold focus:outline-none focus:border-[#00ffc8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Total Pendengar:
                </label>
                <input
                  type="text"
                  value={formData.statListeners}
                  onChange={(e) => handleChange('statListeners', e.target.value)}
                  placeholder="1500000"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white text-center font-bold focus:outline-none focus:border-[#00ffc8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Genre Musik:
                </label>
                <input
                  type="text"
                  value={formData.statGenres}
                  onChange={(e) => handleChange('statGenres', e.target.value)}
                  placeholder="8"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white text-center font-bold focus:outline-none focus:border-[#00ffc8]"
                />
              </div>
            </div>
          </div>

          {/* Status feedback message */}
          {statusMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 font-bold text-xs flex items-center gap-2 hover:opacity-95 transition shadow-[0_0_20px_rgba(0,255,200,0.3)] cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Spreadsheet...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan & Sinkronkan Profil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
