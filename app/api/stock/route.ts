import { NextRequest, NextResponse } from "next/server";
import {
    getStockQuote,
    getStockProfile,
    getStockCandles,
    getCompanyNews,
    searchStocks,
    getBasicFinancials,
    getRecommendationTrends,
} from "@/lib/finnhub";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const symbol = searchParams.get("symbol");

    try {
        switch (type) {
            case "quote":
                const quote = await getStockQuote(symbol!);
                return NextResponse.json(quote);

            case "profile":
                const profile = await getStockProfile(symbol!);
                return NextResponse.json(profile);

            case "candles":
                const resolution = searchParams.get("resolution") || "D";
                const from = parseInt(searchParams.get("from") || "0");
                const to = parseInt(searchParams.get("to") || "0");
                const candles = await getStockCandles(symbol!, resolution, from, to);
                return NextResponse.json(candles);

            case "news":
                const fromDate = searchParams.get("from") || "";
                const toDate = searchParams.get("to") || "";
                const news = await getCompanyNews(symbol!, fromDate, toDate);
                return NextResponse.json(news);

            case "search":
                const query = searchParams.get("q") || "";
                const results = await searchStocks(query);
                return NextResponse.json(results);

            case "financials":
                const financials = await getBasicFinancials(symbol!);
                return NextResponse.json(financials);

            case "recommendations":
                const recommendations = await getRecommendationTrends(symbol!);
                return NextResponse.json(recommendations);

            default:
                return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}