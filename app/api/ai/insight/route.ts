import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Gemini API key not configured in .env.local" },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { symbol, stockName, currentPrice, changePercent, news } = body;

        if (!symbol || !stockName) {
            return NextResponse.json(
                { error: "symbol and stockName are required" },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const newsText =
            Array.isArray(news) && news.length > 0
                ? news.slice(0, 3).map((n: any) => `- ${n.headline}`).join("\n")
                : "No recent news available";

        const prompt = `
You are a professional financial analyst. Provide a concise analysis of ${stockName} (${symbol}).

Current Data:
- Price: $${currentPrice}
- Today's Change: ${changePercent >= 0 ? "+" : ""}${Number(changePercent).toFixed(2)}%

Recent News:
${newsText}

Write 2-3 paragraphs covering:
1. Current market sentiment
2. Key factors driving today's price movement  
3. Important considerations for investors

Keep it professional and factual. Do NOT give direct buy or sell advice.
    `.trim();

        const result = await model.generateContent(prompt);
        const insight = result.response.text();

        return NextResponse.json({ insight });

    } catch (error: any) {
        console.error("AI insight error:", error.message);

        // Clean error messages — no raw JSON shown to user
        if (error.message?.includes("429") || error.message?.includes("quota")) {
            return NextResponse.json(
                { error: "AI quota limit reached. Please get a new API key from aistudio.google.com and update GEMINI_API_KEY in .env.local" },
                { status: 429 }
            );
        }

        if (error.message?.includes("404") || error.message?.includes("not found")) {
            return NextResponse.json(
                { error: "AI model not available. Please check your Gemini API key." },
                { status: 404 }
            );
        }

        if (error.message?.includes("API_KEY") || error.message?.includes("invalid")) {
            return NextResponse.json(
                { error: "Invalid Gemini API key. Please update GEMINI_API_KEY in .env.local" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to generate insight. Please try again." },
            { status: 500 }
        );
    }
}