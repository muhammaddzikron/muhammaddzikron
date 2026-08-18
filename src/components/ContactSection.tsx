import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, Phone, MapPin, Instagram, Youtube, Radio, MessageSquare, Sparkles } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;

    setIsSubmitting(true);
    const waText = encodeURIComponent(
      `Halo Mas Muhammad Dzikron, saya ingin konsultasi/kerjasama musik:\n\n` +
      `*Nama:* ${formData.name}\n` +
      (formData.email ? `*Email:* ${formData.email}\n` : '') +
      `*Pesan:*\n"${formData.message}"`
    );
    const waUrl = `https://wa.me/6281226854000?text=${waText}`;

    setTimeout(() => {
      window.open(waUrl, '_blank');
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    }, 800);
  };

  return (
    <section id="kontak" className="py-24 relative z-10 border-t border-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-[#00ffc8]/30 mb-3">
            <Mail className="w-3.5 h-3.5 text-[#00ffc8]" />
            <span className="text-xs font-semibold text-[#00ffc8] uppercase tracking-wider">
              Hubungi & Kolaborasi
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight">
            Kontak <span className="text-gradient">Resmi & Kerjasama</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Ingin berkonsultasi seputar pembuatan lagu, lisensi karya, atau kolaborasi musik? Kirimkan pesan Anda.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-[#0099ff] to-[#00ffc8] mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Info & Social Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Info Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
              <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#00ffc8]" />
                Informasi Kontak Direct
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="p-3 rounded-xl bg-[#0099ff]/20 text-[#0099ff]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Resmi</span>
                    <a href="mailto:muhammaddzikron@gmail.com" className="font-semibold text-white hover:text-[#00ffc8]">
                      muhammaddzikron@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">WhatsApp Management</span>
                    <a href="https://wa.me/6281226854000" target="_blank" rel="noreferrer" className="font-semibold text-white hover:text-[#00ffc8]">
                      +62 812-2685-4000 (Official WA)
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Lokasi Studio Musik</span>
                    <span className="font-semibold text-white">Jakarta / Yogyakarta, Indonesia</span>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-4 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 block mb-3">Media Sosial Resmi:</span>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl glass-card flex items-center gap-2 text-xs font-medium text-slate-200 hover:text-[#00ffc8] transition"
                  >
                    <Instagram className="w-4 h-4 text-pink-400" /> Instagram
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl glass-card flex items-center gap-2 text-xs font-medium text-slate-200 hover:text-red-400 transition"
                  >
                    <Youtube className="w-4 h-4 text-red-500" /> YouTube Channel
                  </a>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl glass-card flex items-center gap-2 text-xs font-medium text-slate-200 hover:text-cyan-400 transition"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" /> TikTok Official
                  </a>
                  <a
                    href="https://spotify.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl glass-card flex items-center gap-2 text-xs font-medium text-slate-200 hover:text-emerald-400 transition"
                  >
                    <Radio className="w-4 h-4 text-emerald-400" /> Spotify Artist
                  </a>
                </div>
              </div>
            </div>

            {/* Google Maps Location Preview */}
            <div className="glass-panel p-4 rounded-3xl border border-slate-800 overflow-hidden">
              <span className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#00ffc8]" /> Peta Studio Musik
              </span>
              <div className="w-full h-40 rounded-2xl bg-slate-900 overflow-hidden relative border border-slate-800 flex items-center justify-center">
                <iframe
                  title="Studio Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.56347862248!2d107.573117!3d-6.9034443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6398252477f%3A0x146a0a38f32247f0!2sBandung%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1625000000000!5m2!1sen!2sid"
                  className="w-full h-full border-0 filter grayscale invert contrast-125 opacity-70"
                  loading="lazy"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative">
              
              <h3 className="text-2xl font-serif font-bold text-white mb-2">
                Kirim Pesan <span className="text-gradient">Langsung</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Isi formulir di bawah ini untuk mendiskusikan penulisan lagu, kolaborasi, atau tanggapan apresiasi karya.
              </p>

              {isSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-3 mb-6 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <strong className="block text-sm">Pesan Berhasil Terkirim!</strong>
                    Terima kasih telah menghubungi Muhammad Dzikron. Tim management kami akan merespons sesegera mungkin.
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama Anda..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white focus:outline-none focus:border-[#00ffc8] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Alamat Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white focus:outline-none focus:border-[#00ffc8] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pesan / Topik Kerjasama</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tuliskan detail pesan, judul proyek lagu, atau pertanyaan Anda di sini..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white focus:outline-none focus:border-[#00ffc8] transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(0,255,200,0.4)] hover:shadow-[0_0_40px_rgba(0,255,200,0.7)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Mengirim dan konfirmasi WhatsApp ke 081226854000...</span>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Kirim dan Konfirmasi WhatsApp ke 081226854000</span>
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
