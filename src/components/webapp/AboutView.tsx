import React from 'react';
import {
  User,
  Calendar,
  MapPin,
  HeartHandshake,
  Edit3,
  Music,
  Disc,
  Users,
  Grid
} from 'lucide-react';
import { ComposerProfile } from '../../types/song';
import { getGoogleDriveImageUrl } from '../../services/googleDrive';

interface AboutViewProps {
  profile: ComposerProfile;
  isAdminLoggedIn?: boolean;
  onOpenEditProfile: () => void;
  onOpenLoginModal?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  profile,
  isAdminLoggedIn = false,
  onOpenEditProfile,
  onOpenLoginModal
}) => {
  const photoSrc = profile.photoUrl
    ? getGoogleDriveImageUrl(profile.photoUrl)
    : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';

  const formatStatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString('id-ID');
    }
    const num = Number(val);
    if (!isNaN(num)) {
      return num.toLocaleString('id-ID');
    }
    return val || '0';
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-10 animate-in fade-in duration-300">
      
      {/* 1. Main Bio Banner */}
      <div className="relative p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_rgba(15,23,42,0.04)] overflow-hidden">
        
        {/* Soft luxury ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-50/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-50/50 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
          
          {/* Profile Photo */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-slate-200 shadow-xl bg-slate-100 group">
              <img
                src={photoSrc}
                alt={profile.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-4">
                <div>
                  <div className="text-white font-bold text-sm">{profile.name}</div>
                  <div className="text-[11px] text-amber-300 font-medium">{profile.tagline || 'Songwriter & Composer'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Text */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-900 text-xs font-bold uppercase tracking-wider border border-purple-200">
                <User className="w-3.5 h-3.5 text-purple-700" />
                <span>Biografi Komposer</span>
              </div>

              {/* Edit Profile Button */}
              {isAdminLoggedIn ? (
                <button
                  id="btn-edit-profile-admin"
                  onClick={onOpenEditProfile}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold text-xs border border-purple-200 transition-all shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-purple-700" />
                  <span>Edit Profil Komposer</span>
                </button>
              ) : (
                <button
                  id="btn-edit-profile-guest"
                  onClick={onOpenLoginModal || onOpenEditProfile}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs border border-slate-200 transition cursor-pointer"
                  title="Login admin untuk mengedit profil"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Profil</span>
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-slate-900 tracking-tight leading-tight">
              {profile.headline || 'Menenun Jiwa ke dalam Harmoni & Nada'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>

            {profile.experience && (
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed whitespace-pre-line">
                {profile.experience}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-700">
              {profile.location && (
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium">{profile.location}</span>
                </div>
              )}
              {profile.activeSince && (
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span className="font-medium">{profile.activeSince}</span>
                </div>
              )}
              {profile.collaborationStatus && (
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
                  <span className="font-medium">{profile.collaborationStatus}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 2. Key Stats Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lagu */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 text-center space-y-1 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-md transition">
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-emerald-700">
            {formatStatValue(profile.statSongs)}+
          </div>
          <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lagu Diciptakan</span>
          </div>
        </div>

        {/* Album & EP */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 text-center space-y-1 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-md transition">
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-indigo-700">
            {formatStatValue(profile.statAlbums)} Rilis
          </div>
          <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5">
            <Disc className="w-3.5 h-3.5 text-indigo-600" />
            <span>Album & EP</span>
          </div>
        </div>

        {/* Total Pendengar */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 text-center space-y-1 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-md transition">
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-purple-700">
            {formatStatValue(profile.statListeners)}+
          </div>
          <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>Total Pendengar</span>
          </div>
        </div>

        {/* Genre Musik */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 text-center space-y-1 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-md transition">
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-rose-700">
            {formatStatValue(profile.statGenres)} Kombinasi
          </div>
          <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-rose-600" />
            <span>Genre Musik</span>
          </div>
        </div>
      </div>

    </div>
  );
};
