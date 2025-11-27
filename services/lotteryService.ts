
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { LotteryResult, LoGanItem, LotoHayVeItem, HeadTailData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Robust Vietnam Time helper using Intl to avoid browser locale issues
export const getVietnamTimeParts = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '0';
  
  return {
    year: parseInt(getPart('year')),
    month: parseInt(getPart('month')),
    day: parseInt(getPart('day')),
    hour: parseInt(getPart('hour')),
    minute: parseInt(getPart('minute'))
  };
};

export const getVietnamDateString = (): string => {
  const { year, month, day } = getVietnamTimeParts();
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// Logic xác định ngày mặc định để hiển thị
export const getDefaultLotteryDateString = (): string => {
  const { year, month, day, hour, minute } = getVietnamTimeParts();
  
  const currentMinutes = hour * 60 + minute;
  const cutoffMinutes = 18 * 60 + 13; // 18:13

  if (currentMinutes < cutoffMinutes) {
    // Trả về ngày hôm qua
    const dateObj = new Date(year, month - 1, day);
    dateObj.setDate(dateObj.getDate() - 1);
    
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } else {
    // Trả về hôm nay
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
};

// Helper to add/subtract days from a YYYY-MM-DD string
export const adjustDate = (dateStr: string, days: number): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  
  const newY = date.getFullYear();
  const newM = String(date.getMonth() + 1).padStart(2, '0');
  const newD = String(date.getDate()).padStart(2, '0');
  return `${newY}-${newM}-${newD}`;
};

// Helper to format date for display (e.g. "Thứ Hai, 25/11/2024")
export const formatDateVN = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return `${days[date.getDay()]}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
};

const formatDateForSearch = (isoDateStr: string): string => {
  const [year, month, day] = isoDateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const isLiveDrawingTime = (): boolean => {
  const { hour, minute } = getVietnamTimeParts();
  // Khung giờ chính xác: 18:13 đến 18:35
  if (hour === 18 && minute >= 13 && minute <= 35) {
    return true;
  }
  return false;
};

// Hàm tính toán bảng Đầu Lô Tô từ danh sách các giải
const calculateLotoHead = (prizes: string[]): HeadTailData => {
  const heads: HeadTailData = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
  };

  prizes.forEach(prize => {
    if (!prize || prize === "..." || prize.length < 2) return;
    const loto = prize.slice(-2); // Lấy 2 số cuối
    const head = parseInt(loto[0]); // Lấy số hàng chục (Đầu)
    if (!isNaN(head) && heads[head]) {
      heads[head].push(loto);
    }
  });

  // Sắp xếp các số trong mỗi đầu
  Object.keys(heads).forEach(k => {
    const key = parseInt(k);
    heads[key].sort();
  });

  return heads;
};

export const fetchLotteryResult = async (dateStr: string): Promise<LotteryResult> => {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetchLotteryResultInternal(dateStr);
    } catch (e) {
      console.warn(`Attempt ${attempt + 1} failed:`, e);
      lastError = e;
      await new Promise(res => setTimeout(res, 1500));
    }
  }
  
  console.error("All attempts to fetch lottery data failed:", lastError);
  return createEmptyResult(dateStr);
};

const fetchLotteryResultInternal = async (dateStr: string): Promise<LotteryResult> => {
  const model = 'gemini-2.5-flash';
  const searchDate = formatDateForSearch(dateStr);
  
  const prompt = `
    Nhiệm vụ: Tra cứu kết quả xổ số miền bắc (XSMB) ngày ${searchDate}.
    
    Yêu cầu quan trọng:
    1. Sử dụng Google Search để tìm kiếm dữ liệu chính xác từ "rongbachkim.net" hoặc "xoso.com.vn".
    2. TRÍCH XUẤT chính xác các giải thưởng. TUYỆT ĐỐI KHÔNG TỰ BỊA SỐ. Nếu chưa có kết quả, trả về "...".
    3. Thống kê "Lô Gan": top 5 số lâu chưa về nhất.
    4. Thống kê "Lô Hay Về": top 5 số xuất hiện nhiều nhất trong 30 ngày qua (nếu tìm thấy).

    Output Schema (JSON ONLY):
    {
      "prizeSpecial": "string",
      "prize1": "string",
      "prize2": ["string", "string"],
      "prize3": ["string", "string", "string", "string", "string", "string"],
      "prize4": ["string", "string", "string", "string"],
      "prize5": ["string", "string", "string", "string", "string", "string"],
      "prize6": ["string", "string", "string"],
      "prize7": ["string", "string", "string", "string"],
      "loGan": [
         { "number": "string (2 chữ số)", "days": integer }
      ],
      "lotoHayVe": [
         { "number": "string (2 chữ số)", "count": integer }
      ]
    }
  `;

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ];

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      safetySettings: safetySettings,
    }
  });

  const text = response.text || "";
  
  let jsonString = text.trim();
  const startIndex = jsonString.indexOf('{');
  const endIndex = jsonString.lastIndexOf('}');
  
  if (startIndex !== -1 && endIndex !== -1) {
    jsonString = jsonString.substring(startIndex, endIndex + 1);
  } else {
    throw new Error("Invalid response format: No JSON found");
  }

  let parsedData;
  try {
      parsedData = JSON.parse(jsonString);
  } catch (e) {
      throw new Error("JSON Parse Error");
  }

  if (!parsedData.prizeSpecial && !parsedData.prize7) {
     return createEmptyResult(dateStr);
  }

  // Helper validators
  const cleanLoGan = (items: any[]): LoGanItem[] => {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
      number: String(item.number || "??").padStart(2, '0'),
      days: typeof item.days === 'number' ? item.days : 0
    })).filter(i => !isNaN(parseInt(i.number)));
  };

  const cleanLotoHayVe = (items: any[]): LotoHayVeItem[] => {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
      number: String(item.number || "??").padStart(2, '0'),
      count: typeof item.count === 'number' ? item.count : 0
    })).filter(i => !isNaN(parseInt(i.number)));
  };

  // Collect all prizes to calculate Head Table
  const allPrizes = [
    parsedData.prizeSpecial,
    parsedData.prize1,
    ...(ensureArray(parsedData.prize2, 2)),
    ...(ensureArray(parsedData.prize3, 6)),
    ...(ensureArray(parsedData.prize4, 4)),
    ...(ensureArray(parsedData.prize5, 6)),
    ...(ensureArray(parsedData.prize6, 3)),
    ...(ensureArray(parsedData.prize7, 4)),
  ];

  const result: LotteryResult = {
    date: dateStr,
    prizeSpecial: parsedData.prizeSpecial || "...",
    prize1: parsedData.prize1 || "...",
    prize2: ensureArray(parsedData.prize2, 2),
    prize3: ensureArray(parsedData.prize3, 6),
    prize4: ensureArray(parsedData.prize4, 4),
    prize5: ensureArray(parsedData.prize5, 6),
    prize6: ensureArray(parsedData.prize6, 3),
    prize7: ensureArray(parsedData.prize7, 4),
    loGan: cleanLoGan(parsedData.loGan),
    lotoHayVe: cleanLotoHayVe(parsedData.lotoHayVe),
    lotoHead: calculateLotoHead(allPrizes),
    isLive: isLiveDrawingTime() && dateStr === getVietnamDateString(),
    lastUpdated: Date.now()
  };

  return result;
};

const ensureArray = (arr: any, length: number): string[] => {
  if (!Array.isArray(arr)) return Array(length).fill("...");
  const newArr = arr.map(item => item ? String(item).trim() : "...");
  while (newArr.length < length) {
    newArr.push("...");
  }
  return newArr.slice(0, length);
};

const createEmptyResult = (dateStr: string): LotteryResult => ({
  date: dateStr,
  prizeSpecial: "...",
  prize1: "...",
  prize2: Array(2).fill("..."),
  prize3: Array(6).fill("..."),
  prize4: Array(4).fill("..."),
  prize5: Array(6).fill("..."),
  prize6: Array(3).fill("..."),
  prize7: Array(4).fill("..."),
  loGan: [],
  lotoHayVe: [],
  lotoHead: {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[]},
  isLive: false,
  lastUpdated: Date.now()
});
