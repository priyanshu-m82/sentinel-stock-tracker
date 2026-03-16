"use client";

import Link from "next/link";
import { formatCurrency, formatPercent, getPriceBgColor } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StockCardProps {
    symbol: string;
    name: string;
    currentPrice: number;
    change: number;
    changePercent: number;
    logo?: string;
}

export default function StockCard({
                                      symbol,
                                      name,
                                      currentPrice,
                                      change,
                                      changePercent,
                                      logo,
                                  }: StockCardProps) {
    const isPositive = changePercent >= 0;

    return (
        <Link href={`/stocks/${symbol}`}>
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 hover:border-white/20 hover:bg-zinc-800 transition-all cursor-pointer group">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        {logo ? (
                            <img
                                src={logo}
                                alt={name}
                                className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <span className="text-green-500 font-bold text-xs">
                  {symbol.charAt(0)}
                </span>
                            </div>
                        )}
                        <div>
                            <p className="text-white font-semibold">{symbol}</p>
                            <p className="text-gray-500 text-xs truncate max-w-24">{name}</p>
                        </div>
                    </div>

                    <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getPriceBgColor(changePercent)}`}
                    >
            {isPositive ? (
                <TrendingUp className="w-3 h-3 inline mr-1" />
            ) : (
                <TrendingDown className="w-3 h-3 inline mr-1" />
            )}
                        {formatPercent(changePercent)}
          </span>
                </div>

                {/* Price */}
                <div>
                    <p className="text-2xl font-bold text-white">
                        {formatCurrency(currentPrice)}
                    </p>
                    <p
                        className={`text-sm mt-1 ${
                            isPositive ? "text-green-500" : "text-red-500"
                        }`}
                    >
                        {isPositive ? "+" : ""}
                        {formatCurrency(change)} today
                    </p>
                </div>
            </div>
        </Link>
    );
}