import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
    try {
        // Check API key first before doing anything else
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is missing from .env.local" },
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

        // Initialize Gemini directly here — no external lib/gemini import needed
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const newsText =
            Array.isArray(news) && news.length > 0
                ? news
                    .slice(0, 3)
                    .map((n: any) => `- ${n.headline}`)
                    .join("\n")
                : "No recent news available";

        const prompt = `
You are a professional financial analyst. Provide a concise analysis of ${stockName} (${symbol}).

Current Data:
- Price: $${currentPrice}
- Today's Change: ${changePercent >= 0 ? "+" : ""}${Number(changePercent).toFixed(2)}%

Recent News Headlines:
${newsText}

Write 2-3 paragraphs covering:
1. Current market sentiment for this stock
2. Key factors driving today's price movement
3. Important considerations for investors

Keep it professional, factual and concise. Do NOT give direct buy or sell advice.
    `.trim();

        const result = await model.generateContent(prompt);
        const insight = result.response.text();

        return NextResponse.json({ insight });
    } catch (error: any) {
        console.error("AI insight error:", error.message);
        return NextResponse.json(
            { error: error.message || "Failed to generate insight" },
            { status: 500 }
        );
    }
}