export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-gradient-to-br from-green-950/20 via-black to-black pointer-events-none" />
            <div className="relative z-10 w-full flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}