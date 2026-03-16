"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import StockCard from "@/components/stock/StockCard";
import { StockCardSkeleton } from "@/components/shared/LoadingSkeleton";

const DEFAULT_STOCKS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META",
    "TSLA", "NVDA", "JPM", "JNJ", "V",
    "WMT", "PG"
];

interface StockData {
    symbol: string;
    name: string;
    currentPrice: number;
    change: number;
    changePercent: number;
    logo?: string;
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stocks, setStocks] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        setLoading(true);
        try {
            const stockData = await Promise.all(
                DEFAULT_STOCKS.map(async (symbol) => {
                    const [quoteRes, profileRes] = await Promise.all([
                        fetch(`/api/stock?type=quote&symbol=${symbol}`),
                        fetch(`/api/stock?type=profile&symbol=${symbol}`),
                    ]);
                    const quote = await quoteRes.json();
                    const profile = await profileRes.json();
                    return {
                        symbol,
                        name: profile.name || symbol,
                        currentPrice: quote.c || 0,
                        change: quote.d || 0,
                        changePercent: quote.dp || 0,
                        logo: profile.logo,
                    };
                })
            );
            setStocks(stockData.filter((s) => s.currentPrice > 0));
        } catch (error) {
            console.error("Error fetching stocks:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">
                    Welcome back, {session?.user?.name?.split(" ")[0]} 👋
                </h1>
                <p className="text-gray-400 mt-1">
                    Here's what's moving in the market today
                </p>
            </div>

            {/* Market Overview */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                    Market Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {loading
                        ? Array.from({ length: 12 }).map((_, i) => (
                            <StockCardSkeleton key={i} />
                        ))
                        : stocks.map((stock) => <StockCard key={stock.symbol} {...stock} />)}
                </div>
            </div>
        </div>
    );
}