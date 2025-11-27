
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LotteryBoard } from './components/LotteryBoard';
import { AIAnalysis } from './components/AIAnalysis';
import { PredictionHistory } from './components/PredictionHistory';
import { 
  fetchLotteryResult, 
  isLiveDrawingTime, 
  getVietnamDateString, 
  getDefaultLotteryDateString,
  adjustDate,
  formatDateVN 
} from './services/lotteryService';
import { analyzeLotteryResult } from './services/geminiService';
import { LotteryResult, AnalyzeStatus, AIAnalysisResult } from './types';

const App: React.FC = () => {
  // Khởi tạo ngày dựa trên logic: Trước 18:13 hiện ngày hôm qua, sau 18:13 hiện hôm nay
  const [currentDate, setCurrentDate] = useState<string>(getDefaultLotteryDateString());
  const [data, setData] = useState<LotteryResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false); 
  
  // AI State
  const [aiStatus, setAiStatus] = useState<AnalyzeStatus>(AnalyzeStatus.IDLE);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [history, setHistory] = useState<Record<string, AIAnalysisResult>>({});
  
  // Cache state to persist status (including Errors) per date
  const [aiCache, setAiCache] = useState<Record<string, { status: AnalyzeStatus, result: AIAnalysisResult | null }>>({});

  // Ref để quản lý interval polling
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const maxDate = getVietnamDateString();

  // Load History and Cache from LocalStorage on Mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('xsmb_ai_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      const savedCache = localStorage.getItem('xsmb_ai_cache');
      if (savedCache) {
        setAiCache(JSON.parse(savedCache));
      }
    } catch (error) {
      console.error("Failed to load local storage data:", error);
    }
  }, []);

  // Save History Helper (Persist successful predictions)
  const saveToHistory = (date: string, result: AIAnalysisResult) => {
    try {
      setHistory(prev => {
        const newHistory = { ...prev, [date]: result };
        localStorage.setItem('xsmb_ai_history', JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  };

  // Save Cache Helper (Persist current UI state including Errors)
  const saveToCache = (date: string, status: AnalyzeStatus, result: AIAnalysisResult | null) => {
    // We do not cache 'LOADING' state to avoid stuck spinners on refresh.
    if (status === AnalyzeStatus.LOADING) return;

    try {
      setAiCache(prev => {
        const newCache = { ...prev, [date]: { status, result } };
        localStorage.setItem('xsmb_ai_cache', JSON.stringify(newCache));
        return newCache;
      });
    } catch (error) {
      console.error("Failed to save cache:", error);
    }
  };

  // Restore AI State when Date Changes or Cache Loads
  useEffect(() => {
    const cachedState = aiCache[currentDate];
    
    if (cachedState) {
      // Restore exact state from cache (Success or Error)
      setAiStatus(cachedState.status);
      setAiResult(cachedState.result);
    } else if (history[currentDate]) {
      // Fallback to history if cache is missing but history exists
      setAiResult(history[currentDate]);
      setAiStatus(AnalyzeStatus.SUCCESS);
    } else {
      // Default to IDLE if no data found
      setAiResult(null);
      setAiStatus(AnalyzeStatus.IDLE);
    }
  }, [currentDate, aiCache, history]);

  // Load Data
  const loadData = useCallback(async (date: string, isAutoRefresh = false) => {
    // Nếu là auto refresh (polling) thì không hiện loading spinner toàn màn hình
    if (!isAutoRefresh) setLoading(true);
    
    if (!isAutoRefresh) {
      setData(null);
    }

    try {
      const result = await fetchLotteryResult(date);
      setData(result);
      
      // Kiểm tra xem có đang trong giờ quay không để bật chế độ Live UI
      const today = getVietnamDateString();
      const isDrawingTime = isLiveDrawingTime();
      
      if (date === today && isDrawingTime) {
        setIsLiveMode(true);
      } else {
        setIsLiveMode(false);
      }

    } catch (err) {
      console.error(err);
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  }, []);

  // Effect chính để load dữ liệu khi ngày thay đổi
  useEffect(() => {
    loadData(currentDate);
  }, [currentDate, loadData]);

  // Effect để xử lý Auto-update trong giờ quay (Polling)
  useEffect(() => {
    const checkAndSchedule = () => {
      const today = getVietnamDateString();
      
      // Clear interval cũ nếu có
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      // Chỉ auto-update nếu đang xem ngày hôm nay VÀ đang trong giờ quay
      if (currentDate === today && isLiveDrawingTime()) {
        console.log("Start live polling...");
        // Poll mỗi 30 giây
        pollIntervalRef.current = setInterval(() => {
          console.log("Auto-updating results...");
          loadData(currentDate, true);
        }, 30000); 
      }
    };

    checkAndSchedule();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [currentDate, loadData]);

  // Handlers for Navigation
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDate(e.target.value);
  };

  const handlePrevDay = () => {
    setCurrentDate(prev => adjustDate(prev, -1));
  };

  const handleNextDay = () => {
    if (currentDate >= maxDate) return;
    setCurrentDate(prev => adjustDate(prev, 1));
  };

  const handleQuickSelect = (dateStr: string) => {
    setCurrentDate(dateStr);
  };

  // Generate recent 7 days for quick history
  const getRecentDates = () => {
    const dates = [];
    // Start from Today down to past 6 days
    const today = maxDate;
    for (let i = 0; i < 7; i++) {
       dates.push(adjustDate(today, -i));
    }
    return dates;
  };

  // Handler for AI Analysis
  const handleAnalyze = async () => {
    if (!data) return;
    setAiStatus(AnalyzeStatus.LOADING);
    
    const result = await analyzeLotteryResult(data);
    const newStatus = result.hotNumbers[0] === "--" ? AnalyzeStatus.ERROR : AnalyzeStatus.SUCCESS;
    
    setAiResult(result);
    setAiStatus(newStatus);
    
    // Save to Cache (preserves Error or Success state for this specific date)
    saveToCache(currentDate, newStatus, result);
    
    // Save to History (only if successful, for the History List)
    if (newStatus === AnalyzeStatus.SUCCESS) {
      saveToHistory(currentDate, result);
    }
  };

  const handleClearAI = () => {
    setAiStatus(AnalyzeStatus.IDLE);
    setAiResult(null);
    // Also clear from cache for this date so it doesn't reappear on refresh
    saveToCache(currentDate, AnalyzeStatus.IDLE, null);
  };

  const handleRefresh = () => {
     loadData(currentDate, false);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 pb-12 font-sans">
      {/* Header */}
      <header className="bg-red-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-500 rounded-full w-8 h-8 flex items-center justify-center text-red-700 font-bold border-2 border-white shadow-sm">
              $
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden md:block">XSMB Thần Tài</h1>
            <h1 className="text-lg font-bold tracking-tight md:hidden">XSMB AI</h1>
          </div>
          
          {isLiveMode && (
            <div className="text-xs md:text-sm font-medium bg-red-800 px-3 py-1 rounded-full flex items-center gap-2 animate-pulse border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,1)]"></span>
              Đang quay thưởng
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 pt-6 max-w-4xl">
        {/* Controls Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
          
          {/* Row 1: Date Navigation */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="flex items-center gap-2 w-full md:w-auto bg-gray-50 p-1.5 rounded-lg border border-gray-200">
              <button 
                onClick={handlePrevDay}
                className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600 active:scale-95"
                title="Ngày trước"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              <div className="flex flex-col items-center px-2 min-w-[140px]">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider mb-0.5">
                  {formatDateVN(currentDate).split(',')[0]}
                </span>
                <input 
                  type="date" 
                  id="date"
                  value={currentDate}
                  onChange={handleDateChange}
                  max={maxDate}
                  className="bg-transparent text-gray-800 font-bold text-center focus:outline-none cursor-pointer w-full text-sm font-mono"
                />
              </div>

              <button 
                onClick={handleNextDay}
                disabled={currentDate >= maxDate}
                className={`p-2 rounded-md transition-all ${currentDate >= maxDate ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-white hover:shadow-sm text-gray-600 active:scale-95'}`}
                title="Ngày sau"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 font-medium px-4 py-2.5 rounded-lg transition-colors w-full md:w-auto justify-center border border-red-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Cập nhật
            </button>
          </div>

          {/* Row 2: Quick History */}
          <div className="mt-4 pt-4 border-t border-gray-100">
             <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Lịch sử gần đây:</span>
             <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
               {getRecentDates().map(d => {
                 const isSelected = d === currentDate;
                 const label = formatDateVN(d).split(',')[1].trim().slice(0, 5); // get dd/mm
                 const dayName = formatDateVN(d).split(',')[0];
                 
                 return (
                   <button
                    key={d}
                    onClick={() => handleQuickSelect(d)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex flex-col items-center min-w-[60px]
                      ${isSelected 
                        ? 'bg-red-600 text-white border-red-600 shadow-md transform scale-105' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-500'
                      }`}
                   >
                     <span className="opacity-80 text-[10px] uppercase leading-tight">{dayName}</span>
                     <span className="text-sm font-bold">{label}</span>
                   </button>
                 );
               })}
             </div>
          </div>
        </div>

        {/* Board */}
        <LotteryBoard 
          data={data} 
          loading={loading} 
          isSimulatingLive={false}
        />

        {/* Gemini AI Section */}
        <AIAnalysis 
          status={aiStatus}
          result={aiResult}
          onAnalyze={handleAnalyze}
          onReset={handleClearAI}
          disabled={!data || loading}
        />

        {/* Saved History List */}
        <PredictionHistory 
           history={history} 
           onSelectDate={handleQuickSelect}
           currentDate={currentDate}
        />

        {/* Footer info */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Dữ liệu được tìm kiếm thực tế từ Google Search.</p>
          <p>Ứng dụng sẽ tự động cập nhật trong khung giờ 18:13 - 18:35 hàng ngày.</p>
        </div>
      </main>
    </div>
  );
};

export default App;
