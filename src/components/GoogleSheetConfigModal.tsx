import React, { useState } from 'react';
import { APPS_SCRIPT_CODE_SAMPLE, getStoredAppsScriptUrl } from '../services/appsScript';
import {
  X,
  Database,
  Check,
  Copy,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface GoogleSheetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestAndSave: (url: string) => Promise<boolean>;
  isLive: boolean;
}

export const GoogleSheetConfigModal: React.FC<GoogleSheetConfigModalProps> = ({
  isOpen,
  onClose,
  onTestAndSave,
  isLive
}) => {
  const [urlInput, setUrlInput] = useState(getStoredAppsScriptUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const success = await onTestAndSave(urlInput);
    setTesting(false);

    if (success) {
      setTestResult({
        success: true,
        msg: 'Integrasi Google Spreadsheet Berhasil! Playlist otomatis diperbarui realtime.'
      });
    } else {
      setTestResult({
        success: false,
        msg: 'Gagal menghubungkan. Pastikan Apps Script Web App dideploy dengan izin "Anyone" (Siapa Saja).'
      });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE_SAMPLE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xl text-slate-800">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900">
              Integrasi Google Spreadsheet & Drive CMS
            </h3>
            <p className="text-xs text-slate-500">
              Ubah data lagu di Spreadsheet tanpa perlu mengubah kode website.
            </p>
          </div>
        </div>

        {/* Current Sync Status Badge */}
        <div className={`p-4 rounded-2xl border mb-6 flex items-center justify-between gap-4 ${
          isLive
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-3 text-xs">
            {isLive ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />}
            <div>
              <strong className="block text-sm">
                {isLive ? 'Status: Terhubung ke Apps Script Live' : 'Status: Menggunakan Data Lokal'}
              </strong>
              {isLive
                ? 'Website secara realtime membaca data playlist dari Google Spreadsheet Anda.'
                : 'Belum ada URL Apps Script terhubung. Silakan ikuti petunjuk di bawah ini.'}
            </div>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} className="space-y-4 mb-8">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              URL Web App Google Apps Script
            </label>
            <input
              type="url"
              required
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white shadow-xs"
            />
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              testResult.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              <span>{testResult.msg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={testing}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-emerald-200"
            >
              {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              <span>{testing ? 'Menguji Koneksi...' : 'Simpan & Hubungkan Live'}</span>
            </button>
          </div>
        </form>

        {/* Step-by-Step Instructions */}
        <div className="space-y-4 pt-6 border-t border-slate-100 text-xs text-slate-600">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Panduan Menghubungkan Google Spreadsheet:
          </h4>

          <ol className="list-decimal list-inside space-y-3 leading-relaxed text-slate-600 pl-1">
            <li>
              Buka atau buat <strong>Google Spreadsheet</strong> di Google Drive Anda.
            </li>
            <li>
              Struktur Tab Spreadsheet:
              <div className="mt-2 space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-indigo-700">Tab 1: "Lagu" (Kolom Baris 1):</span>
                  <code className="text-slate-800 block text-[10px] mt-1 font-mono">
                    No | Judul Lagu | Penyanyi | Genre | Tahun | Link Google Drive | Cover URL | Link YouTube | Durasi | Lirik | Status | Urutan
                  </code>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-sky-700">Tab 2: "Profil" (Format Kunci-Nilai Kolom A-B atau Kolom Horizontal):</span>
                  <code className="text-slate-800 block text-[10px] mt-1 font-mono">
                    Kolom A: Field | Kolom B: Value (Nama, Tagline, Headline, Foto, Biografi, Pengalaman, Lokasi, Tahun Aktif, Status Kolaborasi, Total Lagu, Album & EP, Total Pendengar, Genre Musik)
                  </code>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-amber-700">Tab 3: "Pesanan" (Pesanan / Kolaborasi Masuk):</span>
                  <code className="text-slate-800 block text-[10px] mt-1 font-mono">
                    Timestamp | Nama Klien | Nomor WhatsApp | Email | Jenis Layanan | Genre Musik | Estimasi Budget | Deskripsi Proyek | Status Pesanan
                  </code>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-emerald-700">Tab 4: "Unduhan" (Akses Unduhan Terbuka & Link Google Drive):</span>
                  <code className="text-slate-800 block text-[10px] mt-1 font-mono">
                    No | Nama File | Kategori | Format | Ukuran | Link Download | Deskripsi | Jumlah Unduhan | Status
                  </code>
                </div>
              </div>
            </li>
            <li>
              Klik menu <strong>Extensions &rarr; Apps Script</strong>.
            </li>
            <li>
              Hapus kode default dan tempelkan (paste) seluruh kode Apps Script di bawah:
            </li>
          </ol>

          {/* Apps Script Code snippet */}
          <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-4 font-mono text-[11px] text-slate-200 overflow-x-auto shadow-inner">
            <button
              onClick={handleCopyCode}
              className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Tersalin!' : 'Copy Code'}</span>
            </button>
            <pre>{APPS_SCRIPT_CODE_SAMPLE}</pre>
          </div>

          <p className="leading-relaxed">
            6. Klik <strong>Deploy &rarr; New deployment &rarr; Web app</strong>. Atur <em>Who has access</em> ke <strong>Anyone</strong> (Siapa Saja).
            <br />
            7. Salin URL Web App yang dihasilkan dan tempelkan pada kolom di atas!
          </p>
        </div>

      </div>
    </div>
  );
};
