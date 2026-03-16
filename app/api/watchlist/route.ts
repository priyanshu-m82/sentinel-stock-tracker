import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database";
import Watchlist from "@/database/models/watchlist.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const watchlist = await Watchlist.find({ userId: session.user.id }).sort({ createdAt: -1 });
        return NextResponse.json(watchlist);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { stockSymbol, stockName } = await request.json();
        await connectDB();

        const existing = await Watchlist.findOne({
            userId: session.user.id,
            stockSymbol: stockSymbol.toUpperCase(),
        });

        if (existing) {
            return NextResponse.json({ error: "Already in watchlist" }, { status: 400 });
        }

        const item = await Watchlist.create({
            userId: session.user.id,
            stockSymbol: stockSymbol.toUpperCase(),
            stockName,
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const symbol = searchParams.get("symbol");

        await connectDB();
        await Watchlist.findOneAndDelete({
            userId: session.user.id,
            stockSymbol: symbol?.toUpperCase(),
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}