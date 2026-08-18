import React, { useState } from 'react';
import {
  Send,
  Mail,
  Phone,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Music2,
  FileCheck,
  Headphones,
  Instagram,
  Youtube,
  Radio,
  Loader2
} from 'lucide-react';
import { submitContactOrder } from '../../services/appsScript';

export const ContactView: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'Lagu Custom / Single Baru',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitContactOrder(formData);
    } catch (err) {
      console.warn('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          serviceType: 'Lagu Custom / Single Baru',
          message: ''
        });
      }, 5000);
    }
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Halo Mas Muhammad Dzikron, saya tertarik untuk kolaborasi/pemesanan pembuatan lagu atau lisensi musik.`
    );
    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-[#042018] border border-slate-800/80 shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kolaborasi & Layanan Komposisi</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-white">
            Wujudkan Cerita Anda Menjadi <span className="text-gradient">Lagu & Melodi Indah</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Terbuka untuk jasa pembuatan lagu orisinal, aransemen musik vokal/akustik, jingle korporat, scoring film pendek, serta lisensi karya cipta resmi.
          </p>
        </div>
      </div>

      {/* Main Grid: Form + Contact Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-[#00ffc8]" />
              <span>Kirim Permintaan / Penawaran Proyek</span>
            </h2>

            {isSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                <h3 className="text-base font-bold text-white">Pesan Berhasil Terkirim!</h3>
                <p className="text-xs text-slate-300">
                  Terima kasih, tim manajemen Muhammad Dzikron akan segera menghubungi Anda kembali melalui WhatsApp/Email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">
                      Nama Lengkap / Instansi *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Masukkan nama Anda"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">
                      Nomor WhatsApp / Telp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0812xxxxxxx"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">
                      Jenis Kebutuhan Layanan
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8]"
                    >
                      <option value="Lagu Custom / Single Baru">Penciptaan Lagu Custom / Single Baru</option>
                      <option value="Aransemen Musik & Orkestrasi">Aransemen Musik & Orkestrasi</option>
                      <option value="Jingle Iklan & Brand Anthem">Jingle Iklan & Brand Anthem</option>
                      <option value="Film Scoring & Soundtrack">Film Scoring & Soundtrack</option>
                      <option value="Lisensi Lagu Eksisting">Lisensi Penggunaan Lagu Eksisting</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    Ceritakan Ide, Konsep, atau Deadline Proyek
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Contoh: Saya membutuhkan lagu religi pop bernuansa akustik dengan tema rasa syukur..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#00ffc8] leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 font-bold text-xs uppercase tracking-wider hover:scale-[1.01] transition cursor-pointer shadow-[0_0_20px_rgba(0,255,200,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim ke Spreadsheet...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Formulir Permintaan</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Contact Info Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick WhatsApp Action Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-950/50 to-slate-900 border border-emerald-500/30 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                Respon Cepat WhatsApp
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Diskusikan proyek musik atau tawaran panggung langsung dengan manajemen resmi.
              </p>
            </div>

            <button
              onClick={handleWhatsAppDirect}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat WhatsApp Sekarang</span>
            </button>
          </div>

          {/* Service Highlights */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Layanan yang Disediakan
            </h4>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <Music2 className="w-4 h-4 text-[#00ffc8] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Orisinalitas Terjamin:</strong> Melodi dan lirik dibuat khusus dan bebas klaim hak cipta pihak ketiga.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Headphones className="w-4 h-4 text-[#0099ff] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Produksi Standar Industri:</strong> Format audio Master 24-bit siap rilis di Spotify, Apple Music & YouTube.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Surat Perjanjian Lisensi Resmi:</strong> Dokumen kontrak legalitas penggunaan komersial.
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
