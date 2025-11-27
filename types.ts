
export interface LoGanItem {
  number: string;
  days: number;
}

export interface LotoHayVeItem {
  number: string;
  count: number; // Số lần xuất hiện (ví dụ trong 30 ngày)
}

export type HeadTailData = Record<number, string[]>;

export interface LotteryResult {
  date: string; // YYYY-MM-DD
  prizeSpecial: string;
  prize1: string;
  prize2: string[];
  prize3: string[];
  prize4: string[];
  prize5: string[];
  prize6: string[];
  prize7: string[];
  loGan: LoGanItem[];
  lotoHayVe: LotoHayVeItem[]; 
  lotoHead: HeadTailData;     
  isLive: boolean;
  lastUpdated: number;
}

export enum AnalyzeStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface PredictionStat {
  category: string; // e.g., "Bạch Thủ", "Song Thủ"
  numbers: string; // e.g., "88", "68-86"
  trend: string; // e.g., "Lô rơi", "Cầu kẹp", "Bạc nhớ"
  dataRef: string; // e.g., "Về 5 lần/30 ngày", "Gan 10 ngày", "Vừa về hôm qua"
}

export interface TomorrowPrediction {
  bachThu: string; // Bạch thủ lô
  songThu: string; // Song thủ lô
  dacBiet: string; // Dự đoán đề (chạm hoặc bộ)
  description: string; // Lời bình cho dự đoán
  detailedStats: PredictionStat[]; // Thống kê chi tiết ảnh hưởng đến dự đoán
}

export interface AIAnalysisResult {
  summary: string;
  hotNumbers: string[];
  luckyPrediction: string;
  tomorrow: TomorrowPrediction; 
}
