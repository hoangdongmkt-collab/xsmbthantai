
import { GoogleGenAI, Type } from "@google/genai";
import { LotteryResult, AIAnalysisResult } from "../types";

const parseLotteryDataToString = (data: LotteryResult): string => {
  const loGanText = data.loGan && data.loGan.length > 0
    ? data.loGan.map(i => `${i.number}(${i.days} ngày)`).join(', ')
    : "Không có dữ liệu";

  const hayVeText = data.lotoHayVe && data.lotoHayVe.length > 0
    ? data.lotoHayVe.map(i => `${i.number}(${i.count} lần)`).join(', ')
    : "Không có dữ liệu";

  const headSummary = Object.entries(data.lotoHead || {})
    .map(([head, nums]) => `Đầu ${head}: ${nums.length > 0 ? nums.join(',') : 'CÂM'}`)
    .join('\n');

  return `
    Kết quả Xổ Số Miền Bắc ngày ${data.date}:
    Đặc biệt: ${data.prizeSpecial}
    Giải Nhất: ${data.prize1}
    Giải Nhì: ${data.prize2.join(', ')}
    Giải Ba: ${data.prize3.join(', ')}
    Giải Tư: ${data.prize4.join(', ')}
    Giải Năm: ${data.prize5.join(', ')}
    Giải Sáu: ${data.prize6.join(', ')}
    Giải Bảy: ${data.prize7.join(', ')}
    
    THỐNG KÊ CHI TIẾT:
    1. Bảng Lô Tô (Đầu):
    ${headSummary}

    2. Lô Gan (Lâu chưa về): ${loGanText}
    
    3. Lô Hay Về (30 ngày qua): ${hayVeText}
  `;
};

export const analyzeLotteryResult = async (data: LotteryResult): Promise<AIAnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Bạn là một chuyên gia "Thần Tài" soi cầu xổ số miền bắc (XSMB) với phong cách hài hước nhưng phân tích cực kỳ logic dựa trên bạc nhớ, thống kê và xác suất.
      
      Dữ liệu đầu vào:
      ${parseLotteryDataToString(data)}

      Nhiệm vụ:
      1. TỔNG QUAN: Nhận xét ngắn gọn về kết quả hôm nay (Đầu nào câm? Đuôi nào câm? Có lô kép không?).
      2. CẦU LÔ: Chọn 3 số lô tô có cầu đẹp hôm nay.
      3. CHỐT SỐ NGÀY MAI (Quan trọng nhất):
         - Bạch Thủ Lô: 1 con số tâm đắc nhất.
         - Song Thủ Lô: Cặp số (ví dụ: 68-86).
         - Đặc Biệt (Đề): Dự đoán Chạm (ví dụ: Chạm 5) hoặc Bộ.
         - Lời bình: BẮT BUỘC phải giải thích ngắn gọn tại sao chọn các số này.
         - Thống kê chi tiết (detailedStats): Với mỗi số dự đoán, hãy chỉ rõ xu hướng (Trend) và dữ liệu tham chiếu (DataRef).
           Ví dụ: Nếu chọn số 88 và nó vừa về hôm nay -> Trend: "Lô rơi", DataRef: "Vừa về giải Nhất".
           Ví dụ: Nếu chọn số 15 và nó hay về -> Trend: "Cầu đẹp", DataRef: "Về 5 lần/30 ngày".
           Ví dụ: Nếu chọn theo bạc nhớ -> Trend: "Bạc nhớ", DataRef: "Đầu 4 câm thường trả 45".

      Trả về định dạng JSON khớp với schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            hotNumbers: { type: Type.ARRAY, items: { type: Type.STRING } },
            luckyPrediction: { type: Type.STRING, description: "Một con số may mắn ngẫu nhiên" },
            tomorrow: {
              type: Type.OBJECT,
              properties: {
                bachThu: { type: Type.STRING, description: "Bạch thủ lô cho ngày mai" },
                songThu: { type: Type.STRING, description: "Song thủ lô cho ngày mai" },
                dacBiet: { type: Type.STRING, description: "Dự đoán giải đặc biệt/đề" },
                description: { type: Type.STRING, description: "Lời bình giải thích lý do chọn số" },
                detailedStats: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING, description: "Loại dự đoán (Bạch Thủ, Song Thủ...)" },
                      numbers: { type: Type.STRING, description: "Con số dự đoán" },
                      trend: { type: Type.STRING, description: "Xu hướng (Lô rơi, Bạc nhớ, Lô gan...)" },
                      dataRef: { type: Type.STRING, description: "Dữ liệu chứng minh (Về x lần, Gan y ngày...)" }
                    },
                    required: ["category", "numbers", "trend", "dataRef"]
                  }
                }
              },
              required: ["bachThu", "songThu", "dacBiet", "description", "detailedStats"]
            }
          },
          required: ["summary", "hotNumbers", "luckyPrediction", "tomorrow"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    
    throw new Error("No response from AI");

  } catch (error) {
    console.error("AI Analysis failed", error);
    return {
      summary: "Thần tài đang bận đi vắng, chưa thể phân tích lúc này!",
      hotNumbers: ["--", "--", "--"],
      luckyPrediction: "--",
      tomorrow: {
        bachThu: "--",
        songThu: "--",
        dacBiet: "--",
        description: "Hệ thống đang bận, vui lòng thử lại sau.",
        detailedStats: []
      }
    };
  }
};
