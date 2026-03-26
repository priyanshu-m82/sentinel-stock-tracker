"use client";

import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { format, fromUnixTime } from "date-fns";

interface StockChartProps {
    symbol: string;
}

const PERIODS = [
    { label: "1W", resolution: "60", days: 7 },
    { label: "1M", resolution: "D", days: 30 },
    { label: "3M", resolution: "D", days: 90 },
    { label: "6M", resolution: "W", days: 180 },
    { label: "1Y", resolution: "W", days: 365 },
];

interface ChartPoint {
    date: string;
    price: number;
}

export default function StockChart({ symbol }: StockChartProps) {
    const [data, setData] = useState<ChartPoint[]>([]);
    const [activePeriod, setActivePeriod] = useState("1M");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (symbol) {
            const period = PERIODS.find((p) => p.label === activePeriod)!;
            fetchChart(period.resolution);
        }
    }, [symbol, activePeriod]);

    async function fetchChart(resolution: string) {
        setLoading(true);
        setError("");
        setData([]);

        try {
            // Let the server compute timestamps — avoids timezone/range bugs
            const res = await fetch(
                `/api/stock?type=candles&symbol=${symbol}&resolution=${resolution}`
            );

            if (!res.ok) {
                setError("Server error fetching chart data.");
                return;
            }

            const candle = await res.json();

            // Finnhub returns s:"no_data" when symbol is wrong or market closed
            if (!candle || candle.s === "no_data" || !Array.isArray(candle.c) || candle.c.length === 0) {
                setError(
                    "No chart data available right now. " +
                    "Historical data loads during or after US market hours (7 PM – 1:30 AM IST)."
                );
                return;
            }

            const points: ChartPoint[] = candle.t.map(
                (timestamp: number, i: number) => ({
                    date: format(fromUnixTime(timestamp), "MMM d"),
                    price: Math.round(candle.c[i] * 100) / 100,
                })
            );

            setData(points);
        } catch (err) {
            console.error("Chart fetch error:", err);
            setError("Failed to load chart. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const isPositive =
        data.length >= 2 && data[data.length - 1].price >= data[0].price;

    const lineColor = isPositive ? "#22c55e" : "#ef4444";

    function CustomTooltip({ active, payload, label }: any) {
        if (active && payload && payload.length > 0) {
            return (
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 shadow-lg">
                    <p className="text-gray-400 text-xs mb-1">{label}</p>
                    <p className="text-white font-semibold">${payload[0].value.toFixed(2)}</p>
                </div>
            );
        }
        return null;
    }

    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">

            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Price History</h3>
                <div className="flex gap-1">
                    {PERIODS.map((period) => (
                        <Button
                            key={period.label}
                            variant="ghost"
                            size="sm"
                            onClick={() => setActivePeriod(period.label)}
                            className={`text-xs px-3 h-7 rounded-md transition-colors ${
                                activePeriod === period.label
                                    ? "bg-zinc-600 text-white"
                                    : "text-gray-500 hover:text-white hover:bg-zinc-700"
                            }`}
                        >
                            {period.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Chart area */}
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : error ? (
                <div className="h-64 flex flex-col items-center justify-center gap-3 text-center px-4">
                    <p className="text-gray-400 text-sm">{error}</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            const period = PERIODS.find((p) => p.label === activePeriod)!;
                            fetchChart(period.resolution);
                        }}
                        className="text-green-500 hover:text-green-400 text-xs"
                    >
                        Retry
                    </Button>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={256}>
                    <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: "#6b7280", fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fill: "#6b7280", fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            domain={["auto", "auto"]}
                            tickFormatter={(v: number) => `$${v}`}
                            width={65}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke={lineColor}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}