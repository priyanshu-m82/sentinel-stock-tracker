import axios from "axios";

const BASE_URL = process.env.FINNHUB_BASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY!;

const finnhub = axios.create({
    baseURL: BASE_URL,
    params: { token: API_KEY },
});

export async function getStockQuote(symbol: string) {
    const { data } = await finnhub.get("/quote", { params: { symbol } });
    return data;
}

export async function getStockProfile(symbol: string) {
    const { data } = await finnhub.get("/stock/profile2", {
        params: { symbol },
    });
    return data;
}

export async function getStockCandles(
    symbol: string,
    resolution: string = "D",
    from: number,
    to: number
) {
    const { data } = await finnhub.get("/stock/candle", {
        params: { symbol, resolution, from, to },
    });
    return data;
}

export async function getCompanyNews(
    symbol: string,
    from: string,
    to: string
) {
    const { data } = await finnhub.get("/company-news", {
        params: { symbol, from, to },
    });
    return data;
}

export async function searchStocks(query: string) {
    const { data } = await finnhub.get("/search", { params: { q: query } });
    return data;
}

export async function getBasicFinancials(symbol: string) {
    const { data } = await finnhub.get("/stock/metric", {
        params: { symbol, metric: "all" },
    });
    return data;
}

export async function getRecommendationTrends(symbol: string) {
    const { data } = await finnhub.get("/stock/recommendation", {
        params: { symbol },
    });
    return data;
}