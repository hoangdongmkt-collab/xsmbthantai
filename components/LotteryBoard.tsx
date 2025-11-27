
import React, { useEffect, useState } from 'react';
import { LotteryResult } from '../types';

interface LotteryBoardProps {
  data: LotteryResult | null;
  loading: boolean;
  isSimulatingLive: boolean; 
}

const PrizeRow = ({ 
  title, 
  info,
  numbers, 
  className = "", 
  highlight = false,
  icon
}: { 
  title: string, 
  info: string,
  numbers: string[], 
  className?: string, 
  highlight?: boolean,
  icon?: React.ReactNode 
}) => (
  <div className={`flex border-b border-gray-200 ${className}`}>
    <div 
      className="w-24 md:w-32 p-3 text-gray-700 bg-gray-50 flex flex-col items-center justify-center border-r border-gray-200 text-sm md:text-base relative group"
      title={info} 
    >
      {icon && (
        <div className={`mb-1 ${highlight ? 'text-yellow-500' : 'text-gray-400 group-hover:text-red-500'} transition-colors duration-300`}>
          {icon}
        </div>
      )}
      <span className={`font-bold text-center cursor-help decoration-dotted underline underline-offset-4 decoration-gray-400`}>
        {title}
      </span>
      
      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-max max-w-[120px] bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-lg hidden md:block">
        {info}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
      </div>
    </div>
    
    <div className="flex-1 p-3 flex flex-wrap justify-center items-center gap-2 md:gap-8 bg-white">
      {numbers.map((num, idx) => (
        <span 
          key={idx} 
          className={`font-mono text-lg md:text-2xl tracking-widest ${highlight ? 'text-red-600 font-black text-2xl md:text-4xl' : 'text-gray-800 font-bold'}`}
        >
          {num}
        </span>
      ))}
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm">
    <div className="text-gray-400 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    </div>
    <p className="text-gray-500 text-lg">Đang chờ kết quả mở thưởng...</p>
    <p className="text-sm text-gray-400">Kết quả thường có từ 18:15 hàng ngày</p>
  </div>
);

