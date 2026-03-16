"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import StockChart from "@/components/stock/StockChart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    formatCurrency,
    formatPercent,
    formatMarketCap,
    getPriceChangeColor,
    getDateRange,
} from "@/lib/utils";
import {
    BookMarked,
    BookmarkMinus,
    TrendingUp,
    TrendingDown,
    ExternalLink,
    Sparkles,
} from "lucide-react";
import { format, fromUnixTime } from "date-fns";

export default function StockDetailPage() {
    const { symbol } = useParams<{ symbol: string }>();
    const [quote, setQuote] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [news, setNews] = useState<any[]>([]);
    const [financials, setFinancials] = useState<any>(null);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [aiInsight, setAiInsight] = useState("");
    const [loadingInsight, setLoadingInsight] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (symbol) fetchData();
    }, [symbol]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { fromStr, toStr } = getDateRange(7);
            const [quoteRes, profileRes, newsRes, financialsRes, watchlistRes] =
                await Promise.all([
                    fetch(`/api/stock?type=quote&symbol=${symbol}`),
                    fetch(`/api/stock?type=profile&symbol=${symbol}`),
                    fetch(
                        `/api/stock?type=news&symbol=${symbol}&from=${fromStr}&to=${toStr}`
                    ),
                    fetch(`/api/stock?type=financials&symbol=${symbol}`),
                    fetch("/api/watchlist"),
                ]);

            const [quoteData, profileData, newsData, financialsData, watchlistData] =
                await Promise.all([
                    quoteRes.json(),
                    profileRes.json(),
                    newsRes.json(),
                    financialsRes.json(),
                    watchlistRes.json(),
                ]);

            setQuote(quoteData);
            setProfile(profileData);
            setNews(Array.isArray(newsData) ? newsData.slice(0, 5) : []);
            setFinancials(financialsData?.metric);
            setIsInWatchlist(
                watchlistData.some((w: any) => w.stockSymbol === symbol)
            );
        } catch (error) {
            console.error("Error fetching stock data:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWatchlist = async () => {
        if (isInWatchlist) {
            await fetch(`/api/watchlist?symbol=${symbol}`, { method: "DELETE" });
        } else {
            await fetch("/api/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stockSymbol: symbol,
                    stockName: profile?.name || symbol,
                }),
            });
        }
        setIsInWatchlist(!isInWatchlist);
    };

    const getAiInsight = async () => {
        setLoadingInsight(true);
        try {
            const res = await fetch("/api/ai/insight", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symbol,
                    stockName: profile?.name,
                    currentPrice: quote?.c,
                    changePercent: quote?.dp,
                    news: news.map((n) => ({
                        headline: n.headline,
                        summary: n.summary,
                    })),
                }),
            });
            const data = await res.json();
            setAiInsight(data.insight);
        } catch (error) {
            console.error("Error getting insight:", error);
        } finally {
            setLoadingInsight(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    {profile?.logo ? (
                        <img
                            src={profile.logo}
                            alt={profile.name}
                            className="w-16 h-16 rounded-xl object-contain bg-white p-2"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center">
              <span className="text-green-500 text-2xl font-bold">
                {symbol?.charAt(0)}
              </span>
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold text-white">{symbol}</h1>
                            {profile?.exchange && (
                                <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                  {profile.exchange}
                </span>
                            )}
                        </div>
                        <p className="text-gray-400">{profile?.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={toggleWatchlist}
                        variant="outline"
                        className={`border-white/20 ${
                            isInWatchlist
                                ? "bg-green-500/20 text-green-500 border-green-500/30"
                                : "text-white hover:bg-white/10"
                        }`}
                    >
                        {isInWatchlist ? (
                            <>
                                <BookmarkMinus className="w-4 h-4 mr-2" />
                                Watchlisted
                            </>
                        ) : (
                            <>
                                <BookMarked className="w-4 h-4 mr-2" />
                                Add to Watchlist
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Price */}
            {quote && (
                <div className="mb-8">
                    <p className="text-5xl font-bold text-white">
                        {formatCurrency(quote.c)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
            <span
                className={`text-lg font-medium ${getPriceChangeColor(quote.dp)}`}
            >
              {quote.dp >= 0 ? (
                  <TrendingUp className="w-5 h-5 inline mr-1" />
              ) : (
                  <TrendingDown className="w-5 h-5 inline mr-1" />
              )}
                {formatCurrency(quote.d)} ({formatPercent(quote.dp)}) today
            </span>
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="mb-8">
                <StockChart symbol={symbol} />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview">
                <TabsList className="bg-zinc-900 border border-white/10">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="news" className="data-[state=active]:bg-white/10">
                        News
                    </TabsTrigger>
                    <TabsTrigger value="financials" className="data-[state=active]:bg-white/10">
                        Financials
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="data-[state=active]:bg-white/10">
                        AI Insights
                    </TabsTrigger>
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Open", value: formatCurrency(quote?.o) },
                            { label: "High", value: formatCurrency(quote?.h) },
                            { label: "Low", value: formatCurrency(quote?.l) },
                            { label: "Prev Close", value: formatCurrency(quote?.pc) },
                            {
                                label: "Market Cap",
                                value: profile?.marketCapitalization
                                    ? formatMarketCap(profile.marketCapitalization * 1e6)
                                    : "N/A",
                            },
                            { label: "Industry", value: profile?.finnhubIndustry || "N/A" },
                            { label: "Country", value: profile?.country || "N/A" },
                            {
                                label: "Website",
                                value: profile?.weburl ? (
                                    <a
                                        href={profile.weburl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-500 hover:text-green-400 flex items-center gap-1"
                                    >
                                        Visit <ExternalLink className="w-3 h-3" />
                                    </a>
                                ) : (
                                    "N/A"
                                ),
                            },
                        ].map(({ label, value }) => (
                            <div
                                key={label}
                                className="bg-zinc-900 border border-white/10 rounded-xl p-4"
                            >
                                <p className="text-gray-500 text-sm mb-1">{label}</p>
                                <p className="text-white font-semibold">{value}</p>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* News */}
                <TabsContent value="news" className="mt-6">
                    <div className="space-y-4">
                        {news.length === 0 ? (
                            <p className="text-gray-400">No recent news available.</p>
                        ) : (
                            news.map((item, i) => (
                                <a
                                    key={i}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block bg-zinc-900 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
                                >
                                    <div className="flex gap-4">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt=""
                                                className="w-20 h-16 rounded-lg object-cover flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium line-clamp-2 mb-1">
                                                {item.headline}
                                            </p>
                                            <p className="text-gray-500 text-sm line-clamp-2">
                                                {item.summary}
                                            </p>
                                            <p className="text-gray-600 text-xs mt-2">
                                                {item.source} ·{" "}
                                                {format(fromUnixTime(item.datetime), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* Financials */}
                <TabsContent value="financials" className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {financials &&
                            [
                                { label: "PE Ratio (TTM)", value: financials.peBasicExclExtraTTM?.toFixed(2) },
                                { label: "EPS (TTM)", value: financials.epsBasicExclExtraAnnual?.toFixed(2) },
                                { label: "52W High", value: formatCurrency(financials["52WeekHigh"]) },
                                { label: "52W Low", value: formatCurrency(financials["52WeekLow"]) },
                                { label: "Beta", value: financials.beta?.toFixed(2) },
                                { label: "Dividend Yield", value: financials.dividendYieldIndicatedAnnual ? `${financials.dividendYieldIndicatedAnnual.toFixed(2)}%` : "N/A" },
                            ].map(({ label, value }) => (
                                <div
                                    key={label}
                                    className="bg-zinc-900 border border-white/10 rounded-xl p-4"
                                >
                                    <p className="text-gray-500 text-sm mb-1">{label}</p>
                                    <p className="text-white font-semibold">{value || "N/A"}</p>
                                </div>
                            ))}
                    </div>
                </TabsContent>

                {/* AI Insights */}
                <TabsContent value="ai" className="mt-6">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-green-500" />
                                <h3 className="text-white font-semibold">AI Market Insight</h3>
                            </div>
                            <Button
                                onClick={getAiInsight}
                                disabled={loadingInsight}
                                className="bg-green-500/20 hover:bg-green-500/30 text-green-500 border border-green-500/30"
                                variant="outline"
                                size="sm"
                            >
                                {loadingInsight ? "Analyzing..." : "Generate Insight"}
                            </Button>
                        </div>

                        {aiInsight ? (
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {aiInsight}
                            </p>
                        ) : (
                            <p className="text-gray-500">
                                Click "Generate Insight" to get an AI-powered analysis of{" "}
                                {profile?.name || symbol} based on current market data and
                                recent news.
                            </p>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}