"use client";

import { useState, useEffect } from "react";
import StockCard from "@/components/stock/StockCard";
import { StockCardSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { BookMarked, Trash2 } from "lucide-react";

interface WatchlistItem {
    _id: string;
    stockSymbol: string;
    stockName: string;
}

interface StockData {
    symbol: string;
    name: string;
    currentPrice: number;
    change: number;
    changePercent: number;
    logo?: string;
}

export default function WatchlistPage() {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [stocks, setStocks] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const fetchWatchlist = async () => {
        try {
            const res = await fetch("/api/watchlist");
            const data = await res.json();
            setWatchlist(data);

            if (data.length > 0) {
                const stockData = await Promise.all(
                    data.map(async (item: WatchlistItem) => {
                        const [quoteRes, profileRes] = await Promise.all([
                            fetch(`/api/stock?type=quote&symbol=${item.stockSymbol}`),
                            fetch(`/api/stock?type=profile&symbol=${item.stockSymbol}`),
                        ]);
                        const quote = await quoteRes.json();
                        const profile = await profileRes.json();
                        return {
                            symbol: item.stockSymbol,
                            name: item.stockName,
                            currentPrice: quote.c || 0,
                            change: quote.d || 0,
                            changePercent: quote.dp || 0,
                            logo: profile.logo,
                        };
                    })
                );
                setStocks(stockData);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWatchlist = async (symbol: string) => {
        await fetch(`/api/watchlist?symbol=${symbol}`, { method: "DELETE" });
        setWatchlist((prev) => prev.filter((w) => w.stockSymbol !== symbol));
        setStocks((prev) => prev.filter((s) => s.symbol !== symbol));
    };

    if (loading) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-white mb-8">My Watchlist</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <StockCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (watchlist.length === 0) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-white mb-8">My Watchlist</h1>
                <div className="text-center py-20">
                    <BookMarked className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-white font-semibold text-lg mb-2">
                        Your watchlist is empty
                    </h3>
                    <p className="text-gray-400">
                        Browse stocks and add them to your watchlist
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
                    <p className="text-gray-400 mt-1">{watchlist.length} stocks tracked</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stocks.map((stock) => (
                    <div key={stock.symbol} className="relative group">
                        <StockCard {...stock} />
                        <button
                            onClick={() => removeFromWatchlist(stock.symbol)}
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 hover:bg-red-500/40 text-red-400 p-1.5 rounded-lg"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}