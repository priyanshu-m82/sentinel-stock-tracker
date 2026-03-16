import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database";
import Alert from "@/database/models/alert.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const alerts = await Alert.find({ userId: session.user.id }).sort({ createdAt: -1 });
        return NextResponse.json(alerts);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        await connectDB();

        const alert = await Alert.create({
            userId: session.user.id,
            ...body,
            stockSymbol: body.stockSymbol.toUpperCase(),
        });

        return NextResponse.json(alert, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        await connectDB();
        await Alert.findOneAndDelete({ _id: id, userId: session.user.id });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}