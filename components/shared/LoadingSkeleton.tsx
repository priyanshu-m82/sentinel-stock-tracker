import { Skeleton } from "@/components/ui/skeleton";

export function StockCardSkeleton() {
    return (
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg bg-zinc-700" />
                    <div>
                        <Skeleton className="w-16 h-4 mb-1 bg-zinc-700" />
                        <Skeleton className="w-24 h-3 bg-zinc-700" />
                    </div>
                </div>
                <Skeleton className="w-16 h-6 rounded-full bg-zinc-700" />
            </div>
            <Skeleton className="w-28 h-8 mb-1 bg-zinc-700" />
            <Skeleton className="w-20 h-4 bg-zinc-700" />
        </div>
    );
}

export function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}