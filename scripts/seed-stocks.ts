import connectDB from "../database";
import Stock from "../database/models/stock.model";

const STOCKS_TO_SEED = [
    { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", industry: "Technology" },
    { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", industry: "Technology" },
    { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", industry: "Technology" },
    { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", industry: "Consumer Cyclical" },
    { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ", industry: "Technology" },
    { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", industry: "Automotive" },
    { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", industry: "Technology" },
    { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE", industry: "Financial Services" },
    { symbol: "JNJ", name: "Johnson & Johnson", exchange: "NYSE", industry: "Healthcare" },
    { symbol: "V", name: "Visa Inc.", exchange: "NYSE", industry: "Financial Services" },
    { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE", industry: "Consumer Defensive" },
    { symbol: "PG", name: "Procter & Gamble Co.", exchange: "NYSE", industry: "Consumer Defensive" },
];

async function seedStocks() {
    await connectDB();
    console.log("Connected to MongoDB");

    for (const stock of STOCKS_TO_SEED) {
        await Stock.findOneAndUpdate(
            { symbol: stock.symbol },
            stock,
            { upsert: true, new: true }
        );
        console.log(`Seeded: ${stock.symbol}`);
    }

    console.log("Seeding complete!");
    process.exit(0);
}

seedStocks().catch(console.error);