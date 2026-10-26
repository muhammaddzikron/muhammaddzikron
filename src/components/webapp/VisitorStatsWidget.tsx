import React, { useState, useEffect } from 'react';
import {
  Users,
  Compass,
  MessageCircle,
  Search,
  Share2,
  Globe,
  TrendingUp,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getVisitorStats, trackVisit, VisitorStats, TrafficSource } from '../../services/visitorAnalytics';

export const VisitorStatsWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [stats, setStats] = useState<VisitorStats>(() => getVisitorStats());
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  useEffect(() => {
    // Record visit on mount
    trackVisit();
    setStats(getVisitorStats());

    const handleUpdate = () => {
      setStats(getVisitorStats());
    };

    window.addEventListener('dzikron_visitor_updated', handleUpdate);
    return () => {
      window.removeEventListener('dzikron_visitor_updated', handleUpdate);
    };
  }, []);

  const renderSourceIcon = (iconName: TrafficSource['iconName']) => {
    switch (iconName) {
      case 'compass':
        return <Compass className="w-3 h-3 text-[#00ffc8]" />;
      case 'message-circle':
        return <MessageCircle className="w-3 h-3 text-[#25D366]" />;
      case 'search':
        return <Search className="w-3 h-3 text-[#4285F4]" />;
      case 'share-2':
        return <Share2 className="w-3 h-3 text-[#E1306C]" />;
      case 'globe':
      default:
        return <Globe className="w-3 h-3 text-purple-400" />;
    }
  };

  return (
    <div className="pt-2">
      {/* Header section with Live badge */}
      <div className="px-3 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Pengunjung
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-[9px] font-bold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live
          </span>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-slate-700 transition p-0.5 rounded"
          title={isExpanded ? 'Sembunyikan rincian' : 'Tampilkan rincian'}
        >
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Main Stats Card */}
      <div className="mx-1 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
        {/* Total & Today Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="text-[10px] font-medium text-slate-500 leading-tight">Total Pengunjung</div>
              <div className="text-sm font-extrabold text-slate-900 tracking-tight font-mono">
                {stats.totalVisitors.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              +{stats.todayVisitors}
            </div>
            <div className="text-[9px] font-medium text-slate-400 mt-0.5">hari ini</div>
          </div>
        </div>

        {/* Traffic Sources Breakdown (Collapsible) */}
        {isExpanded && (
          <div className="pt-2.5 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-0.5">
              <span>Sumber Trafik</span>
              <span className="text-[9px] text-slate-400">Persentase</span>
            </div>

            <div className="space-y-1.5">
              {stats.sources.map((source) => (
                <div key={source.id} className="group">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      {renderSourceIcon(source.iconName)}
                      <span className="truncate max-w-[110px] text-[11px]">{source.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {source.count.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-900 font-mono min-w-[28px] text-right">
                        {source.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(source.percentage, 4)}%`,
                        backgroundColor: source.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Current visitor source badge */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Activity className="w-3 h-3 text-indigo-500" />
                Sumber Anda:
              </span>
              <span className="font-bold text-indigo-700 truncate max-w-[100px]">
                {stats.currentSource}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
