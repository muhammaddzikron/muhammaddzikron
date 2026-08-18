import React, { useState, useEffect } from 'react';
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
  Loader2,
  Inbox,
  RefreshCw,
  Clock,
  User,
  DollarSign,
  Tag,
  ExternalLink,
  ShieldCheck,
  Lock,
  ChevronRight,
  Eye,
  FileText,
  Trash2
} from 'lucide-react';
import {
  submitContactOrder,
  fetchOrdersFromGoogleSheet,
  deleteOrderFromLocalAndSheet,
  clearAllOrdersFromLocal,
  INITIAL_SAMPLE_ORDERS
} from '../../services/appsScript';
import { Order } from '../../types/song';

interface ContactViewProps {
  isAdminLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({
  isAdminLoggedIn = false,
  onOpenLoginModal
}) => {
  // Public form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'Lagu Custom / Single Baru',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Admin orders state
  const [orders, setOrders] = useState<Order[]>(INITIAL_SAMPLE_ORDERS);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersLive, setOrdersLive] = useState(false);
  const [viewPublicFormAsAdmin, setViewPublicFormAsAdmin] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load orders when admin is logged in
  useEffect(() => {
    if (isAdminLoggedIn) {
      loadOrders();
    }
  }, [isAdminLoggedIn]);

  // Sync if orders updated elsewhere
  useEffect(() => {
    const handleOrdersUpdated = () => {
      loadOrders();
    };
    window.addEventListener('dzikron_orders_updated', handleOrdersUpdated);
    return () => window.removeEventListener('dzikron_orders_updated', handleOrdersUpdated);
  }, []);

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    const res = await fetchOrdersFromGoogleSheet();
    setOrders(res.orders);
    setOrdersLive(res.isLive);
    setIsLoadingOrders(false);
  };

  const handleDeleteOrder = async (order: Order) => {
    const orderKey = order.id || `${order.name}-${order.timestamp}`;
    if (!confirm(`Hapus data pesanan dari "${order.name}"?`)) {
      return;
    }

    setDeletingOrderId(orderKey);
    // Optimistic UI update
    setOrders((prev) => prev.filter((o) => (o.id || `${o.name}-${o.timestamp}`) !== orderKey));

    try {
      const res = await deleteOrderFromLocalAndSheet(order);
      setActionNotice(res.message || 'Pesanan berhasil dihapus');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      console.warn('Gagal menghapus pesanan:', err);
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleClearAllOrders = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus SEMUA daftar pesanan klien?')) {
      return;
    }
    setOrders([]);
    await clearAllOrdersFromLocal();
    setActionNotice('Semua riwayat pesanan telah dibersihkan');
    setTimeout(() => setActionNotice(null), 3000);
  };

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

  // ==========================================
  // JIKA DALAM POSISI LOGIN ADMIN: TAMPILKAN DAFTAR PESANAN
  // ==========================================
  if (isAdminLoggedIn && !viewPublicFormAsAdmin) {
    return (
      <div className="space-y-6 pb-16 animate-in fade-in duration-300">
        
        {/* Admin Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-[#042018] border border-slate-800/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Dashboard &bull; Manajemen Pesanan Klien</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-serif font-extrabold text-white">
              Daftar Pesanan & <span className="text-gradient">Permintaan Masuk</span>
            </h1>
            <p className="text-xs text-slate-300">
              Semua formulir pesanan yang dikirim pengunjung website tersimpan di tab <strong>Pesanan</strong> Google Spreadsheet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {orders.length > 0 && (
              <button
                onClick={handleClearAllOrders}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Hapus semua riwayat pesanan"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Semua</span>
              </button>
            )}

            <button
              onClick={loadOrders}
              disabled={isLoadingOrders}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-semibold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
              <span>{isLoadingOrders ? 'Memuat...' : 'Segarkan Data'}</span>
            </button>

            <button
              onClick={() => setViewPublicFormAsAdmin(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Lihat Form Pengunjung</span>
            </button>
          </div>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Total Pesanan</div>
            <div className="text-xl font-bold text-white mt-1">{orders.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="text-[11px] text-emerald-400 font-medium">Status Koneksi</div>
            <div className="text-xs font-bold text-white mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{ordersLive ? 'Spreadsheet Live' : 'Database Lokal'}</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="text-[11px] text-sky-400 font-medium">Layanan Populer</div>
            <div className="text-xs font-bold text-white mt-1 truncate">Lagu Custom</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="text-[11px] text-amber-400 font-medium">Aksi Cepat</div>
            <div className="text-xs font-bold text-slate-300 mt-1">Balas via WhatsApp</div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-3">
              <Inbox className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">Belum ada pesanan masuk</p>
              <p className="text-xs text-slate-500">
                Formulir yang diisi oleh pengunjung di halaman kontak akan otomatis muncul di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order, idx) => {
                const orderKey = order.id || `${order.name}-${order.timestamp}`;
                const isDeleting = deletingOrderId === orderKey;

                return (
                  <div
                    key={orderKey || idx}
                    className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-4 shadow-lg flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Header: Service & Date */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div>
                          <span className="px-2.5 py-1 rounded-lg bg-[#00ffc8]/10 text-[#00ffc8] text-[10px] font-bold uppercase tracking-wider border border-[#00ffc8]/20">
                            {order.service}
                          </span>
                          <h3 className="text-base font-bold text-white mt-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span>{order.name}</span>
                          </h3>
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

                      {/* Meta info */}
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

                      {/* Message Box */}
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/60 text-xs text-slate-300 leading-relaxed">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                          Pesan & Kebutuhan Proyek:
                        </div>
                        <p className="italic">"{order.message}"</p>
                      </div>
                    </div>

                    {/* Actions: Reply WA + Hapus */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleReplyWhatsApp(order)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Balas via WhatsApp</span>
                      </button>

                      <button
                        onClick={() => handleDeleteOrder(order)}
                        disabled={isDeleting}
                        className="py-2.5 px-3.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        title="Hapus pesanan ini"
                      >
                        {isDeleting ? (
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

      </div>
    );
  }

  // ==========================================
  // JIKA DALAM POSISI LOGOUT (PENGUNJUNG / CLIENT): TAMPILKAN FORMULIR
  // ==========================================
  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Admin Quick Switch Bar (Only visible if viewing as admin) */}
      {isAdminLoggedIn && viewPublicFormAsAdmin && (
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Mode Pratinjau Formulir Pengunjung (Anda sedang login sebagai Admin)</span>
          </div>
          <button
            onClick={() => setViewPublicFormAsAdmin(false)}
            className="px-3 py-1.5 rounded-xl bg-[#00ffc8] text-slate-950 font-bold hover:scale-105 transition cursor-pointer"
          >
            Kembali ke Daftar Pesanan Masuk
          </button>
        </div>
      )}

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

