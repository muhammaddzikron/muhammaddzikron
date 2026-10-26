import React, { useState } from 'react';
import {
  X,
  User,
  Save,
  Image,
  MapPin,
  Calendar,
  HeartHandshake,
  Check,
  RefreshCw,
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

      // 2. Sync to Google Spreadsheet (Tab Profil)
      const res = await saveProfileToGoogleSheet(formData);
      setIsSaving(false);
      setSaveSuccess(true);
      setStatusMessage(res.message || 'Profil berhasil disimpan dan disinkronkan ke Google Spreadsheet!');

      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.warn('Gagal menyimpan profil:', err);
      setIsSaving(false);
      setStatusMessage('Profil tersimpan di website, namun sinkronisasi Spreadsheet mengalami kendala jaringan.');
    }
  };

  // Preview computed photo URL
  const previewPhoto = formData.photoUrl ? getGoogleDriveImageUrl(formData.photoUrl) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 tracking-tight">
                Edit Profil Komposer
              </h2>
              <p className="text-xs text-slate-500">
                Ubah informasi biografi dan sinkronkan otomatis ke tab <strong>"Profil"</strong> Google Spreadsheet.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* 1. Profile Preview & Photo Link */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-purple-700" />
                <span>Foto Profil & Identitas Visual</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Photo Preview Avatar */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-slate-200 shrink-0 shadow-md bg-slate-100 flex items-center justify-center">
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
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>

              {/* Photo Link Input */}
              <div className="flex-1 w-full space-y-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Link Foto / File ID Google Drive
                  </label>
                  <input
                    type="text"
                    value={formData.photoUrl || ''}
                    onChange={(e) => handleChange('photoUrl', e.target.value)}
                    placeholder="Contoh: https://drive.google.com/file/d/1a2b3c... atau link gambar langsung"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 shadow-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Gunakan link Google Drive yang disetel ke <em>"Anyone with the link can view"</em>.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Main Identity & Headlines */}
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Komposer *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white shadow-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tagline Profesi Singkat
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="Songwriter, Arranger & Sound Designer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Headline Profil (Judul Besar Bio)
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => handleChange('headline', e.target.value)}
                placeholder="Menenun Jiwa ke dalam Harmoni & Nada"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white shadow-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Biografi Utama
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tuliskan biografi, filosofi karya, atau perjalanan bermusik..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white leading-relaxed shadow-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pengalaman & Portofolio Karya Tambahan
              </label>
              <textarea
                rows={2}
                value={formData.experience || ''}
                onChange={(e) => handleChange('experience', e.target.value)}
                placeholder="Pengalaman kolaborasi, rilisan digital, festival, atau pencapaian..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white leading-relaxed shadow-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Lokasi Basis
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Yogyakarta, Indonesia"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white shadow-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" /> Aktif Sejak
                </label>
                <input
                  type="text"
                  value={formData.activeSince || ''}
                  onChange={(e) => handleChange('activeSince', e.target.value)}
                  placeholder="2018 - Sekarang"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white shadow-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-600" /> Status Kolaborasi
                </label>
                <input
                  type="text"
                  value={formData.collaborationStatus || ''}
                  onChange={(e) => handleChange('collaborationStatus', e.target.value)}
                  placeholder="Terbuka untuk Projek Baru"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* 3. Angka Statistik Matrix */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
              Angka Pencapaian (Key Statistics Matrix)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 flex items-center gap-1">
                  <Music className="w-3.5 h-3.5 text-emerald-600" /> Total Lagu
                </label>
                <input
                  type="text"
                  value={formData.statSongs || ''}
                  onChange={(e) => handleChange('statSongs', e.target.value)}
                  placeholder="50"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 flex items-center gap-1">
                  <Disc className="w-3.5 h-3.5 text-indigo-600" /> Album & EP
                </label>
                <input
                  type="text"
                  value={formData.statAlbums || ''}
                  onChange={(e) => handleChange('statAlbums', e.target.value)}
                  placeholder="3"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-purple-600" /> Pendengar
                </label>
                <input
                  type="text"
                  value={formData.statListeners || ''}
                  onChange={(e) => handleChange('statListeners', e.target.value)}
                  placeholder="10000"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 flex items-center gap-1">
                  <Grid className="w-3.5 h-3.5 text-rose-600" /> Genre Musik
                </label>
                <input
                  type="text"
                  value={formData.statGenres || ''}
                  onChange={(e) => handleChange('statGenres', e.target.value)}
                  placeholder="5"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Status feedback message */}
          {statusMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-purple-200 cursor-pointer disabled:opacity-50"
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
