import { models, model, Schema, Document } from "mongoose";

export interface IAlertDocument extends Document {
    userId: string;
    stockSymbol: string;
    stockName: string;
    condition: "above" | "below";
    targetPrice: number;
    isActive: boolean;
    isTriggered: boolean;
    triggeredAt?: Date;
    createdAt: Date;
}

const AlertSchema = new Schema<IAlertDocument>(
    {
        userId: { type: String, required: true },
        stockSymbol: { type: String, required: true, uppercase: true },
        stockName: { type: String, required: true },
        condition: { type: String, enum: ["above", "below"], required: true },
        targetPrice: { type: Number, required: true },
        isActive: { type: Boolean, default: true },
        isTriggered: { type: Boolean, default: false },
        triggeredAt: { type: Date },
    },
    { timestamps: true }
);

const Alert = models?.Alert || model<IAlertDocument>("Alert", AlertSchema);
export default Alert;