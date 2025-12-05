import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Dream, DiaryEntry } from "../types";

const SYSTEM_INSTRUCTION = `
你现在是《小狗钱钱》书中的主角小狗“钱钱”。
你是一只拉布拉多犬，能说人类的语言，是主人的财务导师和最好的朋友。

你的性格设定：
1. **温暖、鼓励、简单**：你总是用积极的语言，不说复杂的金融术语。
2. **口头禅**：你喜欢在句子结尾偶尔加一声“汪！”或者“汪呜~”。
3. **使命**：帮助主人实现梦想，建立自信（通过成功日记），并学会让钱生钱。
4. **不评判**：即使主人乱花钱，你也会温柔地引导，而不是严厉批评。
5. **记忆**：你知道主人当前的梦想和日记。

你的功能：
- 引导用户创建梦想。
- 每天提醒用户写“成功日记”。
- 当用户完成小目标时，给予大大的赞美。

请用简短的对话形式回复，不要长篇大论。
`;

let chatSession: Chat | null = null;

export const initializeChat = (dreams: Dream[], diaryEntries: DiaryEntry[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Create context string from current app state
    const dreamContext = dreams.length > 0 
      ? `主人目前的梦想是：${dreams.map(d => `${d.title} (目标:${d.targetAmount}, 当前:${d.currentAmount})`).join(', ')}。`
      : "主人目前还没有创建梦想清单。";
      
    const diaryContext = diaryEntries.length > 0
      ? `主人最近的成功日记：${diaryEntries.slice(0, 3).map(d => d.content).join('; ')}。`
      : "主人还没有开始写成功日记。";

    const initialHistory = [
      {
        role: "user",
        parts: [{ text: "钱钱，你好！我来了。" }],
      },
      {
        role: "model",
        parts: [{ text: "你好呀！我是钱钱。很高兴见到你！我们要一起为了梦想努力哦，汪！你想先聊聊你的梦想，还是记录今天的成功日记呢？" }],
      },
    ];

    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + `\n当前上下文信息：\n${dreamContext}\n${diaryContext}`,
        temperature: 0.7,
      },
      history: initialHistory,
    });

    return true;
  } catch (error) {
    console.error("Failed to initialize Gemini chat:", error);
    return false;
  }
};

export const sendMessageToMoney = async (message: string): Promise<string> => {
  if (!chatSession) {
    // Re-initialize if session is lost (shouldn't happen often in single session)
    initializeChat([], []); 
  }

  if (!chatSession) {
    return "汪呜... 我好像有点晕（连接失败）。";
  }

  try {
    const result: GenerateContentResponse = await chatSession.sendMessage({ message });
    return result.text || "汪？我没听清...";
  } catch (error) {
    console.error("Gemini send message error:", error);
    return "汪呜... 我现在有点累，稍后再聊吧。";
  }
};

export const generateDiaryComment = async (diaryContent: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `用户写了一条成功日记：“${diaryContent}”。作为小狗钱钱，请用一句温暖鼓励的话评价它，并以“汪！”结尾。`,
    });
    return response.text || "太棒了！汪！";
  } catch (error) {
    return "做得真棒！汪！";
  }
};
