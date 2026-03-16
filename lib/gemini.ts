import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateStockInsight(
    symbol: string,
    stockName: string,
    currentPrice: number,
    changePercent: number,
    news: { headline: string; summary: string }[]
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const newsText = news
        .slice(0, 3)
        .map((n) => `- ${n.headline}: ${n.summary}`)
        .join("\n");

    const prompt = `
    You are a financial analyst. Provide a brief, insightful analysis (2-3 paragraphs) 
    for ${stockName} (${symbol}).
    
    Current Data:
    - Price: $${currentPrice}
    - Today's Change: ${changePercent > 0 ? "+" : ""}${changePercent.toFixed(2)}%
    
    Recent News:
    ${newsText}
    
    Provide:
    1. A brief market sentiment analysis
    2. Key factors affecting the stock today
    3. Important considerations for investors
    
    Keep it concise, professional, and factual. Do not give direct buy/sell advice.
  `;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

export async function generateDailyDigest(
    stocks: { symbol: string; name: string; changePercent: number }[]
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const stockList = stocks
        .map(
            (s) =>
                `${s.name} (${s.symbol}): ${s.changePercent > 0 ? "+" : ""}${s.changePercent.toFixed(2)}%`
        )
        .join("\n");

    const prompt = `
    Create a brief daily market digest (3-4 sentences) for these stocks in a user's watchlist:
    ${stockList}
    
    Highlight the most notable movers and provide a general market sentiment.
    Keep it friendly and informative.
  `;

    const result = await model.generateContent(prompt);
    return result.response.text();
}