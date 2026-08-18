import React from 'react';
import {
  User,
  Calendar,
  MapPin,
  HeartHandshake,
  Edit3,
  Sparkles,
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
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* 1. Main Bio Banner */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-[#0c1f2d] border border-slate-800/80 shadow-2xl overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ffc8]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Profile Photo */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-3xl overflow-hidden border-2 border-[#00ffc8]/40 shadow-[0_0_30px_rgba(0,255,200,0.2)] bg-slate-900">
              <img
                src={photoSrc}
                alt={profile.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-4">
                <div>
                  <div className="text-white font-bold text-sm">{profile.name}</div>
                  <div className="text-[11px] text-[#00ffc8]">{profile.tagline || 'Songwriter & Composer'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Text */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00ffc8]/10 text-[#00ffc8] text-xs font-bold uppercase tracking-wider border border-[#00ffc8]/20">
                <User className="w-3.5 h-3.5" />
                <span>Biografi Komposer</span>
              </div>

              {/* Edit Profile Button */}
              {isAdminLoggedIn ? (
                <button
                  id="btn-edit-profile-admin"
                  onClick={onOpenEditProfile}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-[#00ffc8] text-slate-300 hover:text-slate-950 font-semibold text-xs border border-slate-700 hover:border-[#00ffc8] transition-all shadow-md cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profil Komposer</span>
                </button>
              ) : (
                <button
                  id="btn-edit-profile-guest"
                  onClick={onOpenLoginModal || onOpenEditProfile}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs border border-slate-700/60 transition cursor-pointer"
                  title="Login admin untuk mengedit profil"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profil</span>
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-white tracking-tight leading-tight">
              {profile.headline || 'Menenun Jiwa ke dalam Harmoni & Nada'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>

            {profile.experience && (
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed whitespace-pre-line">
                {profile.experience}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              {profile.location && (
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-[#00ffc8]" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.activeSince && (
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-[#0099ff]" />
                  <span>{profile.activeSince}</span>
                </div>
              )}
              {profile.collaborationStatus && (
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
                  <span>{profile.collaborationStatus}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 2. Key Stats Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lagu */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1 shadow-lg hover:border-slate-700 transition">
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-[#00ffc8]">
            {formatStatValue(profile.statSongs)}+
          </div>
          <div className="text-xs font-semibold text-white flex items-center justify-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-[#00ffc8]" />
            <span>Lagu Diciptakan</span>
          </div>
        </div>

        {/* Album & EP */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1 shadow-lg hover:border-slate-700 transition">
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-[#0099ff]">
            {formatStatValue(profile.statAlbums)} Rilis
          </div>
          <div className="text-xs font-semibold text-white flex items-center justify-center gap-1.5">
            <Disc className="w-3.5 h-3.5 text-[#0099ff]" />
            <span>Album & EP</span>
          </div>
        </div>

        {/* Total Pendengar */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1 shadow-lg hover:border-slate-700 transition">
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-[#a855f7]">
            {formatStatValue(profile.statListeners)}+
          </div>
          <div className="text-xs font-semibold text-white flex items-center justify-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>Total Pendengar</span>
          </div>
        </div>

        {/* Genre Musik */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1 shadow-lg hover:border-slate-700 transition">
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-[#f43f5e]">
            {formatStatValue(profile.statGenres)} Kombinasi
          </div>
          <div className="text-xs font-semibold text-white flex items-center justify-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-[#f43f5e]" />
            <span>Genre Musik</span>
          </div>
        </div>
      </div>

    </div>
  );
};
