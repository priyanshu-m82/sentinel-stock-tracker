"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BarChart3, LogOut, User, Bell, BookMarked, Home } from "lucide-react";

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const navLinks = [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/watchlist", label: "Watchlist", icon: BookMarked },
        { href: "/alerts", label: "Alerts", icon: Bell },
    ];

    const handleSignOut = async () => {
        await signOut();
        window.location.href = "/sign-in";
    };

    return (
        <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-black" />
                        </div>
                        <span className="text-white font-bold text-xl">Sentinel</span>
                    </Link>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    pathname === href
                                        ? "bg-white/10 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* User Menu */}
                    {session?.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={session.user.image || ""} />
                                        <AvatarFallback className="bg-green-500 text-black text-xs font-bold">
                                            {session.user.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden md:block text-sm text-white">
                    {session.user.name}
                  </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-48 bg-zinc-900 border-white/10"
                            >
                                <DropdownMenuItem className="text-gray-300">
                                    <User className="w-4 h-4 mr-2" />
                                    {session.user.email}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem
                                    onClick={handleSignOut}
                                    className="text-red-400 hover:text-red-300 cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/sign-in">
                            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}