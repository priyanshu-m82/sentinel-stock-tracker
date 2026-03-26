import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateStockInsight(
    symbol: string,
    stockName: string,
    currentPrice: number,
    changePercent: number,
    news: { headline: string; summary: string }[]
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const newsText = news
            .slice(0, 3)
            .map((n) => `- ${n.headline}`)
            .join("\n");

        const prompt = `
      Analyze ${stockName} (${symbol}) briefly:
      - Current Price: $${currentPrice}
      - Today's Change: ${changePercent > 0 ? "+" : ""}${changePercent?.toFixed(2)}%
      - Recent News: ${newsText || "No recent news"}
      
      Provide a 2-3 paragraph analysis covering:
      1. Current market sentiment
      2. Key factors affecting the stock
      3. Important considerations for investors
      
      Keep it concise and professional. Do not give direct buy/sell advice.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("Gemini error:", error);
        throw new Error(`AI insight failed: ${error.message}`);
    }
}

export async function generateDailyDigest(
    stocks: { symbol: string; name: string; changePercent: number }[]
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const stockList = stocks
            .map(
                (s) =>
                    `${s.name} (${s.symbol}): ${s.changePercent > 0 ? "+" : ""}${s.changePercent?.toFixed(2)}%`
            )
            .join("\n");

        const prompt = `
      Create a brief daily market digest (3-4 sentences) for these stocks in a user's watchlist:
      ${stockList}
      
      Highlight the most notable movers and provide a general market sentiment.
      Keep it friendly and informative.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("Gemini digest error:", error);
        throw new Error(`Daily digest failed: ${error.message}`);
    }
}