export const LotteryBoard: React.FC<LotteryBoardProps> = ({ data, loading, isSimulatingLive }) => {
  const [displayedData, setDisplayedData] = useState<LotteryResult | null>(null);

  useEffect(() => {
    if (!data) return;

    if (!isSimulatingLive) {
      setDisplayedData(data);
      return;
    }

    const emptyResult: LotteryResult = {
      ...data,
      prizeSpecial: '...',
      prize1: '...',
      prize2: ['...', '...'],
      prize3: Array(6).fill('...'),
      prize4: Array(4).fill('...'),
      prize5: Array(6).fill('...'),
      prize6: Array(3).fill('...'),
      prize7: Array(4).fill('...'),
    };
    setDisplayedData(emptyResult);

    const revealSequence: Array<() => void> = [
        () => setDisplayedData(prev => prev ? ({ ...prev, prize7: data.prize7 }) : null),
        () => setDisplayedData(prev => prev ? ({ ...prev, prize6: data.prize6 }) : null),
        () => setDisplayedData(prev => prev ? ({ ...prev, prize5: data.prize5 }) : null),
        () => setDisplayedData(prev => prev ? ({ ...prev, prize4: data.prize4 }) : null),
        () => setDisplayedData(prev => prev ? ({ ...prev, prize3: data.prize3 }) : null),
        () => setDisplayedData(prev => prev ? ({ ...prev, prize2: data.prize2 }) : null),
        () => setDisplayedData(prev => prev ? ({ ...prev, prize1: data.prize1 }) : null),
        () => setDisplayedData(prev => prev ? ({ ...prev, prizeSpecial: data.prizeSpecial }) : null),
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < revealSequence.length) {
        revealSequence[step]();
        step++;
      } else {
        clearInterval(interval);
      }
    }, 800); 

    return () => clearInterval(interval);
  }, [data, isSimulatingLive]);


  if (loading) {
      return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
      );
  }

  if (!displayedData) return <EmptyState />;

  // Icons
  const Icons = {
    Special: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
      </svg>
    ),
    Prize1: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h14.25c.414 0 .75-.336.75-.75a2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clipRule="evenodd" />
      </svg>
    ),
    Prize2: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
      </svg>
    ),
    Prize3: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M16.125 11.43l-.102.017a6.375 6.375 0 01-3.84.953 6.375 6.375 0 01-3.84-.953l-.102-.017a2.25 2.25 0 00-2.228 1.598l-.013.042C5.725 13.84 5.5 14.83 5.5 16.5c0 1.079.268 2.079.744 2.956.41.756 1.348 1.038 2.058.619a9.663 9.663 0 002.394-1.957 5.397 5.397 0 001.304-4.391 6.456 6.456 0 00-3.84-2.114 6.75 6.75 0 00-2.037-.183zM4.156 16.837a2.25 2.25 0 01-1.312-3.413c.875-1.256 1.636-2.583 2.128-4.086 1.069-3.266 3.65-5.741 7.028-5.741 3.378 0 5.96 2.475 7.028 5.741.492 1.503 1.253 2.83 2.128 4.086a2.25 2.25 0 01-1.312 3.413c-.982.26-1.742.825-2.262 1.488a10.428 10.428 0 01-2.73 2.37c-1.637.95-3.52 1.038-5.188.13-1.026-.559-1.954-1.378-2.73-2.37-.52-.663-1.28-1.228-2.262-1.488z" />
      </svg>
    ),
    Prize4: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M9.375 3a1.875 1.875 0 000 3.75h1.875v4.5H3.375A1.875 1.875 0 011.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0112 2.753a3.375 3.375 0 015.432 3.997h3.943c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 10-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3zM11.25 12.75H3v6.75a2.25 2.25 0 002.25 2.25h6v-9zM12.75 12.75v9h6a2.25 2.25 0 002.25-2.25v-6.75h-8.25z" />
      </svg>
    ),
    Prize5: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M5.25 2.25a3 3 0 00-3 3v4.318a3 3 0 00.879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 005.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 00-2.122-.879H5.25zM6.375 7.5a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" clipRule="evenodd" />
      </svg>
    ),
    Prize6: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 01-.921.42z" />
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 01-.921-.421l-.879-.66a.75.75 0 00-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 001.5 0v-.81a4.124 4.124 0 001.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 00-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 00.933-1.175l-.415-.33a3.836 3.836 0 00-1.719-.755V6z" clipRule="evenodd" />
      </svg>
    ),
    Prize7: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94c-2.693 0-4.875-1.726-4.875-4.06 0-2.334 2.182-4.06 4.875-4.06V6a.75.75 0 00-.75-.75H3.75a.75.75 0 00-.75.75v1.94c2.693 0 4.875 1.726 4.875 4.06 0 2.334-2.182 4.06-4.875 4.06z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-red-600 text-white p-4 text-center">
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide">
            Kết Quả Xổ Số Miền Bắc
          </h2>
          <p className="text-red-100 text-sm mt-1">{displayedData.date}</p>
        </div>

        <div className="flex flex-col">
          <PrizeRow 
            title="Đặc Biệt" 
            info="1 giải 5 chữ số"
            numbers={[displayedData.prizeSpecial]} 
            highlight 
            icon={Icons.Special}
            className="bg-yellow-50" 
          />
          <PrizeRow 
            title="Giải Nhất" 
            info="1 giải 5 chữ số"
            icon={Icons.Prize1}
            numbers={[displayedData.prize1]} 
          />
          <PrizeRow 
            title="Giải Nhì" 
            info="2 giải 5 chữ số"
            icon={Icons.Prize2}
            numbers={displayedData.prize2} 
          />
          <PrizeRow 
            title="Giải Ba" 
            info="6 giải 5 chữ số"
            icon={Icons.Prize3}
            numbers={displayedData.prize3} 
          />
          <PrizeRow 
            title="Giải Tư" 
            info="4 giải 4 chữ số"
            icon={Icons.Prize4}
            numbers={displayedData.prize4} 
          />
          <PrizeRow 
            title="Giải Năm" 
            info="6 giải 4 chữ số"
            icon={Icons.Prize5}
            numbers={displayedData.prize5} 
          />
          <PrizeRow 
            title="Giải Sáu" 
            info="3 giải 3 chữ số"
            icon={Icons.Prize6}
            numbers={displayedData.prize6} 
          />
          <PrizeRow 
            title="Giải Bảy" 
            info="4 giải 2 chữ số"
            icon={Icons.Prize7}
            numbers={displayedData.prize7} 
            className="border-b-0" 
          />
        </div>
      </div>

      {/* Grid for Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Loto Head Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 p-3 border-b border-gray-200">
             <h3 className="font-bold text-gray-700 text-center uppercase text-sm">Bảng Lô Tô (Đầu)</h3>
          </div>
          <div className="p-0">
             <table className="w-full text-sm">
               <thead>
                 <tr className="bg-gray-50 border-b border-gray-200 text-gray-500">
                    <th className="py-2 px-3 w-16 border-r text-center">Đầu</th>
                    <th className="py-2 px-3 text-left">Lô tô</th>
                 </tr>
               </thead>
               <tbody>
                  {[0,1,2,3,4,5,6,7,8,9].map(head => (
                    <tr key={head} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-2 px-3 text-center font-bold text-red-600 border-r border-gray-100 bg-gray-50/50">{head}</td>
                      <td className="py-2 px-3 font-mono text-gray-800 tracking-wider">
                        {displayedData.lotoHead && displayedData.lotoHead[head] && displayedData.lotoHead[head].length > 0 
                          ? displayedData.lotoHead[head].join(', ') 
                          : <span className="text-gray-300 italic">câm</span>}
                      </td>
                    </tr>
                  ))}
               </tbody>
             </table>
          </div>
        </div>

        {/* Lo Gan & Hot Numbers */}
        <div className="space-y-6">
           {/* Lo Gan */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
             <div className="bg-gray-100 p-3 border-b border-gray-200">
                <h3 className="font-bold text-gray-700 text-center uppercase text-sm">Thống Kê Lô Gan (Lâu chưa về)</h3>
             </div>
             <div className="p-4">
              {displayedData.loGan && displayedData.loGan.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {displayedData.loGan.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="bg-red-50 rounded border border-red-100 p-2 flex flex-col items-center">
                      <span className="text-red-600 font-black text-lg">{item.number}</span>
                      <span className="text-xs text-gray-500">{item.days} ngày</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm italic">Không có dữ liệu lô gan</p>
              )}
             </div>
          </div>

           {/* Hot Numbers */}
           <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
             <div className="bg-gray-100 p-3 border-b border-gray-200">
                <h3 className="font-bold text-gray-700 text-center uppercase text-sm">Lô Hay Về (30 ngày qua)</h3>
             </div>
             <div className="p-4">
              {displayedData.lotoHayVe && displayedData.lotoHayVe.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {displayedData.lotoHayVe.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="bg-green-50 rounded border border-green-100 p-2 flex flex-col items-center">
                      <span className="text-green-700 font-black text-lg">{item.number}</span>
                      <span className="text-xs text-gray-500">{item.count} lần</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm italic">Không có dữ liệu lô hay về</p>
              )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
