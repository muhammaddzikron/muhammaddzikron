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
  ShieldCheck,
  Trash2
} from 'lucide-react';
import {
  submitContactOrder,
  fetchOrdersFromGoogleSheet,
  deleteOrderFromLocalAndSheet,
  clearAllOrdersFromLocal,
  getCachedOrders
} from '../../services/appsScript';
import { Order } from '../../types/song';

interface ContactViewProps {
  isAdminLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({
  isAdminLoggedIn = false
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
  const [orders, setOrders] = useState<Order[]>(() => getCachedOrders());
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

  const [lastSubmittedWaUrl, setLastSubmittedWaUrl] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const waText = encodeURIComponent(
      `Halo Mas Muhammad Dzikron, saya ingin memesan / konsultasi proyek musik:\n\n` +
      `*Nama:* ${formData.name}\n` +
      `*WhatsApp:* ${formData.phone}\n` +
      (formData.email ? `*Email:* ${formData.email}\n` : '') +
      `*Layanan:* ${formData.serviceType}\n\n` +
      `*Pesan / Kebutuhan Proyek:*\n"${formData.message}"`
    );
    const waUrl = `https://wa.me/6281226854000?text=${waText}`;
    setLastSubmittedWaUrl(waUrl);

    try {
      await submitContactOrder(formData);
    } catch (err) {
      console.warn('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleWhatsAppDirect = () => {
    const waText = encodeURIComponent(
      'Halo Mas Muhammad Dzikron, saya ingin konsultasi terkait pesanan lagu / aransemen musik.'
    );
    window.open(`https://wa.me/6281226854000?text=${waText}`, '_blank', 'noopener,noreferrer');
  };

  const handleReplyWhatsApp = (order: Order) => {
    const cleanPhone = (order.phone || '').replace(/\D/g, '');
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      formattedPhone = '62' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('62')) {
      formattedPhone = '62' + cleanPhone;
    }

    const replyText = encodeURIComponent(
      `Halo Kak ${order.name}, saya Muhammad Dzikron. Terima kasih atas pesanan "${order.service}". Mari kita bahas detail konsep musik yang Kakak inginkan.`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${replyText}`, '_blank', 'noopener,noreferrer');
  };

  // ==========================================
  // JIKA DALAM POSISI LOGIN (ADMINISTRATOR): TAMPILKAN TABEL PESANAN KLIEN
  // ==========================================
  if (isAdminLoggedIn && !viewPublicFormAsAdmin) {
    return (
      <div className="space-y-6 pb-16 animate-in fade-in duration-300">
        
        {/* Toast Notifikasi Aksi */}
        {actionNotice && (
          <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Header Admin Pesanan Masuk */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-900 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-200">
              <Inbox className="w-3.5 h-3.5 text-rose-600" />
              <span>Inbox Klien & Konsultasi</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-slate-900 flex items-center gap-2">
              <span>Daftar Pesanan & Kontak Klien</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-sans font-bold">
                {orders.length} Masuk
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Data pemesanan lagu custom, aransemen, dan lisensi dari pengunjung website.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setViewPublicFormAsAdmin(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              Lihat Tampilan Form
            </button>

            <button
              onClick={loadOrders}
              disabled={isLoadingOrders}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-rose-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
              <span>{isLoadingOrders ? 'Memuat...' : 'Refresh'}</span>
            </button>

            {orders.length > 0 && (
              <button
                onClick={handleClearAllOrders}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold transition cursor-pointer"
                title="Bersihkan Semua Pesanan"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-[11px] text-slate-500 font-medium">Total Pesanan</div>
            <div className="text-xl font-serif font-extrabold text-slate-900 mt-0.5">{orders.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-[11px] text-emerald-700 font-medium">Sinkronisasi</div>
            <div className="text-xs font-bold text-slate-900 mt-1 truncate">
              {ordersLive ? 'Google Sheet Aktif' : 'Penyimpanan Lokal'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-[11px] text-sky-700 font-medium">Layanan Populer</div>
            <div className="text-xs font-bold text-slate-900 mt-1 truncate">Lagu Custom</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-[11px] text-amber-700 font-medium">Aksi Cepat</div>
            <div className="text-xs font-bold text-slate-700 mt-1">Balas via WhatsApp</div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-slate-200 bg-white shadow-xs space-y-3">
              <Inbox className="w-10 h-10 mx-auto text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">Belum ada pesanan masuk</p>
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
                    className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 transition space-y-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Header: Service & Date */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 text-[10px] font-bold uppercase tracking-wider border border-rose-200">
                            {order.service}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span>{order.name}</span>
                          </h3>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{order.timestamp}</span>
                          </div>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            {order.status || 'Baru Masuk'}
                          </span>
                        </div>
                      </div>

                      {/* Meta info */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-slate-900 font-mono font-medium">{order.phone}</span>
                        </div>
                        {order.email && order.email !== '-' && (
                          <div className="flex items-center gap-1.5 text-slate-500 truncate">
                            <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span className="truncate">{order.email}</span>
                          </div>
                        )}
                        {order.genre && order.genre !== '-' && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{order.genre}</span>
                          </div>
                        )}
                        {order.budget && order.budget !== '-' && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{order.budget}</span>
                          </div>
                        )}
                      </div>

                      {/* Message Box */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Pesan & Kebutuhan Proyek:
                        </div>
                        <p className="italic">"{order.message}"</p>
                      </div>
                    </div>

                    {/* Actions: Reply WA + Hapus */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleReplyWhatsApp(order)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm shadow-emerald-200"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Balas via WhatsApp</span>
                      </button>

                      <button
                        onClick={() => handleDeleteOrder(order)}
                        disabled={isDeleting}
                        className="py-2.5 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        title="Hapus pesanan ini"
                      >
                        {isDeleting ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
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
        <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 font-semibold">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Mode Pratinjau Formulir Pengunjung (Anda sedang login sebagai Admin)</span>
          </div>
          <button
            onClick={() => setViewPublicFormAsAdmin(false)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition cursor-pointer shadow-xs"
          >
            Kembali ke Daftar Pesanan Masuk
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_rgba(15,23,42,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-50/50 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-900 text-xs font-bold uppercase tracking-wider border border-rose-200">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Kolaborasi & Layanan Komposisi</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-slate-900">
            Wujudkan Cerita Anda Menjadi <span className="text-rose-600">Lagu & Melodi Indah</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Terbuka untuk jasa pembuatan lagu orisinal, aransemen musik vokal/akustik, jingle korporat, scoring film pendek, serta lisensi karya cipta resmi.
          </p>
        </div>
      </div>

      {/* Main Grid: Form + Contact Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 space-y-6 shadow-[0_4px_25px_rgba(15,23,42,0.04)]">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-rose-600" />
              <span>Kirim Permintaan / Penawaran Proyek</span>
            </h2>

            {isSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Pesanan Terkirim!</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Konfirmasi WhatsApp ke <strong className="text-slate-900">081226854000</strong> telah dibuka. Jika jendela chat belum terbuka, klik tombol di bawah:
                </p>
                {lastSubmittedWaUrl && (
                  <a
                    href={lastSubmittedWaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-emerald-200"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Buka Chat WhatsApp (081226854000)</span>
                  </a>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Nama Lengkap / Instansi *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Masukkan nama Anda"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Nomor WhatsApp / Telp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0812xxxxxxx"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Jenis Kebutuhan Layanan
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white shadow-xs cursor-pointer"
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
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Ceritakan Ide, Konsep, atau Deadline Proyek
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Contoh: Saya membutuhkan lagu religi pop bernuansa akustik dengan tema rasa syukur..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white leading-relaxed shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider hover:scale-[1.01] transition cursor-pointer shadow-md shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim dan konfirmasi WhatsApp ke 081226854000...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Kirim dan Konfirmasi WhatsApp ke 081226854000</span>
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
          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <MessageSquare className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Respon Cepat WhatsApp (081226854000)
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Diskusikan proyek musik langsung dengan Muhammad Dzikron melalui WhatsApp resmi <strong className="text-emerald-800">081226854000</strong>.
              </p>
            </div>

            <button
              onClick={handleWhatsAppDirect}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm shadow-emerald-200"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat WhatsApp ke 081226854000</span>
            </button>
          </div>

          {/* Service Highlights */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-4 shadow-[0_4px_25px_rgba(15,23,42,0.04)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Layanan yang Disediakan
            </h4>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <Music2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Orisinalitas Terjamin:</strong> Melodi dan lirik dibuat khusus dan bebas klaim hak cipta pihak ketiga.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Headphones className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Produksi Standar Industri:</strong> Format audio Master 24-bit siap rilis di Spotify, Apple Music & YouTube.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Surat Perjanjian Lisensi Resmi:</strong> Dokumen kontrak legalitas penggunaan komersial.
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
