
import React, { useRef, useEffect } from 'react';
import { AIAnalysisResult, AnalyzeStatus } from '../types';

interface AIAnalysisProps {
  status: AnalyzeStatus;
  result: AIAnalysisResult | null;
  onAnalyze: () => void;
  onReset: () => void;
  disabled: boolean;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ status, result, onAnalyze, onReset, disabled }) => {
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === AnalyzeStatus.SUCCESS && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [status]);

  return (
    <div className="mt-10 relative rounded-3xl shadow-2xl overflow-hidden border border-amber-900/40 bg-[#0c0505]">
        {/* Background Effects */}
        <div className="absolute inset-0">
             {/* Radial Red Glow */}
             <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-red-900/20 blur-[100px] rounded-full"></div>
             {/* Grid Pattern */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
             {/* Vignette */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0c0505_100%)]"></div>
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10">
            {/* Header Area */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 bg-white/[0.02]">
                <div className="text-center md:text-left">
                     <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                        <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">🔮</span>
                        <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 font-serif tracking-wide">
                            THẦN TÀI PHÁN
                        </h3>
                     </div>
                     <p className="text-stone-400 text-sm font-light tracking-[0.2em] uppercase pl-1">
                        Dự đoán số học &bull; Vận may tài lộc
                     </p>
                </div>

                <div className="flex items-center gap-4">
                    {status === AnalyzeStatus.SUCCESS && (
                         <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/20 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Đã lưu kết quả</span>
                         </div>
                    )}
                    
                    <button
                        onClick={onAnalyze}
                        disabled={disabled || status === AnalyzeStatus.LOADING}
                        className={`
                            relative group px-8 py-3 rounded-xl font-bold text-white transition-all transform overflow-hidden
                            ${disabled 
                                ? 'bg-stone-800 cursor-not-allowed opacity-50' 
                                : 'bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-orange-600 shadow-[0_4px_20px_rgba(220,38,38,0.4)] hover:-translate-y-1'
                            }
                        `}
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                        
                        <div className="relative flex items-center gap-2">
                             {status === AnalyzeStatus.LOADING ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="font-serif italic text-amber-100">Đang xin quẻ...</span>
                                </>
                             ) : (
                                <>
                                    <span className="text-lg">⚡</span> 
                                    <span>{status === AnalyzeStatus.SUCCESS ? 'PHÂN TÍCH LẠI' : 'XEM QUẺ NGAY'}</span>
                                </>
                             )}
                        </div>
                    </button>
                </div>
            </div>

            {/* Content Body */}
            {status === AnalyzeStatus.SUCCESS && result && (
                <div ref={resultRef} className="p-6 md:p-10 animate-fade-in space-y-10">
                    
                    {/* TOP ROW: CARDS */}
                    {result.tomorrow && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <PredictionCard 
                                title="BẠCH THỦ LÔ" 
                                number={result.tomorrow.bachThu} 
                                variant="gold"
                                delay={0}
                            />
                            <PredictionCard 
                                title="SONG THỦ LÔ" 
                                number={result.tomorrow.songThu} 
                                variant="platinum"
                                delay={100}
                            />
                            <PredictionCard 
                                title="ĐẶC BIỆT (ĐỀ)" 
                                number={result.tomorrow.dacBiet} 
                                variant="ruby"
                                delay={200}
                            />
                        </div>
                    )}

                    {/* MIDDLE: QUOTE & STATS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        <div className="lg:col-span-2 space-y-8">
                            {/* Quote Box */}
                            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 shadow-lg">
                                <span className="absolute top-4 left-4 text-4xl text-white/10 font-serif">❝</span>
                                <h4 className="text-amber-500 font-bold uppercase text-xs tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <div className="h-px w-6 bg-amber-500"></div> Lời Bình
                                </h4>
                                <p className="text-xl md:text-2xl text-stone-200 font-serif italic leading-relaxed text-center px-4 md:px-8 drop-shadow-lg">
                                    {result.tomorrow.description}
                                </p>
                                <span className="absolute bottom-4 right-4 text-4xl text-white/10 font-serif">❞</span>
                            </div>

                            {/* Detailed Stats Table */}
                            {result.tomorrow.detailedStats && result.tomorrow.detailedStats.length > 0 && (
                                <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#120808]">
                                    <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                        <h4 className="text-stone-400 font-bold text-xs uppercase tracking-widest">Dữ liệu tham chiếu</h4>
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-stone-500 text-xs uppercase border-b border-white/5">
                                                    <th className="px-6 py-4 font-semibold text-left">Mục tiêu</th>
                                                    <th className="px-6 py-4 font-semibold text-left">Số</th>
                                                    <th className="px-6 py-4 font-semibold text-left">Xu Hướng</th>
                                                    <th className="px-6 py-4 font-semibold text-left">Chi tiết</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {result.tomorrow.detailedStats.map((stat, idx) => (
                                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-stone-300">{stat.category}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-serif font-bold text-lg text-amber-400">{stat.numbers}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <TrendBadge label={stat.trend} />
                                                        </td>
                                                        <td className="px-6 py-4 text-stone-400 italic font-light">{stat.dataRef}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-6">
                            {/* Summary */}
                             <div className="rounded-2xl p-6 bg-[#1a0f0f] border border-red-900/20 shadow-inner">
                                <h4 className="text-red-400 font-bold uppercase text-xs tracking-widest mb-3">Tổng Quan</h4>
                                <p className="text-stone-400 text-sm leading-7 text-justify font-light">
                                    {result.summary}
                                </p>
                            </div>

                            {/* Hot Numbers */}
                            <div className="p-1 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 border border-white/5 shadow-xl">
                                <div className="bg-[#151010] rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-orange-400 font-bold uppercase text-xs tracking-widest">Số Nóng</h4>
                                        <span className="text-xs text-stone-600 font-mono">TOP 3</span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        {result.hotNumbers.map((num, idx) => (
                                            <div key={idx} className="w-14 h-14 rounded-lg bg-gradient-to-b from-stone-800 to-stone-900 border border-white/5 flex items-center justify-center shadow-lg group hover:border-orange-500/50 transition-colors">
                                                <span className="font-serif font-bold text-xl text-stone-200 group-hover:text-orange-400">{num}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Lucky Number */}
                             <div className="relative group overflow-hidden rounded-2xl">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 animate-gradient-xy opacity-90"></div>
                                <div className="relative m-[1px] bg-[#1a0505] rounded-xl p-6 flex items-center justify-between">
                                    <div>
                                        <div className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1">May Mắn</div>
                                        <div className="text-xs text-stone-500">Ngẫu nhiên</div>
                                    </div>
                                    <div className="text-5xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-pink-200 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                                        {result.luckyPrediction}
                                    </div>
                                </div>
                             </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Error State */}
            {status === AnalyzeStatus.ERROR && (
                <div className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 text-red-500 text-3xl mb-4 border border-red-900/50">
                        ⚠️
                    </div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Không thể phân tích</h3>
                    <p className="text-stone-500">Hệ thống đang bận. Vui lòng thử lại sau giây lát.</p>
                </div>
            )}
        </div>
    </div>
  );
};

const PredictionCard = ({ title, number, variant, delay }: { title: string, number: string, variant: 'gold' | 'platinum' | 'ruby', delay: number }) => {
    const variants = {
        gold: {
            bg: "from-amber-900/40 to-black",
            border: "border-amber-500/30",
            text: "text-amber-400",
            subtext: "text-amber-600/60",
            glow: "shadow-[0_0_30px_rgba(245,158,11,0.1)]",
            gradientText: "from-amber-200 via-yellow-400 to-amber-600"
        },
        platinum: {
            bg: "from-slate-900/40 to-black",
            border: "border-emerald-500/30",
            text: "text-emerald-400",
            subtext: "text-emerald-600/60",
            glow: "shadow-[0_0_30px_rgba(16,185,129,0.1)]",
            gradientText: "from-emerald-200 via-teal-400 to-emerald-600"
        },
        ruby: {
            bg: "from-red-900/40 to-black",
            border: "border-rose-500/30",
            text: "text-rose-400",
            subtext: "text-rose-600/60",
            glow: "shadow-[0_0_30px_rgba(244,63,94,0.1)]",
            gradientText: "from-rose-200 via-red-400 to-rose-600"
        }
    };
    
    const style = variants[variant];

    return (
        <div 
            className={`relative group rounded-2xl border ${style.border} bg-gradient-to-br ${style.bg} p-1 ${style.glow} transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl`}
            style={{ animation: `fadeInUp 0.6s ease-out ${delay}ms backwards` }}
        >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
            <div className="relative h-full rounded-xl bg-black/40 backdrop-blur-sm p-6 flex flex-col items-center justify-center overflow-hidden">
                {/* Decorative circle */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${style.gradientText} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}></div>
                
                <h5 className={`relative z-10 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${style.text} opacity-80`}>{title}</h5>
                <div className={`relative z-10 text-5xl md:text-6xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-b ${style.gradientText} drop-shadow-sm`}>
                    {number}
                </div>
            </div>
        </div>
    );
};

const TrendBadge = ({ label }: { label: string }) => {
    let classes = "bg-stone-800 text-stone-400 border-stone-700";
    if (label.toLowerCase().includes('rơi')) classes = "bg-blue-900/30 text-blue-300 border-blue-500/30";
    if (label.toLowerCase().includes('gan')) classes = "bg-red-900/30 text-red-300 border-red-500/30";
    if (label.toLowerCase().includes('cầu') || label.toLowerCase().includes('đẹp')) classes = "bg-amber-900/30 text-amber-300 border-amber-500/30";

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${classes}`}>
            {label}
        </span>
    );
};
