import { inngest } from "./client";
import connectDB from "@/database";
import Alert from "@/database/models/alert.model";
import User from "@/database/models/user.model";
import Watchlist from "@/database/models/watchlist.model";
import { getStockQuote } from "@/lib/finnhub";
import { sendAlertEmail, sendDailyDigestEmail } from "@/lib/nodemailer";
import { generateDailyDigest } from "@/lib/gemini";
import { format } from "date-fns";

// Function 1: Check price alerts every 5 minutes
export const checkPriceAlerts = inngest.createFunction(
    { id: "check-price-alerts", name: "Check Price Alerts" },
    { cron: "*/5 * * * *" },
    async ({ step }) => {
        await step.run("connect-db", () => connectDB());

        const activeAlerts = await step.run("fetch-alerts", async () => {
            const alerts = await Alert.find({ isActive: true, isTriggered: false });
            return JSON.parse(JSON.stringify(alerts));
        });

        if (activeAlerts.length === 0) return { message: "No active alerts" };

        const uniqueSymbols = [...new Set(activeAlerts.map((a: any) => a.stockSymbol))];

        const quotes = await step.run("fetch-quotes", async () => {
            const results: Record<string, number> = {};
            for (const symbol of uniqueSymbols) {
                const quote = await getStockQuote(symbol as string);
                results[symbol as string] = quote.c;
            }
            return results;
        });

        const triggeredAlerts = await step.run("process-alerts", async () => {
            const triggered = [];
            for (const alert of activeAlerts) {
                const currentPrice = quotes[alert.stockSymbol];
                const shouldTrigger =
                    (alert.condition === "above" && currentPrice >= alert.targetPrice) ||
                    (alert.condition === "below" && currentPrice <= alert.targetPrice);

                if (shouldTrigger) {
                    await Alert.findByIdAndUpdate(alert._id, {
                        isTriggered: true,
                        isActive: false,
                        triggeredAt: new Date(),
                    });
                    triggered.push({ ...alert, currentPrice });
                }
            }
            return triggered;
        });

        await step.run("send-notifications", async () => {
            for (const alert of triggeredAlerts) {
                const user = await User.findById(alert.userId);
                if (!user) continue;

                await sendAlertEmail(
                    user.email,
                    user.name,
                    alert.stockName,
                    alert.stockSymbol,
                    alert.condition,
                    alert.targetPrice,
                    alert.currentPrice
                );
            }
        });

        return { triggered: triggeredAlerts.length };
    }
);

// Function 2: Send daily digest at 9 AM
export const sendDailyDigest = inngest.createFunction(
    { id: "send-daily-digest", name: "Send Daily Market Digest" },
    { cron: "0 9 * * 1-5" }, // 9 AM Mon-Fri
    async ({ step }) => {
        await step.run("connect-db", () => connectDB());

        const users = await step.run("fetch-users-with-watchlists", async () => {
            const watchlistUsers = await Watchlist.distinct("userId");
            const users = await User.find({ _id: { $in: watchlistUsers } });
            return JSON.parse(JSON.stringify(users));
        });

        await step.run("send-digests", async () => {
            for (const user of users) {
                const watchlist = await Watchlist.find({ userId: user._id });
                if (watchlist.length === 0) continue;

                const quotes = [];
                for (const item of watchlist) {
                    const quote = await getStockQuote(item.stockSymbol);
                    quotes.push({
                        symbol: item.stockSymbol,
                        name: item.stockName,
                        changePercent: quote.dp,
                    });
                }

                const digest = await generateDailyDigest(quotes);
                const today = format(new Date(), "MMMM d, yyyy");

                await sendDailyDigestEmail(user.email, user.name, digest, today);
            }
        });

        return { message: "Daily digests sent", users: users.length };
    }
);