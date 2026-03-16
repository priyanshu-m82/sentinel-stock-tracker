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
import { getDateRange } from "@/lib/utils";
import { format, fromUnixTime } from "date-fns";

interface StockChartProps {
    symbol: string;
}

const PERIODS = [
    { label: "1W", days: 7, resolution: "D" },
    { label: "1M", days: 30, resolution: "D" },
    { label: "3M", days: 90, resolution: "D" },
    { label: "6M", days: 180, resolution: "W" },
    { label: "1Y", days: 365, resolution: "W" },
];

export default function StockChart({ symbol }: StockChartProps) {
    const [data, setData] = useState<any[]>([]);
    const [activePeriod, setActivePeriod] = useState("1M");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const period = PERIODS.find((p) => p.label === activePeriod)!;
        fetchChartData(period.days, period.resolution);
    }, [symbol, activePeriod]);

    const fetchChartData = async (days: number, resolution: string) => {
        setLoading(true);
        try {
            const { from, to } = getDateRange(days);
            const res = await fetch(
                `/api/stock?type=candles&symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`
            );
            const candle = await res.json();

            if (candle.s === "ok") {
                const chartData = candle.t.map((timestamp: number, i: number) => ({
                    date: format(fromUnixTime(timestamp), "MMM d"),
                    price: candle.c[i],
                }));
                setData(chartData);
            }
        } catch (error) {
            console.error("Chart error:", error);
        } finally {
            setLoading(false);
        }
    };

    const isPositive =
        data.length > 1 && data[data.length - 1]?.price >= data[0]?.price;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload?.[0]) {
            return (
                <div className="bg-zinc-800 border border-white/10 rounded-lg px-3 py-2">
                    <p className="text-gray-400 text-xs">{label}</p>
                    <p className="text-white font-semibold">
                        ${payload[0].value.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold">Price History</h3>
                <div className="flex gap-1">
                    {PERIODS.map((period) => (
                        <Button
                            key={period.label}
                            variant="ghost"
                            size="sm"
                            onClick={() => setActivePeriod(period.label)}
                            className={`text-xs px-3 ${
                                activePeriod === period.label
                                    ? "bg-white/10 text-white"
                                    : "text-gray-500 hover:text-white"
                            }`}
                        >
                            {period.label}
                        </Button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={256}>
                    <LineChart data={data}>
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
                            tickFormatter={(v) => `$${v.toFixed(0)}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke={isPositive ? "#22c55e" : "#ef4444"}
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}