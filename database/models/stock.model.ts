import { models, model, Schema, Document } from "mongoose";

export interface IStockDocument extends Document {
    symbol: string;
    name: string;
    exchange: string;
    industry: string;
    logo?: string;
    isActive: boolean;
    createdAt: Date;
}

const StockSchema = new Schema<IStockDocument>(
    {
        symbol: { type: String, required: true, unique: true, uppercase: true },
        name: { type: String, required: true },
        exchange: { type: String, required: true },
        industry: { type: String, default: "Other" },
        logo: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Stock = models?.Stock || model<IStockDocument>("Stock", StockSchema);
export default Stock;