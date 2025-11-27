
import React from 'react';
import { AIAnalysisResult } from '../types';
import { formatDateVN } from '../services/lotteryService';

interface PredictionHistoryProps {
  history: Record<string, AIAnalysisResult>;
  onSelectDate: (date: string) => void;
  currentDate: string;
}

export const PredictionHistory: React.FC<PredictionHistoryProps> = ({ history, onSelectDate, currentDate }) => {
  const dates = Object.keys(history).sort().reverse();

  if (dates.length === 0) return null;

  return (
    <div className="mt-16 max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-10 justify-center">
         <div className="h-px w-12 bg-gray-300"></div>
         <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <span className="text-xl">📜</span> Nhật Ký
         </h3>
         <div className="h-px w-12 bg-gray-300"></div>
      </div>

      <div className="relative border-l border-gray-200 ml-4 md:ml-1/2 space-y-10">
        {dates.map((date) => {
            const item = history[date];
            const isSelected = date === currentDate;
            
            return (
                <div key={date} className="relative pl-8 md:pl-10 group">
                    {/* Timeline Dot */}
                    <div 
                        className={`absolute -left-[5px] top-6 w-2.5 h-2.5 rounded-full ring-4 ring-white transition-all duration-300 z-10
                        ${isSelected 
                            ? 'bg-red-600 scale-125' 
                            : 'bg-gray-300 group-hover:bg-amber-400'}`}
                    ></div>

                    {/* Content Card */}
                    <div 
                        onClick={() => onSelectDate(date)}
                        className={`
                            relative rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden group/card
                            ${isSelected 
                                ? 'bg-[#1a0505] border-amber-500/50 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.2)]' 
                                : 'bg-white border-gray-200 hover:border-amber-300 hover:shadow-md'
                            }
                        `}
                    >
                        {/* Header */}
                        <div className={`px-4 py-3 border-b flex justify-between items-center ${isSelected ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                            <span className={`font-bold font-serif ${isSelected ? 'text-amber-400' : 'text-gray-700'}`}>
                                {formatDateVN(date)}
                            </span>
                        </div>

                        {/* Body */}
                        <div className="p-4 grid grid-cols-4 gap-4 items-center">
                            {/* Numbers */}
                            <div className="col-span-3 flex gap-3">
                                <HistoryNumber label="Bạch thủ" value={item.tomorrow.bachThu} active={isSelected} />
                                <HistoryNumber label="Đặc biệt" value={item.tomorrow.dacBiet} active={isSelected} />
                            </div>
                            
                            {/* Action Icon */}
                            <div className="col-span-1 flex justify-end">
                                <span className={`text-xs px-2 py-1 rounded border ${isSelected ? 'border-white/10 text-stone-400' : 'border-gray-200 text-gray-400'}`}>
                                    Xem
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};

const HistoryNumber = ({ label, value, active }: { label: string, value: string, active: boolean }) => (
    <div className="flex flex-col">
        <span className={`text-[10px] uppercase font-bold mb-0.5 ${active ? 'text-stone-500' : 'text-gray-400'}`}>{label}</span>
        <span className={`text-lg font-serif font-bold ${active ? 'text-white' : 'text-gray-800'}`}>{value}</span>
    </div>
);
