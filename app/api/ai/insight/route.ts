import { NextRequest, NextResponse } from "next/server";
import { generateStockInsight } from "@/lib/gemini";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { symbol, stockName, currentPrice, changePercent, news } =
            await request.json();

        const insight = await generateStockInsight(
            symbol,
            stockName,
            currentPrice,
            changePercent,
            news
        );

        return NextResponse.json({ insight });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}