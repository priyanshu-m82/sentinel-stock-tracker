import { models, model, Schema, Document } from "mongoose";

export interface IWatchlistDocument extends Document {
    userId: string;
    stockSymbol: string;
    stockName: string;
    createdAt: Date;
}

const WatchlistSchema = new Schema<IWatchlistDocument>(
    {
        userId: { type: String, required: true },
        stockSymbol: { type: String, required: true, uppercase: true },
        stockName: { type: String, required: true },
    },
    { timestamps: true }
);

WatchlistSchema.index({ userId: 1, stockSymbol: 1 }, { unique: true });

const Watchlist =
    models?.Watchlist ||
    model<IWatchlistDocument>("Watchlist", WatchlistSchema);
export default Watchlist;