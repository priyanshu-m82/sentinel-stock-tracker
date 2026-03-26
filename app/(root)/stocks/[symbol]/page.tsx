"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import StockChart from "@/components/stock/StockChart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatPercent, formatMarketCap, getPriceChangeColor, getDateRange } from "@/lib/utils";
import { BookMarked, BookmarkMinus, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { format, fromUnixTime } from "date-fns";

export default function StockDetailPage() {
  const params = useParams();
  const symbol = (params?.symbol as string) ?? "";

  const [quote, setQuote] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any>(null);
  const [watchlisted, setWatchlisted] = useState(false);
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (symbol) { loadData(); }
  }, [symbol]);

  async function loadData() {
    setLoading(true);
    try {
      const { fromStr, toStr } = getDateRange(7);
      const [q, p, n, f, w] = await Promise.all([
        fetch("/api/stock?type=quote&symbol=" + symbol).then((r) => r.json()),
        fetch("/api/stock?type=profile&symbol=" + symbol).then((r) => r.json()),
        fetch("/api/stock?type=news&symbol=" + symbol + "&from=" + fromStr + "&to=" + toStr).then((r) => r.json()),
        fetch("/api/stock?type=financials&symbol=" + symbol).then((r) => r.json()),
        fetch("/api/watchlist").then((r) => r.json()),
      ]);
      setQuote(q);
      setProfile(p);
      setNewsItems(Array.isArray(n) ? n.slice(0, 5) : []);
      setFinancials(f?.metric ?? null);
      setWatchlisted(Array.isArray(w) && w.some((x: any) => x.stockSymbol === symbol));
    } catch (err) {
      console.error("loadData error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleWatchlist() {
    if (watchlisted) {
      await fetch("/api/watchlist?symbol=" + symbol, { method: "DELETE" });
    } else {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockSymbol: symbol, stockName: profile?.name ?? symbol }),
      });
    }
    setWatchlisted(!watchlisted);
  }

  async function handleInsight() {
    setInsightLoading(true);
    setInsight("");
    try {
      const res = await fetch("/api/ai/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          stockName: profile?.name ?? symbol,
          currentPrice: quote?.c ?? 0,
          changePercent: quote?.dp ?? 0,
          news: newsItems.map((n: any) => ({ headline: n.headline, summary: n.summary })),
        }),
      });
      const data = await res.json();
      setInsight(res.ok ? data.insight : "Error: " + data.error);
    } catch {
      setInsight("Failed. Check GEMINI_API_KEY in .env.local");
    } finally {
      setInsightLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentPrice = quote?.c ?? 0;
  const priceChange = quote?.d ?? 0;
  const priceChangePct = quote?.dp ?? 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {profile?.logo ? (
            <img src={profile.logo} alt={symbol} className="w-16 h-16 rounded-xl object-contain bg-white p-1.5" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 text-2xl font-bold">{symbol.charAt(0)}</span>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold text-white">{symbol}</h1>
              {profile?.exchange && (
                <span className="text-xs bg-zinc-700 text-gray-300 px-2 py-1 rounded-full">
                  {profile.exchange}
                </span>
              )}
            </div>
            {profile?.name && <p className="text-gray-400 mt-0.5">{profile.name}</p>}
          </div>
        </div>
        <Button
          onClick={handleWatchlist}
          className={watchlisted ? "bg-green-500 hover:bg-green-600 text-black font-semibold" : "bg-zinc-700 hover:bg-zinc-600 text-white border border-zinc-600 font-semibold"}
        >
          {watchlisted ? (
            <><BookmarkMinus className="w-4 h-4 mr-2" />Watchlisted</>
          ) : (
            <><BookMarked className="w-4 h-4 mr-2" />Add to Watchlist</>
          )}
        </Button>
      </div>

      <div className="mb-8">
        <p className="text-5xl font-bold text-white">{formatCurrency(currentPrice)}</p>
        <div className={"mt-2 text-lg font-medium flex items-center gap-1 " + getPriceChangeColor(priceChangePct)}>
          {priceChangePct >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          <span>{formatCurrency(priceChange)} ({formatPercent(priceChangePct)}) today</span>
        </div>
      </div>

      <div className="mb-8">
        <StockChart symbol={symbol} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-zinc-800 border border-zinc-700 p-1 h-auto">
          <TabsTrigger value="overview" className="text-gray-400 data-[state=active]:bg-zinc-600 data-[state=active]:text-white rounded-md">Overview</TabsTrigger>
          <TabsTrigger value="news" className="text-gray-400 data-[state=active]:bg-zinc-600 data-[state=active]:text-white rounded-md">News</TabsTrigger>
          <TabsTrigger value="financials" className="text-gray-400 data-[state=active]:bg-zinc-600 data-[state=active]:text-white rounded-md">Financials</TabsTrigger>
          <TabsTrigger value="ai" className="text-gray-400 data-[state=active]:bg-zinc-600 data-[state=active]:text-white rounded-md">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
              <p className="text-gray-500 text-sm mb-1">Open</p>
              <p className="text-white font-semibold">{formatCurrency(quote?.o)}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
              <p className="text-gray-500 text-sm mb-1">High</p>
              <p className="text-white font-semibold">{formatCurrency(quote?.h)}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
              <p className="text-gray-500 text-sm mb-1">Low</p>
              <p className="text-white font-semibold">{formatCurrency(quote?.l)}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
              <p className="text-gray-500 text-sm mb-1">Prev Close</p>
              <p className="text-white font-semibold">{formatCurrency(quote?.pc)}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
              <p className="text-gray-500 text-sm mb-1">Market Cap</p>
              <p className="text-white font-semibold">
                {profile?.marketCapitalization ? formatMarketCap(profile.marketCapitalization * 1e6) : "N/A"}
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
              <p className="text-gray-500 text-sm mb-1">Industry</p>
              <p className="text-white font-semibold text-sm">{profile?.finnhubIndustry ?? "N/A"}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
              <p className="text-gray-500 text-sm mb-1">Country</p>
              <p className="text-white font-semibold">{profile?.country ?? "N/A"}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
              <p className="text-gray-500 text-sm mb-1">Website</p>
              {profile?.weburl ? (
                <a href={profile.weburl} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 font-semibold text-sm underline">
                  Visit site
                </a>
              ) : (
                <p className="text-white font-semibold">N/A</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="news" className="mt-6">
          <div className="space-y-3">
            {newsItems.length === 0 && (
              <p className="text-gray-400">No recent news available.</p>
            )}
            {newsItems.map((item: any, i: number) => (
              <div key={i} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 hover:border-zinc-500 transition-colors cursor-pointer" onClick={() => window.open(item.url, "_blank")}>
                <div className="flex gap-4">
                  {item.image && (
                    <img src={item.image} alt="" className="w-20 h-16 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium line-clamp-2 text-sm mb-1">{item.headline}</p>
                    <p className="text-gray-500 text-xs line-clamp-2">{item.summary}</p>
                    <p className="text-gray-600 text-xs mt-2">
                      {item.source}{item.datetime ? " · " + format(fromUnixTime(item.datetime), "MMM d, yyyy") : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financials" className="mt-6">
          {!financials ? (
            <p className="text-gray-400">No financial data available.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                <p className="text-gray-500 text-sm mb-1">PE Ratio (TTM)</p>
                <p className="text-white font-semibold">{financials.peBasicExclExtraTTM ? Number(financials.peBasicExclExtraTTM).toFixed(2) : "N/A"}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                <p className="text-gray-500 text-sm mb-1">EPS (TTM)</p>
                <p className="text-white font-semibold">{financials.epsBasicExclExtraAnnual ? Number(financials.epsBasicExclExtraAnnual).toFixed(2) : "N/A"}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                <p className="text-gray-500 text-sm mb-1">52W High</p>
                <p className="text-white font-semibold">{formatCurrency(financials["52WeekHigh"])}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                <p className="text-gray-500 text-sm mb-1">52W Low</p>
                <p className="text-white font-semibold">{formatCurrency(financials["52WeekLow"])}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                <p className="text-gray-500 text-sm mb-1">Beta</p>
                <p className="text-white font-semibold">{financials.beta ? Number(financials.beta).toFixed(2) : "N/A"}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                <p className="text-gray-500 text-sm mb-1">Dividend Yield</p>
                <p className="text-white font-semibold">{financials.dividendYieldIndicatedAnnual ? Number(financials.dividendYieldIndicatedAnnual).toFixed(2) + "%" : "N/A"}</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-400" />
                <h3 className="text-white font-semibold">AI Market Insight</h3>
              </div>
              <Button onClick={handleInsight} disabled={insightLoading} className="bg-green-500 hover:bg-green-600 text-black font-semibold">
                {insightLoading ? "Analyzing..." : "Generate Insight"}
              </Button>
            </div>
            {insight ? (
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{insight}</p>
            ) : (
              <p className="text-gray-500 text-sm">
                Click Generate Insight to get an AI-powered analysis of{" "}
                <span className="text-gray-300">{profile?.name ?? symbol}</span>{" "}
                based on current price data and recent news.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
