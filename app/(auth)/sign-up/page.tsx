"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { data, error } = await signUp.email({
            name,
            email,
            password,
            callbackURL: "/dashboard",
        });

        if (error) {
            setError(error.message || "Something went wrong. Please try again.");
            setLoading(false);
            return;
        }

        router.push("/dashboard");
    };

    return (
        <div className="w-full max-w-md">
            <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-black" />
                </div>
                <span className="text-white font-bold text-xl">Sentinel</span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
            <p className="text-gray-400 mb-8">
                Start tracking stocks with AI-powered insights
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name" className="text-gray-300">
                        Full Name
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="mt-1.5 bg-zinc-900 border-white/10 text-white placeholder:text-gray-600 focus:border-green-500"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="email" className="text-gray-300">
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="mt-1.5 bg-zinc-900 border-white/10 text-white placeholder:text-gray-600 focus:border-green-500"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="password" className="text-gray-300">
                        Password
                    </Label>
                    <div className="relative mt-1.5">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimum 8 characters"
                            minLength={8}
                            className="bg-zinc-900 border-white/10 text-white placeholder:text-gray-600 focus:border-green-500 pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold h-11"
                >
                    {loading ? "Creating account..." : "Create Account"}
                </Button>
            </form>

            <p className="text-gray-500 text-sm text-center mt-6">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-green-500 hover:text-green-400">
                    Sign in
                </Link>
            </p>
        </div>
    );
}