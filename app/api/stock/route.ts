import { NextRequest, NextResponse } from "next/server";
import {
    getStockQuote,
    getStockProfile,
    getStockCandles,
    getCompanyNews,
    searchStocks,
    getBasicFinancials,
} from "@/lib/finnhub";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const symbol = searchParams.get("symbol");

    if (!type) {
        return NextResponse.json({ error: "type is required" }, { status: 400 });
    }

    try {
        switch (type) {
            case "quote": {
                if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });
                const data = await getStockQuote(symbol);
                return NextResponse.json(data);
            }

            case "profile": {
                if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });
                const data = await getStockProfile(symbol);
                return NextResponse.json(data);
            }

            case "candles": {
                if (!symbol) {
                    return NextResponse.json({ error: "symbol required" }, { status: 400 });
                }
                const resolution = searchParams.get("resolution") || "D";
                const to = Math.floor(Date.now() / 1000);
                // Use longer range to ensure data exists
                const daysMap: Record<string, number> = {
                    "60": 10,
                    "D": 180,
                    "W": 730,
                };
                const days = daysMap[resolution] ?? 180;
                const from = to - days * 24 * 60 * 60;

                try {
                    const data = await getStockCandles(symbol, resolution, from, to);
                    return NextResponse.json(data);
                } catch (error: any) {
                    console.error("Candle route error:", error.message);
                    return NextResponse.json({ s: "no_data" }, { status: 200 });
                }
            }

            case "news": {
                if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });
                const fromDate = searchParams.get("from") || "";
                const toDate = searchParams.get("to") || "";
                const data = await getCompanyNews(symbol, fromDate, toDate);
                return NextResponse.json(data);
            }

            case "search": {
                const query = searchParams.get("q") || "";
                const data = await searchStocks(query);
                return NextResponse.json(data);
            }

            case "financials": {
                if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });
                const data = await getBasicFinancials(symbol);
                return NextResponse.json(data);
            }

            default:
                return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }
    } catch (error: any) {
        console.error("Stock API error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}