"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Trash2, BellOff, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Alert {
    _id: string;
    stockSymbol: string;
    stockName: string;
    condition: "above" | "below";
    targetPrice: number;
    isActive: boolean;
    isTriggered: boolean;
    createdAt: string;
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        stockSymbol: "",
        stockName: "",
        condition: "above" as "above" | "below",
        targetPrice: "",
    });

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const res = await fetch("/api/alerts");
            const data = await res.json();
            setAlerts(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const createAlert = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch("/api/alerts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    targetPrice: parseFloat(form.targetPrice),
                }),
            });
            if (res.ok) {
                const newAlert = await res.json();
                setAlerts((prev) => [newAlert, ...prev]);
                setForm({ stockSymbol: "", stockName: "", condition: "above", targetPrice: "" });
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setCreating(false);
        }
    };

    const deleteAlert = async (id: string) => {
        await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
        setAlerts((prev) => prev.filter((a) => a._id !== id));
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Price Alerts</h1>
                <p className="text-gray-400 mt-1">
                    Get notified when stocks hit your target price
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Alert Form */}
                <div className="lg:col-span-1">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
                        <h2 className="text-white font-semibold mb-4">Create Alert</h2>
                        <form onSubmit={createAlert} className="space-y-4">
                            <div>
                                <Label className="text-gray-300 text-sm">Stock Symbol</Label>
                                <Input
                                    value={form.stockSymbol}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            stockSymbol: e.target.value.toUpperCase(),
                                        }))
                                    }
                                    placeholder="e.g. AAPL"
                                    className="mt-1 bg-zinc-800 border-white/10 text-white placeholder:text-gray-600"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-gray-300 text-sm">Company Name</Label>
                                <Input
                                    value={form.stockName}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, stockName: e.target.value }))
                                    }
                                    placeholder="e.g. Apple Inc."
                                    className="mt-1 bg-zinc-800 border-white/10 text-white placeholder:text-gray-600"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-gray-300 text-sm">Condition</Label>
                                <div className="flex gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => setForm((f) => ({ ...f, condition: "above" }))}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors ${
                                            form.condition === "above"
                                                ? "bg-green-500/20 text-green-500 border border-green-500/30"
                                                : "bg-zinc-800 text-gray-400 border border-white/10"
                                        }`}
                                    >
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        Above
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm((f) => ({ ...f, condition: "below" }))}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors ${
                                            form.condition === "below"
                                                ? "bg-red-500/20 text-red-500 border border-red-500/30"
                                                : "bg-zinc-800 text-gray-400 border border-white/10"
                                        }`}
                                    >
                                        <TrendingDown className="w-3.5 h-3.5" />
                                        Below
                                    </button>
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-300 text-sm">Target Price ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={form.targetPrice}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, targetPrice: e.target.value }))
                                    }
                                    placeholder="0.00"
                                    className="mt-1 bg-zinc-800 border-white/10 text-white placeholder:text-gray-600"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={creating}
                                className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold"
                            >
                                {creating ? "Creating..." : "Create Alert"}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Alerts List */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-20">
                            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-white font-semibold mb-2">No alerts yet</h3>
                            <p className="text-gray-400">
                                Create your first price alert to get started
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {alerts.map((alert) => (
                                <div
                                    key={alert._id}
                                    className={`bg-zinc-900 border rounded-xl p-4 flex items-center justify-between ${
                                        alert.isTriggered
                                            ? "border-yellow-500/30 opacity-60"
                                            : "border-white/10"
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                alert.condition === "above"
                                                    ? "bg-green-500/20"
                                                    : "bg-red-500/20"
                                            }`}
                                        >
                                            {alert.condition === "above" ? (
                                                <TrendingUp className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <TrendingDown className="w-5 h-5 text-red-500" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-semibold">
                                                    {alert.stockSymbol}
                                                </p>
                                                {alert.isTriggered && (
                                                    <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">
                            Triggered
                          </span>
                                                )}
                                            </div>
                                            <p className="text-gray-400 text-sm">
                                                {alert.stockName} — {alert.condition}{" "}
                                                <span className="text-white">
                          {formatCurrency(alert.targetPrice)}
                        </span>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteAlert(alert._id)}
                                        className="text-gray-600 hover:text-red-400 transition-colors p-1.5"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}