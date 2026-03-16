import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IUserDocument extends Document {
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        emailVerified: { type: Boolean, default: false },
        image: { type: String },
        role: { type: String, enum: ["user", "admin"], default: "user" },
    },
    { timestamps: true }
);

const User = models?.User || model<IUserDocument>("User", UserSchema);
export default User;